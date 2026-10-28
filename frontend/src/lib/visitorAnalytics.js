import { supabase } from './supabase';
import { getAttribution } from './attribution';

export const CONSENT_KEY = 'klyron_cookie_consent';
export const hasAnalyticsConsent = () => typeof window !== 'undefined' && localStorage.getItem(CONSENT_KEY) === 'accepted';

export async function recordPageView(path) {
  if (!hasAnalyticsConsent() || path.startsWith('/admin')) return;
  const attribution = getAttribution();
  const referrer = document.referrer ? new URL(document.referrer).hostname : null;
  await supabase.from('visitor_events').insert({
    path: path.slice(0, 200),
    referrer: referrer?.slice(0, 200) || null,
    utm_source: attribution.utm_source || null,
    utm_campaign: attribution.utm_campaign || null,
    device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1100 ? 'tablet' : 'desktop',
    consent: 'accepted',
  });
}
