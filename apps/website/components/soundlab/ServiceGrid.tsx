'use client';

import { motion, type Variants } from 'framer-motion';
import {
  Music2,
  Mic2,
  Podcast,
  Radio,
  Fingerprint,
  Bot,
  Drum,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface Service {
  icon: LucideIcon;
  title: string;
  desc: string;
  featured?: boolean;
}

const SERVICES: Service[] = [
  {
    icon: Music2,
    title: 'BUSINESS JINGLES',
    desc: 'Catchy, memorable, brand-focused hooks engineered to lodge in your customer’s head and stay there.',
    featured: true,
  },
  { icon: Mic2, title: 'FULL SONGS', desc: 'Custom lyrics, hooks & melodies.' },
  { icon: Podcast, title: 'PODCAST INTROS & OUTROS', desc: 'Stand out. Set the tone. Be remembered.' },
  { icon: Radio, title: 'COMMERCIALS & RADIO SPOTS', desc: 'TV, radio, online ads & promotions.' },
  { icon: Fingerprint, title: 'SONIC LOGOS & BRAND IDENTITY', desc: 'Audio identities that represent your brand.' },
  { icon: Bot, title: 'AI VOCALS & VOICE MODELS', desc: 'Realistic AI vocals in any style or tone.' },
  { icon: Drum, title: 'INSTRUMENTALS & BEATS', desc: 'Any genre. Any mood. Any vibe.' },
  { icon: Smartphone, title: 'SOCIAL MEDIA AUDIO', desc: 'TikTok, Reels, YouTube Shorts & more.' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function ServiceGrid() {
  return (
    <section id="what-we-create" className="relative bg-black py-24 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <SectionHeading
          index="01"
          kicker="Capabilities"
          title="WHAT WE"
          highlight="CREATE"
          sub="One studio for every sound your brand needs — from a 15-second hook to a full production."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[1fr]"
        >
          {SERVICES.map(({ icon: Icon, title, desc, featured }) => (
            <motion.article
              key={title}
              variants={item}
              className={`group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0c0c0c] to-[#060606] p-5 transition-all duration-300 hover:border-[#b08d57]/60 hover:-translate-y-1 ${
                featured ? 'col-span-2 md:row-span-2 flex flex-col justify-between p-6' : ''
              }`}
            >
              {/* hover glow */}
              <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(400px_circle_at_var(--x,50%)_0%,rgba(176,141,87,0.12),transparent_70%)]" />

              <div className="relative">
                <div
                  className={`rounded-lg bg-[#b08d57]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#b08d57]/20 group-hover:scale-105 ${
                    featured ? 'w-14 h-14' : 'w-10 h-10'
                  }`}
                >
                  <Icon size={featured ? 28 : 20} className="text-[#b08d57]" aria-hidden="true" />
                </div>
                <h3 className={`font-black tracking-wide mb-1.5 ${featured ? 'text-lg md:text-xl' : 'text-xs'}`}>
                  {title}
                </h3>
                <p className={`text-gray-500 leading-relaxed ${featured ? 'text-sm max-w-sm' : 'text-[11px]'}`}>
                  {desc}
                </p>
              </div>

              {featured && (
                <div className="relative mt-6 flex items-end gap-1 h-12">
                  {[40, 70, 30, 85, 55, 95, 45, 75, 35, 60, 50, 80].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-[#b08d57]/30 to-[#b08d57] opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
