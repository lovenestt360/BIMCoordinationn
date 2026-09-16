// Provider-agnostic event tracking. No analytics provider is installed —
// per the conversion brief, that requires explicit approval — so this just
// pushes to window.dataLayer (creating it if needed), which is the standard
// intake array for Google Tag Manager / GA4 and most other tools. Once a
// provider is approved and connected, every call site below starts flowing
// through with zero code changes here.
//
// Documented event names (payload keys are always non-sensitive: category
// values from lib/attribution.js, section/CTA identifiers, language codes —
// never names, emails, or free text a visitor typed):
//
//   cta_click             { location, label }
//   case_study_view       { project }
//   capability_request    {}
//   consultation_start    { location }
//   consultation_complete {}
//   contact_submit        { location }
//   language_toggle       { to }
//   page_variant_view     { page, role?, company_size?, pain? }

export function trackEvent(name, payload = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
}
