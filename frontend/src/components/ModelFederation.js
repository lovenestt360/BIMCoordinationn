import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const DISCIPLINE_KEYS = [
  'modelFederation.disciplineArchitecture',
  'modelFederation.disciplineStructure',
  'modelFederation.disciplineMechanical',
  'modelFederation.disciplineElectrical',
  'modelFederation.disciplinePlumbing',
  'modelFederation.disciplineFire',
];

const ModelFederation = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.disc-chip',
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
      gsap.fromTo(
        '.fed-arrow',
        { autoAlpha: 0, scaleY: 0 },
        {
          autoAlpha: 1,
          scaleY: 1,
          duration: 0.6,
          delay: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
      gsap.fromTo(
        '.fed-model',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="model-federation"
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ background: '#04070B' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(57,195,255,0.08) 0%, transparent 60%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <span className="text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
          {t('modelFederation.eyebrow')}
        </span>

        <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-14 max-w-3xl">
          {t('modelFederation.titleLine1')}
          <br />
          <span className="italic text-white/70">{t('modelFederation.titleLine2')}</span>
        </h2>

        {/* Discipline convergence visual */}
        <div className="flex flex-col items-center mb-14 py-6">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {DISCIPLINE_KEYS.map((key, i) => (
              <span key={key} className="flex items-center gap-3">
                <span
                  className="disc-chip text-xs md:text-sm font-light text-white/70 border border-white/15 rounded-full px-4 py-2"
                >
                  {t(key)}
                </span>
                {i < DISCIPLINE_KEYS.length - 1 && <span className="text-white/20 text-xs">*</span>}
              </span>
            ))}
          </div>

          <div className="fed-arrow w-px h-10 bg-gradient-to-b from-white/30 to-[#39C3FF] origin-top" />

          <div className="fed-model mt-4 border border-[#39C3FF]/40 rounded-full px-8 py-3" style={{ background: 'rgba(57,195,255,0.08)' }}>
            <span className="text-[#7DE0FF] text-sm font-medium tracking-wide">{t('modelFederation.federatedModel')}</span>
          </div>
        </div>

        <p className="text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto text-center">
          {t('modelFederation.body')}
        </p>
      </div>
    </section>
  );
};

export default ModelFederation;
