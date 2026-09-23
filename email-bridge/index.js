import { registerResearchRoutes } from './research.js';
import express from 'express';

const app = express();
app.use(express.json({ limit: '32kb' }));

const EMAILABLE_URL = 'https://api.emailable.com/v1/verify';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';
const AIRTABLE_BASE_ID = 'appB5ZouRh0zksgbR';
const LEADS_TABLE_ID = 'tblUwhxkMX3GmmjYL';
const PROSPECTING_QUEUE_TABLE_ID = 'tbl8khcFfgtOnw4ed';
const SUPPRESSION_TABLE_ID = 'tblpPtB3Gob5WLvFV';
const MAX_PROCESS_PER_RUN = 1000;
const VERIFY_CONCURRENCY = 20;
const RUN_TIME_BUDGET_MS = 270_000;

function classify(result) {
  if (!result || typeof result !== 'object') return 'Risky';
  if (result.state === 'undeliverable') return 'Invalid';
  if (result.accept_all === true) return 'Catch-all';
  if (
    result.state === 'deliverable' &&
    result.role !== true &&
    result.disposable !== true &&
    result.mailbox_full !== true
  ) {
    return 'Valid';
  }
  return 'Risky';
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeDomain(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];
}

function emailDomain(email) {
  const normalized = normalizeEmail(email);
  return normalized.includes('@') ? normalizeDomain(normalized.split('@').pop()) : '';
}

function scoreTo100(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score <= 1 ? score * 100 : score)));
}

