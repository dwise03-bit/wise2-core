interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  color = '#00ff00',
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeMap = {
    sm: { cx: '50', cy: '50', r: '45', width: '100', height: '100' },
    md: { cx: '50', cy: '50', r: '45', width: '120', height: '120' },
    lg: { cx: '50', cy: '50', r: '45', width: '150', height: '150' },
  };

  const dims = sizeMap[size];

  return (
    <div className="flex items-center justify-center relative">
      <svg width={dims.width} height={dims.height} viewBox="0 0 100 100">
        <circle
          cx={dims.cx}
          cy={dims.cy}
          r={dims.r}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="4"
        />
        <circle
          cx={dims.cx}
          cy={dims.cy}
          r={dims.r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-neon-green">{Math.round(percentage)}%</div>
      </div>
    </div>
  );
}
