/* ====================================================================
   MathFlow — ElasticText Component
   Character-by-character elastic spring animation.
   ==================================================================== */

import { motion, useReducedMotion } from 'framer-motion';
import { useState, useCallback } from 'react';

interface ElasticTextProps {
  text: string;
  className?: string;
}

export default function ElasticText({ text, className = '' }: ElasticTextProps) {
  const prefersReduced = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseEnter = useCallback((i: number) => {
    setHoveredIndex(i);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // If user prefers reduced motion, render plain text
  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  const characters = text.split('');

  return (
    <span className={className} aria-label={text}>
      {characters.map((char, i) => {
        if (char === ' ') {
          return (
            <span key={i} className="inline-block" style={{ width: '0.3em' }}>
              &nbsp;
            </span>
          );
        }

        // Calculate distance from hovered character for ripple effect
        const distance = hoveredIndex !== null ? Math.abs(i - hoveredIndex) : null;
        const isNear = distance !== null && distance <= 3;
        const intensity = isNear ? Math.max(0, 1 - distance! / 4) : 0;

        return (
          <motion.span
            key={i}
            className="inline-block cursor-default"
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            initial={{
              y: 0,
              scaleY: 1,
              scaleX: 1,
              rotate: 0,
            }}
            animate={{
              y: intensity * -8,
              scaleY: 1 + intensity * 0.25,
              scaleX: 1 - intensity * 0.08,
              rotate: intensity * (i % 2 === 0 ? 2 : -2),
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 12,
              mass: 0.6,
            }}
            style={{
              display: 'inline-block',
              transformOrigin: 'bottom center',
              willChange: 'transform',
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
