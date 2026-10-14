import {recordSAAttempt} from './sa-airtable-journal.js';
// Single-attempt SA dispatcher. Not exposed as an API route or cron.
// Caller must supply freshly fetched Airtable state and a verified SMTP envelope.
import {evaluateSA} from './sa-outbound-preflight.js';
import {reserveSend} from './sa-atomic-quota.js';
import {recordOutcome} from './sa-send-journal.js';
import {submitApprovedMessage} from './sa-smtp-transport.js';
export async function dispatchOne({lead,suppressions,step='S01',subject,body,sender,attemptId,reserve=reserveSend,journal=recordOutcome,submit=submitApprovedMessage,audit=recordSAAttempt,liveEnabled=false}){
 if(!liveEnabled||process.env.SA_OUTREACH_LIVE_ENABLED!=='true')return {sent:false,reason:'LIVE_DISABLED'};
 const gate=evaluateSA(lead,suppressions);
 if(!gate.eligible)return {sent:false,reason:'INELIGIBLE',failed:gate.failed};
 if(!subject?.trim()||!body?.trim()||!lead?.id)return {sent:false,reason:'MESSAGE_INCOMPLETE'};
 // A single reservation protects both sender quota and per-prospect/step idempotency.
 const claim=await reserve({sender,leadId:lead.id,step,attemptId});
 if(!claim.reserved)return {sent:false,reason:claim.reason};
 let result,outcome='uncertain';
 try{
  result=await submit({senderAddress:sender,to:gate.email,subject,text:body,sendAuthorized:true});
  outcome='accepted';
 }catch(error){
  // Delivery outcome might be unknown after a socket timeout: never auto-retry.
  outcome='uncertain';
 }
 const recorded=await journal({attemptId,leadId:lead.id,sender,step,outcome,messageId:result?.messageId||null});
 if(!recorded.stored)throw new Error('JOURNAL_WRITE_NOT_CONFIRMED');
 await audit({leadId:lead.id,attemptId,sender,step,outcome,messageId:result?.messageId||null});
 return {sent:outcome==='accepted',reason:outcome,messageId:result?.messageId||null,attemptId};
}
