import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = t('faq.items', { returnObjects: true });

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-28 lg:py-40 bg-[#04070B] relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />
      {/* Ambient glow — animates in as the section scrolls into view (native CSS, no JS).
          Centered via left/margin (not transform) so it doesn't fight the entrance animation's transform. */}
      <div className="ambient-glow absolute pointer-events-none" style={{
        top: '10%', left: '50%', marginLeft: '-300px',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(57,195,255,0.08) 0%, transparent 70%)',
      }} />

      <div className="max-w-3xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="sr-hidden text-center mb-16">
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">{t('faq.eyebrow')}</span>

          <h2 className="font-instrument-serif text-5xl sm:text-6xl leading-[1.02] text-white mb-6">
            {t('faq.titlePrefix')} <span className="italic text-white/70">{t('faq.titleEmphasis')}</span>
          </h2>

          <p className="text-white/65 max-w-xl mx-auto text-base font-light leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Accordion */}
        <div className="sr-hidden divide-y divide-white/10 border-t border-white/10">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  className="group w-full flex items-center justify-between gap-4 py-6 text-left"
                >
                  {/* Number + question */}
                  <div className="flex items-center gap-5 min-w-0">
                    <span
                      className="flex-shrink-0 font-mono text-xs transition-colors duration-200"
                      style={{ color: isOpen ? '#39C3FF' : 'rgba(247,249,251,0.3)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-base font-medium leading-snug transition-colors duration-200"
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: isOpen ? '#F7F9FB' : 'rgba(247,249,251,0.8)',
                      }}
                    >
                      {faq.question}
                    </span>
                  </div>

                  {/* Chevron */}
                  <motion.span
                    className="flex-shrink-0"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChevronDown
                      size={18}
                      className="transition-colors duration-200"
                      style={{ color: isOpen ? '#39C3FF' : 'rgba(247,249,251,0.35)' }}
                    />
                  </motion.span>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.25 } }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="pb-6 pl-[calc(0.75rem+1.25rem)]">
                        <p className="text-white/55 text-sm font-light leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
