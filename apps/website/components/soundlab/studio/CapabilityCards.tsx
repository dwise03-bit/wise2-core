'use client';

import { Cpu, Megaphone, Music2, Grid3x3, Mic, SlidersHorizontal, Fingerprint, type LucideIcon } from 'lucide-react';

interface Cap {
  icon: LucideIcon;
  title: string;
  desc: string;
  img: string;
}

const CAPS: Cap[] = [
  { icon: Cpu, title: 'AI PRODUCER', desc: 'Turn your idea into a radio-ready track.', img: '/soundlab/cards/ai-producer.jpg' },
  { icon: Megaphone, title: 'JINGLE / COMMERCIAL', desc: 'Catchy. Memorable. Brand ready.', img: '/soundlab/cards/jingle.jpg' },
  { icon: Music2, title: 'FULL SONG', desc: 'From idea to finished track.', img: '/soundlab/cards/full-song.jpg' },
  { icon: Grid3x3, title: 'BEAT MAKER', desc: 'Original beats in any style.', img: '/soundlab/cards/beat-maker.jpg' },
  { icon: Mic, title: 'VOCAL SUITE', desc: 'AI or your vocals. Pro quality.', img: '/soundlab/cards/vocal-suite.jpg' },
  { icon: SlidersHorizontal, title: 'MIX & MASTER', desc: 'Studio grade sound.', img: '/soundlab/cards/mix-master.jpg' },
  { icon: Fingerprint, title: 'SONIC LOGO', desc: 'Audio branding that hits.', img: '/soundlab/cards/sonic-logo.jpg' },
];

export function CapabilityCards() {
  return (
    <section id="ai-producer" className="relative bg-[#02050A] px-4 md:px-6 py-6 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {CAPS.map(({ icon: Icon, title, desc, img }) => (
          <button
            key={title}
            className="group text-left rounded-xl overflow-hidden bg-[#071321]/70 border border-[#24C8FF]/12 hover:border-[#24C8FF]/40 hover:shadow-[0_0_28px_rgba(0,140,255,0.18)] transition-all cursor-pointer"
          >
            {/* studio photo */}
            <div className="relative h-24 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} — WISE² Sound Lab studio`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071321] via-[#02050A]/35 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_0%,rgba(36,200,255,0.2),transparent_70%)]" />
              <div className="absolute left-2.5 bottom-2.5 w-9 h-9 rounded-lg bg-[#02050A]/70 backdrop-blur-sm border border-[#24C8FF]/30 grid place-items-center shadow-[0_0_18px_rgba(0,140,255,0.3)]">
                <Icon size={17} className="text-[#24C8FF]" />
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
