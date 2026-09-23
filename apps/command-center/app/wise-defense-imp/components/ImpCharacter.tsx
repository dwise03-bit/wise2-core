'use client';

import { useMemo } from 'react';

export type ImpState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SCANNING' | 'ALERT' | 'OFFLINE' | 'CONNECTED';

interface ImpCharacterProps {
  state: ImpState;
  message?: string;
  alertLevel?: 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
}

export function ImpCharacter({ state, message, alertLevel }: ImpCharacterProps) {
  const glowColor = useMemo(() => {
    switch (alertLevel) {
      case 'CRITICAL':
        return '#ef4444';
      case 'WARNING':
        return '#f59e0b';
      case 'WATCH':
        return '#eab308';
      default:
        return '#22c55e';
    }
  }, [alertLevel]);

  const eyeAnimation = useMemo(() => {
    switch (state) {
      case 'LISTENING':
        return 'animate-pulse';
      case 'THINKING':
        return 'animate-spin';
      case 'SCANNING':
        return 'animate-bounce';
      default:
        return '';
    }
  }, [state]);

  const mouthExpression = useMemo(() => {
    switch (state) {
      case 'ALERT':
        return 'M25,35 L40,40 L55,35'; // Frown
      case 'THINKING':
        return 'M25,35 Q40,38 55,35'; // Neutral
      case 'LISTENING':
        return 'M25,35 Q40,42 55,35'; // Slight smile
      default:
        return 'M25,35 Q40,45 55,35'; // Happy smile
    }
  }, [state]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Character SVG */}
      <div className="relative w-48 h-56">
        <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-xl">
          {/* Glow effect for alerts */}
          {state === 'ALERT' && (
            <circle cx="40" cy="40" r="45" fill={glowColor} opacity="0.1" />
          )}

          {/* Head */}
          <ellipse cx="40" cy="40" rx="28" ry="32" fill="#7ec850" stroke="#5fa140" strokeWidth="2" />

          {/* Ears/Horns */}
          <ellipse cx="15" cy="20" rx="6" ry="12" fill="#6fb43e" stroke="#5fa140" strokeWidth="1.5" />
          <ellipse cx="65" cy="20" rx="6" ry="12" fill="#6fb43e" stroke="#5fa140" strokeWidth="1.5" />

          {/* Eyes container */}
          <g className={eyeAnimation}>
            {/* Left eye */}
            <circle cx="28" cy="35" r="5" fill="#1f2937" />
            <circle cx="28" cy="35" r="2.5" fill="white" />
            <circle cx="29" cy="34" r="1.5" fill="#000" />

            {/* Right eye */}
            <circle cx="52" cy="35" r="5" fill="#1f2937" />
            <circle cx="52" cy="35" r="2.5" fill="white" />
            <circle cx="53" cy="34" r="1.5" fill="#000" />
          </g>

          {/* Nose */}
          <polygon points="40,45 38,48 42,48" fill="#5fa140" />

          {/* Mouth */}
          <path d={mouthExpression} stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Tactical markings */}
          <rect x="10" y="10" width="60" height="60" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
          <line x1="40" y1="10" x2="40" y2="70" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" />
          <line x1="10" y1="40" x2="70" y2="40" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" />

          {/* Status indicator orb */}
          <circle
            cx="40"
            cy="75"
            r="4"
            fill={
              state === 'OFFLINE'
                ? '#ef4444'
                : state === 'ALERT'
                  ? glowColor
                  : state === 'LISTENING'
                    ? '#3b82f6'
                    : '#22c55e'
            }
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-xs font-mono text-green-400 uppercase tracking-wider">{state}</p>
        {message && <p className="text-sm text-gray-400 mt-2 max-w-xs">{message}</p>}
      </div>

      {/* Command prompt */}
      <div className="text-xs font-mono text-green-400 opacity-75">
        &gt; What do you want me to check?
      </div>
    </div>
  );
}
