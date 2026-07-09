import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * A word-by-word staggered reveal, inspired by React Bits' SplitText component
 * (https://reactbits.dev) but trimmed for a simpler use case: animating
 * above-the-fold hero text that's always visible on mount, so it doesn't need
 * SplitText's ScrollTrigger machinery. Falls back to a static render for
 * users who've asked for less motion.
 */
export default function SplitText({
  text,
  tag = 'span',
  className = '',
  delay = 0.3,
  stagger = 0.05,
  duration = 0.7,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = el.querySelectorAll('.split-word');

    if (prefersReducedMotion) {
      gsap.set(words, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(words, { opacity: 0, y: 24 });
    const tween = gsap.to(words, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
    });

    return () => tween.kill();
  }, [text, delay, stagger, duration]);

  const Tag = tag;
  const words = text.split(' ');

  return (
    <Tag ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <span className="split-word" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
}
