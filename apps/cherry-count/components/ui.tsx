import { CHERRY_LAYOUT } from '@/lib/brand-tokens';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ children, className = '', glow }: GlassCardProps) {
  return (
    <div className={`relative ${CHERRY_LAYOUT.glassCard} ${glow ? 'glow-bg' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <GlassCard className="flex flex-col gap-1">
      <span className={CHERRY_LAYOUT.statLabel}>{label}</span>
      <span className={`${CHERRY_LAYOUT.statValue} ${accent ? 'text-cherry-lavender' : ''}`}>
        {typeof value === 'number' && label.includes('SALES') ? `$${value.toLocaleString()}` : value}
      </span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
    </GlassCard>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-3 flex items-center justify-between ${className}`}>
      <h2 className={CHERRY_LAYOUT.sectionTitle}>{title}</h2>
      {action}
    </div>
  );
}

export function CherryLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  return (
    <div className="flex items-center gap-2">
      <span className="text-cherry-hot">🍒</span>
      <span className={`font-serif font-bold uppercase tracking-wider ${sizes[size]}`}>
        Cherry Count<span className="text-cherry-hot">™</span>
      </span>
    </div>
  );
}

export function Wise2Badge({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[10px] uppercase tracking-[0.2em] text-cherry-chrome/60 ${className}`}>
      Powered by <span className="text-cherry-chrome">WISE²</span> Business Operating System
    </p>
  );
}
