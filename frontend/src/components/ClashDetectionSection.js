import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Progress -> state band. Kept as plain data (not React state) since this
// updates on every scroll tick — driving the DOM directly via GSAP avoids
// re-rendering the component on scroll.
const STATES = [
  { key: 'OPEN', color: '#FF7A1A', bg: 'rgba(255,122,26,0.12)', border: 'rgba(255,122,26,0.4)', from: 0, to: 0.3 },
  { key: 'ASSIGNED', color: '#39C3FF', bg: 'rgba(57,195,255,0.12)', border: 'rgba(57,195,255,0.4)', from: 0.3, to: 0.6 },
  { key: 'IN REVIEW', color: '#39C3FF', bg: 'rgba(57,195,255,0.12)', border: 'rgba(57,195,255,0.4)', from: 0.6, to: 0.85 },
  { key: 'CLOSED', color: '#43D17A', bg: 'rgba(67,209,122,0.12)', border: 'rgba(67,209,122,0.4)', from: 0.85, to: 1 },
];

const stateForProgress = (p) => STATES.find((s) => p >= s.from && p < s.to) || STATES[STATES.length - 1];

const ClashDetectionSection = () => {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const statusRef = useRef(null);
  const panelRef = useRef(null);
  const dotRef = useRef(null);
  const lastKeyRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const state = stateForProgress(self.progress);
          if (state.key !== lastKeyRef.current) {
            lastKeyRef.current = state.key;
            if (statusRef.current) statusRef.current.textContent = state.key;
            if (statusRef.current) statusRef.current.style.color = state.color;
            if (panelRef.current) {
              panelRef.current.style.background = state.bg;
              panelRef.current.style.borderColor = state.border;
            }
            if (dotRef.current) dotRef.current.style.background = state.color;
          }
        },
      });

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

      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="clash-detection" className="relative" style={{ height: '200vh' }}>
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Reference clash-detection render — MEP duct/structural beam clash */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/projects/clash-detection-ref.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, rgba(4,7,11,0.85) 0%, rgba(4,7,11,0.55) 45%, rgba(4,7,11,0.75) 100%)' }}
        />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-16">
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

          {/* Issue panel */}
          <div
            ref={panelRef}
            className="absolute bottom-16 right-6 md:right-12 lg:right-16 w-72 rounded-2xl px-5 py-5 border transition-colors duration-300"
            style={{ background: 'rgba(255,122,26,0.12)', borderColor: 'rgba(255,122,26,0.4)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/50 text-[10px] font-light tracking-[0.15em] uppercase">Clash Detected</span>
              <span ref={dotRef} className="w-2 h-2 rounded-full" style={{ background: '#FF7A1A' }} />
            </div>
            <p className="text-white text-sm font-medium mb-4">Mechanical &times; Electrical</p>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-white/45 font-light">Priority</span>
                <span className="text-[#FF7A1A] font-medium">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/45 font-light">Status</span>
                <span ref={statusRef} className="font-medium" style={{ color: '#FF7A1A' }}>OPEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/45 font-light">Responsible</span>
                <span className="text-white/80 font-light">Electrical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/45 font-light">Issue</span>
                <span className="text-white/80 font-light">#024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClashDetectionSection;
