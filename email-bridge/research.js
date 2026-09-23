const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';
const BASE_ID = 'appB5ZouRh0zksgbR';
const LEADS = 'tblUwhxkMX3GmmjYL';
const COMPANY_RESEARCH = 'tblvqtlJanUEeBKUs';
const CONTROL = 'tbl3vQuQDfxP2x5NP';

function normDomain(v=''){return String(v).trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0].split(':')[0]}
function normName(v=''){return String(v).trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function companyKey(f){return normDomain(f['Company Domain']) || normName(f.Company)}
function checkboxChecked(v){return v === true || v === 1}
// Airtable omits unchecked checkbox fields from REST responses. Absence therefore means unchecked/false.
function checkboxClear(v){return !checkboxChecked(v)}
async function at(path, options={}){
 const token=process.env.AIRTABLE_PAT;if(!token) throw new Error('AIRTABLE_PAT missing');
 const r=await fetch(`${AIRTABLE_API_URL}/${BASE_ID}/${path}`,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json',...(options.headers||{})}});
 const b=await r.json().catch(()=>({}));if(!r.ok) throw new Error(b?.error?.message||`Airtable HTTP ${r.status}`);return b
}
async function list(table, fields=[], formula=null, max=5000){
 let out=[],offset=null;do{const p=new URLSearchParams({pageSize:'100'});fields.forEach(x=>p.append('fields[]',x));if(formula)p.set('filterByFormula',formula);if(offset)p.set('offset',offset);
 const b=await at(`${table}?${p}`);out.push(...(b.records||[]));offset=b.offset||null}while(offset&&out.length<max);return out.slice(0,max)
}
async function patch(table, records){for(let i=0;i<records.length;i+=10)await at(table,{method:'PATCH',body:JSON.stringify({records:records.slice(i,i+10),typecast:true})})}
async function create(table, fields){return at(table,{method:'POST',body:JSON.stringify({records:[{fields}],typecast:true})})}
function parseJson(text){
 const s=String(text||'').trim().replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
 try{return JSON.parse(s)}catch{const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(s.slice(a,b+1));throw new Error('Model returned non-JSON output')}
}
async function researchWithGemini(lead, companyCache){
 const key=process.env.GEMINI_API_KEY;if(!key) throw new Error('GEMINI_API_KEY missing');
 const f=lead.fields||{};
 const companyEvidence=companyCache?.['Research Status']==='Complete' ? JSON.stringify({company:companyCache.Company,industry:companyCache['Industry / Delivery Context'],bim:companyCache['BIM / Digital Evidence'],needs:companyCache['Need Signals'],projects:companyCache['Vacancy / Project Signals'],pain:companyCache['Pain Point Evidence'],sources:companyCache['Source URLs'],researched:companyCache['Last Researched']}).slice(0,6500) : 'No completed company cache.';
 const prompt=`You are Gemini, the research worker for Klyron Consulting's strict 2K prospect pool. Research ONLY this supplied Airtable person and their current employer; never suggest or create new prospects.
Research this company and person using current public web sources. Prefer official company website/projects/news/careers, then professional/LinkedIn public information, credible project/industry sources, then other web sources.
PERSON: ${f['First Name']||''} ${f['Last Name']||''}
TITLE: ${f['Job Title']||''}
COMPANY: ${f.Company||''}
DOMAIN: ${f['Company Domain']||''}
LINKEDIN: ${f['LinkedIn URL']||''}
COUNTRY: ${f.Country||''}
COMPANY RESEARCH CACHE: ${companyEvidence}
If the cache contains reliable company evidence, reuse its cited findings. Focus any new web searches on this person's current role or specific missing/fresh facts. Avoid repeating general company searches. Preserve relevant cached source URLs in the evidence.

Strict ICP: person physically UK/Ireland/Netherlands; company 51-5000 employees; built-environment construction/civil/general contractor/specialty trade/MEP/building-services or clearly relevant engineering/consultancy; relevant decision-maker in BIM/digital/design/preconstruction/MEP/project delivery. Reject generic manufacturing, machinery, fashion, marine, industrial automation, generic mechanical/industrial engineering unless reliable evidence proves built-environment relevance.
Look for BIM/digital delivery, Revit/Navisworks/ACC/ISO 19650/coordination, projects/contracts/frameworks/mobilisation/expansion/technology adoption/vacancies. Vacancy itself is not a pain point. Separate OBSERVED EVIDENCE from INFERENCE and never invent.
NEED-EVIDENCE RULE: need_evidence_gate may be Approved ONLY when at least one concrete, current public signal supports a specific operational pressure relevant to Klyron. Acceptable signals include a named live/recent project or framework with coordination/digital-delivery complexity; a relevant vacancy whose responsibilities reveal workload/capacity/coordination pressure; documented expansion/mobilisation; explicit BIM/digital/ISO 19650/model-coordination requirement; technology adoption/change; multidisciplinary/subcontractor coordination responsibility; or another source-backed delivery trigger. Generic statements such as 'complex projects create coordination pressure', job-title responsibilities alone, company size, sector fit, or a merely plausible BIM pain are NOT enough.
PAIN QUALITY RULE: pain_point_evidence must state the concrete observed signal(s) and source context. pain_point_hypothesis must then explain the likely operational consequence for THIS role/company and how Klyron's controlled BIM workflow/flexible coordination capacity could address it. Do not claim the inferred consequence as a fact. If you cannot identify a concrete source-backed trigger, set need_evidence_gate="Insufficient Data", qualification="Hold", and confidence no higher than 70. The email must have enough evidence to feel personally relevant and motivate a reply without pretending to know a private problem.
Return ONLY one JSON object with:
company_icp: "Approved"|"Rejected";
company_research_gate: "Approved"|"Insufficient Data"|"Rejected";
person_role_gate: "Approved"|"Rejected";
need_evidence_gate: "Approved"|"Insufficient Data"|"Rejected";
research_status: "Complete"|"Insufficient Data";
qualification: "Qualified"|"Hold"|"Disqualified";
industry_context: string;
bim_digital_evidence: string;
need_signals: string;
vacancy_project_signals: string;
pain_point_evidence: string;
website_findings: string;
person_role_evidence: string;
pain_point_hypothesis: string;
positive_signals: string;
negative_signals: string;
source_urls: array of public URLs actually used (never fabricate links);
confidence: integer 0-100.
Qualification may be Qualified only if company fit, person fit, need evidence and Klyron solution fit all pass. If evidence is weak, use Insufficient Data/Hold rather than guessing.`;
 const model=process.env.GEMINI_RESEARCH_MODEL||GEMINI_MODEL;
 const r=await fetch(`${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`,{
  method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},
  body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.2,maxOutputTokens:4096}}),
  signal:AbortSignal.timeout(90000)
 });
 const b=await r.json().catch(()=>({}));
 if(!r.ok){console.error('Klyron Gemini error',r.status,b?.error?.status||'',b?.error?.message||'');throw new Error(b?.error?.message||`Gemini HTTP ${r.status}`)}
 const candidate=b.candidates?.[0]||{};
 if(candidate.finishReason && candidate.finishReason!=='STOP')throw new Error(`Gemini finish reason: ${candidate.finishReason}`);
 const text=(candidate.content?.parts||[]).filter(x=>!x.thought&&typeof x.text==='string').map(x=>x.text).join('\n');
 const result=parseJson(text);
 const sources=(candidate.groundingMetadata?.groundingChunks||[]).map(x=>x.web?.uri).filter(x=>typeof x==='string'&&(x.startsWith('https://')||x.startsWith('http://')));
 const returned=Array.isArray(result.source_urls)?result.source_urls.filter(x=>typeof x==='string'&&(x.startsWith('https://')||x.startsWith('http://'))):[];
 result.source_urls=[...new Set([...returned,...sources])].slice(0,30);
 console.log('Klyron Gemini research usage',JSON.stringify({lead:lead.id,model,input_tokens:b.usageMetadata?.promptTokenCount||0,output_tokens:b.usageMetadata?.candidatesTokenCount||0,search_queries:candidate.groundingMetadata?.webSearchQueries?.length||0}));
 // Fail closed: qualification requires public sources, person context, company context, and a concrete need signal.
 const weakNeed = !result.need_signals || !String(result.need_signals).trim() || !result.vacancy_project_signals || !String(result.vacancy_project_signals).trim();
 if(!result.source_urls.length||!result.person_role_evidence||!result.industry_context||!result.pain_point_evidence||weakNeed){
  result.research_status='Insufficient Data';result.qualification='Hold';
  if(result.company_research_gate==='Approved'&&!result.industry_context)result.company_research_gate='Insufficient Data';
  if(result.need_evidence_gate==='Approved'&&(!result.pain_point_evidence||weakNeed))result.need_evidence_gate='Insufficient Data';
  if(weakNeed) result.confidence=Math.min(70,Number(result.confidence)||0);
 }
 return result
}
function leadUpdate(r){
 const evidence=[r.industry_context,r.bim_digital_evidence,r.need_signals,r.vacancy_project_signals,r.person_role_evidence,(r.source_urls||[]).join('\n')].filter(Boolean).join('\n\n').slice(0,95000);
 return {
  'Company ICP Status':r.company_icp,'Company Research Gate':r.company_research_gate,'Person Role Gate':r.person_role_gate,'Need Evidence Gate':r.need_evidence_gate,
  'Research Status':r.research_status,'Qualification':r.qualification,'Research Evidence':evidence,'Website Findings':String(r.website_findings||'').slice(0,95000),
  'Pain Point Hypothesis':String(r.pain_point_hypothesis||'').slice(0,95000),'Positive Signals':String(r.positive_signals||'').slice(0,95000),
  'Negative Signals':String(r.negative_signals||'').slice(0,95000),'Research Confidence':Math.max(0,Math.min(100,Number(r.confidence)||0)),'Last Researched':new Date().toISOString()
 }
}
async function upsertCompany(lead,r,cache){
 const f=lead.fields||{}, key=companyKey(f);if(!key)return;
 const fields={'Company Key':key,'Company':f.Company||'','Domain':f['Company Domain']||undefined,'Country / Markets':f.Country||'','ICP Fit':r.company_icp,
  'Research Status':r.company_research_gate==='Approved'?'Complete':'Insufficient Data','Industry / Delivery Context':r.industry_context||'','BIM / Digital Evidence':r.bim_digital_evidence||'',
  'Need Signals':r.need_signals||'','Vacancy / Project Signals':r.vacancy_project_signals||'','Pain Point Evidence':r.pain_point_evidence||'',
  'Source URLs':(r.source_urls||[]).join('\n'),'Research Confidence':Math.max(0,Math.min(100,Number(r.confidence)||0)),'Last Researched':new Date().toISOString(),
  'Cache Notes':'Gemini Google-Search-grounded research worker; observed evidence must remain separate from inference.'};
 Object.keys(fields).forEach(k=>fields[k]===undefined&&delete fields[k]);
 if(cache.has(key)&&cache.get(key).fields?.['Research Status']==='Complete'&&r.company_research_gate!=='Approved')return;
 if(cache.has(key)){await patch(COMPANY_RESEARCH,[{id:cache.get(key).id,fields}]);cache.get(key).fields={...cache.get(key).fields,...fields}}
 else{const c=await create(COMPANY_RESEARCH,fields);const rec=c.records?.[0];if(rec)cache.set(key,rec)}
}
function hardFail(f){return ['Invalid','Risky','Catch-all'].includes(f['Verification Status'])||f['Company ICP Status']==='Rejected'||f['Company Research Gate']==='Rejected'||f['Person Role Gate']==='Rejected'||f['Need Evidence Gate']==='Rejected'}
function finalState(f){
 const ok=f['Verification Status']==='Valid'&&checkboxClear(f['Accept All'])&&checkboxClear(f['Role Email'])&&f['Company ICP Status']==='Approved'&&f['Company Research Gate']==='Approved'&&f['Person Role Gate']==='Approved'&&f['Need Evidence Gate']==='Approved'&&f['Research Status']==='Complete'&&f.Qualification==='Qualified';
 return ok?'Approved':hardFail(f)?'Rejected':'Pending'
}
async function syncFinal(){
 const fields=['Verification Status','Accept All','Role Email','Company ICP Status','Company Research Gate','Person Role Gate','Need Evidence Gate','Research Status','Qualification','Final 2K Gate','Final Gate At'];
 const leads=await list(LEADS,fields,null,10000), updates=[];let approved=0;
 for(const x of leads){const next=finalState(x.fields||{});if(next==='Approved')approved++;if((x.fields?.['Final 2K Gate']||'Pending')!==next){const u={'Final 2K Gate':next};if(next==='Approved'&&!x.fields?.['Final Gate At'])u['Final Gate At']=new Date().toISOString();updates.push({id:x.id,fields:u})}}
 if(updates.length)await patch(LEADS,updates);
 const controls=await list(CONTROL,['Control','Stage','Command','Status','Target','Current Count'],null,100);
 const pool=controls.find(x=>x.fields?.Stage==='Pool Building'||/build.*2k|2k.*pool/i.test(x.fields?.Control||''));const launch=controls.find(x=>x.fields?.Stage==='Outreach'||/launch.*outreach/i.test(x.fields?.Control||''));
 if(pool){const pf={'Current Count':approved,'Last Action At':new Date().toISOString()};if(approved>=2000){pf.Status='Complete';pf.Command='Idle'}await patch(CONTROL,[{id:pool.id,fields:pf}])}
 if(approved>=2000&&launch&&launch.fields?.Command==='Idle'&&launch.fields?.Status==='Locked')await patch(CONTROL,[{id:launch.id,fields:{Status:'Ready','Last Action At':new Date().toISOString()}}]);
 return {approved,updated:updates.length,complete:approved>=2000}
}
// Start with a bounded test even after deployment; enable 100/hour only after evidence/cost review.
const DISPATCH_LIMIT = process.env.GEMINI_RESEARCH_FULL_CAPACITY === 'true' ? 100 : 2;
const BATCH_SIZE = 2;
function authorized(req){return Boolean(process.env.CRON_SECRET) && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`}
function eligible(f){return f.Company && f['Job Title'] && !['Invalid','Risky','Catch-all'].includes(f['Verification Status']) && checkboxClear(f['Accept All']) && checkboxClear(f['Role Email']) && (!f['Research Status'] || f['Research Status']==='Pending' || (f['Research Status']==='Researching' && (!f['Last Researched'] || Date.now()-Date.parse(f['Last Researched'])>30*60*1000)))}
async function dispatch(limit=DISPATCH_LIMIT){
 const leads=await list(LEADS,['First Name','Last Name','Job Title','Company','Company Domain','Verification Status','Accept All','Role Email','Research Status','Last Researched'],null,10000);
 const selected=leads.filter(x=>eligible(x.fields||{})).slice(0,limit);
 // Keep people from the same company adjacent so the second person can reuse its evidence.
 const groups=new Map();
 for(const lead of selected){const key=companyKey(lead.fields||{})||lead.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(lead.id)}
 const ordered=[...groups.values()].flat();
 const batches=[];for(let i=0;i<ordered.length;i+=BATCH_SIZE)batches.push({index:batches.length,ids:ordered.slice(i,i+BATCH_SIZE)});
 return {selected:selected.length,batches};
}
async function processBatch(ids){
 const summary={selected:ids.length,researched:0,qualified:0,processed:[],errors:[]};
 const cache=new Map();
 for(const id of ids){
  let claimed=false;
  try{
   const lead=await at(`${LEADS}/${encodeURIComponent(id)}`);
   if(!eligible(lead.fields||{}))continue;
   const key=companyKey(lead.fields||{});
   if(key&&!cache.has(key)){
    const formula=`{Company Key}="${key.replace(/\\/g,'\\\\').replace(/"/g,'\\"')}"`;
    const found=await list(COMPANY_RESEARCH,[],formula,1);
    if(found[0])cache.set(key,found[0]);
   }
   await patch(LEADS,[{id,fields:{'Research Status':'Researching','Qualification':'Researching','Company Research Gate':'Researching','Person Role Gate':'Researching','Last Researched':new Date().toISOString()}}]);claimed=true;
   const r=await researchWithGemini(lead,cache.get(key)?.fields);
   await upsertCompany(lead,r,cache);
   await patch(LEADS,[{id,fields:leadUpdate(r)}]);
   summary.researched++;if(r.qualification==='Qualified')summary.qualified++;
   summary.processed.push({id,qualification:r.qualification,research_status:r.research_status,company_icp:r.company_icp,person_role_gate:r.person_role_gate,need_evidence_gate:r.need_evidence_gate,confidence:r.confidence});
  }catch(e){
   console.error('Klyron research lead failed',id,String(e.message||e));
   summary.errors.push({id,error:String(e.message||e).slice(0,300)});
   if(claimed)await patch(LEADS,[{id,fields:{'Research Status':'Pending','Qualification':'New','Company Research Gate':'Pending','Person Role Gate':'Pending'}}]).catch(()=>{});
  }
 }
 return summary;
}
export function registerResearchRoutes(app){
 app.get('/api/process-research/gemini-test',async(req,res)=>{
  if(!authorized(req))return res.status(401).json({success:false,error:'Unauthorized'});
  if(!process.env.GEMINI_API_KEY)return res.status(503).json({success:false,error:'GEMINI_API_KEY missing'});
  const model=process.env.GEMINI_RESEARCH_MODEL||GEMINI_MODEL;
  try{
   const r=await fetch(`${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':process.env.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:'Return exactly: KLYRON_GEMINI_OK'}]}]}),signal:AbortSignal.timeout(30000)});
   const b=await r.json().catch(()=>({}));const output=(b.candidates?.[0]?.content?.parts||[]).filter(x=>!x.thought).map(x=>x.text||'').join('\n');
   return res.status(r.ok?200:r.status).json({success:r.ok,status:r.status,model,output:r.ok?output:undefined,error:r.ok?undefined:b?.error?.message});
  }catch(e){return res.status(500).json({success:false,error:String(e.message||e)})}
 });
 app.get('/api/process-research/status',(_req,res)=>res.json({ok:true,service:'klyron-gemini-research-worker',gemini_configured:Boolean(process.env.GEMINI_API_KEY),airtable_configured:Boolean(process.env.AIRTABLE_PAT),model:process.env.GEMINI_RESEARCH_MODEL||GEMINI_MODEL,hourly_target:DISPATCH_LIMIT,batch_size:BATCH_SIZE,full_capacity:DISPATCH_LIMIT===100}));
 app.get('/api/process-research/dispatch',async(req,res)=>{
  if(!authorized(req))return res.status(401).json({success:false,error:'Unauthorized'});
  if(!process.env.GEMINI_API_KEY||!process.env.AIRTABLE_PAT)return res.status(503).json({success:false,error:'Required credentials missing'});
  try{return res.json({success:true,...await dispatch(Math.min(DISPATCH_LIMIT,Math.max(1,Number.parseInt(req.query.limit,10)||DISPATCH_LIMIT)))})}catch(e){return res.status(500).json({success:false,error:String(e.message||e)})}
 });
 app.post('/api/process-research',async(req,res)=>{
  if(!authorized(req))return res.status(401).json({success:false,error:'Unauthorized'});
  if(!process.env.GEMINI_API_KEY||!process.env.AIRTABLE_PAT)return res.status(503).json({success:false,error:'Required credentials missing'});
  const ids=req.body?.ids;
  if(!Array.isArray(ids)||!ids.length||ids.length>BATCH_SIZE||ids.some(x=>typeof x!=='string'||!/^rec[a-zA-Z0-9]+$/.test(x))||new Set(ids).size!==ids.length)return res.status(400).json({success:false,error:'Expected one or two unique Airtable lead IDs'});
  try{const result=await processBatch(ids);return res.status(result.errors.length?207:200).json({success:result.errors.length===0,...result})}
  catch(e){return res.status(500).json({success:false,error:String(e.message||e)})}
 });
 // Legacy GET cannot start a large blocking run. Retain a small protected manual path.
 app.get('/api/process-research',async(req,res)=>{
  if(!authorized(req))return res.status(401).json({success:false,error:'Unauthorized'});
  try{const d=await dispatch();const ids=d.batches[0]?.ids||[];const result=await processBatch(ids);return res.json({success:result.errors.length===0,...result})}
  catch(e){return res.status(500).json({success:false,error:String(e.message||e)})}
 });
 app.post('/api/process-research/finalize',async(req,res)=>{
  if(!authorized(req))return res.status(401).json({success:false,error:'Unauthorized'});
  try{return res.json({success:true,final:await syncFinal()})}catch(e){return res.status(500).json({success:false,error:String(e.message||e)})}
 });
}
