import { useTranslation } from 'react-i18next';

// Software actually used on delivery, not claimed partnerships or
// certifications — logos sit on white cards since several (Autodesk,
// Solibri) are unreadable in their native dark/black colorway on this
// site's near-black background.
const PLATFORM_LOGOS = [
  { name: 'Autodesk', src: '/logos/autodesk.svg' },
  { name: 'Solibri', src: '/logos/solibri.png' },
  { name: 'BEXEL Manager', src: '/logos/bexel.webp' },
];

// Data-exchange/information-management standards Klyron delivers against —
// not companies, so shown as text badges rather than logos.
const STANDARDS = ['COBie', 'ISO 19650'];

const CredibilityStrip = () => {
  const { t } = useTranslation();
  const items = t('credibility.items', { returnObjects: true });

  return (
    <section
      data-testid="credibility-strip"
      className="relative border-y border-white/10 py-6"
      style={{ background: '#04070B' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map((item, i) => (
            <span
              key={i}
              className="text-white/50 text-xs font-light tracking-wide flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-[#39C3FF] flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>

        <div
          data-testid="platform-logos"
          className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-6 border-t border-white/10"
        >
          <span className="text-white/40 text-[10px] font-light tracking-[0.2em] uppercase mr-1">
            {t('credibility.platformsLabel')}
          </span>
          {PLATFORM_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="bg-white rounded-md h-11 px-4 flex items-center justify-center"
            >
              <img src={logo.src} alt={logo.name} className="h-5 w-auto object-contain bg-white" />
            </div>
          ))}
          <span className="w-px h-6 bg-white/15 mx-1 hidden sm:block" aria-hidden="true" />
          {STANDARDS.map((standard) => (
            <span
              key={standard}
              className="text-white text-xs font-medium tracking-wide uppercase bg-white/[0.06] border border-white/15 rounded-full px-3 py-1.5"
            >
              {standard}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CredibilityStrip;
