import { useEffect, useRef } from 'react';
import { Globe, Layers, Globe2, Target, Compass } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GLANCE = [
  {
    icon: Globe,
    label: 'Remote-First',
    title: 'Digital Consultancy',
    description: 'Collaboration beyond geographic boundaries.',
  },
  {
    icon: Layers,
    label: 'Multidisciplinary',
    title: 'BIM Perspective',
    description: 'Architecture, structure and services — as one project.',
  },
  {
    icon: Globe2,
    label: 'International',
    title: 'Project Outlook',
    description: 'An international approach to BIM coordination.',
  },
  {
    icon: Target,
    label: 'Specialised',
    title: 'BIM Focus',
    description: 'Coordination and digital delivery. Nothing else.',
  },
];

const EXPERTISE = [
  'BIM Coordination',
  'Model Federation',
  'Clash Detection & Issue Management',
  'BIM QA/QC & Model Validation',
  '4D / 5D BIM',
  'COBie & Information Management',
  'Digital Construction Workflows',
];

const TECH_STACK = ['Revit', 'Navisworks', 'Solibri', 'Autodesk Construction Cloud', 'Bexel Manager', 'BCF Workflows'];

const About = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.about-block').forEach((block) => {
        gsap.fromTo(
          block.querySelectorAll('.about-fade'),
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: block, start: 'top 75%' },
          }
        );
      });

      gsap.utils.toArray('.expertise-row').forEach((row, i) => {
        gsap.fromTo(
          row,
          { autoAlpha: 0, x: -12 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
            delay: i * 0.05,
            ease: 'power2.out',
            scrollTrigger: { trigger: row, start: 'top 90%' },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} data-testid="about-section" className="relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />

      {/* Ambient glows spaced through the section so the long scroll never reads as flat */}
      <div className="absolute pointer-events-none" style={{ top: '2%', left: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(57,195,255,0.10) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '26%', right: '-10%', width: '650px', height: '650px', background: 'radial-gradient(circle, rgba(125,224,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '50%', left: '-8%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(57,195,255,0.09) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '72%', right: '-8%', width: '650px', height: '650px', background: 'radial-gradient(circle, rgba(125,224,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: '92%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(57,195,255,0.08) 0%, transparent 70%)' }} />

      {/* ================= ABOUT OPENING ================= */}
      <div className="about-block relative z-10 py-28 lg:py-40 max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
        <span className="about-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block" data-testid="about-label">
          About Klyron
        </span>
        <h2 data-testid="about-title" className="about-fade font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-10">
          Built to bring control
          <br />
          <span className="italic text-white/70">to complex BIM projects.</span>
        </h2>
        <div className="about-fade text-white/65 text-base md:text-lg font-light leading-relaxed space-y-4 max-w-2xl">
          <p>
            Klyron Consulting is a BIM Coordination and Digital Delivery consultancy built for the
            increasingly complex digital environment behind modern construction.
          </p>
          <p className="text-white/85">Klyron was created around that reality.</p>
        </div>
      </div>

      {/* ================= WHY KLYRON EXISTS ================= */}
      <div className="about-block relative z-10 py-20 lg:py-28 max-w-5xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10">
        <span className="about-fade text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-8 block">
          Why Klyron Exists
        </span>
        <h3 className="about-fade font-instrument-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-white mb-12 max-w-3xl">
          A model can identify a problem.
          <br />
          <span className="italic text-white/70">But a project still has to solve it.</span>
        </h3>
        <p className="about-fade text-white/60 text-base font-light leading-relaxed max-w-2xl mb-6">
          Projects aren&apos;t short of models, meetings or information. The challenge is what happens
          between having it and turning it into a clear decision — across{' '}
          <span className="text-white/85">multiple disciplines</span>,{' '}
          <span className="text-white/85">multiple organisations</span>, and{' '}
          <span className="text-white/85">information that never stops changing</span>.
        </p>

        <p className="about-fade text-white/80 text-base font-light leading-relaxed max-w-2xl">
          Klyron exists to bring precision and structure to that environment — not by making BIM more
          complicated, but by making complex information easier to trust.
        </p>
      </div>

      {/* ================= KLYRON AT A GLANCE ================= */}
      <div className="about-block relative z-10 py-20 lg:py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10">
        <span className="about-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-12 block">
          Klyron at a Glance
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {GLANCE.map((g, i) => {
            const GIcon = g.icon;
            return (
              <div
                key={g.label}
                className={`about-fade lg:pl-8 ${i > 0 ? 'lg:border-l lg:border-white/10' : ''}`}
              >
                <p className="text-[#7DE0FF] font-mono text-xs tracking-[0.15em] uppercase mb-4">{g.label}</p>
                <div className="flex items-center gap-3 mb-4">
                  <GIcon size={20} className="text-[#39C3FF] flex-shrink-0" strokeWidth={1.5} />
                  <h4 className="font-instrument-serif text-2xl text-white">{g.title}</h4>
                </div>
                <p className="text-white/55 text-sm font-light leading-relaxed">{g.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= EDITORIAL BRAND STATEMENT ================= */}
      <div className="about-block relative z-10 py-32 lg:py-48 max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center border-t border-white/10">
        <h3 className="about-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-white mb-8">
          Technology gives us the tools.
          <br />
          <span className="italic text-white/70">Precision comes from how we use them.</span>
        </h3>
        <p className="about-fade text-white/55 text-base font-light leading-relaxed max-w-xl mx-auto">
          Engineering thinking. Digital construction. Disciplined coordination.
        </p>
      </div>

      {/* ================= LEADERSHIP ================= */}
      <div className="about-block relative z-10 py-20 lg:py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10">
        <span className="about-fade text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
          Leadership
        </span>
        <h3 className="about-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-16 max-w-3xl">
          Technical direction behind Klyron.
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="about-fade lg:col-span-4">
            <img
              src="/mario.jpg"
              alt="Mário Quissico Júnior"
              className="w-full rounded-2xl object-cover border border-white/10"
              style={{ filter: 'saturate(0.95)' }}
            />
          </div>

          <div className="about-fade lg:col-span-8 flex flex-col justify-center">
            <h4 data-testid="about-name" className="font-instrument-serif text-3xl sm:text-4xl text-white mb-2">
              Mário Quissico Júnior
            </h4>
            <p className="text-[#39C3FF] font-mono text-sm mb-6">Director &amp; BIM Coordinator</p>

            <div className="text-white/65 text-base font-light leading-relaxed space-y-4 mb-10 max-w-2xl">
              <p>
                Mário leads Klyron&apos;s technical direction across multidisciplinary BIM coordination
                and digital delivery. His Civil Engineering degree (SEGi University, Malaysia) grounds
                that direction in how architectural, structural and services systems actually interact
                — digitally and on site.
              </p>
              <p>
                His focus: multidisciplinary coordination, model reliability, and the quality of
                information behind project decisions.
              </p>
            </div>

            {/* Areas of Expertise */}
            <p className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-5">Areas of Expertise</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-10">
              {EXPERTISE.map((item, i) => (
                <div key={item} className="expertise-row flex items-baseline gap-3 border-b border-white/5 pb-2.5">
                  <span className="text-white/30 font-mono text-xs flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white/75 text-sm font-light">{item}</span>
                </div>
              ))}
            </div>

            {/* Technical environment — understated */}
            <p className="text-white/40 text-xs font-light tracking-[0.15em] uppercase mb-2">Technical Environment</p>
            <p className="text-white/50 text-sm font-light">
              {TECH_STACK.join(' · ')}
            </p>
          </div>
        </div>
      </div>

      {/* ================= ABOUT CLOSING — OUR DIRECTION ================= */}
      <div className="about-block relative z-10 py-20 lg:py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-16 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-14">
          <div className="lg:col-span-8">
            <span className="about-fade text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
              Our Direction
            </span>
            <h3 className="about-fade font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8">
              Better coordinated information.
              <br />
              <span className="italic text-white/70">Better construction decisions.</span>
            </h3>
            <p className="about-fade text-white/65 text-base font-light leading-relaxed max-w-2xl">
              Klyron&apos;s ambition: become a trusted BIM Coordination and Digital Delivery partner
              internationally — grounded in technical quality and dependable collaboration.
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
          The value of BIM is not simply what a model looks like. It&apos;s what a project team can
          confidently do with the information inside it.
        </p>
      </div>

      {/* ================= TRANSITION — SELECTED WORK ================= */}
      <div className="about-block relative z-10 pt-16 pb-8 max-w-4xl mx-auto px-6 md:px-12 lg:px-16 text-center border-t border-white/10">
        <span className="about-fade text-[#39C3FF] text-xs font-light tracking-[0.2em] uppercase mb-4 block">
          Selected Work
        </span>
        <p className="about-fade text-white/55 text-base font-light">
          See how Klyron&apos;s technical approach translates into real project environments.
        </p>
      </div>
    </section>
  );
};

export default About;
