import { Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      data-testid="footer"
      className="bg-[#0F172A] border-t border-[#1E293B] py-12"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <a 
              href="#" 
              data-testid="footer-logo"
              className="font-bold text-xl tracking-tight inline-block mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <span className="text-[#F8FAFC]">KLYRON</span>
              <span className="text-[#0EA5E9]">.</span>
            </a>
            <p className="text-[#94A3B8] text-sm max-w-sm mb-4">
              Professional BIM coordination and clash detection services for modern construction projects. 
              Precision engineering for seamless builds.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="footer-linkedin"
                className="w-10 h-10 rounded-sm bg-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:bg-[#0EA5E9] hover:text-[#0F172A] transition-all duration-200"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="footer-twitter"
                className="w-10 h-10 rounded-sm bg-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:bg-[#0EA5E9] hover:text-[#0F172A] transition-all duration-200"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="mailto:contact@klyronconsulting.com"
                data-testid="footer-email"
                className="w-10 h-10 rounded-sm bg-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:bg-[#0EA5E9] hover:text-[#0F172A] transition-all duration-200"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 
              className="font-bold mb-4 text-sm"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: '#about', label: 'About' },
                { href: '#services', label: 'Services' },
                { href: '#portfolio', label: 'Portfolio' },
                { href: '#schedule', label: 'Schedule' },
                { href: '#contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-[#94A3B8] hover:text-[#0EA5E9] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 
              className="font-bold mb-4 text-sm"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Services
            </h4>
            <ul className="space-y-2">
              {[
                'Clash Detection',
                'BIM Coordination',
                '4D Scheduling',
                'Constructability Review',
                'Quality Assurance',
              ].map((service) => (
                <li key={service}>
                  <span className="text-[#94A3B8] text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          data-testid="footer-bottom"
          className="pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-[#64748B] text-sm">
            © {currentYear} Klyron Consulting. All rights reserved.
          </p>
          <p className="text-[#64748B] text-xs font-mono">
            BIM · CLASH DETECTION · COORDINATION
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
