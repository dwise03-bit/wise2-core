import { FERGIE_LAYOUT } from '@/lib/brand-tokens';

export function GlassCard({
  children,
  className = '',
  glow,
  gold,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  gold?: boolean;
}) {
  return (
    <div
      className={`relative ${FERGIE_LAYOUT.glassCard} ${glow ? 'glow-bg' : ''} ${gold ? 'gold-glow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <GlassCard className="flex flex-col gap-1">
      <span className={FERGIE_LAYOUT.statLabel}>{label}</span>
      <span className={FERGIE_LAYOUT.statValue}>{value}</span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
    </GlassCard>
  );
}

export function SectionHeader({
  title,
  action,
  className = '',
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-center justify-between ${className}`}>
      <h2 className={FERGIE_LAYOUT.sectionTitle}>{title}</h2>
      {action}
    </div>
  );
}

export function ClocheMark({ className = 'h-10 w-10', spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} ${spinning ? 'cloche-spin' : ''}`}
      fill="none"
      aria-hidden
    >
      <path
        d="M8 42h48"
        stroke="#FFD700"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 42c1.2-16 10-28 20-28s18.8 12 20 28"
        stroke="#FFD700"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="12" r="3.2" fill="#FFD700" />
      <path d="M18 42h28v4H18z" fill="#6A22E2" />
      <path d="M16 46h32v3H16z" fill="#FFD700" />
    </svg>
  );
}

export function BrandWordmark({
  size = 'md',
  align = 'center',
}: {
  size?: 'sm' | 'md' | 'lg';
  align?: 'center' | 'left';
}) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  return (
    <div className={`flex flex-col ${align === 'left' ? 'items-start' : 'items-center'}`}>
      <span className={`font-display font-bold uppercase tracking-[0.18em] text-fergie-gold ${sizes[size]}`}>
        Fergie&apos;s Table
      </span>
      <span className="font-script text-2xl text-fergie-rose">Savôré</span>
    </div>
  );
}

export function Wise2Badge({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[10px] uppercase tracking-[0.22em] text-fergie-rose/50 ${className}`}>
      Powered by <span className="text-fergie-gold">WISE²</span> Business Platform
    </p>
  );
}

export function StatusPill({ label, tone = 'gold' }: { label: string; tone?: 'gold' | 'purple' | 'muted' | 'rose' }) {
  const tones = {
    gold: 'border-fergie-gold/40 bg-fergie-gold/15 text-fergie-gold',
    purple: 'border-fergie-royal/40 bg-fergie-royal/20 text-fergie-rose',
    muted: 'border-white/15 bg-white/5 text-white/60',
    rose: 'border-fergie-rose/40 bg-fergie-rose/15 text-fergie-rose',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {label}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-3">
      <div>
        {subtitle && <p className="font-script text-xl text-fergie-rose">{subtitle}</p>}
        <h1 className="font-serif text-2xl font-bold">{title}</h1>
      </div>
      {action}
    </header>
  );
}
