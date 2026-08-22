'use client';

import { Zap, Sparkles, Mic, ShieldCheck, Clock, Infinity as InfinityIcon } from 'lucide-react';

const FEATURES = [
  { label: 'AI SPEED PRODUCTION', icon: Zap },
  { label: '100% ORIGINAL & CUSTOM', icon: Sparkles },
  { label: 'PROFESSIONAL VOCALS & MIXING', icon: Mic },
  { label: 'COMMERCIAL USE LICENSE', icon: ShieldCheck },
  { label: 'FAST DELIVERY', icon: Clock },
  { label: 'UNLIMITED CREATIVE DIRECTION', icon: InfinityIcon },
];

export function FeatureStrip() {
  return (
    <section className="bg-black border-y border-white/10 py-6">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {FEATURES.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon size={18} className="text-[#9AFF00] shrink-0" />
            <span className="text-[11px] font-bold tracking-wide text-gray-300 leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
