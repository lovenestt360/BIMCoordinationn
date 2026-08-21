import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

const CHECKS = [
  'Naming',
  'Classification',
  'Parameters',
  'Properties',
  'COBie',
  'Information Consistency',
  'Model Requirements',
];

const QAQCSection = () => {
  const sectionRef = useRef(null);
  const [validated, setValidated] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          CHECKS.forEach((_, i) => {
            setTimeout(() => setValidated((v) => Math.max(v, i + 1)), 250 + i * 220);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 lg:py-40 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[#43D17A] text-xs font-light tracking-[0.2em] uppercase mb-6 block">
            QA/QC &amp; Information
          </span>
          <h2 className="font-instrument-serif text-4xl sm:text-5xl leading-[1.05] text-white mb-6">
            A coordinated model isn&apos;t enough.
            <br />
            <span className="italic text-white/70">It also has to be reliable.</span>
          </h2>
          <p className="text-white/65 text-base font-light leading-relaxed max-w-md">
            Clash detection concerns geometry. QA/QC concerns the reliability of the information
            behind it — so decisions made from the model can actually be trusted.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl p-6 md:p-8" style={{ background: 'rgba(11,42,68,0.3)' }}>
          {CHECKS.map((check, i) => {
            const isValidated = i < validated;
            return (
              <div
                key={check}
                className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0"
              >
                <span className="text-sm font-light" style={{ color: isValidated ? '#F7F9FB' : 'rgba(247,249,251,0.4)' }}>
                  {check}
                </span>
                <span
                  className="flex items-center gap-2 text-xs font-medium transition-colors duration-300"
                  style={{ color: isValidated ? '#43D17A' : 'rgba(247,249,251,0.3)' }}
                >
                  {isValidated ? (
                    <>
                      <Check size={13} />
                      Validated
                    </>
                  ) : (
                    'Checking'
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QAQCSection;
