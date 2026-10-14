import {shouldHaltLead} from './sa-inbound-signals.js';
// SA outbound preflight. Read-only: never sends email or changes Airtable.
export const SENDERS = Object.freeze([
  {address:'mario@klyronconsulting.cc',name:'Mário Quissico',hourlyMax:20},
  {address:'contact@klyronconsulting.com',name:'Klyron Consulting',hourlyMax:20}
]);
export const MAX_PER_MAILBOX=20;
export const MIN_CROSS_SENDER_GAP_MS=3*60_000;
export const MAX_CROSS_SENDER_GAP_MS=5*60_000;
const val = value => typeof value==='object'&&value!==null&&'name'in value?value.name:value;
const norm = value => String(value||'').trim().toLowerCase();
const emailOK = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function evaluateSA(lead, suppressions=[], previouslySent=new Set()){
  const f=lead?.fields||lead||{},email=norm(f.Email),domain=email.split('@')[1]||'';
  const blocked=suppressions.some(r=>{
    const x=r.fields||r;
    return (x.Email&&norm(x.Email)===email)||(x.Domain&&norm(x.Domain)===domain);
  });
  const checks={
    source:f.Country==='South Africa'&&['SA-CON','SA-PM'].includes(f['Campaign Key']),
    email:emailOK(email),
    finalGate:val(f['Final SA Gate'])==='Approved',
    qualified:val(f.Qualification)==='Qualified',
    suppression:val(f['Suppression Gate'])==='Clear'&&!blocked,
    duplicate:val(f['Duplicate Gate'])==='Unique'&&!previouslySent.has(email),
    verified:!['Invalid','Risky','Catch-all'].includes(val(f['Email Verification']))&&!f['Accept All']&&!f['Role Email'],
    research:val(f['ICP Gate'])==='Approved'&&val(f['Company Research Gate'])==='Approved'&&val(f['Person Research Gate'])==='Approved'&&val(f['Need Evidence Gate'])==='Approved'&&val(f['Research Status'])==='Complete',
    stoppage:!shouldHaltLead(f)
  };
  return {email,eligible:Object.values(checks).every(Boolean),failed:Object.keys(checks).filter(k=>!checks[k])};
}
export function validateBatch({mailboxEvents=[],crossSenderPairs=[],now=Date.now()}={}){
  const failures=[];
  for(const sender of SENDERS){
    const events=mailboxEvents.filter(e=>norm(e.sender)===sender.address&&Number.isFinite(Date.parse(e.sentAt)));
    // Sliding 60 minute window, not merely a clock-hour reset.
    for(const event of events){
      const at=Date.parse(event.sentAt);
      const count=events.filter(e=>{const t=Date.parse(e.sentAt);return t>=at-3_600_000&&t<=at}).length;
      if(count>sender.hourlyMax){failures.push('HOURLY_LIMIT:'+sender.address);break;}
    }
    const recent=events.filter(e=>Date.parse(e.sentAt)>now-3_600_000&&Date.parse(e.sentAt)<=now);
    if(recent.length>=sender.hourlyMax)failures.push('SENDER_AT_CAP:'+sender.address);
  }
  for(const pair of crossSenderPairs){
    const gap=Math.abs(Date.parse(pair.secondAt)-Date.parse(pair.firstAt));
    if(!Number.isFinite(gap)||gap<MIN_CROSS_SENDER_GAP_MS||gap>MAX_CROSS_SENDER_GAP_MS)failures.push('CROSS_SENDER_GAP');
  }
  return {valid:failures.length===0,failures:[...new Set(failures)]};
}
