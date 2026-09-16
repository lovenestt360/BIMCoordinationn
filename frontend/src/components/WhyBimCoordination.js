import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const PROBLEM_KEYS = [
  'whyBim.problem1',
  'whyBim.problem2',
  'whyBim.problem3',
  'whyBim.problem4',
];

const WhyBimCoordination = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
      gsap.fromTo(
        '.wby-item',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-bim"
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ background: '#04070B' }}
    >
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {t('whyBim.eyebrow')}
            </span>

            <h2
              ref={headlineRef}
              className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8 max-w-3xl"
            >
              {t('whyBim.titleLine1')}
              <br />
              <span className="italic text-white/70">{t('whyBim.titleLine2')}</span>
            </h2>

            <p className="text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-14">
              {t('whyBim.body')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 max-w-3xl">
              {PROBLEM_KEYS.map((key) => (
                <div key={key} className="wby-item flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] flex-shrink-0 mt-2" />
                  <span className="text-white/65 text-sm md:text-base font-light leading-relaxed">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="wby-item lg:col-span-5">
            <img
              src="/problem-cad-screen.jpg"
              alt="Reviewing detailed digital design information"
              className="w-full rounded-2xl object-cover border border-white/10"
              style={{ filter: 'saturate(0.95)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBimCoordination;
