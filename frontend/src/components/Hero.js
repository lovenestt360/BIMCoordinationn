import { ArrowRight } from 'lucide-react';
import CountUp from './CountUp';
import CanvasWrapper from './3d/CanvasWrapper';

const HeroStaticFallback = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="hero-bg-motion absolute inset-0"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1760553120312-2821bf54e767?crop=entropy&cs=srgb&fm=jpg&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.65,
      }}
    />
  </div>
);

const Hero = () => {
  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center blueprint-bg overflow-hidden">

      {/* 3D Background Scene (falls back to the static Ken-Burns image on low-end/no-WebGL/reduced-motion) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <CanvasWrapper
          className="absolute inset-0"
          sceneImport={() => import('./3d/HeroScene')}
          fallback={<HeroStaticFallback />}
          canvasProps={{ camera: { position: [0, 1, 7], fov: 45 } }}
        />
      </div>

      
      {/* Gradient Overlay — fades the photo into the page background at the edges, keeps it visible in the middle */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(to bottom, #F8FAFC 0%, rgba(248,250,252,0) 22%, rgba(248,250,252,0) 45%, rgba(248,250,252,0.2) 80%, #F8FAFC 100%)',
      }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Main Heading */}
        <h1
          data-testid="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up stagger-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>

          <span className="text-[#0F172A]">Precision </span>
          <span className="text-[#0EA5E9]">BIM Coordination</span>
          <br />
          <span className="text-[#0F172A]">for Construction-Ready Delivery</span>
        </h1>

        {/* Subheading */}
        <p
          data-testid="hero-subtitle"
          className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">

          Providing BIM coordination and digital delivery support to help project teams improve model reliability, reduce rework, and make better decisions before construction begins.
        </p>

        {/* Urgency badge */}
        <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up stagger-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="text-xs text-[#64748B] font-mono tracking-wide">Currently accepting new projects — Q3 2026</span>
        </div>

        {/* CTA Buttons */}
        <div
          data-testid="hero-cta-container"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">

          <a
            href="#schedule"
            data-testid="hero-cta-primary"
            onClick={(e) => scrollToSection(e, '#schedule')}
            className="btn-primary px-8 py-3 rounded-sm font-medium flex items-center gap-2">

            Schedule a Meeting
            <ArrowRight size={18} />
          </a>
          <a
            href="#portfolio"
            data-testid="hero-cta-secondary"
            onClick={(e) => scrollToSection(e, '#portfolio')}
            className="btn-outline px-8 py-3 rounded-sm font-medium">

            View Portfolio
          </a>
        </div>

        {/* Stats */}
        <div
          data-testid="hero-stats"
          className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-8 border-t border-[#F1F5F9] animate-fade-in-up stagger-4">

          <div>
            <CountUp target={8} suffix="+" duration={1600} className="stat-number-glow text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono" />
            <p className="text-xs sm:text-sm text-[#475569] mt-1">Projects Delivered</p>
          </div>
          <div>
            <CountUp target={85} suffix="%" duration={1800} className="stat-number-glow text-2xl sm:text-3xl font-bold text-[#22D3EE] font-mono" />
            <p className="text-xs sm:text-sm text-[#475569] mt-1">Clash Resolution</p>
          </div>
          <div>
            <CountUp target={2} suffix="+" duration={1200} className="stat-number-glow text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono" />
            <p className="text-xs sm:text-sm text-[#475569] mt-1">Years Experience</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-[#E2E8F0] rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-[#0EA5E9] rounded-full animate-bounce" />
        </div>
      </div>
    </section>);

};

export default Hero;