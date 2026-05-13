import { ArrowRight, ClipboardList, FolderOpen, Layers, ScanSearch, ShieldCheck, PackageCheck } from 'lucide-react';

const processSteps = [
  {
    number: '01',
    title: 'Consultation & Scope Review',
    description: 'We understand your project, BIM requirements, disciplines, timeline, and level of coordination support needed.',
    output: 'Clear BIM support scope',
    icon: ClipboardList,
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.22)',
  },
  {
    number: '02',
    title: 'Model Intake & Workflow Setup',
    description: 'We receive models, review structure, confirm versions, set up the federated environment, and align the coordination workflow.',
    output: 'Ready-to-review BIM environment',
    icon: FolderOpen,
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.22)',
  },
  {
    number: '03',
    title: 'Federated Model Review',
    description: 'We combine and review architectural, structural, and MEP models checking alignment, positioning, and coordination readiness.',
    output: 'Federated model ready for coordination',
    icon: Layers,
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.22)',
  },
  {
    number: '04',
    title: 'Clash Detection & Coordination',
    description: 'We run clash detection, classify priorities, separate real issues from noise, and track resolution through ACC or BCF.',
    output: 'Prioritized coordination issues',
    icon: ScanSearch,
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.22)',
  },
  {
    number: '05',
    title: 'BIM QA/QC & Data Validation',
    description: 'We review model quality, classification, property sets, COBie fields, and consistency to improve project information reliability.',
    output: 'Validated BIM information',
    icon: ShieldCheck,
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.22)',
  },
  {
    number: '06',
    title: 'Digital Delivery & Reporting',
    description: 'We deliver clash reports, QA/QC summaries, validation logs, and 4D/5D outputs ready for project review and decision-making.',
    output: 'Clear deliverables for decision-making',
    icon: PackageCheck,
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.22)',
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

      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{
        top: '-80px', right: '-80px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 65%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '0', left: '-60px', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)',
      }} />

      {/* Floating geometric decorations */}
      <div className="float-deco absolute pointer-events-none select-none" style={{ '--dur': '11s', top: '12%', left: '4%', opacity: 0.3 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="34" stroke="rgba(14,165,233,0.35)" strokeWidth="1" strokeDasharray="5 8" />
          <circle cx="36" cy="36" r="22" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="36" cy="36" r="5" fill="rgba(14,165,233,0.4)" />
        </svg>
      </div>
      <div className="float-deco absolute pointer-events-none select-none" style={{ '--dur': '14s', top: '55%', right: '3%', opacity: 0.25 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <rect x="4" y="4" width="48" height="48" rx="6" stroke="rgba(34,211,238,0.3)" strokeWidth="1" strokeDasharray="4 7" transform="rotate(15 28 28)" />
          <rect x="14" y="14" width="28" height="28" rx="3" stroke="rgba(14,165,233,0.2)" strokeWidth="1" transform="rotate(30 28 28)" />
        </svg>
      </div>
      <div className="float-deco absolute pointer-events-none select-none" style={{ '--dur': '8s', bottom: '20%', left: '44%', opacity: 0.18 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <polygon points="20,2 38,32 2,32" stroke="rgba(14,165,233,0.4)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
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
            A complete BIM coordination and digital delivery workflow designed to help project teams reduce clashes, validate model quality, and move forward with confidence before construction begins.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-[#64748B]"
            style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.14)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] output-dot" />
            Designed for design teams, contractors, BIM managers, and project teams needing reliable remote BIM support.
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="sr-hidden process-card flex flex-col"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                {/* Shimmer */}
                <div className="card-shimmer" />

                {/* Ghost number */}
                <span className="absolute select-none pointer-events-none font-black"
                  style={{
                    bottom: '-10px', right: '12px',
                    fontSize: '90px', lineHeight: 1,
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: `${step.color}06`,
                    zIndex: 0,
                  }}>
                  {step.number}
                </span>

                <div className="relative z-10 flex flex-col flex-1 p-6">

                  {/* ── Large icon illustration ── */}
                  <div className="flex flex-col items-center pt-4 pb-6">

                    {/* Step number pill — above icon */}
                    <div className="step-reveal mb-5 px-3 py-1 rounded-full font-mono text-xs font-bold tracking-widest"
                      style={{
                        background: `rgba(14,165,233,0.07)`,
                        border: `1px solid ${step.color}45`,
                        color: step.color,
                        animationDelay: `${i * 90 + 150}ms`,
                      }}>
                      STEP {step.number}
                    </div>

                    {/* Icon with orbit rings */}
                    <div className="relative flex items-center justify-center" style={{ width: '120px', height: '120px' }}>

                      {/* Outer orbit ring */}
                      <svg className="icon-orbit absolute inset-0" width="120" height="120" viewBox="0 0 120 120" style={{ top: 0, left: 0 }}>
                        <circle cx="60" cy="60" r="57" fill="none"
                          stroke={step.color} strokeWidth="1"
                          strokeDasharray="5 9" opacity="0.35" />
                      </svg>

                      {/* Middle orbit ring */}
                      <svg className="icon-orbit-reverse absolute" width="92" height="92" viewBox="0 0 92 92"
                        style={{ top: '14px', left: '14px' }}>
                        <circle cx="46" cy="46" r="44" fill="none"
                          stroke={step.color} strokeWidth="0.8"
                          strokeDasharray="3 7" opacity="0.22" />
                      </svg>

                      {/* Glow blob behind icon */}
                      <div className="absolute rounded-full" style={{
                        width: '68px', height: '68px',
                        background: `radial-gradient(circle, ${step.glow} 0%, transparent 70%)`,
                        filter: 'blur(12px)',
                      }} />

                      {/* Icon container */}
                      <div className="process-icon-wrap relative w-[68px] h-[68px] rounded-2xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${step.color}22 0%, ${step.color}08 100%)`,
                          border: `1px solid ${step.color}45`,
                          boxShadow: `0 0 24px ${step.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                        }}>
                        <Icon size={32} style={{ color: step.color }} strokeWidth={1.5} />
                      </div>

                      {/* Corner accent dots */}
                      <div className="absolute w-2 h-2 rounded-full" style={{ top: '8px', right: '8px', background: step.color, opacity: 0.5 }} />
                      <div className="absolute w-1.5 h-1.5 rounded-full" style={{ bottom: '10px', left: '10px', background: step.color, opacity: 0.3 }} />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mb-4" style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${step.color}30, transparent)` }} />

                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-[#F1F5F9] mb-3 leading-snug text-center"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#94A3B8] text-sm leading-relaxed flex-1 mb-5 text-center">
                    {step.description}
                  </p>

                  {/* Output tag */}
                  <div className="output-tag-glow flex items-center gap-2 px-3 py-2 rounded-sm rounded-l-none"
                    style={{
                      background: `linear-gradient(90deg, ${step.color}0D, transparent)`,
                      border: `1px solid ${step.color}20`,
                      borderLeft: 'none',
                    }}>
                    <div className="output-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                    <span className="text-xs font-mono" style={{ color: step.color, opacity: 0.85 }}>
                      Output:&nbsp;<span className="text-[#CBD5E1] font-sans">{step.output}</span>
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="sr-hidden mt-16 rounded-xl p-8 lg:p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.07) 0%, rgba(34,211,238,0.04) 50%, rgba(14,165,233,0.07) 100%)',
            border: '1px solid rgba(14,165,233,0.2)',
          }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.1) 0%, transparent 60%)',
          }} />
          <div className="relative z-10">
            <span className="inline-block text-xs text-[#0EA5E9] font-mono tracking-[3px] mb-4 uppercase">Next Step</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Need BIM support for an active project?
            </h3>
            <p className="text-[#94A3B8] max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              Book a consultation and share your project scope, models, timeline, and required deliverables. We'll review how Klyron Consulting can support your team with coordination, validation, reporting, and digital delivery.
            </p>
            <a href="#schedule" onClick={scrollToSchedule}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-sm font-semibold text-sm">
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
