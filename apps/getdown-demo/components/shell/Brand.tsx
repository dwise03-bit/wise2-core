export function GetDownMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const scale = {
    sm: { t: 'text-lg', s: 'text-[8px] tracking-[0.42em]' },
    md: { t: 'text-2xl', s: 'text-[9px] tracking-[0.44em]' },
    lg: { t: 'text-5xl', s: 'text-xs tracking-[0.5em]' },
    xl: { t: 'text-6xl md:text-8xl', s: 'text-sm tracking-[0.6em]' },
  }[size];

  return (
    <div className="select-none leading-none">
      <div
        className={`chrome-text font-display font-black uppercase italic ${scale.t}`}
        style={{ letterSpacing: '-0.03em' }}
      >
        Get Down
      </div>
      <div className={`mt-1 font-display font-bold uppercase text-gd-electric ${scale.s}`}>
        Pressure Washing
      </div>
    </div>
  );
}

export function WaterEdge() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full opacity-[0.35]"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22B8FF" stopOpacity="0" />
          <stop offset="45%" stopColor="#22B8FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7CFF3D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,64 C180,18 320,104 520,58 C700,16 840,96 1030,54 C1110,36 1160,50 1200,44"
        fill="none"
        stroke="url(#wg)"
        strokeWidth="1.4"
      />
      <path
        d="M0,86 C200,44 340,120 560,78 C760,42 900,110 1080,72 C1140,60 1180,68 1200,64"
        fill="none"
        stroke="url(#wg)"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}

export function PoweredByWise() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gd-steel">
      Powered by
      <span className="text-gd-chrome">
        WISE<sup className="text-[7px] text-gd-neon">2</sup>
      </span>
      Revenue Engine
    </div>
  );
}
