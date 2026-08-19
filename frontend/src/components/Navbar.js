import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#schedule', label: 'Schedule' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      data-testid="navbar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a 
          href="#" 
          data-testid="nav-logo"
          className="font-bold text-xl tracking-tight"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="text-[#0F172A]">KLYRON</span>
          <span className="text-[#0EA5E9]">.</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-sm text-[#475569] hover:text-[#0EA5E9] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#schedule"
            data-testid="nav-cta-button"
            onClick={(e) => scrollToSection(e, '#schedule')}
            className="btn-primary px-5 py-2 rounded-sm text-sm font-medium"
          >
            Book a Call
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          data-testid="mobile-menu-button"
          className="md:hidden text-[#0F172A] p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div 
          data-testid="mobile-menu"
          className="md:hidden glass mt-2 mx-4 rounded-sm"
        >
          <div className="flex flex-col py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-6 py-3 text-[#475569] hover:text-[#0EA5E9] hover:bg-[#F1F5F9] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <div className="px-6 pt-3">
              <a
                href="#schedule"
                data-testid="mobile-nav-cta-button"
                onClick={(e) => scrollToSection(e, '#schedule')}
                className="btn-primary block text-center px-5 py-2 rounded-sm text-sm font-medium"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
