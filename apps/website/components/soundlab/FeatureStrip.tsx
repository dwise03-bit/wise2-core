'use client';

import { useReducedMotion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Mic,
  ShieldCheck,
  Clock,
  Infinity as InfinityIcon,
  type LucideIcon,
} from 'lucide-react';

const FEATURES: { label: string; icon: LucideIcon }[] = [
  { label: 'AI SPEED PRODUCTION', icon: Zap },
  { label: '100% ORIGINAL & CUSTOM', icon: Sparkles },
  { label: 'PROFESSIONAL VOCALS & MIXING', icon: Mic },
  { label: 'COMMERCIAL USE LICENSE', icon: ShieldCheck },
  { label: 'FAST DELIVERY', icon: Clock },
  { label: 'UNLIMITED CREATIVE DIRECTION', icon: InfinityIcon },
];

function Item({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <span className="flex items-center gap-2.5 shrink-0">
      <Icon size={16} className="text-[#b08d57] shrink-0" aria-hidden="true" />
      <span className="text-xs font-bold tracking-[0.15em] text-gray-300 whitespace-nowrap">
        {label}
      </span>
      <span className="mx-6 h-1 w-1 rounded-full bg-[#b08d57]/50" aria-hidden="true" />
    </span>
  );
}

export function FeatureStrip() {
  const reduce = useReducedMotion();

  if (reduce) {
    // Static, no infinite scroll — honors prefers-reduced-motion.
    return (
      <section className="bg-black border-y border-[#b08d57]/20 py-5 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
          {FEATURES.map((f) => (
            <Item key={f.label} {...f} />
          ))}
        </div>
      </section>
    );
  }

  // Two identical tracks, translated -50% for a seamless infinite loop.
  const loop = [...FEATURES, ...FEATURES];
  return (
    <section
      className="group relative bg-black border-y border-[#b08d57]/20 py-5 overflow-hidden"
      aria-label="Key features"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-black to-transparent" />

      <div className="flex w-max animate-[soundlab-marquee_32s_linear_infinite] group-hover:[animation-play-state:paused]">
        {loop.map((f, i) => (
          <Item key={`${f.label}-${i}`} {...f} />
        ))}
      </div>

      <style jsx>{`
        @keyframes soundlab-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
