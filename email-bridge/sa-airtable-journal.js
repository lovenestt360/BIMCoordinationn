// Airtable send result synchronization. Isolated: not called by a scheduler.
const BASE='appB5ZouRh0zksgbR',PIPELINE='tbl0oArumIYj71OFC',LOG='tblh7K2naDbWw8dNV';
async function request(table,opts={},env=process.env,fetcher=fetch){
 if(!env.AIRTABLE_PAT)throw new Error('AIRTABLE_NOT_CONFIGURED');
 const response=await fetcher('https://api.airtable.com/v0/'+BASE+'/'+table,{...opts,headers:{Authorization:'Bearer '+env.AIRTABLE_PAT','Content-Type':'application/json'},signal:AbortSignal.timeout(10000)});
 const result=await response.json();
 if(!response.ok)throw new Error('AIRTABLE_HTTP_'+response.status);
 return result;
}
export async function recordSAAttempt({leadId,attemptId,sender,step='S01',outcome,messageId=null,at=new Date().toISOString(),requester=request}){
 if(!/^rec[a-zA-Z0-9]+$/.test(leadId)||!/^[-a-zA-Z0-9]{12,128}$/.test(attemptId)||!['accepted','uncertain','failed'].includes(outcome))throw new Error('INVALID_LOG_EVENT');
 const event={fields:{'Activity ID':'sa-'+attemptId,'Lead ID':leadId,'Timestamp':at,'Event Type':outcome==='accepted'?'SA_SEND_CONFIRMED':'SA_SEND_UNCERTAIN','Details':JSON.stringify({attemptId,sender,step,outcome,messageId}),'Source':'SA worker'}};
 await requester(LOG,{method:'POST',body:JSON.stringify({records:[event]})});
 // Do not mutate pipeline status until exact allowed field values and stop rules are verified.
 return {logged:true,leadUpdated:false,requiresReconciliation:outcome==='accepted'};
}
