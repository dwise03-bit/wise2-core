'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { UtensilsCrossed, HardHat, Mic, Church, Car, Dumbbell } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { SectionHeading } from './SectionHeading';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// Shared demo track — swap each `src` below for the category's real master
// once produced. Never presented as anything but a preview.
const DEMO_SRC = '/audio-wise2-promo.mp3';

const SAMPLES = [
  { id: 'restaurant', icon: UtensilsCrossed, category: 'RESTAURANT JINGLE', title: 'Flavor on Point', src: DEMO_SRC },
  { id: 'construction', icon: HardHat, category: 'CONSTRUCTION THEME', title: 'Built Different', src: DEMO_SRC },
  { id: 'podcast', icon: Mic, category: 'PODCAST INTRO', title: 'Next Level Talk', src: DEMO_SRC },
  { id: 'church', icon: Church, category: 'CHURCH THEME', title: 'Faith in Motion', src: DEMO_SRC },
  { id: 'automotive', icon: Car, category: 'AUTOMOTIVE SPOT', title: 'Drive Supreme', src: DEMO_SRC },
  { id: 'fitness', icon: Dumbbell, category: 'FITNESS MOTIVATION', title: 'No Limits', src: DEMO_SRC },
];

export function SampleGallery() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section id="samples" className="bg-black py-20 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <SectionHeading index="04" kicker="Listen. Get Inspired." title="SOUND" highlight="SAMPLES" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SAMPLES.map(({ id, icon: Icon, category, title, src }) => (
            <motion.div
              key={id}
              variants={item}
              className="group rounded-xl border border-white/10 bg-gradient-to-br from-[#0c0c0c] to-[#060606] overflow-hidden hover:border-[#b08d57]/50 transition-colors"
            >
              <div className="h-28 bg-gradient-to-br from-[#141414] to-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,rgba(176,141,87,0.15),transparent_70%)]" />
                <Icon size={36} className="relative text-[#b08d57]/70 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                <span className="absolute top-2 right-2 text-[9px] font-bold tracking-widest text-gray-500 bg-black/60 px-2 py-0.5 rounded">
                  PREVIEW
                </span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold tracking-widest text-[#b08d57] mb-1">{category}</p>
                <h3 className="text-sm font-black mb-3">{title}</h3>
                <AudioPlayer
                  src={src}
                  isActive={playingId === id}
                  onPlay={() => setPlayingId(id)}
                  onPause={() => setPlayingId((p) => (p === id ? null : p))}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <button className="px-6 py-3 rounded border border-[#b08d57] text-[#b08d57] text-xs font-black tracking-wide hover:bg-[#b08d57]/10 transition-colors cursor-pointer">
            VIEW ALL SAMPLES
          </button>
        </div>
      </div>
    </section>
  );
}
