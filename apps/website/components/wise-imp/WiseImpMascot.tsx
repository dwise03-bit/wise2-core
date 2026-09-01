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
  // The VPS desktop IMP is the canonical approved character for branded embeds.
  // Use its idle frame here instead of the older one-use web mascot.
  const src = mascotState === 'idle' ? '/wise-imp/vps-idle.png?v=3' : `/wise-imp/${mascotState}-${glowColor}.webp`;
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
  const colorHex = GLOW_HEX[glowColor];

  const classNames = [
    'wise-imp-mascot',
    animated ? 'wimp-float' : '',
    breathing ? 'wimp-breathe' : '',
    mascotState === 'thinking' ? 'wimp-think' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={{
        width: size,
        height: size,
        position: 'relative',
        '--wimp-color': colorHex,
        '--wimp-color-66': `${colorHex}66`,
        '--wimp-color-99': `${colorHex}99`,
        '--wimp-color-88': `${colorHex}88`,
        '--wimp-glow': `${glowSize}px`,
        '--wimp-glow-lg': `${Math.round(glowSize * 2.5)}px`,
        '--wimp-glow-xl': `${Math.round(glowSize * 4)}px`,
        '--wimp-glow-md': `${Math.round(glowSize * 2)}px`,
        filter: `drop-shadow(0 0 ${glowSize}px ${colorHex}66)`,
      } as React.CSSProperties}
    >
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
    </div>
  );
}
