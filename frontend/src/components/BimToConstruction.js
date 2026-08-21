import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BimToConstruction = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.btc-content',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/projects/coordinate-digitally-ref.jpg')",
          filter: 'brightness(0.55) contrast(1.1)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(0deg, rgba(4,7,11,0.9) 0%, rgba(4,7,11,0.35) 55%, rgba(4,7,11,0.55) 100%)' }}
      />

      <div className="btc-content relative z-10 w-full px-6 md:px-12 lg:px-16 pb-20 md:pb-28">
        <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6 max-w-2xl">
          Coordinate digitally.
          <br />
          <span className="italic text-white/70">Build with confidence.</span>
        </h2>
        <p className="text-white/65 text-base font-light leading-relaxed max-w-md">
          The goal of BIM coordination is not a perfect model for its own sake. It is clearer
          decisions, fewer unresolved conflicts and better information before construction.
        </p>
      </div>
    </section>
  );
};

export default BimToConstruction;
