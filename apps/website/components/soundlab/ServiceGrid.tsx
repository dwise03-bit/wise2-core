'use client';

import { motion } from 'framer-motion';
import {
  Music2,
  Mic2,
  Podcast,
  Radio,
  Fingerprint,
  Bot,
  Drum,
  Smartphone,
} from 'lucide-react';

const SERVICES = [
  {
    icon: Music2,
    title: 'BUSINESS JINGLES',
    desc: 'Catchy. Memorable. Brand-Focused.',
  },
  {
    icon: Mic2,
    title: 'FULL SONGS',
    desc: 'Custom lyrics, hooks & melodies.',
  },
  {
    icon: Podcast,
    title: 'PODCAST INTROS & OUTROS',
    desc: 'Stand out. Set the tone. Be remembered.',
  },
  {
    icon: Radio,
    title: 'COMMERCIALS & RADIO SPOTS',
    desc: 'TV, radio, online ads & promotions.',
  },
  {
    icon: Fingerprint,
    title: 'SONIC LOGOS & BRAND IDENTITY',
    desc: 'Audio identities that represent your brand.',
  },
  {
    icon: Bot,
    title: 'AI VOCALS & VOICE MODELS',
    desc: 'Realistic AI vocals in any style or tone.',
  },
  {
    icon: Drum,
    title: 'INSTRUMENTALS & BEATS',
    desc: 'Any genre. Any mood. Any vibe.',
  },
  {
    icon: Smartphone,
    title: 'SOCIAL MEDIA AUDIO',
    desc: 'TikTok, Reels, YouTube Shorts & more.',
  },
];

export function ServiceGrid() {
  return (
    <section id="what-we-create" className="bg-black py-20 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-black tracking-widest mb-12">
          WHAT WE <span className="text-[#9AFF00] drop-shadow-[0_0_12px_rgba(154,255,0,0.5)]">CREATE</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group rounded-lg border border-white/10 bg-[#0a0a0a] p-5 hover:border-[#9AFF00]/60 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(154,255,0,0.15)] transition-all cursor-default"
            >
              <div className="w-10 h-10 rounded-md bg-[#9AFF00]/10 flex items-center justify-center mb-4 group-hover:bg-[#9AFF00]/20 transition-colors">
                <Icon size={20} className="text-[#9AFF00]" />
              </div>
              <h3 className="text-xs font-black tracking-wide mb-1.5">{title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
