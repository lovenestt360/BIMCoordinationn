import { useEffect, useRef } from 'react';
import { Eye, ShieldCheck, ListOrdered, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Clarity',
    description: 'Every meaningful coordination issue should have a clear status.',
  },
  {
    icon: ShieldCheck,
    title: 'Accountability',
    description: 'Issues must have an owner, not just a screenshot.',
  },
  {
    icon: ListOrdered,
    title: 'Priority',
    description: 'Not every clash deserves the same attention.',
  },
  {
    icon: CheckCircle2,
    title: 'Closure',
    description: 'An issue isn’t finished when it is discussed. It is finished when it is resolved.',
  },
];

const WhyKlyron = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.principle-card',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 lg:py-40 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-20 max-w-3xl">
          Coordination isn&apos;t about creating more reports.
          <br />
          <span className="italic text-white/70">It&apos;s about creating fewer site problems.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {PRINCIPLES.map((p) => {
            const PIcon = p.icon;
            return (
              <div key={p.title} className="principle-card">
                <PIcon size={22} className="text-[#39C3FF] mb-5" strokeWidth={1.5} />
                <h3 className="text-white text-lg font-medium mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {p.title}
                </h3>
                <p className="text-white/55 text-sm font-light leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyKlyron;
