'use client';

import { useState } from 'react';
import { UtensilsCrossed, HardHat, Mic, Church, Car, Dumbbell } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

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
        <h2 className="text-center text-2xl md:text-3xl font-black tracking-widest mb-2">
          SOUND <span className="text-[#9AFF00] drop-shadow-[0_0_12px_rgba(154,255,0,0.5)]">SAMPLES</span>
        </h2>
        <p className="text-center text-xs tracking-widest text-gray-500 mb-12">LISTEN. GET INSPIRED.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLES.map(({ id, icon: Icon, category, title, src }) => (
            <div
              key={id}
              className="rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden hover:border-[#9AFF00]/50 transition-colors"
            >
              <div className="h-28 bg-gradient-to-br from-[#111] to-black flex items-center justify-center relative">
                <Icon size={36} className="text-[#9AFF00]/70" />
                <span className="absolute top-2 right-2 text-[9px] font-bold tracking-widest text-gray-500 bg-black/60 px-2 py-0.5 rounded">
                  PREVIEW
                </span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold tracking-widest text-[#9AFF00] mb-1">{category}</p>
                <h3 className="text-sm font-black mb-3">{title}</h3>
                <AudioPlayer
                  src={src}
                  isActive={playingId === id}
                  onPlay={() => setPlayingId(id)}
                  onPause={() => setPlayingId((p) => (p === id ? null : p))}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="px-6 py-3 rounded border border-[#9AFF00] text-[#9AFF00] text-xs font-black tracking-wide hover:bg-[#9AFF00]/10 transition-colors cursor-pointer">
            VIEW ALL SAMPLES
          </button>
        </div>
      </div>
    </section>
  );
}
