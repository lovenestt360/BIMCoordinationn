const OPENAI_URL = 'https://api.openai.com/v1/responses';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';
const BASE_ID = 'appB5ZouRh0zksgbR';
const LEADS = 'tblUwhxkMX3GmmjYL';
const COMPANY_RESEARCH = 'tblvqtlJanUEeBKUs';
const CONTROL = 'tbl3vQuQDfxP2x5NP';

function normDomain(v=''){return String(v).trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0].split(':')[0]}
function normName(v=''){return String(v).trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function companyKey(f){return normDomain(f['Company Domain']) || normName(f.Company)}
function boolFalse(v){return v === false || v === 0}
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
async function researchWithOpenAI(lead){
 const key=process.env.OPENAI_API_KEY;if(!key) throw new Error('OPENAI_API_KEY missing');
 const f=lead.fields||{};
 const prompt=`You are the research worker for Klyron Consulting's strict 2K prospect pool.
Research this company and person using current public web sources. Prefer official company website/projects/news/careers, then professional/LinkedIn public information, credible project/industry sources, then other web sources.
PERSON: ${f['First Name']||''} ${f['Last Name']||''}
TITLE: ${f['Job Title']||''}
COMPANY: ${f.Company||''}
DOMAIN: ${f['Company Domain']||''}
LINKEDIN: ${f['LinkedIn URL']||''}
COUNTRY: ${f.Country||''}

Strict ICP: person physically UK/Ireland/Netherlands; company 51-5000 employees; built-environment construction/civil/general contractor/specialty trade/MEP/building-services or clearly relevant engineering/consultancy; relevant decision-maker in BIM/digital/design/preconstruction/MEP/project delivery. Reject generic manufacturing, machinery, fashion, marine, industrial automation, generic mechanical/industrial engineering unless reliable evidence proves built-environment relevance.
Look for BIM/digital delivery, Revit/Navisworks/ACC/ISO 19650/coordination, projects/contracts/frameworks/mobilisation/expansion/technology adoption/vacancies. Vacancy itself is not a pain point: infer operational pressure only from responsibilities, capabilities, workload, technologies or project environment. Separate observed evidence from inference. Never invent.
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
source_urls: array of public URLs actually used;
confidence: integer 0-100.
Qualification may be Qualified only if company fit, person fit, need evidence and Klyron solution fit all pass. If evidence is weak, use Insufficient Data/Hold rather than guessing.`;
 const r=await fetch(OPENAI_URL,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_RESEARCH_MODEL||'gpt-5.6-luna',tools:[{type:'web_search',search_context_size:'medium'}],input:prompt})});
 const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b?.error?.message||`OpenAI HTTP ${r.status}`);
 const text=(b.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
 return parseJson(text)
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
  'Research Status':r.research_status==='Complete'?'Complete':'Insufficient Data','Industry / Delivery Context':r.industry_context||'','BIM / Digital Evidence':r.bim_digital_evidence||'',
  'Need Signals':r.need_signals||'','Vacancy / Project Signals':r.vacancy_project_signals||'','Pain Point Evidence':r.pain_point_evidence||'',
  'Source URLs':(r.source_urls||[]).join('\n'),'Research Confidence':Math.max(0,Math.min(100,Number(r.confidence)||0)),'Last Researched':new Date().toISOString(),
  'Cache Notes':'OpenAI web-research worker; observed evidence must remain separate from inference.'};
 Object.keys(fields).forEach(k=>fields[k]===undefined&&delete fields[k]);
 if(cache.has(key)){await patch(COMPANY_RESEARCH,[{id:cache.get(key).id,fields}]);cache.get(key).fields={...cache.get(key).fields,...fields}}
 else{const c=await create(COMPANY_RESEARCH,fields);const rec=c.records?.[0];if(rec)cache.set(key,rec)}
}
function hardFail(f){return ['Invalid','Risky','Catch-all'].includes(f['Verification Status'])||f['Company ICP Status']==='Rejected'||f['Company Research Gate']==='Rejected'||f['Person Role Gate']==='Rejected'||f['Need Evidence Gate']==='Rejected'}
function finalState(f){
 const ok=f['Verification Status']==='Valid'&&boolFalse(f['Accept All'])&&boolFalse(f['Role Email'])&&f['Company ICP Status']==='Approved'&&f['Company Research Gate']==='Approved'&&f['Person Role Gate']==='Approved'&&f['Need Evidence Gate']==='Approved'&&f['Research Status']==='Complete'&&f.Qualification==='Qualified';
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
 if(approved>=2000&&launch)await patch(CONTROL,[{id:launch.id,fields:{Status:'Ready','Command':'Idle','Last Action At':new Date().toISOString()}}]);
 return {approved,updated:updates.length,complete:approved>=2000}
}
export function registerResearchRoutes(app){
 app.get('/api/process-research/status',(_req,res)=>res.json({ok:true,service:'klyron-openai-research-worker',openai_configured:Boolean(process.env.OPENAI_API_KEY),airtable_configured:Boolean(process.env.AIRTABLE_PAT),model:process.env.OPENAI_RESEARCH_MODEL||'gpt-5.6-luna'}));
 app.get('/api/process-research',async(req,res)=>{
  if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({success:false,error:'Unauthorized'});
  if(!process.env.OPENAI_API_KEY||!process.env.AIRTABLE_PAT)return res.status(503).json({success:false,error:'Required credentials missing',openai_configured:Boolean(process.env.OPENAI_API_KEY),airtable_configured:Boolean(process.env.AIRTABLE_PAT)});
  const limit=Math.max(1,Math.min(40,Number(req.query.limit)||40));const testRecordId=String(req.query.recordId||'').trim();const summary={selected:0,researched:0,qualified:0,processed:[],errors:[]};
  try{
   const [leads,companies]=await Promise.all([list(LEADS,['First Name','Last Name','Job Title','Company','Company Domain','LinkedIn URL','Country','Research Status','Verification Status','Accept All','Role Email','Company ICP Status','Company Research Gate','Person Role Gate','Need Evidence Gate','Qualification','Final 2K Gate'],null,10000),list(COMPANY_RESEARCH,[],null,10000)]);
   const cache=new Map(companies.map(x=>[String(x.fields?.['Company Key']||'').toLowerCase(),x]).filter(x=>x[0]));
   const eligible=leads.filter(x=>(!testRecordId||x.id===testRecordId)&&['Pending','Researching',undefined].includes(x.fields?.['Research Status'])&&x.fields?.Company&&x.fields?.['Job Title']).slice(0,limit);summary.selected=eligible.length;
   for(const lead of eligible){try{await patch(LEADS,[{id:lead.id,fields:{'Research Status':'Researching','Qualification':'Researching','Company Research Gate':'Researching','Person Role Gate':'Researching'}}]);const r=await researchWithOpenAI(lead);await upsertCompany(lead,r,cache);await patch(LEADS,[{id:lead.id,fields:leadUpdate(r)}]);summary.researched++;summary.processed.push({id:lead.id,name:[lead.fields?.['First Name'],lead.fields?.['Last Name']].filter(Boolean).join(' '),company:lead.fields?.Company,qualification:r.qualification,research_status:r.research_status,company_icp:r.company_icp,company_research_gate:r.company_research_gate,person_role_gate:r.person_role_gate,need_evidence_gate:r.need_evidence_gate,confidence:r.confidence});if(r.qualification==='Qualified')summary.qualified++}catch(e){summary.errors.push({id:lead.id,error:String(e.message||e).slice(0,300)});await patch(LEADS,[{id:lead.id,fields:{'Research Status':'Pending','Qualification':'New','Company Research Gate':'Pending','Person Role Gate':'Pending'}}]).catch(()=>{})}}
   const final=await syncFinal();return res.json({success:summary.errors.length===0,...summary,final})
  }catch(e){return res.status(500).json({success:false,error:String(e.message||e),...summary})}
 });
}
