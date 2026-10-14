import {senderReadiness} from './sa-smtp-transport.js';
import {planSA} from './sa-sending-plan.js';
import {SENDERS,evaluateSA} from './sa-outbound-preflight.js';
const BASE='appB5ZouRh0zksgbR', PIPELINE='tbl0oArumIYj71OFC', SUPPRESSION='tblpPtB3Gob5WLvFV', CONTROL='tbl3vQuQDfxP2x5NP', LOG='tblh7K2naDbWw8dNV';
import {poolPermission,pausedResult} from './pool-control.js';
const norm=v=>String(v||'').trim().toLowerCase();
const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'');
const domain=v=>norm(v).replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0].split(':')[0];
async function at(path,options={}){
 let r;for(let attempt=0;attempt<4;attempt++){
  r=await fetch(`https://api.airtable.com/v0/${BASE}/${path}`,{...options,headers:{Authorization:`Bearer ${process.env.AIRTABLE_PAT}`,'Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(30000)});
  if(r.status!==429&&(r.status<500||options.method==='POST'))break;
  if(attempt<3)await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));
 }
 const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`Airtable ${r.status}: ${b.error?.message||b.error?.type||'request failed'}`);return b;
}
async function list(table){
 let records=[],offset;do{const q=new URLSearchParams({pageSize:'100'});if(offset)q.set('offset',offset);const b=await at(`${table}?${q}`);records.push(...(b.records||[]));offset=b.offset;}while(offset);return records;
}
async function patch(table,records){for(let i=0;i<records.length;i+=10)await at(table,{method:'PATCH',body:JSON.stringify({records:records.slice(i,i+10)})});}
async function log(type,details,lead){
 await at(LOG,{method:'POST',body:JSON.stringify({records:[{fields:{'Activity ID':`sa-${Date.now()}-${crypto.randomUUID()}`,'Lead ID':lead||'','Timestamp':new Date().toISOString(),'Event Type':type,'Details':JSON.stringify(details).slice(0,95000),'Source':'SA worker'}}]})});
}
function canonicalRecords(records){
 // Shared email, LinkedIn or exact person/company groups collapse transitively.
 const parent=new Map(records.map(r=>[r.id,r.id]));
 const find=id=>{let p=parent.get(id);if(p!==id){p=find(p);parent.set(id,p);}return p;};
 const aliases=new Map();
 for(const r of [...records].sort((a,b)=>String(a.fields['Prospect Key']).localeCompare(String(b.fields['Prospect Key'])))){
  const f=r.fields, keys=[];
  if(isEmail(norm(f.Email)))keys.push('email:'+norm(f.Email));
  if(f['Person LinkedIn'])keys.push('linkedin:'+norm(f['Person LinkedIn']).replace(/^https?:/,'').replace(/\/$/,''));
  if(f['First Name']&&f['Last Name']&&f.Company)keys.push('person:'+norm(f['First Name']+' '+f['Last Name']+' '+f.Company));
  for(const key of keys){if(aliases.has(key)){const a=find(aliases.get(key)),b=find(r.id);if(a!==b)parent.set(b,a);}else aliases.set(key,r.id);}
 }
 const groups=new Map();for(const r of records){const root=find(r.id);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(r);}
 const canonical=new Set();for(const group of groups.values()){
  // Prefer an email-bearing source row, then a deterministic source key.
  group.sort((a,b)=>Number(isEmail(norm(b.fields.Email)))-Number(isEmail(norm(a.fields.Email)))||String(a.fields['Prospect Key']).localeCompare(String(b.fields['Prospect Key'])));
  canonical.add(group[0].id);
 }return canonical;
}
async function suppressionData(){
 const rows=await list(SUPPRESSION),emails=new Set(),domains=new Set();
 let incomplete=rows.length===0;
 for(const r of rows){const e=norm(r.fields.Email),d=domain(r.fields.Domain);if(!e&&!d)incomplete=true;if(e)emails.add(e);if(d)domains.add(d);}
 return {emails,domains,incomplete};
}
function isSuppressed(email,s){return s.emails.has(email)||s.domains.has(email.split('@')[1]);}
// User approved unchecked-email bypass on 2026-10-14; preserve verification evidence.
function approved(f){return f.Country==='South Africa'&&['SA-CON','SA-PM'].includes(f['Campaign Key'])&&isEmail(norm(f.Email))&&(!f['Email Verification']||['Not checked','Valid'].includes(f['Email Verification']))&&!f['Accept All']&&!f['Role Email']&&f['Duplicate Gate']==='Unique'&&f['Suppression Gate']==='Clear'&&f['ICP Gate']==='Approved'&&f['Company Research Gate']==='Approved'&&f['Person Research Gate']==='Approved'&&f['Need Evidence Gate']==='Approved'&&f['Research Status']==='Complete'&&f.Qualification==='Qualified';}
async function syncSA(){
 const rows=await list(PIPELINE),updates=[];let count=0;const counts={Qualified:0,'Insufficient Data':0,Rejected:0,Pending:0};
 for(const r of rows){const f=r.fields;counts[f.Qualification||'Pending']=(counts[f.Qualification||'Pending']||0)+1;const gate=approved(f)?'Approved':f.Qualification==='Rejected'?'Rejected':'Pending';if(gate==='Approved')count++;if(f['Final SA Gate']!==gate)updates.push({id:r.id,fields:{'Final SA Gate':gate}});}
 await patch(PIPELINE,updates);
 const controls=await list(CONTROL),pool=controls.find(r=>r.fields.Stage==='Pool Building');
 if(pool)await patch(CONTROL,[{id:pool.id,fields:{'Current Count':count,'Last Action At':new Date().toISOString()}}]);
 return {approved:count,source_records:rows.length,counts,complete:count>=2000};
}
async function verifySA(){
 const start=Date.now(),records=await list(PIPELINE),canonical=canonicalRecords(records),s=await suppressionData();
 const summary={mode:'SA',processed:0,valid:0,risky:0,invalid:0,catch_all:0,duplicate:0,suppressed:0,missing_email:0,verification_error:0,warnings:s.incomplete?['SUPPRESSION_DATA_INCOMPLETE_FINAL_APPROVAL_BLOCKED']:[]};
 const fixes=[];
 for(const r of records){
  const f=r.fields,email=norm(f.Email),duplicate=!canonical.has(r.id),suppressed=isEmail(email)&&isSuppressed(email,s);
  const gates={'Duplicate Gate':duplicate?'Duplicate':'Unique','Suppression Gate':suppressed?'Suppressed':s.incomplete?'Pending':'Clear'};
  if(duplicate||suppressed||!isEmail(email)||!f.Company||!f['Job Title']){
   gates.Qualification=duplicate||suppressed?'Rejected':'Insufficient Data';gates['Research Status']='Complete';gates['Final SA Gate']=gates.Qualification==='Rejected'?'Rejected':'Pending';
   gates['Verification Reason']=duplicate?'Duplicate email or person/source identity':suppressed?'On historical suppression list':!isEmail(email)?'No usable primary email in source record':'Company or job title missing from source record';
   if(!isEmail(email))summary.missing_email++;if(duplicate)summary.duplicate++;if(suppressed)summary.suppressed++;
  }
  if(Object.entries(gates).some(([k,v])=>f[k]!==v))fixes.push({id:r.id,fields:gates});
 }
 await patch(PIPELINE,fixes);
 summary.skipped=true;summary.reason='Emailable subscription ended; paid verification disabled by user';
 await log('SA_VERIFICATION_RUN',summary);
 return {success:summary.verification_error===0,duration_ms:Date.now()-start,...summary};
}
function eligibleSA(f){
 const stale=f['Research Status']==='Researching'&&Date.now()-Date.parse(f['Last Researched']||'1970-01-01')>1800000;
 return f.Country==='South Africa'&&['SA-CON','SA-PM'].includes(f['Campaign Key'])&&f.Company&&f['Job Title']&&isEmail(norm(f.Email))&&(!f['Email Verification']||['Not checked','Valid'].includes(f['Email Verification']))&&!f['Accept All']&&!f['Role Email']&&f['Duplicate Gate']==='Unique'&&f['Suppression Gate']!=='Suppressed'&&(!f['Research Status']||['Pending','Technical Failure'].includes(f['Research Status'])||stale);
}
async function dispatchSA(limit=62){
 await verifySA(); // Reconcile source identities and suppressions without paid verification.
 const records=await list(PIPELINE),selected=records.filter(r=>eligibleSA(r.fields)).sort((a,b)=>String(a.fields['Prospect Key']).localeCompare(String(b.fields['Prospect Key']))).slice(0,Math.min(62,limit));
 const batches=[];for(let i=0;i<selected.length;i+=2)batches.push({index:batches.length,ids:selected.slice(i,i+2).map(r=>r.id)});
 await log('SA_RESEARCH_DISPATCH',{selected:selected.length,limit:Math.min(62,limit)});
 return {success:true,mode:'SA',selected:selected.length,batches};
}
async function researchSA(ids){
 const result={mode:'SA',selected:ids.length,researched:0,qualified:0,insufficient_data:0,rejected:0,errors:[],processed:[]};
 for(const id of ids){
  let claimed=false;
  try{
   const permission=await poolPermission({allowSA:true});if(!permission.allowed||permission.mode!=='SA'){result.skipped=true;result.reason=permission.reason;break;}
   const lead=await at(`${PIPELINE}/${id}`),f=lead.fields;
   if(!eligibleSA(f))continue;
   if(!process.env.GEMINI_API_KEY)throw new Error('GEMINI_API_KEY missing');
   await patch(PIPELINE,[{id,fields:{'Research Status':'Researching','Last Researched':new Date().toISOString(),'Technical Error':''}}]);claimed=true;
   const prompt=`Research ONLY this supplied existing prospect for Klyron Consulting. Never create or suggest another contact.
PERSON: ${f['First Name']} ${f['Last Name']}; TITLE: ${f['Job Title']}; COMPANY: ${f.Company}; WEBSITE: ${f.Website}; PERSON LINKEDIN: ${f['Person LinkedIn']}; SOURCE COUNTRY: ${f.Country}; CAMPAIGN: ${f['Campaign Key']}.
Use Google Search and current public sources. Prefer company/project/news/careers evidence and current professional role information. The source-country label is not proof: verify South Africa relevance and actual construction/project responsibility.
SA-CON: construction contractors and relevant construction decision-makers. Focus on rework, installation clashes, subcontractor interfaces, productivity, programme and commercial risk.
SA-PM: project-management firms, client-side PMs, owners' representatives and relevant directors, partners, project/programme managers, technical, commercial, development and PMO leaders with actual built-environment responsibility.
Do NOT require a BIM maturity level, company employee-count threshold or verified phone number. Do not reject merely because BIM is absent. Klyron provides technical coordination, information/issue tracking and verification support without replacing the PM or promising statutory certification.
A vacancy or generic job title alone is not a pain point. Need evidence must support a specific plausible technical/interface/information/workload risk and a practical Klyron intervention. Separate observed facts from inference. Do not assert actual faults, losses, compliance breaches or invitations without evidence.
Return ONLY JSON:
company_icp: Approved|Rejected;
company_research_gate: Approved|Insufficient Data|Rejected;
person_role_gate: Approved|Rejected;
need_evidence_gate: Approved|Insufficient Data|Rejected;
qualification: Qualified|Insufficient Data|Rejected;
observed_evidence: string;
person_role_evidence: string;
pain_point_hypothesis: string (clearly labeled inference);
personalisation_rationale: string;
source_urls: array of actual public URLs used.
Qualified only when company/person/South Africa relevance and need evidence all pass. Weak or unavailable evidence means Insufficient Data; clear non-fit means Rejected.`;
   const model=process.env.GEMINI_RESEARCH_MODEL||'gemini-3.5-flash-lite';
   const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':process.env.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.2,maxOutputTokens:4096}}),signal:AbortSignal.timeout(90000)});
   const b=await response.json().catch(()=>({}));if(!response.ok)throw new Error(b.error?.message||`Gemini HTTP ${response.status}`);
   const c=b.candidates?.[0];if(!c||c.finishReason&&c.finishReason!=='STOP')throw new Error('Incomplete Gemini response');
   const text=(c.content?.parts||[]).filter(p=>!p.thought&&p.text).map(p=>p.text).join('\n');
   const begin=text.indexOf('{'),end=text.lastIndexOf('}');const r=JSON.parse(text.slice(begin,end+1));
   for(const [key,values] of Object.entries({company_icp:['Approved','Rejected'],company_research_gate:['Approved','Insufficient Data','Rejected'],person_role_gate:['Approved','Rejected'],need_evidence_gate:['Approved','Insufficient Data','Rejected'],qualification:['Qualified','Insufficient Data','Rejected']}))if(!values.includes(r[key]))throw new Error('Invalid Gemini outcome: '+key);
   const grounded=(c.groundingMetadata?.groundingChunks||[]).map(x=>x.web?.uri).filter(Boolean);
   const urls=[...new Set([...grounded,...(Array.isArray(r.source_urls)?r.source_urls:[])])].filter(x=>typeof x==='string'&&/^https?:\/\//.test(x));
   let qualification=r.qualification;
   if([r.company_icp,r.company_research_gate,r.person_role_gate,r.need_evidence_gate].includes('Rejected'))qualification='Rejected';
   else if(!urls.length||!r.observed_evidence||[r.company_research_gate,r.need_evidence_gate].includes('Insufficient Data'))qualification='Insufficient Data';
   else if(qualification==='Qualified'&&![r.company_icp,r.company_research_gate,r.person_role_gate,r.need_evidence_gate].every(x=>x==='Approved'))qualification='Insufficient Data';
   const fields={'ICP Gate':r.company_icp,'Company Research Gate':r.company_research_gate,'Person Research Gate':r.person_role_gate,'Need Evidence Gate':r.need_evidence_gate,'Qualification':qualification,'Research Status':'Complete','Research Evidence':JSON.stringify({observed_evidence:r.observed_evidence,person_role_evidence:r.person_role_evidence,source_urls:urls,grounding_sources:grounded.length}).slice(0,95000),'Pain Point Hypothesis':String(r.pain_point_hypothesis||'').slice(0,95000),'Personalisation Rationale':String(r.personalisation_rationale||'').slice(0,95000),'Last Researched':new Date().toISOString(),'Technical Error':''};
   fields['Final SA Gate']=approved({...f,...fields})?'Approved':qualification==='Rejected'?'Rejected':'Pending';
   await patch(PIPELINE,[{id,fields}]);result.researched++;result[qualification==='Qualified'?'qualified':qualification==='Rejected'?'rejected':'insufficient_data']++;result.processed.push({id,qualification});
   await log('SA_RESEARCH_RESULT',{qualification,model,input_tokens:b.usageMetadata?.promptTokenCount||0,output_tokens:b.usageMetadata?.candidatesTokenCount||0},id);
  }catch(e){
   result.errors.push({id,error:String(e.message).slice(0,1000)});
   if(claimed)await patch(PIPELINE,[{id,fields:{'Research Status':'Technical Failure','Technical Error':String(e.message).slice(0,1000)}}]);
   await log('SA_TECHNICAL_FAILURE',{stage:'research',error:String(e.message).slice(0,1000)},id);
  }
 }
 return {success:result.errors.length===0,...result};
}
export function registerSARoutes(app){
 const wrap=handler=>async(req,res,next)=>{
  if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({success:false,error:'Unauthorized'});
  try{
   const p=await poolPermission({allowSA:true});if(p.mode!=='SA')return next();
   if(!p.allowed)return res.json(pausedResult(p,{selected:0,batches:[],processed:0,researched:0,qualified:0,errors:[]}));
   await handler(req,res);
  }catch(e){return res.status(500).json({success:false,mode:'SA',error:String(e.message).slice(0,1000)});}
 };
 // Preview uses present Airtable eligibility, drafts, suppressions and sent evidence.
 app.get('/api/sa-outreach/preview',async(req,res)=>{
  if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({success:false,error:'Unauthorized'});
  try{
   const [leads,suppression,activities]=await Promise.all([list(PIPELINE),list(SUPPRESSION),list(LOG)]);
   const recentEvents=activities.filter(a=>a.fields['Event Type']==='SA_SEND_CONFIRMED').map(a=>({sender:a.fields.Source,sentAt:a.fields.Timestamp}));
   const plan=planSA({leads,suppressions:suppression,recentEvents});
   return res.json({...plan,schedule:plan.schedule.slice(0,40)});
  }catch(e){return res.status(500).json({success:false,error:String(e.message).slice(0,300)});}
 });
 // Read-only, authenticated SA readiness report. Works even while Launch Outreach is paused.
 app.get('/api/sa-outreach/readiness',async(req,res)=>{
  if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({success:false,error:'Unauthorized'});
  try{
   const [rows,suppression,controls,campaigns]=await Promise.all([list(PIPELINE),list(SUPPRESSION),list(CONTROL),list('tblJrgzhvgDQr4H0u')]);
   const eligible=rows.filter(r=>evaluateSA(r,suppression).eligible);
   const control=controls.find(r=>r.fields.Control==='Launch Outreach')?.fields||{};
   const saCampaigns=campaigns.filter(r=>r.fields.Country==='South Africa').map(r=>({name:r.fields['Campaign Name'],status:r.fields.Status}));
   const senderConfigured=senderReadiness().map(sender=>({sender:sender.address,displayName:sender.name,hourlyLimit:20,smtpConfigured:sender.configured}));
   const blockers=[];
   if(control.Command!=='Start'||control.Status!=='Running')blockers.push('OUTREACH_PAUSED');
   if(saCampaigns.length!==2||saCampaigns.some(c=>c.status!=='Active'))blockers.push('CAMPAIGNS_NOT_ACTIVE');
   if(!process.env.SA_OUTREACH_LIVE_ENABLED||process.env.SA_OUTREACH_LIVE_ENABLED!=='true')blockers.push('LIVE_SENDING_DISABLED');
   if(suppression.length===0||suppression.some(r=>!r.fields.Email&&!r.fields.Domain))blockers.push('SUPPRESSION_UNAVAILABLE');
   if(senderConfigured.some(x=>!x.smtpConfigured))blockers.push('SENDER_CREDENTIALS_MISSING');
   blockers.push('ATOMIC_RATE_LIMIT_LOCK_NOT_IMPLEMENTED','SEND_JOURNAL_NOT_CONNECTED','INBOUND_STOP_EVENTS_NOT_VALIDATED');
   return res.json({success:true,mode:'read-only',sendingEnabled:false,sourceRecords:rows.length,eligible:eligible.length,senders:senderConfigured,campaigns:saCampaigns,blockers});
  }catch(e){return res.status(500).json({success:false,error:String(e.message).slice(0,300)});}
 });
 app.get('/api/process-leads',wrap(async(_q,res)=>{const r=await verifySA();return res.status(r.success?200:207).json(r);}));
 app.get('/api/process-research/dispatch',wrap(async(req,res)=>res.json(await dispatchSA(Math.min(62,Math.max(1,parseInt(req.query.limit)||62))))));
 app.post('/api/process-research',wrap(async(req,res)=>{
  const ids=req.body?.ids;if(!Array.isArray(ids)||!ids.length||ids.length>2||new Set(ids).size!==ids.length||ids.some(x=>!/^rec[a-zA-Z0-9]+$/.test(x)))return res.status(400).json({success:false,error:'Expected one or two unique Airtable IDs'});
  const r=await researchSA(ids);return res.status(r.success?200:207).json(r);
 }));
 app.get('/api/process-research',wrap(async(_req,res)=>{const d=await dispatchSA(2);const r=await researchSA(d.batches[0]?.ids||[]);return res.status(r.success?200:207).json(r);}));
 app.post('/api/process-research/finalize',wrap(async(_req,res)=>res.json({success:true,mode:'SA',final:await syncSA()})));
}

