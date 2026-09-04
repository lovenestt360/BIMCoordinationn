import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHT_KEYS = ['onDemand.highlight1', 'onDemand.highlight2', 'onDemand.highlight3', 'onDemand.highlight4'];

const OnDemandSupport = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ods-headline',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #04070B 0%, #0B2A44 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />
      <div
        className="absolute pointer-events-none"
        style={{ bottom: '-15%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(57,195,255,0.1) 0%, transparent 65%)' }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 text-center">
        <span className="text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-8 block">
          {t('onDemand.eyebrow')}
        </span>
        <h2 className="ods-headline font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-10">
          {t('onDemand.titleLine1')}
          <br />
          <span className="italic text-white/70">{t('onDemand.titleLine2')}</span>
        </h2>

        <p className="text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-14">
          {t('onDemand.body')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-14">
          {HIGHLIGHT_KEYS.map((key) => (
            <span key={key} className="text-white/55 text-sm font-light flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#39C3FF]" />
              {t(key)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnDemandSupport;
