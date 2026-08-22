import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const faqs = [
  {
    question: 'How do you determine the right BIM support for our project?',
    answer:
      'We first review your project stage, available models, disciplines involved, timeline, coordination challenges, and expected deliverables. From there, we define whether your team needs clash detection, model QA/QC, coordination reporting, 4D/5D support, COBie review, or a combined digital delivery support package. This is usually clarified during the initial consultation.',
  },
  {
    question: 'What makes your coordination process different from simply running clash detection?',
    answer:
      'Our process focuses on practical coordination, not just exporting clash results. We review the model context, classify issues by priority, separate true coordination risks from low-value clashes, check discipline alignment, and provide structured comments that help project teams take action. The goal is to support decision-making, not just produce a long list of clashes.',
  },
  {
    question: 'Can you support our team if we already have an internal BIM department?',
    answer:
      'Yes. Klyron Consulting can work as external BIM coordination support for internal teams, contractors, consultants, or BIM managers. We can help during workload peaks, urgent submissions, recurring coordination cycles, model validation reviews, or specialist 4D/5D and QA/QC tasks without replacing your internal team.',
  },
  {
    question: 'How do you protect project information and confidential models?',
    answer:
      'We treat client models, drawings, reports, and project data as confidential. Where required, we can work under NDAs or confidentiality agreements. Project files are handled through agreed collaboration platforms or secure file-sharing workflows, and we avoid disclosing client names or sensitive project information without permission.',
  },
  {
    question: 'What is the best way to start working with Klyron Consulting?',
    answer:
      'The best first step is to book a consultation and share your project scope, model status, disciplines involved, timeline, and required deliverables. This allows us to understand the support needed, confirm the right workflow, and recommend the most suitable BIM coordination or digital delivery approach before work begins.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

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
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">FAQ</span>

          <h2 className="font-instrument-serif text-5xl sm:text-6xl leading-[1.02] text-white mb-6">
            Common <span className="italic text-white/70">Questions</span>
          </h2>

          <p className="text-white/65 max-w-xl mx-auto text-base font-light leading-relaxed">
            Key answers to help project teams understand how Klyron Consulting approaches BIM coordination, model review, and digital delivery support.
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
