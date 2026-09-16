import express from 'express';

const app = express();
app.use(express.json({ limit: '32kb' }));

const EMAILABLE_URL = 'https://api.emailable.com/v1/verify';

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
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!isEmail(email)) {
    return res.status(400).json({
      success: false,
      email: email || null,
      status: 'Invalid',
      send_eligible: false,
      error: 'A valid email address is required.'
    });
  }

  const apiKey = process.env.EMAILABLE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      email,
      status: 'Risky',
      send_eligible: false,
      error: 'EMAILABLE_API_KEY is not configured.'
    });
  }

  try {
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
      return res.status(response.status === 249 ? 202 : 502).json({
        success: false,
        email,
        status: 'Risky',
        send_eligible: false,
        provider_status: response.status,
        error: body?.message || body?.error || 'Emailable verification failed.'
      });
    }

    const status = classify(body);

    return res.json({
      success: true,
      email,
      status,
      send_eligible: status === 'Valid',
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
    });
  } catch (error) {
    console.error('Emailable verification error:', error);
    return res.status(502).json({
      success: false,
      email,
      status: 'Risky',
      send_eligible: false,
      error: 'Verification provider request failed.'
    });
  }
});

export default app;
