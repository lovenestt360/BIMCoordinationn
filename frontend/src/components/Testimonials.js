import { useScrollReveal } from '../hooks/useScrollReveal';

const testimonials = [
  {
    quote: "Klyron's coordination work helped us identify and resolve over 800 clashes before construction started. The reports were clear, well-structured, and the turnaround was faster than expected.",
    author: "Project Manager",
    role: "Construction Firm",
    location: "Australia",
    initial: "P",
  },
  {
    quote: "The BIM QA/QC review was exactly what we needed. They checked our model data, COBie fields, and naming conventions with precision. Highly recommend for any pre-delivery model validation.",
    author: "BIM Manager",
    role: "Design Consultancy",
    location: "Australia",
    initial: "B",
  },
  {
    quote: "Remote support worked seamlessly. We shared models via ACC and received structured clash reports within 48 hours. Professional, responsive, and technically strong.",
    author: "Site Engineer",
    role: "Infrastructure Project",
    location: "Mozambique",
    initial: "S",
  },
];

const TestimonialCard = ({ t, index }) => {
  const ref = useScrollReveal({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className="sr-hidden tech-card rounded-sm bg-[#0F172A] p-6 flex flex-col"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div
        className="text-5xl font-serif leading-none mb-4 select-none"
        style={{ color: '#0EA5E9', opacity: 0.4 }}
      >
        &ldquo;
      </div>
      <p className="text-[#CBD5E1] text-sm leading-relaxed flex-1 mb-6 italic">
        {t.quote}
      </p>
      <div className="h-px bg-[#1E293B] mb-4" />
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            background: 'rgba(14,165,233,0.1)',
            border: '1px solid rgba(14,165,233,0.25)',
            color: '#0EA5E9',
          }}
        >
          {t.initial}
        </div>
        <div>
          <p
            className="text-[#F8FAFC] text-sm font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {t.author}
          </p>
          <p className="text-[#64748B] text-xs">{t.role} · {t.location}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const headerRef = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 blueprint-bg relative">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef} className="sr-hidden mb-16 text-center">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2">// TESTIMONIALS</p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            What Clients <span className="text-[#0EA5E9]">Say</span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto">
            Feedback from project teams who have worked with Klyron Consulting on BIM coordination, clash detection, and model validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
