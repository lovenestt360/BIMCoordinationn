import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Do you work remotely with international teams?',
    answer: 'Yes. All our BIM coordination services are delivered remotely. We work with project teams in Australia, Mozambique, and other locations using Autodesk Construction Cloud, BCF workflows, and video calls to stay fully aligned throughout the project.',
  },
  {
    question: 'Which software and tools do you use?',
    answer: 'We work with Navisworks for clash detection, Revit for modelling, Solibri for model validation and QA/QC, Autodesk Construction Cloud (ACC) for issue tracking, Bexel Manager for 4D/5D BIM, and BCF-based workflows for issue reporting.',
  },
  {
    question: 'How long does a typical BIM coordination review take?',
    answer: 'It depends on project size and scope. A standard clash detection report for a single discipline package can be delivered within 48-72 hours. Full multidisciplinary coordination for larger projects is typically scoped per phase or milestone.',
  },
  {
    question: 'Can you work with models from any BIM authoring tool?',
    answer: 'Yes. We can work with models exported to IFC, NWC/NWD, or RVT formats from any major BIM authoring tool including Revit, ArchiCAD, Bentley OpenBuildings, and others.',
  },
  {
    question: 'Do you sign NDAs or confidentiality agreements?',
    answer: 'Yes. We understand that project information is sensitive. We are happy to sign NDAs and confidentiality agreements before receiving any project data or models.',
  },
  {
    question: 'What happens after I schedule a consultation?',
    answer: 'You will receive a confirmation email with the Google Meet link and your meeting details. During the call we will discuss your project scope, requirements, timeline, and define the best approach and next steps together.',
  },
];

const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="sr-hidden border border-[#1E293B] rounded-sm overflow-hidden"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-[#0F172A] hover:bg-[#111827] transition-colors duration-200"
      >
        <span
          className="font-semibold text-[#F8FAFC] text-sm pr-4"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {faq.question}
        </span>
        <ChevronDown
          size={18}
          className="flex-shrink-0 text-[#0EA5E9] transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '300px' : '0px' }}
      >
        <p className="px-5 pb-5 text-[#94A3B8] text-sm leading-relaxed border-t border-[#1E293B] pt-4 bg-[#0F172A]">
          {faq.answer}
        </p>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section className="py-24 lg:py-32 bg-[#020617] relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="sr-hidden mb-12 text-center">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2">// FAQ</p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Common <span className="text-[#0EA5E9]">Questions</span>
          </h2>
          <p className="text-[#94A3B8]">
            Everything you need to know before working with us.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[#64748B] text-sm mb-4">Still have questions?</p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-outline px-6 py-2 rounded-sm text-sm inline-block"
          >
            Send us a message
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
