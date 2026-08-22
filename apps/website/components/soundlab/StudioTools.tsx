'use client';

import {
  PenLine,
  Music3,
  Mic,
  Drum,
  Layers,
  SlidersHorizontal,
  Disc3,
  Waves,
  FileAudio,
  AudioWaveform,
  Gauge,
  Image as ImageIcon,
} from 'lucide-react';

const TOOLS = [
  { icon: PenLine, label: 'AI LYRIC WRITER' },
  { icon: Music3, label: 'MELODY COMPOSER' },
  { icon: Mic, label: 'AI VOCAL SUITE' },
  { icon: Drum, label: 'BEAT MAKER' },
  { icon: Layers, label: 'ARRANGEMENT BUILDER' },
  { icon: SlidersHorizontal, label: 'SMART MIXING' },
  { icon: Disc3, label: 'MASTERING ENGINE' },
  { icon: Waves, label: 'VOCAL TUNING' },
  { icon: FileAudio, label: 'STEM EXPORTS' },
  { icon: AudioWaveform, label: 'WAVEFORM EDITOR' },
  { icon: Gauge, label: 'KEY & BPM FINDER' },
  { icon: ImageIcon, label: 'COVER ART GENERATOR' },
];

export function StudioTools() {
  return (
    <section id="studio-tools" className="bg-black py-20 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-black tracking-widest mb-2">
          PRO STUDIO <span className="text-[#9AFF00] drop-shadow-[0_0_12px_rgba(154,255,0,0.5)]">TOOLS</span>
        </h2>
        <p className="text-center text-xs tracking-widest text-gray-500 mb-12">BUILT FOR CREATORS</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOOLS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-md border border-white/10 bg-[#0a0a0a] px-4 py-3.5 hover:border-[#9AFF00]/50 hover:bg-[#9AFF00]/5 transition-colors cursor-default"
            >
              <div className="w-8 h-8 rounded bg-[#9AFF00]/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#9AFF00]" />
              </div>
              <span className="text-[11px] font-bold tracking-wide text-gray-300">{label}</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#9AFF00]/60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
