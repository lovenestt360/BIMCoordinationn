import { useEffect, useRef, useState } from 'react';
import { MapPin, ClipboardList, AlertTriangle, ListChecks, Wrench, BarChart3, Boxes, CheckCircle2, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import CountUp from './CountUp';

const projects = [
  {
    id: 1,
    number: '01',
    category: 'Healthcare',
    title: 'Mental Health Unit',
    location: 'Australia',
    image: '/projects/mental-health-unit.jpg',

    intro:
      'A multidisciplinary healthcare project in Australia, bringing together architectural, structural and building-services information within a technically complex project environment. Klyron supported the coordination process with a focus on federated model review, clash detection and structured digital issue management.',

    challengeHeadline: ['Multiple disciplines.', 'Limited coordination space.'],
    challengeCopy: [
      'The project brought together architectural, structural, HVAC, fire, plumbing and electrical models developing in parallel within a shared federated environment.',
      'As the models matured, multidisciplinary interferences accumulated across the coordination environment. The challenge was not simply finding clashes, but identifying which conflicts required project attention and making those issues visible within the coordination workflow.',
    ],

    scope: ['Federated Model Review', 'BIM Coordination', 'Clash Detection', 'Clash Review & Filtering', 'ACC-Based Issue Tracking'],

    solutionHeadline: ['From model conflicts', 'to coordinated decisions.'],
    solutionCopy:
      'The six discipline models were reviewed within a federated coordination environment to identify meaningful spatial conflicts between systems. Rather than treating every detected interference equally, clashes were reviewed in context and organised according to their coordination relevance, then communicated through Autodesk Construction Cloud so the relevant teams had clear visibility of the location, context and status of each issue.',

    metrics: [
      { target: 6, suffix: '+', label: 'Disciplines Coordinated' },
      { target: 1000, suffix: '+', label: 'Clashes Reviewed' },
      { value: 'LOD 350', label: 'Model Development' },
      { value: 'ACC', label: 'Issue Tracking' },
      { value: 'Completed', label: 'Delivery Status' },
    ],

    tools: [
      { name: 'Navisworks', role: 'Federated Model Review / Clash Detection' },
      { name: 'Autodesk Construction Cloud', role: 'Issue Management / Project Collaboration' },
    ],

    outcomeCopy:
      'The coordination process gave the project team a structured view of multidisciplinary model conflicts and a digital environment for tracking relevant issues through to resolution — rather than relying on static clash reports and ad-hoc coordination meetings.',
  },
  {
    id: 2,
    number: '02',
    category: 'Education',
    title: 'School Project',
    location: 'Australia',
    image: '/projects/school-project.jpg',

    intro:
      'An education-sector project in Australia requiring independent validation of the coordinated model before its data could support downstream information requirements. Klyron supported the project with BIM QA/QC and model validation, focused on model consistency, classification and COBie-related information.',

    challengeHeadline: ['A model that looks right.', 'Data that has to be right.'],
    challengeCopy: [
      'As the design model matured, its geometry, classification and property data needed to be reliable enough to support COBie delivery and downstream facility information — not just visually complete.',
      'The challenge was identifying inconsistencies in model rules, classification and data quality that would not necessarily be visible from a 3D view alone, and making them actionable for the design teams.',
    ],

    scope: ['BIM QA/QC', 'Model Validation', 'COBie Data Review', 'BCF Issue Reporting'],

    solutionHeadline: ['From model checks', 'to reliable information.'],
    solutionCopy:
      'The model was reviewed in Solibri against defined validation rules, checking element classification, property sets and model consistency. Findings were documented and reported back to the design teams through BCF, giving them a structured, tool-agnostic way to locate and resolve each issue directly within their own modelling software.',

    metrics: [
      { target: 5, suffix: '+', label: 'Disciplines Reviewed' },
      { target: 100, suffix: '+', label: 'Model Checks Performed' },
      { target: 50, suffix: '+', label: 'Issues Reported via BCF' },
      { value: 'LOD 350', label: 'Model Development' },
      { value: 'Completed', label: 'Delivery Status' },
    ],

    tools: [
      { name: 'Solibri', role: 'Model Validation / Rule Checking' },
      { name: 'BCF', role: 'Issue Reporting' },
      { name: 'Autodesk Construction Cloud', role: 'Project Collaboration' },
    ],

    outcomeCopy:
      'The validation process gave the design teams a clear, structured record of model and data inconsistencies ahead of COBie delivery — supporting a more reliable handover of information rather than relying on visual review alone.',
  },
  {
    id: 3,
    number: '03',
    category: 'Infrastructure',
    title: 'Water Supply System',
    location: 'Namigonha, Ribáuè District, Mozambique',
    image: '/projects/water-supply-system.jpg',

    intro:
      'A water supply infrastructure project in Namigonha, Ribáuè District, Mozambique, requiring a coordinated 3D model to support planning, quantities and cost. Klyron supported the project with Revit model development and Bexel Manager-based 4D/5D workflows.',

    challengeHeadline: ['A network of systems.', 'One set of reliable quantities.'],
    challengeCopy: [
      "Unlike a single-building coordination project, this infrastructure work needed quantities and cost data that stayed reliable as the network design developed — not a one-off take-off disconnected from the model.",
      'The challenge was keeping quantities, cost and schedule information tied directly to the model as it evolved, so planning decisions could be based on current data rather than a static estimate.',
    ],

    scope: ['Revit Model Development', 'Quantity Take-Off', 'Cost Assignment', '4D/5D Scheduling'],

    solutionHeadline: ['From a static model', 'to a live cost and schedule view.'],
    solutionCopy:
      'The infrastructure model was developed in Revit, then linked to Bexel Manager to take off quantities and assign cost directly against model elements. The same model was connected to project scheduling to build 4D/5D workflows — keeping quantities, cost and programme aligned to the model rather than tracked separately.',

    metrics: [
      { target: 500, suffix: '+', label: 'Model Elements Quantified' },
      { target: 100, suffix: '+', label: 'Cost Items Assigned' },
      { value: 'LOD 300', label: 'Model Development' },
      { value: '4D/5D', label: 'BIM Workflow' },
      { value: 'Completed', label: 'Delivery Status' },
    ],

    tools: [
      { name: 'Revit', role: 'Model Development' },
      { name: 'Bexel Manager', role: 'Quantity Take-Off / Cost & 4D-5D' },
    ],

    outcomeCopy:
      'The project team gained a model-linked view of quantities, cost and schedule — supporting planning and budgeting decisions with data drawn directly from the model rather than a disconnected estimate.',
  },
];

const STAGES = [
  { key: 'project', label: 'Project', icon: ClipboardList, color: 'text-white/50' },
  { key: 'scope', label: 'Scope', icon: ListChecks, color: 'text-white/50' },
  { key: 'challenge', label: 'Challenge', icon: AlertTriangle, color: 'text-[#FF7A1A]' },
  { key: 'solution', label: 'Solution', icon: Wrench, color: 'text-[#39C3FF]' },
  { key: 'outcome', label: 'Outcome', icon: CheckCircle2, color: 'text-[#43D17A]' },
  { key: 'tools', label: 'Tools', icon: Boxes, color: 'text-white/50' },
  { key: 'numbers', label: 'Numbers', icon: BarChart3, color: 'text-white/50' },
];

const Eyebrow = ({ icon: Icon, children, color = 'text-white/50' }) => (
  <div className="proj-fade flex items-center gap-2.5 mb-5">
    {Icon && <Icon size={16} className={color} strokeWidth={1.5} />}
    <span className={`${color} text-xs font-light tracking-[0.2em] uppercase`}>{children}</span>
  </div>
);

const Portfolio = () => {
  const [active, setActive] = useState(0);
  const [stage, setStage] = useState(0);
  const imgRefs = useRef([]);
  const bodyRef = useRef(null);
  const sectionRef = useRef(null);
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
        <span className="pf-intro-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">Selected Work</span>
        <h2 className="pf-intro-fade font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-6">
          Complex projects. <span className="italic text-white/70">Clearer coordination.</span>
        </h2>
        <p className="pf-intro-fade text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl">
          Selected project environments where multidisciplinary coordination, model review and digital
          delivery were used to turn complex project information into clearer technical decisions.
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
          <span className="text-white/50 font-mono text-xs tracking-widest uppercase mb-3">{project.number} / Selected Work</span>
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
            <Eyebrow icon={ClipboardList}>The Project</Eyebrow>
            <p className="proj-fade text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">{project.intro}</p>
          </div>
        )}

        {STAGES[stage].key === 'scope' && (
          <div>
            <Eyebrow icon={ListChecks}>Our Scope</Eyebrow>
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
            <Eyebrow icon={AlertTriangle} color="text-[#FF7A1A]">The Challenge</Eyebrow>
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
            <Eyebrow icon={Wrench} color="text-[#39C3FF]">The Solution</Eyebrow>
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
            <Eyebrow icon={CheckCircle2} color="text-[#43D17A]">The Outcome</Eyebrow>
            <p className="proj-fade text-white/75 text-base md:text-lg font-light leading-relaxed max-w-2xl">{project.outcomeCopy}</p>
          </div>
        )}

        {STAGES[stage].key === 'tools' && (
          <div>
            <Eyebrow icon={Boxes}>Digital Environment</Eyebrow>
            <div className="space-y-5 max-w-2xl">
              {project.tools.map((t) => (
                <div key={t.name} className="proj-fade group flex flex-col sm:flex-row sm:items-baseline sm:gap-4 border-b border-white/5 pb-4 transition-colors duration-200 hover:border-[#39C3FF]/30">
                  <span className="text-white text-sm font-medium tracking-wide uppercase sm:w-64 flex-shrink-0 transition-colors duration-200 group-hover:text-[#39C3FF]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {t.name}
                  </span>
                  <span className="text-white/50 text-sm font-light">{t.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {STAGES[stage].key === 'numbers' && (
          <div>
            <Eyebrow icon={BarChart3}>By the Numbers</Eyebrow>
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
            ← Back
          </button>
          <span className="text-white/30 text-xs font-mono">{stage + 1} / {STAGES.length}</span>
          <button
            onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))}
            disabled={stage === STAGES.length - 1}
            className="text-sm font-light text-white/50 hover:text-white transition-colors duration-200 disabled:opacity-0 disabled:pointer-events-none"
          >
            Next: {STAGES[Math.min(stage + 1, STAGES.length - 1)]?.label} →
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
          Request Full Portfolio
        </a>
      </div>

      {/* Closing transition */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 lg:px-16 py-16 border-t border-white/10 text-center">
        <h3 className="font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-white mb-6">
          Different projects. Different challenges.
          <br />
          <span className="italic text-white/70">The same need for clearer coordination.</span>
        </h3>
        <p className="text-white/55 text-base font-light max-w-xl mx-auto">
          When project complexity or workload increases, Klyron can also provide additional BIM
          capacity alongside existing teams.
        </p>
      </div>
    </section>
  );
};

export default Portfolio;
