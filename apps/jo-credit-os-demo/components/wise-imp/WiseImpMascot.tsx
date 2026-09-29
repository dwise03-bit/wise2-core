'use client';

import Image from 'next/image';
import type { GlowColor, MascotState } from './useWiseImpStore';

interface WiseImpMascotProps {
  glowColor: GlowColor;
  mascotState: MascotState;
  size?: number;
  animated?: boolean;
}

const GLOW_HEX: Record<GlowColor, string> = {
  blue: '#0094FF',
  green: '#39FF14',
  magenta: '#C80096',
  gold: '#FFD700',
};

export { GLOW_HEX };

export function WiseImpMascot({ glowColor, mascotState, size = 72, animated = true }: WiseImpMascotProps) {
  const src = `/wise-imp/${mascotState}-${glowColor}.webp`;

  return (
    <div
      className={animated ? 'wise-imp-float' : undefined}
      style={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 0 ${Math.round(size * 0.14)}px ${GLOW_HEX[glowColor]}66)`,
      }}
    >
      <Image
        src={src}
        alt="Wise Imp, the WISE² AI companion"
        fill
        sizes={`${size}px`}
        style={{ objectFit: 'contain' }}
        priority={false}
      />
      <style jsx>{`
        .wise-imp-float {
          animation: wise-imp-bob 3.2s ease-in-out infinite;
        }
        @keyframes wise-imp-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wise-imp-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
