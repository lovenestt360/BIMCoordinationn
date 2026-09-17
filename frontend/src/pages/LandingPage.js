import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Expand } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import CredibilityStrip from '../components/CredibilityStrip';
import OnDemandSupport from '../components/OnDemandSupport';
import MeetingScheduler from '../components/MeetingScheduler';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingContact from '../components/FloatingContact';
import ImageLightbox from '../components/ImageLightbox';
import { Toaster } from '../components/ui/sonner';
import { getAttribution } from '../lib/attribution';
import { trackEvent } from '../lib/analytics';

gsap.registerPlugin(ScrollTrigger);

// Real project hero images, keyed by the same caseStudyProject id used in
// i18n — so the case-study section shows an actual photo instead of a bare
// text link. Paths only (not translatable content), so they live in code
// rather than being duplicated across locale files.
const CASE_STUDY_IMAGES = {
  mental_health_unit: '/projects/mental-health-unit.jpg',
  school_project: '/projects/school-project.jpg',
  water_supply_system: '/projects/water-supply-system.jpg',
};

// Dedicated hero backdrop per landing page angle — separate from the
// portfolio/case-study photos so no image repeats within the same page or
// with the homepage. Free-license stock photos (Pexels), not used anywhere
// else on the site.
const HERO_IMAGES = {
  bimManagers: '/landing-heroes/bim-managers.jpg',
  contractors: '/landing-heroes/contractors.jpg',
  clashCoordination: '/landing-heroes/clash-coordination.jpg',
  modelQaQc: '/landing-heroes/model-qa-qc.jpg',
  preconstruction: '/landing-heroes/preconstruction.jpg',
  digitalDelivery: '/landing-heroes/digital-delivery.jpg',
};

// Shared shell for every cold-email landing page. Content is driven entirely
// by i18n under `landingPages.<variantKey>` so adding a new angle only means
// adding translations, not a new component.
// The Detection -> Closure clash workflow only reads as evidence on pages
// whose pain point is actually the clash-resolution cycle itself — showing
// it on e.g. the QA/QC or procurement pages would be a non-sequitur.
const SHOW_CLASH_WORKFLOW = ['contractors', 'clashCoordination'];

