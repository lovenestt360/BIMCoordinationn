import { useState, useEffect, useRef } from 'react';

const CountUp = ({ target, suffix = '', duration = 1800, className = '', style = {} }) => {
  const [count, setCount] = useState(0);
  const elRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.unobserve(el);

          const startTime = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={elRef} className={className} style={style}>
      {count.toLocaleString('en-US')}{suffix}
    </span>
  );
};

export default CountUp;
