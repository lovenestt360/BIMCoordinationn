import { ArrowRight, MessageCircle, FolderCog, Layers, SearchCheck, ShieldCheck, FileCheck } from 'lucide-react';

const processSteps = [
  {
    number: '01',
    title: 'Consultation & Scope Review',
    description:
      'We start by understanding your project, BIM requirements, disciplines involved, timeline, deliverables, and the level of coordination or digital support needed.',
    output: 'Clear BIM support scope',
    icon: MessageCircle,
    accent: '#0EA5E9',
  },
  {
    number: '02',
    title: 'Model Intake & Workflow Setup',
    description:
      'We receive the project models, review file structure, confirm model versions, set up the federated model environment, and align the coordination workflow with the project team.',
    output: 'Ready-to-review BIM environment',
    icon: FolderCog,
    accent: '#22D3EE',
  },
  {
    number: '03',
    title: 'Federated Model Review',
    description:
      'We combine and review architectural, structural, and MEP models to check discipline alignment, model positioning, coordination zones, and readiness for clash detection.',
    output: 'Federated model ready for coordination',
    icon: Layers,
    accent: '#0EA5E9',
  },
  {
    number: '04',
    title: 'Clash Detection & Coordination',
    description:
      'We run clash detection, review hard clashes and clearance issues, classify priorities, separate real issues from low-value clashes, and support resolution tracking through ACC, BCF, or the agreed platform.',
    output: 'Prioritized coordination issues',
    icon: SearchCheck,
    accent: '#22D3EE',
  },
  {
    number: '05',
    title: 'BIM QA/QC & Data Validation',
    description:
      'We review model quality, element classification, naming, property sets, COBie-related information, and model consistency to improve the reliability of project information.',
    output: 'Validated BIM information',
    icon: ShieldCheck,
    accent: '#0EA5E9',
  },
  {
    number: '06',
    title: 'Digital Delivery & Reporting',
    description:
      'We deliver structured clash reports, QA/QC comments, validation summaries, issue logs, 4D/5D support outputs, and coordination feedback ready for project review and action.',
    output: 'Clear deliverables for decision-making',
    icon: FileCheck,
    accent: '#22D3EE',
  },
];

const Process = () => {
  const scrollToSchedule = (e) => {
    e.preventDefault();
    document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 lg:py-32 bg-[#020617] relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Subtle radial glow top-right */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="sr-hidden mb-4">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2">// PROCESS</p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            How We <span className="text-[#0EA5E9]">Work</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mb-3">
            A complete BIM coordination and digital delivery workflow designed to help project teams reduce clashes, validate model quality, improve project information, and move forward with confidence before construction begins.
          </p>
          {/* Supporting badge */}
          <span
            className="inline-block text-xs text-[#64748B] px-3 py-1 rounded-full border border-[#1E293B] mt-2"
            style={{ background: 'rgba(14,165,233,0.04)' }}
          >
            Designed for design teams, contractors, BIM managers, and project teams needing reliable remote BIM support.
          </span>
        </div>

        {/* Step connector line (desktop only) */}
        <div className="hidden lg:flex items-center justify-between px-8 mb-[-12px] mt-12 relative z-0">
          {processSteps.slice(0, 3).map((_, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.3), rgba(34,211,238,0.15))' }} />
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="sr-hidden tech-card-hover rounded-sm bg-[#0B1120] p-6 flex flex-col"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Top row: number + icon */}
                <div className="flex items-start justify-between mb-5">
                  {/* Step number box */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-sm font-mono font-bold text-lg"
                    style={{
                      background: 'rgba(14,165,233,0.07)',
                      border: `1px solid ${step.accent}50`,
                      color: step.accent,
                      letterSpacing: '1px',
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="card-icon w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300"
                    style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}
                  >
                    <Icon size={18} className="text-[#0EA5E9] transition-colors duration-300" />
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-base font-bold text-[#F8FAFC] mb-3 leading-snug"
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
                  className="flex items-center gap-2 px-3 py-2 rounded-sm"
                  style={{
                    background: 'rgba(14,165,233,0.05)',
                    border: '1px solid rgba(14,165,233,0.18)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.accent }} />
                  <span className="text-xs font-mono" style={{ color: step.accent }}>
                    Output: {step.output}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="sr-hidden mt-16 rounded-sm p-8 lg:p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(34,211,238,0.03) 100%)',
            border: '1px solid rgba(14,165,233,0.18)',
          }}
        >
          <p className="text-xs text-[#0EA5E9] font-mono tracking-widest mb-3">// NEXT STEP</p>
          <h3
            className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Need BIM support for an active project?
          </h3>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            Book a consultation and share your project scope, models, timeline, and required deliverables. We'll review how Klyron Consulting can support your team with coordination, validation, reporting, and digital delivery.
          </p>
          <a
            href="#schedule"
            onClick={scrollToSchedule}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-sm font-medium"
          >
            Book a Consultation
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Process;
