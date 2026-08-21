import { useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, FolderCog, Layers, SearchCheck, ShieldCheck, FileCheck } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  {
    number: '01',
    title: 'Consultation & Scope Review',
    description:
      'We start by understanding your project, BIM requirements, disciplines involved, timeline, deliverables, and the level of coordination or digital support needed.',
    output: 'Clear BIM support scope',
    icon: MessageCircle,
    color: '#39C3FF',
  },
  {
    number: '02',
    title: 'Model Intake & Workflow Setup',
    description:
      'We receive the project models, review file structure, confirm model versions, set up the federated model environment, and align the coordination workflow with the project team.',
    output: 'Ready-to-review BIM environment',
    icon: FolderCog,
    color: '#7DE0FF',
  },
  {
    number: '03',
    title: 'Federated Model Review',
    description:
      'We combine and review architectural, structural, and MEP models to check discipline alignment, model positioning, coordination zones, and readiness for clash detection.',
    output: 'Federated model ready for coordination',
    icon: Layers,
    color: '#39C3FF',
  },
  {
    number: '04',
    title: 'Clash Detection & Coordination',
    description:
      'We run clash detection, review hard clashes and clearance issues, classify priorities, separate real issues from low-value clashes, and support resolution tracking through ACC, BCF, or the agreed platform.',
    output: 'Prioritized coordination issues',
    icon: SearchCheck,
    color: '#FF7A1A',
  },
  {
    number: '05',
    title: 'BIM QA/QC & Data Validation',
    description:
      'We review model quality, element classification, naming, property sets, COBie-related information, and model consistency to improve the reliability of project information.',
    output: 'Validated BIM information',
    icon: ShieldCheck,
    color: '#43D17A',
  },
  {
    number: '06',
    title: 'Digital Delivery & Reporting',
    description:
      'We deliver structured clash reports, QA/QC comments, validation summaries, issue logs, 4D/5D support outputs, and coordination feedback ready for project review and action.',
    output: 'Clear deliverables for decision-making',
    icon: FileCheck,
    color: '#7DE0FF',
  },
];

const Process = () => {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.step-row',
        { autoAlpha: 0, x: -20 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      );

      // "Information Flow" line grows down the step list as the section scrolls through
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'bottom 70%',
              scrub: 0.5,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToSchedule = (e) => {
    e.preventDefault();
    document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="process" ref={sectionRef} className="py-28 lg:py-40 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        {/* Header */}
        <div className="sr-hidden mb-20 max-w-2xl">
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">How We Work</span>
          <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6">
            A controlled workflow
            <br />
            <span className="italic text-white/70">from model intake to delivery.</span>
          </h2>
          <p className="text-white/65 text-base font-light leading-relaxed">
            Designed for design teams, contractors, BIM managers and project teams needing
            reliable remote BIM support.
          </p>
        </div>

        {/* Step list with Information Flow line */}
        <div className="relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-white/10 hidden md:block" />
          <div
            ref={lineRef}
            className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-[#39C3FF] to-[#7DE0FF] hidden md:block"
            style={{ transformOrigin: 'top' }}
          />

          <div className="space-y-10 md:space-y-14">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="step-row grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 relative">
                  <div className="md:col-span-1 flex md:justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center border relative z-10"
                      style={{ background: '#04070B', borderColor: `${step.color}55` }}
                    >
                      <Icon size={20} style={{ color: step.color }} />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-center">
                    <span className="font-mono text-xs" style={{ color: step.color }}>STEP {step.number}</span>
                  </div>
                  <div className="md:col-span-6">
                    <h3 className="text-white text-lg md:text-xl font-medium mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {step.title}
                    </h3>
                    <p className="text-white/55 text-sm font-light leading-relaxed max-w-lg">{step.description}</p>
                  </div>
                  <div className="md:col-span-3 flex md:justify-end items-start md:items-center">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-xs"
                      style={{ background: `${step.color}12`, border: `1px solid ${step.color}30` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                      <span style={{ color: step.color }}>{step.output}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div
          className="sr-hidden mt-24 rounded-2xl p-10 lg:p-14 text-center relative overflow-hidden border border-white/10"
          style={{ background: 'linear-gradient(135deg, rgba(57,195,255,0.08) 0%, rgba(4,7,11,0.4) 60%)' }}
        >
          <span className="inline-block text-xs text-[#39C3FF] font-mono tracking-[3px] mb-4 uppercase">Next Step</span>
          <h3 className="font-instrument-serif text-3xl sm:text-4xl text-white mb-4">
            Need BIM support for an active project?
          </h3>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm font-light leading-relaxed">
            Book a consultation and share your project scope, models, timeline, and required
            deliverables. We&apos;ll review how Klyron Consulting can support your team.
          </p>
          <a
            href="#schedule"
            onClick={scrollToSchedule}
            className="group bg-white text-black rounded-full px-8 py-3 text-sm font-medium inline-flex items-center gap-2"
          >
            Book a Consultation
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Process;
