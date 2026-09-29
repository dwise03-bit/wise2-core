'use client';

import { ReactNode, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

export function Panel({
  children,
  className = '',
  interactive = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`gd-panel ${interactive ? 'gd-panel-hover transition-all duration-200' : ''} rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-extrabold uppercase tracking-[0.14em] text-white">
          {title}
        </h2>
        <div className="gd-rule mt-1.5 w-24 rounded-full" />
        {sub && <p className="mt-2 text-sm text-gd-steel">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({
  children,
  tone = 'steel',
  className = '',
}: {
  children: ReactNode;
  tone?: 'neon' | 'electric' | 'amber' | 'red' | 'steel' | 'violet';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neon: 'bg-gd-neon/12 text-gd-neon border-gd-neon/35',
    electric: 'bg-gd-electric/12 text-gd-electric border-gd-electric/35',
    amber: 'bg-gd-amber/12 text-gd-amber border-gd-amber/35',
    red: 'bg-gd-red/12 text-gd-red border-gd-red/35',
    violet: 'bg-gd-violet/12 text-gd-violet border-gd-violet/35',
    steel: 'bg-white/5 text-gd-steel border-white/10',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  size = 'md',
  type = 'button',
  title,
}: {
  children: ReactNode;
  variant?: 'primary' | 'neon' | 'ghost' | 'danger';
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
  type?: 'button' | 'submit';
  title?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-gd-electric/15 text-gd-electric border-gd-electric/45 hover:bg-gd-electric/25 hover:shadow-glow-electric',
    neon: 'bg-gd-neon/15 text-gd-neon border-gd-neon/45 hover:bg-gd-neon/25 hover:shadow-glow-neon',
    ghost: 'bg-white/[0.03] text-gd-chrome border-white/10 hover:bg-white/[0.07] hover:text-white',
    danger: 'bg-gd-red/12 text-gd-red border-gd-red/40 hover:bg-gd-red/20',
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition-all duration-150 active:scale-[0.98] ${
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs'
      } ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Every action that would touch the outside world in production is marked. */
export function DemoAction({ label = 'Demo Action' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-gd-amber/35 bg-gd-amber/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gd-amber">
      {label}
    </span>
  );
}

export function KPI({
  label,
  value,
  delta,
  spark,
  accent = '#22B8FF',
  onClick,
  note,
}: {
  label: string;
  value: string;
  delta?: string;
  spark?: number[];
  accent?: string;
  onClick?: () => void;
  note?: string;
}) {
  const up = delta?.startsWith('+');
  return (
    <button
      onClick={onClick}
      className="gd-panel gd-panel-hover group relative w-full overflow-hidden rounded-xl p-4 text-left transition-all duration-200"
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent 75%)` }}
      />
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gd-steel">{label}</p>
        <ArrowUpRight className="h-3.5 w-3.5 text-gd-steel opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">{value}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {delta ? (
          <span
            className={`text-[11px] font-bold ${up ? 'text-gd-neon' : 'text-gd-red'}`}
          >
            {delta}
          </span>
        ) : (
          <span className="text-[11px] text-gd-steel">{note}</span>
        )}
        {spark && <Sparkline data={spark} color={accent} />}
      </div>
    </button>
  );
}

export function Sparkline({
  data,
  color = '#22B8FF',
  w = 68,
  h = 20,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 3) - 1.5}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * (h - 3) - 1.5}
        r="2"
        fill={color}
      />
    </svg>
  );
}

export function Progress({
  value,
  color = '#22B8FF',
  height = 6,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-white/[0.06]"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
        }}
      />
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative flex h-full w-full ${width} animate-riseIn flex-col border-l border-gd-line bg-gd-abyss shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gd-line bg-gd-hull/60 px-6 py-4">
          <div>
            <h3 className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-white">
              {title}
            </h3>
            {subtitle && <p className="mt-1 text-xs text-gd-steel">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1.5 text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-gd-line bg-gd-hull/60 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
            value === t.id
              ? 'bg-gd-electric/18 text-gd-electric shadow-glow-electric'
              : 'text-gd-steel hover:bg-white/5 hover:text-white'
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 opacity-60">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function DataTable<T>({
  rows,
  columns,
  onRowClick,
  empty = 'No records',
}: {
  rows: T[];
  columns: { key: string; head: string; render: (row: T) => ReactNode; align?: 'right' }[];
  onRowClick?: (row: T) => void;
  empty?: string;
}) {
  if (!rows.length) {
    return <div className="px-4 py-10 text-center text-sm text-gd-steel">{empty}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gd-line">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel ${
                  c.align === 'right' ? 'text-right' : ''
                }`}
              >
                {c.head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-white/[0.045] transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-gd-electric/[0.06]' : ''
              }`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 align-middle ${c.align === 'right' ? 'text-right' : ''}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{label}</p>
      <p className="mt-1 font-display text-lg font-extrabold" style={{ color: tone ?? '#fff' }}>
        {value}
      </p>
    </div>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-white/[0.05] py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{label}</p>
      <div className="mt-0.5 text-sm text-white">{value}</div>
    </div>
  );
}

export function Copyable({ text }: { text: string }) {
  const [hit, setHit] = useState(false);
  return (
    <button
      onClick={() => {
        setHit(true);
        setTimeout(() => setHit(false), 1200);
      }}
      className="text-sm text-gd-electric transition-colors hover:text-white"
      title="Copy (demo)"
    >
      {hit ? 'Copied' : text}
    </button>
  );
}
