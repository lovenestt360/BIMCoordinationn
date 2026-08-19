import { useRef } from 'react';
import CanvasWrapper from './3d/CanvasWrapper';
import { useScrollProgress } from '../hooks/useScrollProgress';

const STATUS_STEPS = [
  { label: 'Detected', color: '#EF4444' },
  { label: 'In Review', color: '#F59E0B' },
  { label: 'Resolved', color: '#22C55E' },
];

const ClashStaticFallback = () => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: "url('/projects/mental-health-unit.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.8) 100%)' }}
    />
    <div className="absolute inset-0 flex items-center justify-center gap-3 px-4">
      {STATUS_STEPS.map((s) => (
        <div
          key={s.label}
          className="px-4 py-2 rounded-full text-xs font-mono font-bold"
          style={{ background: `${s.color}22`, border: `1px solid ${s.color}66`, color: s.color }}
        >
          {s.label}
        </div>
      ))}
    </div>
  </div>
);

export default function ClashDetectionShowcase({ step }) {
  const sectionRef = useRef(null);
  const { scrollYProgress, progressRef } = useScrollProgress(sectionRef, ['start 0.85', 'end 0.15']);
  const Icon = step.icon;

  return (
    <div
      ref={sectionRef}
      className="process-card relative overflow-hidden p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center"
    >
      {/* Ghost number watermark, matches the sibling step cards */}
      <span
        className="absolute select-none pointer-events-none font-black"
        style={{
          top: '-16px',
          right: '12px',
          fontSize: '110px',
          lineHeight: 1,
          fontFamily: 'Space Grotesk, sans-serif',
          color: 'rgba(14,165,233,0.04)',
          zIndex: 0,
        }}
      >
        {step.number}
      </span>

      {/* Header column — kept in the global scroll-reveal system for the initial fade-in */}
      <div className="sr-hidden relative z-10 lg:col-span-2 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div
            className="px-3 py-1 rounded-full font-mono text-xs font-bold tracking-widest"
            style={{ background: 'rgba(14,165,233,0.08)', border: `1px solid ${step.color}45`, color: step.color }}
          >
            STEP {step.number}
          </div>
          <div
            className="process-icon-wrap w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(34,211,238,0.06) 100%)',
              border: `1px solid ${step.color}35`,
            }}
          >
            <Icon size={20} style={{ color: step.color }} />
          </div>
        </div>

        <h3
          className="text-[15px] font-bold text-[#1E293B] mb-3 leading-snug"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {step.title}
        </h3>
        <p className="text-[#475569] text-sm leading-relaxed flex-1 mb-5">{step.description}</p>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md"
          style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.07), rgba(34,211,238,0.03))', border: `1px solid ${step.color}25` }}
        >
          <div className="output-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
          <span className="text-xs font-mono" style={{ color: step.color, opacity: 0.85 }}>
            Output:&nbsp;<span className="text-[#334155] font-sans">{step.output}</span>
          </span>
        </div>
      </div>

      {/* Scroll-scrubbed 3D showcase — intentionally NOT sr-hidden, its own scroll progress drives the reveal */}
      <div
        className="relative z-10 lg:col-span-3 h-[420px] lg:h-[520px] rounded-lg overflow-hidden border"
        style={{ borderColor: 'rgba(14,165,233,0.15)', background: '#F1F5F9' }}
      >
        <CanvasWrapper
          className="absolute inset-0"
          sceneImport={() => import('./3d/ClashDetectionScene')}
          fallback={<ClashStaticFallback />}
          canvasProps={{ camera: { position: [0, 2.6, 9], fov: 45 } }}
          sceneProps={{ progressRef, scrollYProgress }}
        />
      </div>
    </div>
  );
}
