import { useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import CountUp from './CountUp';

gsap.registerPlugin(ScrollTrigger);

const CERTS = ['Navisworks Expert', 'Revit Certified', 'Autodesk Construction Cloud Expert', 'Solibri Certified'];
const TOOLS = ['Navisworks', 'Revit', 'Solibri', 'ACC', 'Bexel Manager', 'BCF'];
const SECTORS = ['Residential', 'Commercial', 'Industrial', 'Healthcare', 'Education'];

const About = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-fade',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} data-testid="about-section" className="py-28 lg:py-40 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        {/* Header */}
        <div className="about-fade mb-20 max-w-3xl">
          <p className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6" data-testid="about-label">About Klyron</p>
          <h2 data-testid="about-title" className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-6">
            Technical expertise.
            <br />
            <span className="italic text-white/70">Built around project delivery.</span>
          </h2>
          <p className="text-white/65 text-base md:text-lg font-light leading-relaxed">
            Klyron Consulting provides remote BIM coordination and digital delivery support for
            international project teams — partnering with architects, engineers and contractors
            across residential, commercial, industrial, healthcare and education construction.
          </p>
        </div>

        {/* Profile — big editorial layout */}
        <div className="about-fade grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          <div className="lg:col-span-4">
            <img
              src="/mario.jpg"
              alt="Mário Quissico Júnior"
              className="w-full rounded-2xl object-cover border border-white/10"
              style={{ filter: 'saturate(0.95)' }}
            />
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center">
            <h3 data-testid="about-name" className="font-instrument-serif text-3xl sm:text-4xl text-white mb-2">
              Mário Quissico Júnior
            </h3>
            <p className="text-[#39C3FF] font-mono text-sm mb-6">Director &amp; BIM Coordinator</p>
            <p className="text-white/65 text-base md:text-lg font-light leading-relaxed mb-8">
              Civil Engineer and Director of Klyron Consulting, specialised in BIM Coordination,
              Clash Detection, Model QA/QC, 4D/5D BIM support, and digital delivery workflows —
              aligning multidisciplinary teams, improving model reliability, and supporting
              construction-ready BIM delivery with practical solutions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {CERTS.map((c) => (
                <div key={c} className="flex items-center gap-2 text-sm text-white/70 font-light">
                  <CheckCircle size={15} className="text-[#7DE0FF] flex-shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {TOOLS.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 rounded-full text-xs font-mono border"
                  style={{ background: 'rgba(57,195,255,0.06)', borderColor: 'rgba(57,195,255,0.25)', color: '#7DE0FF' }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats — big, Hero-style */}
        <div className="about-fade grid grid-cols-3 gap-6 md:gap-12 border-t border-white/10 pt-12 mb-20 max-w-2xl">
          <div>
            <CountUp target={2} suffix="+" duration={1200} className="stat-number-glow font-mono text-3xl md:text-5xl font-semibold text-[#39C3FF]" />
            <p className="text-white/50 text-xs md:text-sm mt-2 font-light">Years of Experience</p>
          </div>
          <div>
            <CountUp target={8} suffix="+" duration={1600} className="stat-number-glow font-mono text-3xl md:text-5xl font-semibold text-[#7DE0FF]" />
            <p className="text-white/50 text-xs md:text-sm mt-2 font-light">Projects Completed</p>
          </div>
          <div>
            <CountUp target={20} suffix="K+" duration={2000} className="stat-number-glow font-mono text-3xl md:text-5xl font-semibold text-[#39C3FF]" />
            <p className="text-white/50 text-xs md:text-sm mt-2 font-light">Clashes Resolved</p>
          </div>
        </div>

        {/* Mission + sectors */}
        <div className="about-fade grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h4 className="text-white text-lg font-medium mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our Mission
            </h4>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              To deliver exceptional BIM coordination services that prevent construction conflicts,
              reduce costs, and ensure project success through digital precision.
            </p>
          </div>
          <div>
            <h4 className="text-white text-lg font-medium mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Sectors We Serve
            </h4>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 text-white/55">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
