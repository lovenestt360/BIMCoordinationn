import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      data-testid="scroll-progress"
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #0EA5E9, #22D3EE)',
        boxShadow: '0 0 12px rgba(34,211,238,0.6)',
      }}
    />
  );
};

export default ScrollProgress;
