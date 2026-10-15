// Fail-closed, append-once outbound outcome journal. No email is transmitted here.
import {redisCommand} from './sa-atomic-quota.js';
const encode=x=>encodeURIComponent(String(x));
export async function recordOutcome({attemptId,leadId,sender,step='S01',outcome,messageId=null,at=new Date().toISOString(),command=redisCommand}){
 if(!/^[-a-zA-Z0-9]{12,128}$/.test(attemptId||'')||!/^rec[a-zA-Z0-9]+$/.test(leadId||''))throw new Error('INVALID_ATTEMPT');
 if(!['accepted','failed','uncertain'].includes(outcome))throw new Error('INVALID_OUTCOME');
 const key='sa:outcome:'+encode(attemptId);
 const value=JSON.stringify({attemptId,leadId,sender,step,outcome,messageId,at});
 // SET NX ensures retries cannot rewrite an accepted or uncertain result.
 const result=await command(['SET',key,value,'NX','EX',2592000]);
 return {stored:result==='OK',attemptId,outcome};
}
export async function readOutcome({attemptId,command=redisCommand}){
 if(!/^[-a-zA-Z0-9]{12,128}$/.test(attemptId||''))throw new Error('INVALID_ATTEMPT');
 const raw=await command(['GET','sa:outcome:'+encode(attemptId)]);
 return raw?JSON.parse(raw):null;
}
