import { useState } from 'react';
import { Mail, X, MessageCircle } from 'lucide-react';

const FloatingContact = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Options panel */}
      {open && (
        <div className="flex flex-col gap-2 items-end">
          <a
            href="mailto:contact@klyronconsulting.com"
            className="flex items-center gap-3 bg-[#0B2A44] border border-[rgba(255,255,255,0.1)] rounded-sm px-4 py-3 text-sm text-[#F7F9FB] hover:border-[#39C3FF] hover:text-[#39C3FF] transition-all duration-200 whitespace-nowrap shadow-xl"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Mail size={16} className="text-[#39C3FF]" />
            Send an Email
          </a>
          <a
            href="#schedule"
            onClick={(e) => { e.preventDefault(); setOpen(false); document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-3 bg-[#0B2A44] border border-[rgba(255,255,255,0.1)] rounded-sm px-4 py-3 text-sm text-[#F7F9FB] hover:border-[#7DE0FF] hover:text-[#7DE0FF] transition-all duration-200 whitespace-nowrap shadow-xl"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <MessageCircle size={16} className="text-[#7DE0FF]" />
            Book a Consultation
          </a>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-sm flex items-center justify-center shadow-2xl transition-all duration-300"
        style={{
          background: open ? '#0B2A44' : '#39C3FF',
          border: open ? '1px solid rgba(255,255,255,0.1)' : 'none',
          boxShadow: open ? 'none' : '0 0 30px -5px rgba(14,165,233,0.6)',
        }}
        aria-label="Contact us"
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
