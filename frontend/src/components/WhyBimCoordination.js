import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CONSEQUENCES = [
  'Rework',
  'Site delays',
  'Installation conflicts',
  'Additional labour',
  'Wasted materials',
  'Coordination pressure',
];

const WhyBimCoordination = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
      gsap.fromTo(
        '.wby-item',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-bim"
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ background: '#04070B' }}
    >
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
          The Problem
        </span>

        <h2
          ref={headlineRef}
          className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-8 max-w-3xl"
        >
          Complex buildings aren&apos;t designed by one discipline.
          <br />
          <span className="italic text-white/70">They have to work as one.</span>
        </h2>

        <p className="text-white/65 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-14">
          Architectural, structural, mechanical, electrical, plumbing and fire protection
          systems often compete for the same physical space. Without structured coordination,
          problems can remain unresolved until construction.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5 max-w-2xl">
          {CONSEQUENCES.map((item) => (
            <div key={item} className="wby-item flex items-center gap-3">
              <span className="w-1 h-1 rounded-full bg-[#FF7A1A] flex-shrink-0" />
              <span className="text-white/60 text-sm font-light">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBimCoordination;
