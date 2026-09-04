import { useEffect, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import CountUp from './CountUp';

const Hero = () => {
  const { t } = useTranslation();
  const headlineRefs = useRef([]);
  const fadeRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headlineRefs.current, { yPercent: 100 });
      gsap.set(fadeRefs.current, { autoAlpha: 0, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.to(headlineRefs.current, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.08,
      }).to(
        fadeRefs.current,
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
        '-=0.5'
      );
    });
    return () => ctx.revert();
  }, []);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addHeadlineRef = (el) => {
    if (el && !headlineRefs.current.includes(el)) headlineRefs.current.push(el);
  };
  const addFadeRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative w-full min-h-screen overflow-hidden"
    >
      {/* Cinematic video layer */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-cinematic.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Restrained overlay — keeps the footage visually impressive */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-[#04070B]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center px-6 md:px-12 lg:px-16">
          <div className="max-w-[800px] pt-16 sm:pt-24">
            {/* Headline */}
            <h1
              data-testid="hero-title"
              className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl lg:text-[82px] xl:text-[96px] leading-[0.98] text-white mb-6"
            >
              <span className="overflow-hidden block">
                <span ref={addHeadlineRef} className="block">{t('hero.headlineLine1')}</span>
              </span>
              <span className="overflow-hidden block">
                <span ref={addHeadlineRef} className="block italic text-white/80">{t('hero.headlineLine2')}</span>
              </span>
              <span className="overflow-hidden block">
                <span ref={addHeadlineRef} className="block">{t('hero.headlineLine3')}</span>
              </span>
              <span className="overflow-hidden block">
                <span ref={addHeadlineRef} className="block">{t('hero.headlineLine4')}</span>
              </span>
            </h1>

            {/* Supporting copy */}
            <p
              ref={addFadeRef}
              data-testid="hero-subtitle"
              className="text-sm md:text-base text-white/65 font-light leading-relaxed max-w-[540px] mb-10"
            >
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div ref={addFadeRef} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16">
              <a
                href="#schedule"
                data-testid="hero-cta-primary"
                onClick={(e) => scrollToSection(e, '#schedule')}
                className="group bg-white text-black rounded-full px-7 py-3 text-sm font-medium flex items-center gap-2"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#portfolio"
                data-testid="hero-cta-secondary"
                onClick={(e) => scrollToSection(e, '#portfolio')}
                className="border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>

            {/* Stats */}
            <div
              ref={addFadeRef}
              data-testid="hero-stats"
              className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-6 border-t border-white/10"
            >
              <div>
                <CountUp target={10} suffix="+" duration={1600} className="text-2xl font-semibold text-[#39C3FF] font-mono" />
                <p className="text-xs text-white/50 mt-1">{t('hero.statProjects')}</p>
              </div>
              <div>
                <CountUp target={80} suffix="%" duration={1800} className="text-2xl font-semibold text-[#39C3FF] font-mono" />
                <p className="text-xs text-white/50 mt-1">{t('hero.statEfficiency')}</p>
              </div>
              <div>
                <CountUp target={65} suffix="%" duration={1800} className="text-2xl font-semibold text-[#39C3FF] font-mono" />
                <p className="text-xs text-white/50 mt-1">{t('hero.statCost')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pb-8 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs font-light tracking-wide">{t('hero.scrollCue')}</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
