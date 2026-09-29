import { Star } from 'lucide-react';

export function BrandWordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'lg' ? 'text-4xl sm:text-5xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <span className={`inline-flex items-center gap-1 font-display font-black leading-none ${scale}`}>
      <Star className="h-[0.7em] w-[0.7em] text-lizzy-yellow" fill="currentColor" />
      <span className="bg-gradient-to-r from-lizzy-yellow via-lizzy-pink to-lizzy-cyan bg-clip-text text-transparent">
        Lil Lizzy
      </span>
    </span>
  );
}

export function GlowCard({
  children,
  className = '',
  glow = 'pink',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: 'pink' | 'cyan' | 'yellow';
}) {
  const ring =
    glow === 'cyan'
      ? 'border-lizzy-cyan/35 shadow-cyan'
      : glow === 'yellow'
        ? 'border-lizzy-yellow/35 shadow-yellow'
        : 'border-lizzy-pink/30 shadow-pink';
  return (
    <div className={`rounded-lizzy border bg-lizzy-card/80 backdrop-blur-xl ${ring} ${className}`}>{children}</div>
  );
}

export function StarList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2 text-sm text-white/85">
          <Star className="h-3.5 w-3.5 shrink-0 text-lizzy-yellow" fill="currentColor" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lizzy-cyan">{children}</p>
  );
}
