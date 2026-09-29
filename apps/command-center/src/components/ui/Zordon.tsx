/**
 * Zordon — WISE² mascot companion
 *
 * Renders sprite-sheet animations produced by the `animate-character` skill
 * (.claude/skills/animate-character), which emits a horizontal PNG strip plus
 * CSS of the form:
 *
 *   background: url(sheet.png) left center;
 *   animation: play 2s steps(N) infinite;
 *   @keyframes play { to { background-position: right center; } }
 *
 * This component matches that contract exactly — no JS animation loop, no
 * dependencies. Frames advance via CSS steps().
 *
 * Character rules live in docs/MASCOT_SPEC.md. Renders that drop the horns,
 * crown, chain or chest W² are off-model.
 */
'use client';

import React, { useEffect, useState } from 'react';

export type ZordonState = 'idle' | 'wave' | 'thinking' | 'celebrate';

/** One entry per sprite sheet. `frames` MUST match what the skill reported. */
export interface ZordonSprite {
  /** Public path to the horizontal sprite sheet PNG */
  src: string;
  /** Frame count — feeds CSS steps(); wrong value = visible jitter */
  frames: number;
  /** Seconds for one full cycle */
  duration: number;
  /** Play once then fall back to idle, rather than looping */
  once?: boolean;
}

export interface ZordonProps {
  state?: ZordonState;
  /** Sheets you actually have. Missing states degrade to idle, or to nothing. */
  sprites?: Partial<Record<ZordonState, ZordonSprite>>;
  /** Rendered size in px — sheets are authored square */
  size?: number;
  className?: string;
  onClick?: () => void;
  /** Accessible label. Set to '' if he is purely decorative alongside real text. */
  label?: string;
}

const DEFAULT_SIZE = 160;

export const Zordon: React.FC<ZordonProps> = ({
  state = 'idle',
  sprites,
  size = DEFAULT_SIZE,
  className,
  onClick,
  label = 'Zordon, the WISE² assistant',
}) => {
  const [current, setCurrent] = useState<ZordonState>(state);

  // Respect the OS setting. A mascot looping forever in the corner is a real
  // accessibility problem, not a nicety — freeze to a single frame instead.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => setCurrent(state), [state]);

  // One-shot states return to idle when their cycle ends.
  const sprite = sprites?.[current] ?? sprites?.idle;
  useEffect(() => {
    if (!sprite?.once || current === 'idle') return;
    const t = setTimeout(() => setCurrent('idle'), sprite.duration * 1000);
    return () => clearTimeout(t);
  }, [current, sprite]);

  // No asset yet? Render nothing rather than a broken image. The spec is
  // written; the art is not, and a missing sheet should be invisible.
  if (!sprite) return null;

  const anim = `zordon-play-${sprite.frames}`;
  const interactive = typeof onClick === 'function';

  return (
    <>
      <style>{`
        @keyframes ${anim} { to { background-position: right center; } }
      `}</style>
      <div
        className={className}
        onClick={onClick}
        role={interactive ? 'button' : label ? 'img' : 'presentation'}
        tabIndex={interactive ? 0 : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${sprite.src})`,
          // Sheet is `frames` wide, so scale to frames x size to show one cell.
          backgroundSize: `${sprite.frames * 100}% 100%`,
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto',
          cursor: interactive ? 'pointer' : 'default',
          animation: reduceMotion
            ? undefined
            : `${anim} ${sprite.duration}s steps(${sprite.frames}) ${
                sprite.once ? '1' : 'infinite'
              }`,
        }}
      />
    </>
  );
};

export default Zordon;
