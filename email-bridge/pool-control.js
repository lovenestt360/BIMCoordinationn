const BASE = 'appB5ZouRh0zksgbR';
const CONTROL = 'tbl3vQuQDfxP2x5NP';

// Always inspect the control plane before touching legacy lead tables or providers.
// SA migration requires a separate schema adapter; never run the UK/EU processor on SA.
export async function poolPermission() {
  const token = process.env.AIRTABLE_PAT;
  if (!token) throw new Error('AIRTABLE_PAT is not configured.');
  const params = new URLSearchParams({pageSize: '100'});
  ['Control', 'Stage', 'Command', 'Status', 'Audience'].forEach(f => params.append('fields[]', f));
  const response = await fetch(`https://api.airtable.com/v0/${BASE}/${CONTROL}?${params}`, {
    headers: {Authorization: `Bearer ${token}`, Accept: 'application/json'},
    signal: AbortSignal.timeout(15000)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Control-plane read failed (HTTP ${response.status}): ${body?.error?.message || body?.error?.type || 'Unknown Airtable error'}`);
  const pools = (body.records || []).filter(r => r.fields?.Stage === 'Pool Building');
  if (body.offset || pools.length !== 1) return {allowed:false, reason:'POOL_CONTROL_AMBIGUOUS'};
  const f = pools[0].fields;
  if (f.Command !== 'Start') return {allowed:false, reason:'POOL_STOPPED', command:f.Command || 'Unset'};
  if (!['Ready','Running'].includes(f.Status)) return {allowed:false, reason:'POOL_NOT_READY', status:f.Status || 'Unset'};
  if (/south africa|SA-CON|SA-PM/i.test(f.Audience || '')) {
    return {allowed:false, reason:'SA_MIGRATION_REQUIRES_SCHEMA_ADAPTER'};
  }
  return {allowed:true};
}

export function pausedResult(permission, extra = {}) {
  return {success:true, skipped:true, processing_status:'blocked', reason:permission.reason, ...extra};
}
