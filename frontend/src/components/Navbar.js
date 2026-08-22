import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Projects', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const overlayRef = useRef(null);
  const linkRefs = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        gsap.set(overlayRef.current, { display: 'flex' });
        gsap.fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }
        );
        gsap.fromTo(
          linkRefs.current,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.15,
            stagger: 0.08,
          }
        );
        gsap.fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.55 }
        );
      }, overlayRef);
      return () => ctx.revert();
    }

    document.body.style.overflow = '';
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' });
      },
    });
    return undefined;
  }, [isMobileMenuOpen]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 lg:px-16 py-5 md:py-6 ${
          isScrolled ? 'bg-black/25 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="text-white font-semibold tracking-tight text-lg"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            KLYRON<span className="text-[#39C3FF]">.</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-white/70 hover:text-white text-sm font-light transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#schedule"
              onClick={(e) => scrollToSection(e, '#schedule')}
              data-testid="navbar-cta"
              className="bg-white text-black rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#39C3FF] transition-colors duration-200"
            >
              Book a Consultation
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="md:hidden relative w-8 h-6 flex flex-col justify-center items-end"
          >
            <span
              className="bg-white rounded-full h-[2px] absolute"
              style={{
                width: isMobileMenuOpen ? '24px' : '24px',
                transform: isMobileMenuOpen ? 'translateY(0) rotate(45deg)' : 'translateY(-6px) rotate(0deg)',
                transition: 'transform 500ms cubic-bezier(0.76,0,0.24,1)',
              }}
            />
            <span
              className="bg-white rounded-full h-[2px] absolute"
              style={{
                width: '16px',
                opacity: isMobileMenuOpen ? 0 : 1,
                transition: 'opacity 300ms cubic-bezier(0.76,0,0.24,1)',
              }}
            />
            <span
              className="bg-white rounded-full h-[2px] absolute"
              style={{
                width: '24px',
                transform: isMobileMenuOpen ? 'translateY(0) rotate(-45deg)' : 'translateY(6px) rotate(0deg)',
                transition: 'transform 500ms cubic-bezier(0.76,0,0.24,1)',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] md:hidden bg-black/90 backdrop-blur-xl flex-col"
        style={{ display: 'none' }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-white font-semibold tracking-tight text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            KLYRON<span className="text-[#39C3FF]">.</span>
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 gap-1">
          {NAV_LINKS.map((link, i) => (
            <a
              key={`${link.label}-${i}`}
              ref={(el) => { linkRefs.current[i] = el; }}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="font-instrument-serif text-4xl sm:text-5xl text-white border-b border-white/10 py-4 transition-[padding] duration-300 hover:pl-4"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="px-6 pb-8 pt-4">
          <a
            ref={ctaRef}
            href="#schedule"
            onClick={(e) => scrollToSection(e, '#schedule')}
            className="block w-full text-center bg-white text-black rounded-full py-4 text-sm font-medium"
          >
            Book a Consultation
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
