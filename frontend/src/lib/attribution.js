// Reads cold-email / campaign attribution from the URL, validates every value
// against a fixed allow-list, and persists only the validated result for the
// rest of the session. Values here are coarse categories only — never raw
// personal data (no names, emails, LinkedIn URLs, or research notes) — and
// nothing here is ever injected into visible page content; invalid or
// unlisted values are dropped silently rather than rendered or stored.

const STORAGE_KEY = 'klyron_attribution';

const ALLOWED = {
  utm_source: ['cold_email'],
  utm_medium: ['outbound'],
  role: [
    'bim_manager',
    'project_director',
    'design_manager',
    'preconstruction_manager',
    'digital_delivery_lead',
    'operations_director',
  ],
  company_size: ['small', 'medium', 'large'],
  pain: [
    'coordination_backlog',
    'team_capacity',
    'unresolved_clashes',
    'subcontractor_quality',
    'qaqc',
    'information_requirements',
    'cobie',
    'preconstruction',
    'programme_pressure',
    'urgent_review',
    '4d5d',
    'issue_closure',
  ],
};

// utm_campaign / utm_content aren't mapped to any visible content or enum —
// they only ever flow into internal tracking — so a light shape check
// (short, plain slug) is enough rather than an exhaustive allow-list.
const SLUG_PATTERN = /^[a-z0-9_-]{1,40}$/;

function readValidated(params) {
  const result = {};

  for (const [key, allowedValues] of Object.entries(ALLOWED)) {
    const raw = params.get(key);
    if (raw && allowedValues.includes(raw)) {
      result[key] = raw;
    }
  }

  for (const key of ['utm_campaign', 'utm_content']) {
    const raw = params.get(key);
    if (raw && SLUG_PATTERN.test(raw)) {
      result[key] = raw;
    }
  }

  return result;
}

// Call once on app load. Merges any newly-validated URL params into
// whatever was already captured this session, so attribution survives
// navigation from a landing page to the homepage's contact form.
export function captureAttribution() {
  if (typeof window === 'undefined') return {};

  let stored = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const fresh = readValidated(params);
  const merged = { ...stored, ...fresh };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — attribution just
    // won't persist across navigations this session, which is fine.
  }

  return merged;
}

export function getAttribution() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}
