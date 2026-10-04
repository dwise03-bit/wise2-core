'use client';

import { motion, type Variants } from 'framer-motion';
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
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const TOOLS: { icon: LucideIcon; label: string }[] = [
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

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function StudioTools() {
  return (
    <section id="studio-tools" className="relative bg-black py-24 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <SectionHeading
          index="03"
          kicker="Built For Creators"
          title="PRO STUDIO"
          highlight="TOOLS"
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {TOOLS.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              variants={item}
              className="group flex items-center gap-3 rounded-lg border border-white/10 bg-gradient-to-br from-[#0c0c0c] to-[#060606] px-4 py-3.5 transition-all duration-300 hover:border-[#b08d57]/50 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(176,141,87,0.12)]"
            >
              <div className="w-8 h-8 rounded bg-[#b08d57]/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#b08d57]/20">
                <Icon size={16} className="text-[#b08d57]" aria-hidden="true" />
              </div>
              <span className="text-[11px] font-bold tracking-wide text-gray-300">{label}</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b08d57]/60 group-hover:bg-[#00FF7F] group-hover:shadow-[0_0_8px_#00FF7F] motion-safe:group-hover:animate-pulse transition-colors" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
