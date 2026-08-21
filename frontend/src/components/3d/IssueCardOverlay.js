import { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Breakpoints must stay identical to the color bands in ClashDetectionScene.js —
// both read the same scrollYProgress source, so keeping the numbers in sync keeps
// the 3D glow and this card's status pill visually locked together.
const CARD_IN = [0.45, 0.6];
const COLOR_BANDS = [0.6, 0.7, 0.8];

export default function IssueCardOverlay({ position, scrollYProgress }) {
  const [phase, setPhase] = useState('pending');

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v < CARD_IN[0]) setPhase('pending');
    else if (v < COLOR_BANDS[2]) setPhase('open');
    else setPhase('resolved');
  });

  const cardOpacity = useTransform(scrollYProgress, CARD_IN, [0, 1]);
  const cardY = useTransform(scrollYProgress, CARD_IN, [16, 0]);
  const statusColor = useTransform(scrollYProgress, COLOR_BANDS, ['#EF4444', '#39C3FF', '#43D17A']);

  if (phase === 'pending') return null;

  return (
    <Html transform={false} center distanceFactor={8} position={position} style={{ pointerEvents: 'none' }}>
      <motion.div
        style={{ opacity: cardOpacity, y: cardY }}
        className="w-56 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0B2A44]/95 backdrop-blur-sm px-4 py-3 shadow-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono tracking-widest text-[rgba(247,249,251,0.55)]">CLASH-0142</span>
          <motion.span
            style={{ backgroundColor: statusColor }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#04070B]"
          >
            {phase === 'resolved' ? 'RESOLVED' : 'OPEN'}
          </motion.span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {phase === 'resolved' ? (
            <CheckCircle2 size={14} className="text-[#43D17A]" />
          ) : (
            <AlertTriangle size={14} className="text-[#EF4444]" />
          )}
          <span className="text-xs font-semibold text-[#F7F9FB]">MEP ↔ Structural</span>
        </div>
        <p className="text-[11px] text-[rgba(247,249,251,0.65)] leading-snug">
          Duct routing intersects primary beam — Level 3, Gridline C-4.
        </p>
      </motion.div>
    </Html>
  );
}
