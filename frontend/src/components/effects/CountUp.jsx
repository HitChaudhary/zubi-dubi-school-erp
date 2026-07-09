import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Adapted from React Bits' CountUp (https://reactbits.dev) — animates a number
 * counting up using a spring, only once it scrolls into view. Trimmed down to
 * just what this project needs (no decimals/separator config, since our stats
 * are always whole numbers).
 */
export default function CountUp({ to, from = 0, duration = 2, delay = 0, className = '' }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });

  const isInView = useInView(ref, { once: true, margin: '0px' });

  const formatValue = useCallback((latest) => Math.round(latest).toLocaleString('en-US'), []);

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(from);
  }, [from, formatValue]);

  useEffect(() => {
    if (!isInView) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      motionValue.set(to);
      return;
    }
    const timeoutId = setTimeout(() => motionValue.set(to), delay * 1000);
    return () => clearTimeout(timeoutId);
  }, [isInView, motionValue, to, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
