import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import CredibilityStrip from '../components/CredibilityStrip';
import OnDemandSupport from '../components/OnDemandSupport';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingContact from '../components/FloatingContact';
import { Toaster } from '../components/ui/sonner';
import { getAttribution } from '../lib/attribution';
import { trackEvent } from '../lib/analytics';

gsap.registerPlugin(ScrollTrigger);

const BimSupportLanding = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const problemItems = t('bimSupport.problemItems', { returnObjects: true });

  useEffect(() => {
    const attribution = getAttribution();
    trackEvent('page_variant_view', { page: 'bim_support', ...attribution });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.bs-fade').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef} data-testid="bim-support-landing" className="min-h-screen bg-[#04070B]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 px-6 md:px-12 lg:px-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="bs-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {t('bimSupport.eyebrow')}
            </span>
            <h1 className="bs-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8 max-w-3xl">
              {t('bimSupport.headline')}
            </h1>
            <p className="bs-fade text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-10">
              {t('bimSupport.subtitle')}
            </p>
            <div className="bs-fade flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <a
                href="https://calendar.app.google/2ZdXEk3kBTXBM2DB7"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('consultation_start', { location: 'bim_support_hero' })}
                data-testid="bim-support-cta-primary"
                className="group bg-white text-black rounded-full px-7 py-3 text-sm font-medium flex items-center gap-2"
              >
                {t('bimSupport.ctaPrimary')}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  scrollTo(e, '#contact');
                  trackEvent('capability_request', { location: 'bim_support_hero' });
                }}
                className="border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
              >
                {t('bimSupport.ctaSecondary')}
              </a>
            </div>
            <p className="bs-fade text-xs text-white/50 font-light">{t('bimSupport.reassurance')}</p>
          </div>
        </section>

        <CredibilityStrip />

        {/* Problem */}
        <section className="py-28 lg:py-40 px-6 md:px-12 lg:px-16 relative overflow-hidden" style={{ background: '#04070B' }}>
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="bs-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {t('bimSupport.problemEyebrow')}
            </span>
            <h2 className="bs-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-white mb-8">
              {t('bimSupport.problemTitleLine1')}
              <br />
              <span className="italic text-white/70">{t('bimSupport.problemTitleLine2')}</span>
            </h2>
            <p className="bs-fade text-white/65 text-base font-light leading-relaxed max-w-2xl mb-12">
              {t('bimSupport.problemBody')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              {problemItems.map((item, i) => (
                <div key={i} className="bs-fade flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] flex-shrink-0 mt-2" />
                  <span className="text-white/65 text-sm md:text-base font-light leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <OnDemandSupport />

        {/* Related case study */}
        <section className="py-28 lg:py-40 px-6 md:px-12 lg:px-16 relative overflow-hidden border-t border-white/10" style={{ background: '#04070B' }}>
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="bs-fade text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {t('bimSupport.caseStudyEyebrow')}
            </span>
            <h2 className="bs-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-white mb-6 max-w-2xl">
              {t('bimSupport.caseStudyTitle')}
            </h2>
            <p className="bs-fade text-white/65 text-base font-light leading-relaxed max-w-2xl mb-10">
              {t('bimSupport.caseStudyBody')}
            </p>
            <a
              href="/#portfolio"
              onClick={() => trackEvent('case_study_view', { project: 'mental_health_unit', location: 'bim_support' })}
              className="bs-fade group inline-flex items-center gap-2 border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
            >
              {t('bimSupport.caseStudyCta')}
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-28 lg:py-36 px-6 md:px-12 lg:px-16 relative overflow-hidden border-t border-white/10" style={{ background: '#04070B' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(57,195,255,0.06) 0%, transparent 60%)' }}
          />
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="bs-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-white mb-6">
              {t('bimSupport.finalTitleLine1')}
              <br />
              <span className="italic text-white/70">{t('bimSupport.finalTitleLine2')}</span>
            </h2>
            <p className="bs-fade text-white/65 text-base font-light leading-relaxed mb-4">
              {t('bimSupport.finalBody')}
            </p>
            <div className="bs-fade flex items-center justify-center gap-2 text-white/45 text-xs font-light">
              <CheckCircle size={14} className="text-[#43D17A]" />
              {t('bimSupport.reassurance')}
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
      <FloatingContact />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default BimSupportLanding;
