import React from "react";

export function PanelHeader({ icon: Icon, title, right, iconClass = "text-neon-cyan" }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hair">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconClass}`} />}
        <span className="font-display text-sm font-semibold tracking-wider text-white uppercase truncate">{title}</span>
      </div>
      {right}
    </div>
  );
}

export function ViewAll({ label = "View All", onClick }) {
  return (
    <button onClick={onClick} className="text-[10px] tracking-widest uppercase text-neon-cyan hover:text-white transition-colors">
      {label}
    </button>
  );
}

// Static-ish waveform bars
export function Waveform({ bars = 40, color = "#00a8ff", className = "", seed = 1 }) {
  return (
    <div className={`flex items-center gap-[2px] h-6 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 12 + Math.abs(Math.sin((i + seed) * 0.7)) * 78;
        return <span key={i} style={{ height: `${h}%`, background: color, opacity: 0.35 + (i % 4) * 0.16 }} className="w-[2px] rounded-full" />;
      })}
    </div>
  );
}

export function ProgressBar({ value, gradient = "from-neon-cyan to-neon-deep" }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[#0e1a30] overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${value}%` }} />
    </div>
  );
}
