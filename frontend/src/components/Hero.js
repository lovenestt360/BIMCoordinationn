import { ArrowRight, Layers } from 'lucide-react';

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
      className="relative min-h-screen flex items-center justify-center blueprint-bg overflow-hidden"
    >
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1760553120312-2821bf54e767?crop=entropy&cs=srgb&fm=jpg&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Badge */}
        <div 
          data-testid="hero-badge"
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-sm mb-8 animate-fade-in-up"
        >
          <Layers size={16} className="text-[#0EA5E9]" />
          <span className="text-sm text-[#94A3B8] font-mono">BIM COORDINATION EXPERTS</span>
        </div>

        {/* Main Heading */}
        <h1 
          data-testid="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up stagger-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="text-[#F8FAFC]">Precision </span>
          <span className="text-[#0EA5E9]">Clash Detection</span>
          <br />
          <span className="text-[#F8FAFC]">for Modern Construction</span>
        </h1>

        {/* Subheading */}
        <p 
          data-testid="hero-subtitle"
          className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2"
        >
          Streamline your construction workflow with expert BIM coordination services. 
          We identify and resolve clashes before they become costly on-site problems.
        </p>

        {/* CTA Buttons */}
        <div 
          data-testid="hero-cta-container"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3"
        >
          <a
            href="#schedule"
            data-testid="hero-cta-primary"
            onClick={(e) => scrollToSection(e, '#schedule')}
            className="btn-primary px-8 py-3 rounded-sm font-medium flex items-center gap-2 animate-pulse-glow"
          >
            Schedule a Meeting
            <ArrowRight size={18} />
          </a>
          <a
            href="#portfolio"
            data-testid="hero-cta-secondary"
            onClick={(e) => scrollToSection(e, '#portfolio')}
            className="btn-outline px-8 py-3 rounded-sm font-medium"
          >
            View Portfolio
          </a>
        </div>

        {/* Stats */}
        <div 
          data-testid="hero-stats"
          className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-8 border-t border-[#1E293B] animate-fade-in-up stagger-4"
        >
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono">150+</p>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Projects Delivered</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono">98%</p>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Clash Resolution</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono">10+</p>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Years Experience</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-[#334155] rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-[#0EA5E9] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
