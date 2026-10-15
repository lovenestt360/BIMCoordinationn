import {recordSAAttempt} from './sa-airtable-journal.js';

// Fail closed unless a fresh Control Center + campaign snapshot is provided.
// This is a second guard, not a substitute for a production worker re-fetch.
export function livePermission({control,campaign,now=new Date()}={}){
 const value=x=>typeof x==='object'&&x!==null&&'name'in x?x.name:x;
 const c=control?.fields||control||{},p=campaign?.fields||campaign||{};
 if(value(c.Control)!=='Launch Outreach'||value(c.Command)!=='Start'||!['Ready','Running'].includes(value(c.Status)))return {allowed:false,reason:'CONTROL_NOT_RUNNING'};
 if(value(p.Country)!=='South Africa'||value(p.Status)!=='Active')return {allowed:false,reason:'CAMPAIGN_NOT_ACTIVE'};
 if(!Number.isFinite(now.getTime()))return {allowed:false,reason:'INVALID_CLOCK'};
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Maputo',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const pick=t=>parts.find(x=>x.type===t)?.value;
 const minute=Number(pick('hour'))*60+Number(pick('minute'));
 if(['Sat','Sun'].includes(pick('weekday'))||minute<540||minute>=900)return {allowed:false,reason:'OUTSIDE_SENDING_WINDOW'};
 return {allowed:true};
}
// Single-attempt SA dispatcher. Not exposed as an API route or cron.
// Caller must supply freshly fetched Airtable state and a verified SMTP envelope.
import {evaluateSA} from './sa-outbound-preflight.js';
import {reserveSend} from './sa-atomic-quota.js';
import {recordOutcome} from './sa-send-journal.js';
import {submitApprovedMessage} from './sa-smtp-transport.js';
export async function dispatchOne({lead,suppressions,step='S01',subject,body,sender,attemptId,reserve=reserveSend,journal=recordOutcome,submit=submitApprovedMessage,audit=recordSAAttempt,liveEnabled=false,control,campaign,now=new Date()}){
 if(!liveEnabled||process.env.SA_OUTREACH_LIVE_ENABLED!=='true')return {sent:false,reason:'LIVE_DISABLED'};
 const permission=livePermission({control,campaign,now});
 if(!permission.allowed)return {sent:false,reason:permission.reason};
 const campaignKey=(campaign?.fields||campaign||{})['Campaign Key'];
 if(campaignKey!==(lead?.fields||lead||{})['Campaign Key'])return {sent:false,reason:'CAMPAIGN_MISMATCH'};
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
