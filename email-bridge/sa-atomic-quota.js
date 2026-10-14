// Redis-backed atomic reservation of outbound attempts. No credentials => no reservations.
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
// This module does not send mail.
import {SENDERS} from './sa-outbound-preflight.js';
const keyPart=s=>encodeURIComponent(String(s));
export function claimKey(sender,leadId,step){return 'sa:send:'+keyPart(sender)+':'+keyPart(leadId)+':'+keyPart(step);}
export async function redisCommand(command,env=process.env,fetcher=fetch){
 const base=env.UPSTASH_REDIS_REST_URL,token=env.UPSTASH_REDIS_REST_TOKEN;
 if(!base||!token)throw new Error('ATOMIC_STORE_NOT_CONFIGURED');
 const response=await fetcher(base,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(10000)});
 const body=await response.json();if(!response.ok||body.error)throw new Error('ATOMIC_STORE_FAILED');
 return body.result;
}
// Atomic claim via Lua, protecting concurrent workers. One sender quota sliding 60m.
// A claimed slot is intentionally NOT refunded after uncertain SMTP delivery.
const SCRIPT=`
local dedupe=KEYS[1]
local quota=KEYS[2]
local now=tonumber(ARGV[1])
local limit=tonumber(ARGV[2])
local attempt=ARGV[3]
if redis.call('EXISTS',dedupe)==1 then return {0,'DUPLICATE'} end
redis.call('ZREMRANGEBYSCORE',quota,'-inf',now-3600000)
if redis.call('ZCARD',quota)>=limit then return {0,'RATE_LIMIT'} end
redis.call('SET',dedupe,attempt,'PX',2592000000,'NX')
redis.call('ZADD',quota,now,attempt)
redis.call('PEXPIRE',quota,3600000)
return {1,'RESERVED'}
`;
export async function reserveSend({sender,leadId,step='S01',attemptId,now=Date.now(),env=process.env,command=redisCommand}){
 if(!SENDERS.some(s=>s.address===sender))throw new Error('INVALID_SENDER');
 if(!/^rec[a-zA-Z0-9]+$/.test(leadId)||!/^S(0[1-9]|10)$/.test(step)||!/^[-a-zA-Z0-9]{12,128}$/.test(attemptId||''))throw new Error('INVALID_RESERVATION');
 if(!Number.isFinite(now)||Math.abs(Date.now()-now)>300000)throw new Error('CLOCK_SKEW');
 const result=await command(['EVAL',SCRIPT,2,claimKey(sender,leadId,step),'sa:quota:'+keyPart(sender),String(now),'20',attemptId],env);
 return {reserved:Array.isArray(result)&&result[0]===1,reason:Array.isArray(result)?result[1]:'UNKNOWN',attemptId};
}
