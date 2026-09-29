import type { PriorityBand } from '@/lib/types';

export function Badge({
  tone,
  children,
}: {
  tone: 'critical' | 'high' | 'medium' | 'low' | 'ice' | 'violet' | 'chrome' | 'amber' | 'emerald';
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    critical: 'bg-critical/15 text-critical border-critical/30',
    high: 'bg-amber/15 text-amber border-amber/30',
    medium: 'bg-ice/10 text-ice border-ice/25',
    low: 'bg-white/5 text-chrome border-white/10',
    ice: 'bg-ice/10 text-ice border-ice/30',
    violet: 'bg-violet/15 text-violet border-violet/30',
    chrome: 'bg-white/5 text-chrome border-white/10',
    amber: 'bg-amber/15 text-amber border-amber/30',
    emerald: 'bg-emerald/15 text-emerald border-emerald/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function bandTone(band: PriorityBand): 'critical' | 'high' | 'medium' | 'low' {
  return band;
}

export function Button({
  children,
  onClick,
  variant = 'ice',
  type = 'button',
  disabled,
  className = '',
  autoFocus,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'ice' | 'ghost' | 'critical' | 'emerald' | 'chrome';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}) {
  const variants = {
    ice: 'bg-ice text-carbon hover:brightness-110',
    ghost: 'border border-white/15 bg-transparent text-snow hover:border-ice/50 hover:text-ice',
    critical: 'bg-critical text-white hover:brightness-110',
    emerald: 'bg-emerald text-carbon hover:brightness-110',
    chrome: 'border border-chrome/30 text-chrome hover:bg-white/5',
  };
  return (
    <button
      type={type}
      autoFocus={autoFocus}
      disabled={disabled}
      onClick={onClick}
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="glass min-w-[8.5rem] flex-1 rounded-2xl px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-chrome/70">{label}</p>
      <p className={`mt-1 font-display text-lg font-semibold ${tone ?? 'text-snow'}`}>{value}</p>
    </div>
  );
}

export function SectionTitle({ children, tone = 'chrome' }: { children: React.ReactNode; tone?: string }) {
  return (
    <h3 className={`text-[11px] font-semibold uppercase tracking-[0.18em] text-${tone}`}>{children}</h3>
  );
}
