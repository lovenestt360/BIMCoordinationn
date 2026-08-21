import { Linkedin, Mail } from 'lucide-react';

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
      className="bg-[#0B2A44] border-t border-[#0B2A44] py-12"
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
              <span className="text-[#F7F9FB]">KLYRON</span>
              <span className="text-[#39C3FF]">.</span>
            </a>
            <p className="text-[rgba(247,249,251,0.65)] text-sm max-w-sm mb-4">
              BIM coordination and digital delivery support for design and construction teams. Helping projects reduce clashes, improve model quality, and deliver construction-ready information.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/klyronconsulting/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-linkedin"
                className="w-10 h-10 rounded-sm bg-[#0B2A44] flex items-center justify-center text-[rgba(247,249,251,0.65)] hover:bg-[#39C3FF] hover:text-[#04070B] transition-all duration-200"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:contact@klyronconsulting.com"
                data-testid="footer-email"
                className="w-10 h-10 rounded-sm bg-[#0B2A44] flex items-center justify-center text-[rgba(247,249,251,0.65)] hover:bg-[#39C3FF] hover:text-[#04070B] transition-all duration-200"
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
                    className="text-[rgba(247,249,251,0.65)] hover:text-[#39C3FF] text-sm transition-colors duration-200"
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
                'BIM Coordination',
                'Clash Detection & Issue Review',
                'BIM QA/QC & Model Validation',
                '4D/5D BIM Support',
                'COBie & Information Management',
                'On-Demand BIM Support',
              ].map((service) => (
                <li key={service}>
                  <span className="text-[rgba(247,249,251,0.65)] text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          data-testid="footer-bottom"
          className="pt-8 border-t border-[#0B2A44] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-[rgba(247,249,251,0.55)] text-sm">
            © {currentYear} Klyron Consulting. All rights reserved.
          </p>
          <p className="text-[rgba(247,249,251,0.55)] text-xs font-mono">
            BIM COORDINATION · QA/QC · 4D/5D · DIGITAL DELIVERY
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