const LandingPage = ({ variantKey }) => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const v = (key) => t(`landingPages.${variantKey}.${key}`);
  const problemItems = t(`landingPages.${variantKey}.problemItems`, { returnObjects: true });
  const caseStudyProject = t(`landingPages.${variantKey}.caseStudyProject`);
  const evidence = t(`landingPages.${variantKey}.evidence`, { returnObjects: true });
  const workflowSteps = t('clashDetection.workflowSteps', { returnObjects: true });

  useEffect(() => {
    const attribution = getAttribution();
    trackEvent('page_variant_view', { page: variantKey, ...attribution });
  }, [variantKey]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.lp-fade').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantKey]);

  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div key={variantKey} ref={sectionRef} data-testid="landing-page-variant" className="min-h-screen bg-[#04070B]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 px-6 md:px-12 lg:px-16 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGES[variantKey]}')`, filter: 'brightness(0.85) contrast(1.1)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(120deg, rgba(4,7,11,0.85) 0%, rgba(4,7,11,0.45) 45%, rgba(4,7,11,0.7) 100%)' }}
          />
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="lp-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {v('eyebrow')}
            </span>
            <h1 className="lp-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8 max-w-3xl">
              {v('headline')}
            </h1>
            <p className="lp-fade text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-10">
              {v('subtitle')}
            </p>
            <div className="lp-fade flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <a
                href="#schedule"
                onClick={(e) => {
                  scrollTo(e, '#schedule');
                  trackEvent('consultation_start', { location: `${variantKey}_hero` });
                }}
                data-testid="landing-cta-primary"
                className="group bg-white text-black rounded-full px-7 py-3 text-sm font-medium flex items-center gap-2"
              >
                {v('ctaPrimary')}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  scrollTo(e, '#contact');
                  trackEvent('capability_request', { location: `${variantKey}_hero` });
                }}
                className="border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
              >
                {v('ctaSecondary')}
              </a>
            </div>
            <p className="lp-fade text-xs text-white/50 font-light">{v('reassurance')}</p>
          </div>
        </section>

        <CredibilityStrip />

        {/* Problem */}
        <section className="py-28 lg:py-40 px-6 md:px-12 lg:px-16 relative overflow-hidden" style={{ background: '#04070B' }}>
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="lp-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {v('problemEyebrow')}
            </span>
            <h2 className="lp-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-white mb-8">
              {v('problemTitleLine1')}
              <br />
              <span className="italic text-white/70">{v('problemTitleLine2')}</span>
            </h2>
            <p className="lp-fade text-white/65 text-base font-light leading-relaxed max-w-2xl mb-12">
              {v('problemBody')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mb-16">
              {problemItems.map((item, i) => (
                <div key={i} className="lp-fade flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] flex-shrink-0 mt-2" />
                  <span className="text-white/65 text-sm md:text-base font-light leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            {/* Clash-resolution workflow — same visual language as the homepage's
                Clash Detection section, shown only where it's directly relevant */}
            {SHOW_CLASH_WORKFLOW.includes(variantKey) && (
              <div
                data-testid="landing-workflow-sequence"
                className="lp-fade flex flex-wrap items-center gap-x-1 gap-y-3 mb-16"
              >
                {workflowSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-1">
                    <span className="text-white text-xs font-medium tracking-wide uppercase bg-white/[0.06] border border-white/15 rounded-full px-3 py-1.5">
                      {step}
                    </span>
                    {i < workflowSteps.length - 1 && (
                      <ArrowRight size={12} className="text-white/30 mx-1 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Evidence — real screenshots, not just claims */}
            <span className="lp-fade text-white/40 text-xs font-light tracking-[0.2em] uppercase mb-5 block">
              {v('evidenceEyebrow')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="landing-evidence-gallery">
              {evidence.map((item, i) => (
                <figure
                  key={i}
                  className="lp-fade rounded-sm border border-white/10 bg-white/[0.03] overflow-hidden group cursor-pointer"
                  onClick={() => setLightboxImage(item)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0B2A44]">
                    <img
                      src={item.src}
                      alt={item.caption}
                      loading="lazy"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
                      <Expand size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <figcaption className="px-4 py-3 text-white/60 text-xs font-light leading-relaxed">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <OnDemandSupport />

        {/* Related case study */}
        <section className="py-28 lg:py-40 px-6 md:px-12 lg:px-16 relative overflow-hidden border-t border-white/10" style={{ background: '#04070B' }}>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <span className="lp-fade text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
                  {v('caseStudyEyebrow')}
                </span>
                <h2 className="lp-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-white mb-6 max-w-2xl">
                  {v('caseStudyTitle')}
                </h2>
                <p className="lp-fade text-white/65 text-base font-light leading-relaxed max-w-2xl mb-10">
                  {v('caseStudyBody')}
                </p>
                <a
                  href="/#portfolio"
                  onClick={() => trackEvent('case_study_view', { project: caseStudyProject, location: variantKey })}
                  className="lp-fade group inline-flex items-center gap-2 border border-white/30 text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-white/10 hover:border-white/60 transition-colors duration-200"
                >
                  {v('caseStudyCta')}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
              <div className="lp-fade lg:col-span-5">
                <img
                  src={CASE_STUDY_IMAGES[caseStudyProject]}
                  alt={v('caseStudyTitle')}
                  className="w-full rounded-2xl object-cover border border-white/10"
                  style={{ filter: 'saturate(0.95)' }}
                />
              </div>
            </div>
          </div>
        </section>

        <MeetingScheduler
          headerOverride={{
            titleLine1: v('finalTitleLine1'),
            titleLine2: v('finalTitleLine2'),
            subtitle: v('finalBody'),
            reassurance: v('reassurance'),
          }}
        />

        <Contact />
      </main>
      <Footer />
      <FloatingContact />
      <Toaster position="bottom-right" />
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};

export default LandingPage;