async function verifyWithEmailable(email) {
  const apiKey = process.env.EMAILABLE_API_KEY;
  if (!apiKey) throw new Error('EMAILABLE_API_KEY is not configured.');

  const params = new URLSearchParams({
    email,
    smtp: 'true',
    accept_all: 'true',
    timeout: '10'
  });

  const response = await fetch(`${EMAILABLE_URL}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.message || body?.error || `Emailable returned HTTP ${response.status}`;
    const error = new Error(message);
    error.providerStatus = response.status;
    throw error;
  }

  const status = classify(body);
  return {
    status,
    sendEligible: status === 'Valid',
    verification: {
      state: body.state ?? null,
      reason: body.reason ?? null,
      score: body.score ?? null,
      accept_all: body.accept_all ?? null,
      role: body.role ?? null,
      disposable: body.disposable ?? null,
      mailbox_full: body.mailbox_full ?? null,
      did_you_mean: body.did_you_mean ?? null,
      smtp_provider: body.smtp_provider ?? null
    }
  };
}

async function airtableRequest(path, options = {}) {
  const token = process.env.AIRTABLE_PAT;
  if (!token) throw new Error('AIRTABLE_PAT is not configured.');

  const response = await fetch(`${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error?.message || body?.error?.type || `Airtable returned HTTP ${response.status}`;
    throw new Error(message);
  }
  return body;
}

async function listAirtableRecords(tableId, { fields = [], filterByFormula = null, maxRecords = 5000 } = {}) {
  const records = [];
  let offset = null;

  do {
    const params = new URLSearchParams();
    params.set('pageSize', '100');
    if (filterByFormula) params.set('filterByFormula', filterByFormula);
    for (const field of fields) params.append('fields[]', field);
    if (offset) params.set('offset', offset);

    const page = await airtableRequest(`${tableId}?${params.toString()}`);
    records.push(...(page.records || []));
    offset = page.offset || null;
  } while (offset && records.length < maxRecords);

  return records.slice(0, maxRecords);
}

async function updateLeadRecords(updates) {
  if (!updates.length) return;

  for (let i = 0; i < updates.length; i += 10) {
    const records = updates.slice(i, i + 10).map(({ id, fields }) => ({ id, fields }));
    await airtableRequest(LEADS_TABLE_ID, {
      method: 'PATCH',
      body: JSON.stringify({ records, typecast: true })
    });
  }
}

async function getSuppressionSets() {
  const records = await listAirtableRecords(SUPPRESSION_TABLE_ID, {
    fields: ['Email', 'Domain'],
    maxRecords: 10000
  });

  const emails = new Set();
  const domains = new Set();

  for (const record of records) {
    const email = normalizeEmail(record.fields?.Email);
    const domain = normalizeDomain(record.fields?.Domain);
    if (email) emails.add(email);
    if (domain) domains.add(domain);
  }

  return { emails, domains };
}

async function promoteReadyProspectsToLeads(limit = 1000) {
  const [queue, leads] = await Promise.all([
    listAirtableRecords(PROSPECTING_QUEUE_TABLE_ID, { fields: ['Prospect ID','First Name','Last Name','Job Title','Company','Company Domain','Work Email','LinkedIn URL','Country','Queue Status','Suppression Status','Duplicate Status'], maxRecords: 10000 }),
    listAirtableRecords(LEADS_TABLE_ID, { fields: ['Work Email'], maxRecords: 10000 })
  ]);
  const existing = new Set(leads.map(r => normalizeEmail(r.fields?.['Work Email'])).filter(Boolean));
  const ready = queue.filter(r => r.fields?.['Queue Status'] === 'Suppression Checked' && r.fields?.['Suppression Status'] === 'Clear' && r.fields?.['Duplicate Status'] === 'Unique' && isEmail(r.fields?.['Work Email']) && !existing.has(normalizeEmail(r.fields?.['Work Email']))).slice(0, limit);
  let promoted = 0;
  for (let i=0;i<ready.length;i+=10) {
    const chunk=ready.slice(i,i+10);
    const records=chunk.map(r=>({fields:{
      'Lead ID': r.fields?.['Prospect ID'] || `K2K-${r.id}`,
      'First Name': r.fields?.['First Name'] || '', 'Last Name': r.fields?.['Last Name'] || '',
      'Job Title': r.fields?.['Job Title'] || '', 'Company': r.fields?.['Company'] || '',
      'Company Domain': r.fields?.['Company Domain'] || undefined, 'Work Email': normalizeEmail(r.fields?.['Work Email']),
      'LinkedIn URL': r.fields?.['LinkedIn URL'] || undefined, 'Country': r.fields?.['Country'] || '',
      'Verification Status':'Not checked','Research Status':'Pending','Campaign Status':'Verification Pending'
    }}));
    await airtableRequest(LEADS_TABLE_ID,{method:'POST',body:JSON.stringify({records,typecast:true})});
    await airtableRequest(PROSPECTING_QUEUE_TABLE_ID,{method:'PATCH',body:JSON.stringify({records:chunk.map(r=>({id:r.id,fields:{'Queue Status':'Moved to Leads','Processed At':new Date().toISOString()}})),typecast:true})});
    chunk.forEach(r=>existing.add(normalizeEmail(r.fields?.['Work Email']))); promoted+=chunk.length;
  }
  return promoted;
}

async function getLeadIndexAndPending() {
  const allLeads = await listAirtableRecords(LEADS_TABLE_ID, {
    fields: ['Work Email', 'Verification Status', 'Campaign Status'],
    maxRecords: 10000
  });

  const groupedByEmail = new Map();
  for (const record of allLeads) {
    const email = normalizeEmail(record.fields?.['Work Email']);
    if (!email) continue;
    if (!groupedByEmail.has(email)) groupedByEmail.set(email, []);
    groupedByEmail.get(email).push(record);
  }

  const canonicalByEmail = new Map();
  for (const [email, records] of groupedByEmail.entries()) {
    const alreadyVerified = records.find((record) => {
      const status = record.fields?.['Verification Status'];
      return status && status !== 'Not checked';
    });
    const canonical = alreadyVerified || [...records].sort((a, b) => a.id.localeCompare(b.id))[0];
    canonicalByEmail.set(email, canonical.id);
  }

  const pending = allLeads.filter((record) => {
    const email = normalizeEmail(record.fields?.['Work Email']);
    const status = record.fields?.['Verification Status'];
    return email && (!status || status === 'Not checked');
  });

  return {
    pending: pending.slice(0, MAX_PROCESS_PER_RUN),
    canonicalByEmail
  };
}

function resultFields({ status, provider, state, reason, score = null, acceptAll = false, role = false, campaignStatus }) {
  const fields = {
    'Verification Status': status,
    'Verification Provider': provider,
    'Verification State': state || '',
    'Verification Reason': reason || '',
    'Accept All': Boolean(acceptAll),
    'Role Email': Boolean(role),
    'Verification Date': new Date().toISOString(),
    'Campaign Status': campaignStatus
  };
  if (score !== null) fields['Verification Score'] = score;
  return fields;
}

async function processOneLead(record, context) {
  const email = normalizeEmail(record.fields?.['Work Email']);
  const domain = emailDomain(email);

  if (!isEmail(email)) {
    return {
      id: record.id,
      outcome: 'invalid_format',
      fields: resultFields({
        status: 'Invalid',
        provider: 'System',
        state: 'invalid_format',
        reason: 'Email address format is invalid',
        campaignStatus: 'Hold — Invalid'
      })
    };
  }

  if (context.canonicalByEmail.get(email) !== record.id) {
    return {
      id: record.id,
      outcome: 'duplicate',
      fields: resultFields({
        status: 'Invalid',
        provider: 'System',
        state: 'duplicate',
        reason: 'Duplicate Work Email already exists in Klyron Leads',
        campaignStatus: 'Duplicate — do not contact'
      })
    };
  }

  if (context.suppression.emails.has(email) || (domain && context.suppression.domains.has(domain))) {
    return {
      id: record.id,
      outcome: 'suppressed',
      fields: resultFields({
        status: 'Invalid',
        provider: 'Suppression List',
        state: 'suppressed',
        reason: 'Email address or domain is on the Klyron suppression list',
        campaignStatus: 'Suppressed — do not contact'
      })
    };
  }

  try {
    const result = await verifyWithEmailable(email);
    const status = result.status;
    return {
      id: record.id,
      outcome: status,
      fields: resultFields({
        status,
        provider: 'Emailable',
        state: result.verification.state,
        reason: result.verification.reason,
        score: scoreTo100(result.verification.score),
        acceptAll: result.verification.accept_all,
        role: result.verification.role,
        campaignStatus: status === 'Valid' ? 'Verified — ready for outreach' : `Hold — ${status}`
      })
    };
  } catch (error) {
    // Keep this lead pending so a temporary provider/network failure is retried later.
    return {
      id: record.id,
      outcome: 'verification_error',
      fields: {
        'Verification Status': 'Not checked',
        'Verification Provider': 'Emailable',
        'Verification State': 'verification_error',
        'Verification Reason': String(error?.message || 'Verification request failed').slice(0, 500),
        'Verification Date': new Date().toISOString(),
        'Campaign Status': 'Hold — verification error'
      }
    };
  }
}

app.get('/api/verify-email', (_req, res) => {
  res.json({
    ok: true,
    service: 'klyron-emailable-bridge',
    configured: Boolean(process.env.EMAILABLE_API_KEY),
    endpoint: '/api/verify-email',
    method: 'POST'
  });
});

app.post('/api/verify-email', async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isEmail(email)) {
    return res.status(400).json({
      success: false,
      email: email || null,
      status: 'Invalid',
      send_eligible: false,
      error: 'A valid email address is required.'
    });
  }

  try {
    const result = await verifyWithEmailable(email);
    return res.json({
      success: true,
      email,
      status: result.status,
      send_eligible: result.sendEligible,
      verification: result.verification
    });
  } catch (error) {
    const providerStatus = error?.providerStatus;
    return res.status(providerStatus === 249 ? 202 : providerStatus === 401 ? 502 : 502).json({
      success: false,
      email,
      status: 'Risky',
      send_eligible: false,
      provider_status: providerStatus ?? null,
      error: String(error?.message || 'Verification provider request failed.')
    });
  }
});

