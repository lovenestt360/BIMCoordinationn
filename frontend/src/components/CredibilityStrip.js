import { useTranslation } from 'react-i18next';

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
      </div>
    </section>
  );
};

export default CredibilityStrip;
