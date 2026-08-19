import { useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function useScrollProgress(targetRef, offset = ['start end', 'end start']) {
  const progressRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: targetRef, offset });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v;
  });

  return { scrollYProgress, progressRef };
}
