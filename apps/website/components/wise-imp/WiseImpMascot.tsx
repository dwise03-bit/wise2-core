'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { GlowColor, MascotState } from './useWiseImpStore';

interface WiseImpMascotProps {
  glowColor: GlowColor;
  mascotState: MascotState;
  size?: number;
  animated?: boolean;
  breathing?: boolean;
}

const GLOW_HEX: Record<GlowColor, string> = {
  blue: '#0094FF',
  green: '#39FF14',
  magenta: '#C80096',
  gold: '#FFD700',
};

export { GLOW_HEX };

export function WiseImpMascot({ glowColor, mascotState, size = 72, animated = true, breathing = false }: WiseImpMascotProps) {
  const src = `/wise-imp/${mascotState}-${glowColor}.webp`;
  const [prevSrc, setPrevSrc] = useState(src);
  const [transitioning, setTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (src !== prevSrc) {
      setTransitioning(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setPrevSrc(src);
        setTransitioning(false);
      }, 300);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [src, prevSrc]);

  const glowSize = Math.round(size * 0.14);
  const glowColor6 = `${GLOW_HEX[glowColor]}66`;
  const instanceId = useRef(`wimp-${Math.random().toString(36).slice(2, 7)}`).current;

  return (
    <div
      className={[
        animated ? 'wise-imp-float' : '',
        breathing ? 'wise-imp-breathe' : '',
        mascotState === 'thinking' ? 'wise-imp-think-pulse' : '',
      ].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 0 ${glowSize}px ${glowColor6})`,
      }}
    >
      {/* Previous image (fades out during transition) */}
      {transitioning && (
        <Image
          src={prevSrc}
          alt=""
          fill
          sizes={`${size}px`}
          style={{
            objectFit: 'contain',
            opacity: 0,
            transition: 'opacity 300ms ease-out',
          }}
          priority={false}
        />
      )}

      {/* Current image (fades in) */}
      <Image
        src={src}
        alt="Wise Imp, the WISE² AI companion"
        fill
        sizes={`${size}px`}
        style={{
          objectFit: 'contain',
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 300ms ease-in',
        }}
        priority={false}
        onLoad={() => {
          if (transitioning) {
            setPrevSrc(src);
            setTransitioning(false);
          }
        }}
      />

      <style jsx>{`
        .wise-imp-float {
          animation: ${instanceId}-bob 3.2s ease-in-out infinite;
        }
        @keyframes ${instanceId}-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .wise-imp-breathe {
          animation: ${instanceId}-breathe 2.8s ease-in-out infinite;
        }
        @keyframes ${instanceId}-breathe {
          0%, 100% { filter: drop-shadow(0 0 ${glowSize}px ${glowColor6}); }
          50% { filter: drop-shadow(0 0 ${glowSize * 2.5}px ${GLOW_HEX[glowColor]}99) drop-shadow(0 0 ${glowSize * 4}px ${glowColor6}); }
        }

        .wise-imp-think-pulse {
          animation: ${instanceId}-think 1.2s ease-in-out infinite;
        }
        @keyframes ${instanceId}-think {
          0%, 100% { filter: drop-shadow(0 0 ${glowSize}px ${glowColor6}); transform: translateY(0) scale(1); }
          50% { filter: drop-shadow(0 0 ${glowSize * 2}px ${GLOW_HEX[glowColor]}88); transform: translateY(-3px) scale(1.03); }
        }

        .wise-imp-float.wise-imp-breathe {
          animation: ${instanceId}-bob 3.2s ease-in-out infinite, ${instanceId}-breathe 2.8s ease-in-out infinite;
        }
        .wise-imp-float.wise-imp-think-pulse {
          animation: ${instanceId}-bob 3.2s ease-in-out infinite, ${instanceId}-think 1.2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .wise-imp-float,
          .wise-imp-breathe,
          .wise-imp-think-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
