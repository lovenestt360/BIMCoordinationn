import { useEffect, useRef } from 'react';
import { MessageCircle, FolderCog, Layers, SearchCheck, ShieldCheck, FileCheck } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const STEP_META = [
  { number: '01', icon: MessageCircle, color: '#39C3FF' },
  { number: '02', icon: FolderCog, color: '#7DE0FF' },
  { number: '03', icon: Layers, color: '#39C3FF' },
  { number: '04', icon: SearchCheck, color: '#FF7A1A' },
  { number: '05', icon: ShieldCheck, color: '#43D17A' },
  { number: '06', icon: FileCheck, color: '#7DE0FF' },
];

const Process = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  const steps = t('process.steps', { returnObjects: true });
  const processSteps = STEP_META.map((meta, i) => ({ ...meta, ...steps[i] }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.step-row',
        { autoAlpha: 0, x: -20 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      );

      // "Information Flow" line grows down the step list as the section scrolls through
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'bottom 70%',
              scrub: 0.5,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="py-28 lg:py-40 relative overflow-hidden" style={{ background: '#04070B' }}>
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-40" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        {/* Header */}
        <div className="sr-hidden mb-20 max-w-2xl">
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">{t('process.eyebrow')}</span>
          <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6">
            {t('process.titleLine1')}
            <br />
            <span className="italic text-white/70">{t('process.titleLine2')}</span>
          </h2>
          <p className="text-white/65 text-base font-light leading-relaxed">
            {t('process.body')}
          </p>
        </div>

        {/* Step list with Information Flow line */}
        <div className="relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-white/10 hidden md:block" />
          <div
            ref={lineRef}
            className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-[#39C3FF] to-[#7DE0FF] hidden md:block"
            style={{ transformOrigin: 'top' }}
          />

          <div className="space-y-10 md:space-y-14">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="step-row grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 relative">
                  <div className="md:col-span-1 flex md:justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center border relative z-10"
                      style={{ background: '#04070B', borderColor: `${step.color}55` }}
                    >
                      <Icon size={20} style={{ color: step.color }} />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-center">
                    <span className="font-mono text-xs" style={{ color: step.color }}>{t('process.stepLabel')} {step.number}</span>
                  </div>
                  <div className="md:col-span-6">
                    <h3 className="text-white text-lg md:text-xl font-medium mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {step.title}
                    </h3>
                    <p className="text-white/55 text-sm font-light leading-relaxed max-w-lg">{step.description}</p>
                  </div>
                  <div className="md:col-span-3 flex md:justify-end items-start md:items-center">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-xs"
                      style={{ background: `${step.color}12`, border: `1px solid ${step.color}30` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                      <span style={{ color: step.color }}>{step.output}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Process;
