import { ArrowRight, MessageCircle, FolderCog, Layers, SearchCheck, ShieldCheck, FileCheck } from 'lucide-react';

const processSteps = [
  {
    number: '01',
    title: 'Consultation & Scope Review',
    description:
      'We start by understanding your project, BIM requirements, disciplines involved, timeline, deliverables, and the level of coordination or digital support needed.',
    output: 'Clear BIM support scope',
    icon: MessageCircle,
    color: '#0EA5E9',
  },
  {
    number: '02',
    title: 'Model Intake & Workflow Setup',
    description:
      'We receive the project models, review file structure, confirm model versions, set up the federated model environment, and align the coordination workflow with the project team.',
    output: 'Ready-to-review BIM environment',
    icon: FolderCog,
    color: '#22D3EE',
  },
  {
    number: '03',
    title: 'Federated Model Review',
    description:
      'We combine and review architectural, structural, and MEP models to check discipline alignment, model positioning, coordination zones, and readiness for clash detection.',
    output: 'Federated model ready for coordination',
    icon: Layers,
    color: '#0EA5E9',
  },
  {
    number: '04',
    title: 'Clash Detection & Coordination',
    description:
      'We run clash detection, review hard clashes and clearance issues, classify priorities, separate real issues from low-value clashes, and support resolution tracking through ACC, BCF, or the agreed platform.',
    output: 'Prioritized coordination issues',
    icon: SearchCheck,
    color: '#22D3EE',
  },
  {
    number: '05',
    title: 'BIM QA/QC & Data Validation',
    description:
      'We review model quality, element classification, naming, property sets, COBie-related information, and model consistency to improve the reliability of project information.',
    output: 'Validated BIM information',
    icon: ShieldCheck,
    color: '#0EA5E9',
  },
  {
    number: '06',
    title: 'Digital Delivery & Reporting',
    description:
      'We deliver structured clash reports, QA/QC comments, validation summaries, issue logs, 4D/5D support outputs, and coordination feedback ready for project review and action.',
    output: 'Clear deliverables for decision-making',
    icon: FileCheck,
    color: '#22D3EE',
  },
];

const Process = () => {
  const scrollToSchedule = (e) => {
    e.preventDefault();
    document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: '#020617' }}>

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.035) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Ambient glow blobs */}
      <div className="absolute pointer-events-none" style={{
        top: '-80px', right: '-80px', width: '480px', height: '480px',
        background: 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 65%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '0', left: '-60px', width: '360px', height: '360px',
        background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)',
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <div className="sr-hidden mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#0EA5E9] font-mono text-sm">// PROCESS</span>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.5), transparent)' }} />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            How We <span style={{
              background: 'linear-gradient(90deg, #0EA5E9, #22D3EE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Work</span>
          </h2>

          <p className="text-[#94A3B8] max-w-2xl leading-relaxed mb-5">
            A complete BIM coordination and digital delivery workflow designed to help project teams reduce clashes, validate model quality, improve project information, and move forward with confidence before construction begins.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-[#64748B]"
            style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.14)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] output-dot" />
            Designed for design teams, contractors, BIM managers, and project teams needing reliable remote BIM support.
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="sr-hidden process-card p-6 flex flex-col"
                style={{ transitionDelay: `${i * 75}ms` }}
              >
                {/* Ghost number watermark */}
                <span
                  className="absolute select-none pointer-events-none font-black"
                  style={{
                    top: '-16px',
                    right: '12px',
                    fontSize: '110px',
                    lineHeight: 1,
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: 'rgba(14,165,233,0.04)',
                    zIndex: 0,
                  }}
                >
                  {step.number}
                </span>

                {/* Content sits above ghost */}
                <div className="relative z-10 flex flex-col flex-1">

                  {/* Top row: step badge + icon */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Step badge */}
                    <div
                      className="px-3 py-1 rounded-full font-mono text-xs font-bold tracking-widest"
                      style={{
                        background: `rgba(14,165,233,0.08)`,
                        border: `1px solid ${step.color}45`,
                        color: step.color,
                      }}
                    >
                      STEP {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className="process-icon-wrap w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(34,211,238,0.06) 100%)`,
                        border: `1px solid ${step.color}35`,
                      }}
                    >
                      <Icon size={20} style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-[15px] font-bold text-[#F1F5F9] mb-3 leading-snug"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#94A3B8] text-sm leading-relaxed flex-1 mb-5">
                    {step.description}
                  </p>

                  {/* Output tag */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                    style={{
                      background: `linear-gradient(90deg, rgba(14,165,233,0.07), rgba(34,211,238,0.03))`,
                      border: `1px solid ${step.color}25`,
                    }}
                  >
                    <div
                      className="output-dot w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: step.color }}
                    />
                    <span className="text-xs font-mono" style={{ color: step.color, opacity: 0.85 }}>
                      Output:&nbsp;<span className="text-[#CBD5E1] font-sans">{step.output}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CTA ── */}
        <div
          className="sr-hidden mt-16 rounded-xl p-8 lg:p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.07) 0%, rgba(34,211,238,0.04) 50%, rgba(14,165,233,0.07) 100%)',
            border: '1px solid rgba(14,165,233,0.2)',
          }}
        >
          {/* Background glow inside CTA */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.1) 0%, transparent 60%)',
          }} />

          <div className="relative z-10">
            <span className="inline-block text-xs text-[#0EA5E9] font-mono tracking-[3px] mb-4 uppercase">
              Next Step
            </span>

            <h3
              className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Need BIM support for an active project?
            </h3>

            <p className="text-[#94A3B8] max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              Book a consultation and share your project scope, models, timeline, and required deliverables. We'll review how Klyron Consulting can support your team with coordination, validation, reporting, and digital delivery.
            </p>

            <a
              href="#schedule"
              onClick={scrollToSchedule}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-sm font-semibold text-sm"
            >
              Book a Consultation
              <ArrowRight size={17} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Process;
