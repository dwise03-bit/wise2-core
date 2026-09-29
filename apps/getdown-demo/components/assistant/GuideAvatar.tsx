'use client';

/**
 * The visual identity of the WISE² guide.
 *
 * A pressure-washer droplet rendered in the Get Down palette. The rings pulse
 * and the waveform animates only while speech is actually playing, so the owner
 * always knows whether the guide is talking or waiting on them.
 */
export function GuideAvatar({
  speaking,
  size = 48,
  idlePulse = false,
}: {
  speaking: boolean;
  size?: number;
  idlePulse?: boolean;
}) {
  const active = speaking || idlePulse;
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer pulse rings — only while speaking */}
      {speaking && (
        <>
          <span
            className="absolute inset-0 rounded-full border border-gd-neon/50"
            style={{ animation: 'pulseRing 1.8s ease-out infinite' }}
          />
          <span
            className="absolute inset-0 rounded-full border border-gd-electric/40"
            style={{ animation: 'pulseRing 1.8s .6s ease-out infinite' }}
          />
        </>
      )}

      <svg viewBox="0 0 64 64" width={size} height={size} className="relative">
        <defs>
          <radialGradient id="guideCore" cx="38%" cy="30%">
            <stop offset="0%" stopColor="#BDF5FF" />
            <stop offset="42%" stopColor="#22B8FF" />
            <stop offset="100%" stopColor="#0A3C63" />
          </radialGradient>
          <linearGradient id="guideRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7CFF3D" />
            <stop offset="100%" stopColor="#22B8FF" />
          </linearGradient>
        </defs>

        {/* Droplet body */}
        <path
          d="M32 5 C42 20 52 27 52 38 A20 20 0 0 1 12 38 C12 27 22 20 32 5 Z"
          fill="url(#guideCore)"
          stroke="url(#guideRim)"
          strokeWidth="1.6"
        />
        {/* Specular highlight */}
        <ellipse cx="25" cy="27" rx="5" ry="7" fill="#FFFFFF" opacity="0.34" />

        {/* Voice waveform inside the droplet */}
        <g transform="translate(32 40)">
          {[-9, -4.5, 0, 4.5, 9].map((x, i) => {
            const base = [7, 12, 16, 12, 7][i];
            return (
              <rect
                key={x}
                x={x - 1.4}
                y={-base / 2}
                width="2.8"
                height={base}
                rx="1.4"
                fill="#04121F"
                opacity={active ? 0.9 : 0.45}
                style={
                  speaking
                    ? {
                        animation: `guideWave .62s ${i * 0.08}s ease-in-out infinite alternate`,
                        transformOrigin: 'center',
                      }
                    : undefined
                }
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
