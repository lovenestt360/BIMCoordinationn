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

// Placed alongside actual evidence (the deliverables/evidence galleries)
// rather than as a generic trust bar under the hero, so it reads as backing
// up specific work rather than a boilerplate "as seen with" strip.
const PlatformsStrip = () => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="platform-logos"
      className="flex flex-wrap items-center gap-3"
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
  );
};

export default PlatformsStrip;
