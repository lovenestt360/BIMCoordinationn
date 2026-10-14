# South Africa outreach launch checklist

Status: **not authorized for live sending**. This branch adds previews and an isolated SMTP transport, not a production sender loop.

## Hostinger environment variables (Vercel production, encrypted)
- `SA_SMTP_MARIO_USER=mario@klyronconsulting.cc`
- `SA_SMTP_MARIO_PASSWORD` (Hostinger mailbox SMTP password; secret)
- `SA_SMTP_CONTACT_USER=contact@klyronconsulting.com`
- `SA_SMTP_CONTACT_PASSWORD` (Hostinger mailbox SMTP password; secret)
- `SA_OUTREACH_LIVE_ENABLED=false` until end-to-end validation
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for cross-worker atomic rate-limit/idempotency reservations (credentials must remain secrets)

Set values only in Vercel project environment settings. Do not include passwords in chat, repository files, CI logs, or Airtable.

## Safety gates required before activation
1. Verify Hostinger SMTP authentication using a controlled recipient and inspect actual inbox and bounce results.
2. Connect the new `sa-atomic-quota.js` Redis reservation module to the live dispatch worker when implemented. It atomically enforces 20/hour per mailbox and cross-sender lead/step idempotency; reservations are not yet wired to SMTP sends. Validate failure/retry semantics and locking before launch.
3. Re-read Airtable lead and suppression state just before each send. Treat missing suppression data as a hard stop. Only final-approved South African leads with approved personalization may enter the queue.
4. Integrate confirmed SMTP acceptance and Message-ID into a durable activity journal; ensure retries never send the same attempt twice after a timeout.
5. Poll/ingest both mailbox replies, bounces and opt-outs, and stop sequences for a human reply, booking, opt-out or permanent delivery failure.
6. Validate scheduling against Maputo time and the requested 3–5 minute sender separation. Note that two different sender domains do not guarantee inbox placement.
7. Conduct a controlled user-owned test before activating SA-CON / SA-PM. Never switch on while any readiness blocker remains.

Use `GET /api/sa-outreach/readiness` and `GET /api/sa-outreach/preview` with the existing CRON_SECRET bearer token for read-only inspection once deployed. Neither route sends mail.
