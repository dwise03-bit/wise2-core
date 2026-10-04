'use client';

import { Cpu, Megaphone, Music2, Grid3x3, Mic, SlidersHorizontal, Fingerprint, type LucideIcon } from 'lucide-react';

interface Cap {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const CAPS: Cap[] = [
  { icon: Cpu, title: 'AI PRODUCER', desc: 'Turn your idea into a radio-ready track.' },
  { icon: Megaphone, title: 'JINGLE / COMMERCIAL', desc: 'Catchy. Memorable. Brand ready.' },
  { icon: Music2, title: 'FULL SONG', desc: 'From idea to finished track.' },
  { icon: Grid3x3, title: 'BEAT MAKER', desc: 'Original beats in any style.' },
  { icon: Mic, title: 'VOCAL SUITE', desc: 'AI or your vocals. Pro quality.' },
  { icon: SlidersHorizontal, title: 'MIX & MASTER', desc: 'Studio grade sound.' },
  { icon: Fingerprint, title: 'SONIC LOGO', desc: 'Audio branding that hits.' },
];

export function CapabilityCards() {
  return (
    <section id="ai-producer" className="relative bg-[#02050A] px-4 md:px-6 py-6 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {CAPS.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="group text-left rounded-xl overflow-hidden bg-[#071321]/70 border border-[#24C8FF]/12 hover:border-[#24C8FF]/40 hover:shadow-[0_0_28px_rgba(0,140,255,0.18)] transition-all cursor-pointer"
          >
            {/* visual strip */}
            <div className="relative h-20 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg,#071a30 0%,#041326 60%,#02050A 100%)' }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,200,255,0.08)_1px,transparent_1px)] bg-[size:10px_100%]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_0%,rgba(36,200,255,0.25),transparent_70%)]" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#008CFF]/15 border border-[#24C8FF]/25 grid place-items-center shadow-[0_0_18px_rgba(0,140,255,0.3)]">
                <Icon size={20} className="text-[#24C8FF]" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-[11px] font-black tracking-wide text-[#F7FBFF] mb-1">{title}</h3>
              <p className="text-[10px] leading-snug text-[#8D9BAC]">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
