import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import CountUp from './CountUp';

const Hero = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center blueprint-bg overflow-hidden">

      {/* Background Image Overlay — scroll parallax */}
      <motion.div className="absolute inset-0 z-0 overflow-hidden" style={{ y: bgY }}>
        <div
          className="hero-bg-motion absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1760553120312-2821bf54e767?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />
      </motion.div>


      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(to bottom, #020617 0%, rgba(2,6,23,0.55) 30%, rgba(2,6,23,0.3) 55%, rgba(2,6,23,0.7) 80%, #020617 100%)',
      }} />

      {/* Content — fades, lifts and scales down as you scroll past */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Main Heading */}
        <h1
          data-testid="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up stagger-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>

          <span className="text-[#F8FAFC]">Precision </span>
          <span className="text-[#0EA5E9]">BIM Coordination</span>
          <br />
          <span className="text-[#F8FAFC]">for Construction-Ready Delivery</span>
        </h1>

        {/* Subheading */}
        <p
          data-testid="hero-subtitle"
          className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">

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
            className="btn-primary px-8 py-3 rounded-sm font-medium flex items-center gap-2 animate-pulse-glow">

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
          className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-8 border-t border-[#1E293B] animate-fade-in-up stagger-4">

          <div>
            <CountUp target={8} suffix="+" duration={1600} className="stat-number-glow text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono" />
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Projects Delivered</p>
          </div>
          <div>
            <CountUp target={85} suffix="%" duration={1800} className="stat-number-glow text-2xl sm:text-3xl font-bold text-[#22D3EE] font-mono" />
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Clash Resolution</p>
          </div>
          <div>
            <CountUp target={2} suffix="+" duration={1200} className="stat-number-glow text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono" />
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Years Experience</p>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-[#334155] rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-[#0EA5E9] rounded-full animate-bounce" />
        </div>
      </div>
    </section>);

};

export default Hero;