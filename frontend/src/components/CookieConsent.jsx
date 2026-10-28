import { useState } from 'react';
import { CONSENT_KEY } from '../lib/visitorAnalytics';
import './CookieConsent.css';

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(CONSENT_KEY));
  const choose = (value) => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent('klyron-consent-change', { detail: value }));
    setVisible(false);
  };
  if (!visible) return null;
  return <aside className="cookie-consent" aria-label="Cookie preferences">
    <div><strong>Your privacy matters</strong><p>We use optional analytics to understand page visits, referral sources and device types. We never use this to identify anonymous visitors.</p><a href="/privacy">Learn about your privacy</a></div>
    <div className="cookie-actions"><button onClick={() => choose('declined')}>Decline analytics</button><button className="primary" onClick={() => choose('accepted')}>Accept analytics</button></div>
  </aside>;
}
