const steps = [
  {
    number: '01',
    title: 'Initial Consultation',
    description: 'We discuss your project scope, BIM requirements, disciplines involved, timeline, and the type of support needed before any work begins.',
    accent: '#0EA5E9',
  },
  {
    number: '02',
    title: 'Model Review & Setup',
    description: 'We receive and review your BIM models, set up the federated model environment, and define coordination workflows and issue reporting processes.',
    accent: '#22D3EE',
  },
  {
    number: '03',
    title: 'Coordination & Clash Detection',
    description: 'We run clash detection, review and classify issues, coordinate with discipline teams, and track resolution through ACC, BCF, or your preferred platform.',
    accent: '#0EA5E9',
  },
  {
    number: '04',
    title: 'Report & Delivery',
    description: 'We deliver structured clash reports, validated models, QA/QC documentation, or 4D/5D outputs — ready for construction or project delivery.',
    accent: '#22D3EE',
  },
];

const Process = () => {
  return (
    <section className="py-24 lg:py-32 bg-[#020617] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="sr-hidden mb-16">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2">// PROCESS</p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            How We <span className="text-[#0EA5E9]">Work</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl">
            A clear, structured process from first contact to final delivery — so you always know what to expect and when.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="sr-hidden"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="tech-card rounded-sm bg-[#0F172A] p-6 m-2 h-full">
                <div
                  className="w-14 h-14 rounded-sm flex items-center justify-center mb-5 font-mono font-bold text-xl"
                  style={{
                    background: 'rgba(14,165,233,0.08)',
                    border: `1px solid ${step.accent}40`,
                    color: step.accent,
                  }}
                >
                  {step.number}
                </div>
                <h3
                  className="text-base font-bold mb-3 text-[#F8FAFC]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
