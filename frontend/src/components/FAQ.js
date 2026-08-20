import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
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

  const scrollToSchedule = (e) => {
    e.preventDefault();
    document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 lg:py-32 bg-[#F8FAFC] relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      {/* Ambient glow — animates in as the section scrolls into view (native CSS, no JS).
          Centered via left/margin (not transform) so it doesn't fight the entrance animation's transform. */}
      <div className="ambient-glow absolute pointer-events-none" style={{
        top: '10%', left: '50%', marginLeft: '-300px',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.06) 0%, transparent 70%)',
      }} />

      <div className="max-w-3xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="sr-hidden text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.5))' }} />
            <span className="text-[#0EA5E9] font-mono text-sm">// FAQ</span>
            <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.5), transparent)' }} />
          </div>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Common <span style={{
              background: 'linear-gradient(90deg, #0EA5E9, #22D3EE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Questions</span>
          </h2>

          <p className="text-[#475569] max-w-xl mx-auto text-sm leading-relaxed">
            Key answers to help project teams understand how Klyron Consulting approaches BIM coordination, model review, and digital delivery support.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="sr-hidden rounded-sm overflow-hidden"
                style={{
                  transitionDelay: `${i * 60}ms`,
                  border: isOpen
                    ? '1px solid rgba(14,165,233,0.4)'
                    : '1px solid rgba(226,232,240,1)',
                }}
                animate={{
                  boxShadow: isOpen
                    ? '0 0 24px -6px rgba(14,165,233,0.18)'
                    : '0 0 0px 0px rgba(14,165,233,0)',
                  background: isOpen
                    ? 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)'
                    : 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%)',
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
              >
                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-200"
                  style={{ background: 'transparent' }}
                >
                  {/* Number + question */}
                  <div className="flex items-center gap-4 min-w-0">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center font-mono text-xs font-bold"
                      style={{
                        background: isOpen ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.06)',
                        border: isOpen ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(14,165,233,0.15)',
                        color: isOpen ? '#22D3EE' : '#94A3B8',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="font-semibold text-sm leading-snug"
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: isOpen ? '#1E293B' : '#334155',
                        transition: 'color 0.2s ease',
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
                    <ChevronDown size={18} style={{ color: isOpen ? '#22D3EE' : '#94A3B8' }} />
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
                      <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(14,165,233,0.12)' }}>
                        <p className="text-[#475569] text-sm leading-relaxed pt-3">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="sr-hidden text-center mt-12 pt-8 border-t border-[#F1F5F9]">
          <p className="text-[#64748B] text-sm mb-5">
            Still unsure what level of BIM support your project needs?
          </p>
          <a
            href="#schedule"
            onClick={scrollToSchedule}
            className="btn-primary inline-flex items-center gap-2 px-7 py-3 rounded-sm font-medium text-sm"
          >
            Book a Consultation
            <ArrowRight size={16} />
          </a>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
