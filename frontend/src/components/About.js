import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  const expertise = t('about.expertise', { returnObjects: true });
  const certifications = t('about.certifications', { returnObjects: true });
  const certificationVisuals = [
    { src: '/certifications/autodesk-bim-management.png' },
    { src: '/certifications/acc-build-document-management.jpg' },
    { src: '/certifications/iso-19650-business-certification.png' },
  ];

  return (
    <section id="about" data-testid="about-section" className="relative overflow-x-clip" style={{ background: '#04070B' }}>
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />

      {/* Ambient glows spaced through the section so the long scroll never reads as flat */}
      <div className="absolute pointer-events-none" style={{ top: '2%', left: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(57,195,255,0.10) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '26%', right: '-10%', width: '650px', height: '650px', background: 'radial-gradient(circle, rgba(125,224,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '50%', left: '-8%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(57,195,255,0.09) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '72%', right: '-8%', width: '650px', height: '650px', background: 'radial-gradient(circle, rgba(125,224,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '92%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(57,195,255,0.08) 0%, transparent 70%)' }} />

      {/* ================= OUR STORY + PRINCIPLES ================= */}
      <div className="about-block relative z-10 py-16 lg:py-20 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <span className="about-fade text-[#39C3FF] text-xs font-medium tracking-[0.24em] uppercase" data-testid="about-label">
          {t('about.eyebrow')}
        </span>

        <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 data-testid="about-title" className="about-fade font-instrument-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[0.98] text-white">
              {t('about.storyTitleLine1')}
              <br />
              <span className="italic text-white/65">{t('about.storyTitleLine2')}</span>
            </h2>
          </div>
          <div className="about-fade lg:col-span-6 lg:col-start-7 text-white/65 text-base font-light leading-7 space-y-4">
            <p>{t('about.storyBody1')}</p>
            <p>{t('about.storyBody2')}</p>
          </div>
        </div>

        <figure className="about-fade group relative mt-10 overflow-hidden rounded-xl border border-white/10 bg-[#07131f]">
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[400px] lg:aspect-[2.65/1] lg:min-h-0">
            <img
              src="/about-collaboration.jpg"
              alt={t('about.storyImageAlt')}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
              style={{ filter: 'saturate(0.72) contrast(1.08) brightness(0.72)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#04070B]/90 via-[#04070B]/38 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04070B]/72 via-transparent to-transparent" />
            <blockquote className="absolute bottom-14 left-6 max-w-md border-l border-[#39C3FF]/60 pl-5 font-instrument-serif text-xl leading-snug text-white/90 sm:left-8 sm:text-2xl lg:left-10 lg:max-w-lg">
              {t('about.storyQuote')}
            </blockquote>
            <p className="absolute bottom-5 left-6 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55 sm:left-8 lg:left-10">
              {t('about.storyImageCaption')}
            </p>
          </div>
          <figcaption className="border-t border-white/10 px-4 py-2 text-right text-[9px] text-white/35">
            {t('about.storyImageCredit')}
          </figcaption>
        </figure>

        <div className="about-fade mt-12 grid grid-cols-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] md:grid-cols-2">
          <article className="group relative min-h-[220px] border-b border-white/10 p-7 md:border-b-0 md:border-r lg:p-8">
            <span className="absolute right-7 top-3 font-instrument-serif text-6xl text-white/[0.045] transition-colors duration-300 group-hover:text-white/[0.08]">01</span>
            <div className="relative flex h-full flex-col">
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50"><i className="h-px w-6 bg-[#39C3FF]/70" aria-hidden="true" />{t('about.missionEyebrow')}</span>
              <h3 className="mt-4 font-instrument-serif text-3xl text-white sm:text-4xl">{t('about.missionTitle')}</h3>
              <p className="mt-auto max-w-xl pt-6 text-sm font-light leading-6 text-white/60">{t('about.missionBody')}</p>
            </div>
          </article>

          <article className="group relative min-h-[220px] p-7 lg:p-8">
            <span className="absolute right-7 top-3 font-instrument-serif text-6xl text-white/[0.045] transition-colors duration-300 group-hover:text-white/[0.08]">02</span>
            <div className="relative flex h-full flex-col">
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50"><i className="h-px w-6 bg-[#39C3FF]/70" aria-hidden="true" />{t('about.visionEyebrow')}</span>
              <h3 className="mt-4 font-instrument-serif text-3xl text-white sm:text-4xl">{t('about.visionTitle')}</h3>
              <p className="mt-auto max-w-xl pt-6 text-sm font-light leading-6 text-white/60">{t('about.visionBody')}</p>
            </div>
          </article>
        </div>
      </div>

      {/* ================= COMPANY CERTIFICATION ROADMAP ================= */}
      <div className="about-block relative z-10 py-24 lg:py-32 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10">
        <div className="about-fade flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-5 block">
              {t('about.certificationEyebrow')}
            </span>
            <h3 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white max-w-3xl">
              {t('about.certificationTitleLine1')}
              <br />
              <span className="italic text-white/70">{t('about.certificationTitleLine2')}</span>
            </h3>
          </div>
          <p className="text-white/50 text-sm font-light leading-relaxed max-w-sm md:text-right">
            {t('about.certificationIntro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certifications.map((certification, index) => {
            const visual = certificationVisuals[index];
            return (
              <article
                key={certification.standard}
                className="about-fade group relative min-h-[390px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition-colors duration-300 hover:border-[#39C3FF]/35"
              >
                <div className="relative flex h-full flex-col">
                  <div className="mb-10 flex items-start justify-between gap-4">
                    <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white p-2 shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
                      <img
                        src={visual.src}
                        alt={certification.logoAlt}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="rounded-md border border-white/15 bg-white/[0.035] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
                      {certification.status}
                    </span>
                  </div>
                  <p className="font-mono text-xs tracking-[0.14em] text-white/55">{certification.standard}</p>
                  <h4 className="mt-3 font-instrument-serif text-2xl leading-tight text-white">{certification.title}</h4>
                  <p className="mt-4 text-sm font-light leading-relaxed text-white/55">{certification.description}</p>
                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* ================= LEADERSHIP ================= */}
      <div id="leadership" className="about-block relative z-10 py-20 lg:py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10 scroll-mt-28">
        <span className="about-fade text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
          {t('about.leadershipEyebrow')}
        </span>
        <h3 className="about-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-16 max-w-3xl">
          {t('about.leadershipTitle')}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="about-fade lg:col-span-4">
            <img
              src="/mario.jpg"
              alt={t('about.directorName')}
              className="w-full rounded-2xl object-cover border border-white/10"
              style={{ filter: 'saturate(0.95)' }}
            />
          </div>

          <div className="about-fade lg:col-span-8 flex flex-col justify-center">
            <h4 data-testid="about-name" className="font-instrument-serif text-3xl sm:text-4xl text-white mb-2">
              {t('about.directorName')}
            </h4>
            <p className="text-[#39C3FF] font-mono text-sm mb-6">{t('about.directorRole')}</p>

            <div className="text-white/65 text-base font-light leading-relaxed space-y-4 mb-10 max-w-2xl">
              <p>{t('about.directorBio1')}</p>
              <p>{t('about.directorBio2')}</p>
            </div>

            {/* Areas of Expertise */}
            <p className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-5">{t('about.expertiseLabel')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-10">
              {expertise.map((item, i) => (
                <div key={item} className="expertise-row flex items-baseline gap-3 border-b border-white/5 pb-2.5">
                  <span className="text-white/30 font-mono text-xs flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white/75 text-sm font-light">{item}</span>
                </div>
              ))}
            </div>

            {/* Technical environment — understated */}
            <p className="text-white/40 text-xs font-light tracking-[0.15em] uppercase mb-2">{t('about.technicalEnvironmentLabel')}</p>
            <p className="text-white/50 text-sm font-light">
              Revit · Navisworks · Solibri · Autodesk Construction Cloud · Bexel Manager · BCF Workflows
            </p>
          </div>
        </div>
      </div>

      {/* ================= ABOUT CLOSING — OUR DIRECTION ================= */}
      <div className="about-block relative z-10 py-20 lg:py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-14">
          <div className="lg:col-span-8">
            <span className="about-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              {t('about.directionEyebrow')}
            </span>
            <h3 className="about-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8">
              {t('about.directionTitleLine1')}
              <br />
              <span className="italic text-white/70">{t('about.directionTitleLine2')}</span>
            </h3>
            <p className="about-fade text-white/65 text-base font-light leading-relaxed max-w-2xl">
              {t('about.directionBody')}
            </p>
          </div>

          <div className="about-fade lg:col-span-4 flex justify-start lg:justify-end">
            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ border: '1px solid rgba(57,195,255,0.35)', background: 'rgba(57,195,255,0.05)' }}
            >
              <div
                className="absolute inset-0 rounded-full clash-pulse"
                style={{ background: 'radial-gradient(circle, rgba(57,195,255,0.35) 0%, transparent 70%)' }}
              />
              <Compass size={40} className="text-[#39C3FF] relative z-10" strokeWidth={1.2} />
            </div>
          </div>
        </div>

        <p
          className="about-fade font-instrument-serif text-2xl sm:text-3xl italic text-white/80 leading-snug max-w-2xl pl-6 md:pl-8"
          style={{ borderLeft: '2px solid rgba(57,195,255,0.5)' }}
        >
          {t('about.directionQuote')}
        </p>
      </div>

      {/* ================= TRANSITION — SELECTED WORK ================= */}
    </section>
  );
};

export default About;
