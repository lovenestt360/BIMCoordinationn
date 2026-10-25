// Deterministic, read-only sender planning. Never transmits mail.
import {SENDERS,evaluateSA} from './sa-outbound-preflight.js';
const str=x=>typeof x==='object'&&x?.name?x.name:String(x||'');
const time=x=>{let n=Date.parse(x);return Number.isFinite(n)?n:null;};
export function planSA({leads=[],suppressions=[],recentEvents=[],now=Date.now(),maxPerSender=20}={}){
 const reasons=[],out=[],assigned=new Set();
 const max=Math.min(20,Math.max(0,Math.floor(Number(maxPerSender)||0)));
 const ready=leads.filter(x=>{
  const p=evaluateSA(x,suppressions);
  const f=x.fields||x;
  return p.eligible && str(f['Outreach Status'])==='Not started'
    && !f['Last Sent At'] && !f['S01 Sent'] && !!f['Current Email Subject'] && !!f['Current Email Draft'];
 }).sort((a,b)=>String((a.fields||a)['Prospect Key']||'').localeCompare(String((b.fields||b)['Prospect Key']||'')));
 const used=SENDERS.map(sender=>recentEvents.filter(e=>String(e.sender).toLowerCase()===sender.address&&time(e.sentAt)!==null&&time(e.sentAt)>now-3600000&&time(e.sentAt)<=now).length);
 // This preview is not authorization to send. Actual sending requires atomic claim and fresh rechecks.
 for(let slot=0;slot<max;slot++){
  for(let s=0;s<SENDERS.length;s++){
   if(used[s]>=max)continue;
   const r=ready.find(x=>!assigned.has(x.id||x.fields?.['Prospect Key']||x['Prospect Key'])&&!out.some(o=>o.email===String((x.fields||x).Email).toLowerCase()));
   if(!r)break;
   const f=r.fields||r, id=r.id||f['Prospect Key'];
   assigned.add(id);used[s]++;
   out.push({leadId:id,email:String(f.Email).toLowerCase(),sender:SENDERS[s].address,displayName:SENDERS[s].name,scheduledOffsetMinutes:slot*6+s*3});
  }
 }
 if(!ready.length)reasons.push('NO_DRAFTED_ELIGIBLE_LEADS');
 if(out.length<Math.min(ready.length,2*max))reasons.push('CAPACITY_OR_DUPLICATE_LIMIT');
 return {mode:'preview-only',canSend:false,planned:out.length,bySender:SENDERS.map((s,i)=>({sender:s.address,slots:out.filter(x=>x.sender===s.address).length,eventsInPreviousHour:used[i]})),schedule:out,notes:reasons};
}
