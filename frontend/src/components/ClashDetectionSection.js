import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClashDetectionSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cd-headline',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="clash-detection" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Reference clash-detection render — MEP duct/structural beam clash */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/projects/clash-detection-ref.jpg')" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(120deg, rgba(4,7,11,0.85) 0%, rgba(4,7,11,0.55) 45%, rgba(4,7,11,0.75) 100%)' }}
      />

      <div className="relative z-10 px-6 md:px-12 lg:px-16">
        <div className="max-w-xl">
          <span className="text-[#FF7A1A] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
            Clash Detection
          </span>
          <h2 className="cd-headline font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6">
            Finding the clash is only the beginning.
            <br />
            <span className="italic text-white/70">Closing it is what matters.</span>
          </h2>
          <p className="text-white/65 text-base font-light leading-relaxed max-w-md">
            Klyron identifies meaningful coordination conflicts, filters priorities, assigns
            responsibility and tracks issues through resolution rather than simply generating
            long clash reports.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClashDetectionSection;
