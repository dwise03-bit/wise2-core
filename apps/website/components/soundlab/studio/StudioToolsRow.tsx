'use client';

import { PenLine, Music3, Mic, Grid3x3, SlidersHorizontal, Disc3, Layers, UserRound, SlidersVertical, ArrowRight, type LucideIcon } from 'lucide-react';

const TOOLS: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: PenLine, label: 'AI Lyric Writer', desc: 'Generate lyrics in any style.' },
  { icon: Music3, label: 'Melody Composer', desc: 'Create original melodies.' },
  { icon: Mic, label: 'Vocal Suite', desc: 'AI vocals or upload your own.' },
  { icon: Grid3x3, label: 'Beat Maker', desc: 'Generate or customize beats.' },
  { icon: SlidersHorizontal, label: 'Mixing Studio', desc: 'Professional AI mixing.' },
  { icon: Disc3, label: 'Mastering', desc: 'Radio-ready mastering.' },
  { icon: Layers, label: 'Stems & Splitter', desc: 'Extract and export stems.' },
  { icon: UserRound, label: 'Voice Cloning', desc: 'Create your signature voice.' },
];

export function StudioToolsRow() {
  return (
    <section id="studio-tools" className="relative bg-[#02050A] px-4 md:px-6 py-4 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto rounded-2xl border border-[#24C8FF]/12 bg-[#040B18]/60 p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <SlidersVertical size={20} className="text-[#24C8FF]" />
            <div>
              <h2 className="text-lg font-black text-[#F7FBFF]">STUDIO TOOLS</h2>
              <p className="text-[11px] text-[#8D9BAC]">Everything you need to create, produce and release — in one studio.</p>
            </div>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#24C8FF] hover:text-[#8BE8FF] transition-colors cursor-pointer">
            VIEW ALL TOOLS <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {TOOLS.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              className="group text-center rounded-xl bg-[#071321]/70 border border-[#24C8FF]/12 hover:border-[#24C8FF]/40 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,140,255,0.18)] transition-all p-4 cursor-pointer"
            >
              <div className="mx-auto mb-3 w-11 h-11 rounded-lg bg-[#008CFF]/12 border border-[#24C8FF]/20 grid place-items-center group-hover:bg-[#008CFF]/20 transition-colors">
                <Icon size={19} className="text-[#24C8FF]" />
              </div>
              <h3 className="text-[11px] font-black text-[#F7FBFF] leading-tight mb-1">{label}</h3>
              <p className="text-[9px] text-[#8D9BAC] leading-snug">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
