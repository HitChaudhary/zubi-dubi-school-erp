import { useRef, useState } from 'react';

/**
 * Adapted from React Bits' SpotlightCard (https://reactbits.dev) — a card that
 * reveals a soft glow following the cursor on hover. The original ships
 * dark-themed (border-neutral-800/bg-neutral-900); restyled here on top of
 * this project's existing `.card` class instead, so it matches the rest of
 * the site rather than introducing a second card style.
 */
export default function SpotlightCard({ children, className = '', spotlightColor = 'rgba(53, 37, 205, 0.12)' }) {
  const divRef = useRef(null);
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`card relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity,
          background: `radial-gradient(circle 220px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
