import { useEffect, useRef } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const Deliverables = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const items = t('deliverables.items', { returnObjects: true });
  const gallery = t('deliverables.gallery', { returnObjects: true });

  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dlv-item, .dlv-gallery-item',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="deliverables"
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ background: '#04070B' }}
    >
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
          {t('deliverables.eyebrow')}
        </span>
        <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8 max-w-2xl">
          {t('deliverables.titleLine1')}
          <br />
          <span className="italic text-white/70">{t('deliverables.titleLine2')}</span>
        </h2>
        <p className="text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-14">
          {t('deliverables.body')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mb-14">
          {items.map((item, i) => (
            <div key={i} className="dlv-item flex items-center gap-3 rounded-sm border border-white/10 bg-white/[0.03] px-4 py-3">
              <FileText size={16} className="text-[#39C3FF] flex-shrink-0" />
              <span className="text-white/70 text-sm font-light">{item}</span>
            </div>
          ))}
        </div>

        <span className="text-white/40 text-xs font-light tracking-[0.2em] uppercase mb-5 block">
          {t('deliverables.galleryEyebrow')}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16" data-testid="deliverables-gallery">
          {gallery.map((g, i) => (
            <figure
              key={i}
              className="dlv-gallery-item rounded-sm border border-white/10 bg-white/[0.03] overflow-hidden group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#0B2A44]">
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="px-4 py-3 text-white/60 text-xs font-light leading-relaxed">
                {g.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <a
          href="#contact"
          onClick={(e) => scrollTo(e, '#contact')}
          data-testid="deliverables-cta"
          className="group inline-flex items-center gap-2 border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
        >
          {t('deliverables.cta')}
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
};

export default Deliverables;
