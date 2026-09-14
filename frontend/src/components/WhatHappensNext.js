import { useEffect, useRef } from 'react';
import { MessageCircle, ClipboardCheck, KeyRound, Workflow } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const STEP_META = [
  { number: '01', icon: MessageCircle, color: '#39C3FF' },
  { number: '02', icon: ClipboardCheck, color: '#7DE0FF' },
  { number: '03', icon: KeyRound, color: '#FF7A1A' },
  { number: '04', icon: Workflow, color: '#43D17A' },
];

const WhatHappensNext = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  const steps = t('whatsNext.steps', { returnObjects: true });
  const nextSteps = STEP_META.map((meta, i) => ({ ...meta, ...steps[i] }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.next-step-row',
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="whats-next" ref={sectionRef} className="py-28 lg:py-40 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">{t('whatsNext.eyebrow')}</span>
          <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6">
            {t('whatsNext.titleLine1')}
            <br />
            <span className="italic text-white/70">{t('whatsNext.titleLine2')}</span>
          </h2>
          <p className="text-white/65 text-base font-light leading-relaxed">
            {t('whatsNext.body')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {nextSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="next-step-row flex gap-4 rounded-sm border border-white/10 bg-white/[0.03] p-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0"
                  style={{ background: '#04070B', borderColor: `${step.color}55` }}
                >
                  <Icon size={18} style={{ color: step.color }} />
                </div>
                <div>
                  <span className="font-mono text-xs" style={{ color: step.color }}>{step.number}</span>
                  <h3 className="text-white text-lg font-medium mb-1.5 mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-white/55 text-sm font-light leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatHappensNext;
