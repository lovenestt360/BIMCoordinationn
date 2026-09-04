import { useEffect, useRef, useState } from 'react';
import { MapPin, ClipboardList, AlertTriangle, ListChecks, Wrench, BarChart3, Boxes, CheckCircle2, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import CountUp from './CountUp';

const PROJECT_META = [
  {
    id: 1,
    number: '01',
    image: '/projects/mental-health-unit.jpg',
    metrics: [{ target: 6, suffix: '+' }, { target: 1000, suffix: '+' }, {}, {}, {}],
    tools: [{ name: 'Navisworks' }, { name: 'Autodesk Construction Cloud' }],
  },
  {
    id: 2,
    number: '02',
    image: '/projects/school-project.jpg',
    metrics: [{ target: 5, suffix: '+' }, { target: 100, suffix: '+' }, { target: 50, suffix: '+' }, {}, {}],
    tools: [{ name: 'Solibri' }, { name: 'BCF' }, { name: 'Autodesk Construction Cloud' }],
  },
  {
    id: 3,
    number: '03',
    image: '/projects/water-supply-system.jpg',
    metrics: [{ target: 500, suffix: '+' }, { target: 100, suffix: '+' }, {}, {}, {}],
    tools: [{ name: 'Revit' }, { name: 'Bexel Manager' }],
  },
];

const STAGE_META = [
  { key: 'project', icon: ClipboardList, color: 'text-white/50' },
  { key: 'scope', icon: ListChecks, color: 'text-white/50' },
  { key: 'challenge', icon: AlertTriangle, color: 'text-[#FF7A1A]' },
  { key: 'solution', icon: Wrench, color: 'text-[#39C3FF]' },
  { key: 'outcome', icon: CheckCircle2, color: 'text-[#43D17A]' },
  { key: 'tools', icon: Boxes, color: 'text-white/50' },
  { key: 'numbers', icon: BarChart3, color: 'text-white/50' },
];

const Eyebrow = ({ icon: Icon, children, color = 'text-white/50' }) => (
  <div className="proj-fade flex items-center gap-2.5 mb-5">
    {Icon && <Icon size={16} className={color} strokeWidth={1.5} />}
    <span className={`${color} text-xs font-light tracking-[0.2em] uppercase`}>{children}</span>
  </div>
);

const Portfolio = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [stage, setStage] = useState(0);
  const imgRefs = useRef([]);
  const bodyRef = useRef(null);
  const sectionRef = useRef(null);

  const translatedProjects = t('portfolio.projects', { returnObjects: true });
  const projects = PROJECT_META.map((meta, i) => {
    const tr = translatedProjects[i];
    return {
      ...meta,
      ...tr,
      metrics: meta.metrics.map((m, j) => ({ ...m, ...tr.metrics[j] })),
      tools: meta.tools.map((tl, j) => ({ ...tl, ...tr.tools[j] })),
    };
  });

  const STAGES = STAGE_META.map((s) => ({
    ...s,
    label: t(`portfolio.stage${s.key.charAt(0).toUpperCase()}${s.key.slice(1)}`),
    eyebrow: t(`portfolio.eyebrow${s.key.charAt(0).toUpperCase()}${s.key.slice(1)}`),
  }));

  const project = projects[active];

  const selectProject = (i) => {
    setActive(i);
    setStage(0);
  };

  useEffect(() => {
    imgRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, { autoAlpha: i === active ? 1 : 0, duration: 0.8, ease: 'power2.out' });
    });
  }, [active]);

  useEffect(() => {
    if (!bodyRef.current) return;
    gsap.fromTo(
      bodyRef.current.querySelectorAll('.proj-fade'),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out' }
    );
  }, [active, stage]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pf-intro-fade',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      data-testid="portfolio-section"
      className="relative overflow-hidden"
      style={{ background: '#04070B' }}
    >
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />

      {/* Section intro */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 lg:px-16 pt-24 lg:pt-32 pb-10">
        <span className="pf-intro-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">{t('portfolio.eyebrow')}</span>
        <h2 className="pf-intro-fade font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-6">
          {t('portfolio.titleLine1')} <span className="italic text-white/70">{t('portfolio.titleLine2')}</span>
        </h2>
        <p className="pf-intro-fade text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl">
          {t('portfolio.intro')}
        </p>
      </div>

      {/* Project switcher */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => selectProject(i)}
              className="text-left px-5 py-4 rounded-sm border transition-colors duration-200"
              style={{
                borderColor: active === i ? 'rgba(57,195,255,0.4)' : 'rgba(255,255,255,0.1)',
                background: active === i ? 'rgba(57,195,255,0.06)' : 'transparent',
              }}
            >
              <span className="font-mono text-xs block mb-1" style={{ color: active === i ? '#39C3FF' : 'rgba(255,255,255,0.35)' }}>
                {p.number}
              </span>
              <span className="text-sm md:text-base font-medium block mb-1" style={{ color: active === i ? '#F7F9FB' : 'rgba(247,249,251,0.6)' }}>
                {p.title}
              </span>
              <span className="text-white/40 text-xs font-light">{p.category} · {p.location}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Project hero banner */}
      <div className="relative h-[38vh] md:h-[46vh] w-full overflow-hidden">
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => { imgRefs.current[i] = el; }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${p.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === active ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(4,7,11,0.95) 0%, rgba(4,7,11,0.2) 55%, rgba(4,7,11,0.5) 100%)' }} />

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-8">
          <span className="text-white/50 font-mono text-xs tracking-widest uppercase mb-3">{project.number} / {t('portfolio.eyebrow')}</span>
          <h3 className="font-instrument-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3">{project.title}</h3>
          <div className="flex items-center gap-4 text-white/60 text-sm font-light">
            <span>{project.category}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5"><MapPin size={13} />{project.location}</span>
          </div>
        </div>
      </div>

      {/* Stage tabs */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-16 pt-10">
        <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-white/10">
          {STAGES.map((s, i) => {
            const SIcon = s.icon;
            const isActive = stage === i;
            return (
              <button
                key={s.key}
                onClick={() => setStage(i)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-light whitespace-nowrap border-b-2 transition-colors duration-200 flex-shrink-0"
                style={{
                  borderColor: isActive ? '#39C3FF' : 'transparent',
                  color: isActive ? '#F7F9FB' : 'rgba(247,249,251,0.45)',
                }}
              >
                <SIcon size={14} className={isActive ? s.color : ''} strokeWidth={1.5} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Case study body — one stage at a time */}
      <div ref={bodyRef} key={`${project.id}-${stage}`} className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-16 py-14 lg:py-16" style={{ minHeight: '360px' }}>
        {STAGES[stage].key === 'project' && (
          <div>
            <Eyebrow icon={ClipboardList}>{STAGES[stage].eyebrow}</Eyebrow>
            <p className="proj-fade text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">{project.intro}</p>
          </div>
        )}

        {STAGES[stage].key === 'scope' && (
          <div>
            <Eyebrow icon={ListChecks}>{STAGES[1].eyebrow}</Eyebrow>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
              {project.scope.map((s) => (
                <div key={s} className="proj-fade group flex items-center gap-3 border-b border-white/5 pb-2.5 transition-colors duration-200 hover:border-[#39C3FF]/30">
                  <CheckCircle size={14} className="text-white/25 flex-shrink-0 transition-colors duration-200 group-hover:text-[#39C3FF]" strokeWidth={1.5} />
                  <span className="text-white/75 text-sm font-light transition-colors duration-200 group-hover:text-white">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {STAGES[stage].key === 'challenge' && (
          <div>
            <Eyebrow icon={AlertTriangle} color="text-[#FF7A1A]">{STAGES[2].eyebrow}</Eyebrow>
            <h4 className="proj-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-white mb-8 max-w-2xl">
              {project.challengeHeadline[0]}
              <br />
              <span className="italic text-white/70">{project.challengeHeadline[1]}</span>
            </h4>
            <div className="space-y-4 max-w-2xl">
              {project.challengeCopy.map((p, i) => (
                <p key={i} className="proj-fade text-white/60 text-base font-light leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        )}

        {STAGES[stage].key === 'solution' && (
          <div>
            <Eyebrow icon={Wrench} color="text-[#39C3FF]">{STAGES[3].eyebrow}</Eyebrow>
            <h4 className="proj-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-white mb-6 max-w-2xl">
              {project.solutionHeadline[0]}
              <br />
              <span className="italic text-white/70">{project.solutionHeadline[1]}</span>
            </h4>
            <p className="proj-fade text-white/65 text-base font-light leading-relaxed max-w-2xl">{project.solutionCopy}</p>
          </div>
        )}

        {STAGES[stage].key === 'outcome' && (
          <div>
            <Eyebrow icon={CheckCircle2} color="text-[#43D17A]">{STAGES[4].eyebrow}</Eyebrow>
            <p className="proj-fade text-white/75 text-base md:text-lg font-light leading-relaxed max-w-2xl">{project.outcomeCopy}</p>
          </div>
        )}

        {STAGES[stage].key === 'tools' && (
          <div>
            <Eyebrow icon={Boxes}>{STAGES[5].eyebrow}</Eyebrow>
            <div className="space-y-5 max-w-2xl">
              {project.tools.map((tool) => (
                <div key={tool.name} className="proj-fade group flex flex-col sm:flex-row sm:items-baseline sm:gap-4 border-b border-white/5 pb-4 transition-colors duration-200 hover:border-[#39C3FF]/30">
                  <span className="text-white text-sm font-medium tracking-wide uppercase sm:w-64 flex-shrink-0 transition-colors duration-200 group-hover:text-[#39C3FF]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {tool.name}
                  </span>
                  <span className="text-white/50 text-sm font-light">{tool.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {STAGES[stage].key === 'numbers' && (
          <div>
            <Eyebrow icon={BarChart3}>{STAGES[6].eyebrow}</Eyebrow>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8">
              {project.metrics.map((m) => (
                <div key={m.label} className="proj-fade border-t border-white/10 pt-5 transition-transform duration-300 hover:-translate-y-1">
                  {m.target !== undefined ? (
                    <CountUp
                      target={m.target}
                      suffix={m.suffix}
                      duration={900}
                      className="font-instrument-serif text-4xl sm:text-5xl text-white mb-3 block"
                    />
                  ) : (
                    <p className="font-instrument-serif text-4xl sm:text-5xl text-white mb-3">{m.value}</p>
                  )}
                  <p className="text-white/45 text-xs font-light tracking-wide uppercase">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
          <button
            onClick={() => setStage((s) => Math.max(0, s - 1))}
            disabled={stage === 0}
            className="text-sm font-light text-white/50 hover:text-white transition-colors duration-200 disabled:opacity-0 disabled:pointer-events-none"
          >
            {t('portfolio.back')}
          </button>
          <span className="text-white/30 text-xs font-mono">{stage + 1} / {STAGES.length}</span>
          <button
            onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))}
            disabled={stage === STAGES.length - 1}
            className="text-sm font-light text-white/50 hover:text-white transition-colors duration-200 disabled:opacity-0 disabled:pointer-events-none"
          >
            {t('portfolio.next', { label: STAGES[Math.min(stage + 1, STAGES.length - 1)]?.label })}
          </button>
        </div>
      </div>

      {/* Request full portfolio */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-16 pb-16 text-center">
        <a
          href="#contact"
          onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="inline-block border border-white/25 text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors duration-200"
        >
          {t('portfolio.requestPortfolio')}
        </a>
      </div>

      {/* Closing transition */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 lg:px-16 py-16 border-t border-white/10 text-center">
        <h3 className="font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-white mb-6">
          {t('portfolio.closingTitleLine1')}
          <br />
          <span className="italic text-white/70">{t('portfolio.closingTitleLine2')}</span>
        </h3>
        <p className="text-white/55 text-base font-light max-w-xl mx-auto">
          {t('portfolio.closingBody')}
        </p>
      </div>
    </section>
  );
};

export default Portfolio;
