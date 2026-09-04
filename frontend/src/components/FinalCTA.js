import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const FinalCTA = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.fcta-content',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="py-32 lg:py-48 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(57,195,255,0.06) 0%, transparent 60%)' }}
      />

      <div className="fcta-content max-w-3xl mx-auto px-6 text-center relative z-10">
        <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-8 block">
          {t('finalCta.eyebrow')}
        </span>
        <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6">
          {t('finalCta.titleLine1')}
          <br />
          <span className="italic text-white/70">{t('finalCta.titleLine2')}</span>
        </h2>
        <p className="text-white/65 text-base font-light leading-relaxed max-w-xl mx-auto mb-12">
          {t('finalCta.body')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#schedule"
            onClick={(e) => scrollTo(e, '#schedule')}
            className="group bg-white text-black rounded-full px-7 py-3 text-sm font-medium flex items-center gap-2"
          >
            {t('finalCta.primaryCta')}
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollTo(e, '#contact')}
            className="border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
          >
            {t('finalCta.secondaryCta')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