app.get('/api/process-leads/status', (_req, res) => {
  res.json({
    ok: true,
    service: 'klyron-lead-verification-processor',
    airtable_configured: Boolean(process.env.AIRTABLE_PAT),
    emailable_configured: Boolean(process.env.EMAILABLE_API_KEY),
    cron_secret_configured: Boolean(process.env.CRON_SECRET),
    max_per_run: MAX_PROCESS_PER_RUN
  });
});

app.get('/api/process-leads', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = req.headers.authorization || '';

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!process.env.AIRTABLE_PAT || !process.env.EMAILABLE_API_KEY) {
    return res.status(503).json({
      success: false,
      error: 'Required integration credentials are not configured.',
      airtable_configured: Boolean(process.env.AIRTABLE_PAT),
      emailable_configured: Boolean(process.env.EMAILABLE_API_KEY)
    });
  }

  const startedAt = Date.now();
  const summary = {
    pending_found: 0,
    processed: 0,
    valid: 0,
    risky: 0,
    invalid: 0,
    catch_all: 0,
    suppressed: 0,
    duplicate: 0,
    verification_error: 0,
    stopped_for_time_budget: false
  };

  try {
    const promoted = await promoteReadyProspectsToLeads(MAX_PROCESS_PER_RUN);
    summary.promoted_from_queue = promoted;
    const [suppression, leadData] = await Promise.all([
      getSuppressionSets(),
      getLeadIndexAndPending()
    ]);

    summary.pending_found = leadData.pending.length;
    const context = { suppression, canonicalByEmail: leadData.canonicalByEmail };

    for (let i = 0; i < leadData.pending.length; i += VERIFY_CONCURRENCY) {
      if (Date.now() - startedAt >= RUN_TIME_BUDGET_MS) {
        summary.stopped_for_time_budget = true;
        break;
      }

      const chunk = leadData.pending.slice(i, i + VERIFY_CONCURRENCY);
      const results = await Promise.all(chunk.map((record) => processOneLead(record, context)));
      await updateLeadRecords(results.map(({ id, fields }) => ({ id, fields })));

      for (const result of results) {
        summary.processed += 1;
        switch (result.outcome) {
          case 'Valid': summary.valid += 1; break;
          case 'Risky': summary.risky += 1; break;
          case 'Invalid':
          case 'invalid_format': summary.invalid += 1; break;
          case 'Catch-all': summary.catch_all += 1; break;
          case 'suppressed': summary.suppressed += 1; break;
          case 'duplicate': summary.duplicate += 1; break;
          case 'verification_error': summary.verification_error += 1; break;
          default: break;
        }
      }
    }

    return res.json({
      success: true,
      duration_ms: Date.now() - startedAt,
      ...summary
    });
  } catch (error) {
    console.error('Lead verification processor failed:', error);
    return res.status(500).json({
      success: false,
      duration_ms: Date.now() - startedAt,
      error: String(error?.message || 'Lead verification processor failed.'),
      ...summary
    });
  }
});

registerResearchRoutes(app);

export default app;
