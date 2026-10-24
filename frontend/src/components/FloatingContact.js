import { useEffect, useState } from 'react';
import { Mail, X, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';

const FloatingContact = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const portfolio = document.querySelector('#portfolio');
      const shouldShow = Boolean(portfolio && portfolio.getBoundingClientRect().top <= window.innerHeight);
      setVisible(shouldShow);
      if (!shouldShow) setOpen(false);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  const handleBookClick = (e) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' });
    trackEvent('consultation_start', { location: 'floating_contact' });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Options panel */}
      {open && (
        <div className="flex flex-col gap-2 items-end">
          <a
            href="mailto:contact@klyronconsulting.com"
            className="flex items-center gap-3 bg-[#091A28] border border-[#39C3FF]/20 rounded-md px-4 py-3 text-sm text-[#F7F9FB] hover:border-[#39C3FF] hover:text-[#39C3FF] transition-colors duration-200 whitespace-nowrap"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Mail size={16} className="text-[#39C3FF]" />
            {t('floatingContact.sendEmail')}
          </a>
          <a
            href="#schedule"
            onClick={handleBookClick}
            className="flex items-center gap-3 bg-[#091A28] border border-[#39C3FF]/20 rounded-md px-4 py-3 text-sm text-[#F7F9FB] hover:border-[#39C3FF] hover:text-[#39C3FF] transition-colors duration-200 whitespace-nowrap"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <MessageCircle size={16} className="text-[#39C3FF]" />
            {t('floatingContact.bookConsultation')}
          </a>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-sm flex items-center justify-center transition-colors duration-300"
        style={{
          background: open ? '#091A28' : '#39C3FF',
          border: open ? '1px solid rgba(57,195,255,0.24)' : '1px solid #39C3FF',
          boxShadow: 'none',
        }}
        aria-label={t('floatingContact.ariaLabel')}
      >
        {open
          ? <X size={20} className="text-[rgba(247,249,251,0.65)]" />
          : <Mail size={20} className="text-[#04070B]" />
        }
      </button>
    </div>
  );
};

export default FloatingContact;
