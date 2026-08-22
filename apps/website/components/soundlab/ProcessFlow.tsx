'use client';

import { motion } from 'framer-motion';
import { Users, Wand2, Sliders, CloudDownload, ArrowRight } from 'lucide-react';

const STAGES = [
  {
    n: 1,
    icon: Users,
    title: 'TELL US YOUR VISION',
    desc: 'Answer a few simple questions about your brand, audience, style & goals.',
  },
  {
    n: 2,
    icon: Wand2,
    title: 'WE CREATE OPTIONS',
    desc: 'Our AI Sound Engine generates multiple concepts with lyrics, melodies, vocals & instrumentals.',
  },
  {
    n: 3,
    icon: Sliders,
    title: 'REVIEW & REFINE',
    desc: 'You choose your favorite. Request revisions. We fine-tune every detail until it’s perfect.',
  },
  {
    n: 4,
    icon: CloudDownload,
    title: 'DELIVER & OWN IT',
    desc: 'Receive studio-quality files ready for any platform with full commercial rights.',
  },
];

export function ProcessFlow() {
  return (
    <section id="how-it-works" className="bg-black py-20 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-black tracking-widest mb-12">
          HOW IT <span className="text-[#9AFF00] drop-shadow-[0_0_12px_rgba(154,255,0,0.5)]">WORKS</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-6 md:gap-4 relative">
          {STAGES.map(({ n, icon: Icon, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative rounded-lg border border-white/10 bg-[#0a0a0a] p-6 text-center"
            >
              <div className="mx-auto mb-4 w-12 h-12 rounded-full border-2 border-[#9AFF00] flex items-center justify-center text-[#9AFF00] font-black text-lg shadow-[0_0_16px_rgba(154,255,0,0.35)]">
                {n}
              </div>
              <Icon size={22} className="mx-auto mb-3 text-gray-400" />
              <h3 className="text-xs font-black tracking-wide mb-2">{title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>

              {i < STAGES.length - 1 && (
                <ArrowRight
                  size={20}
                  className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-[#9AFF00]/50 z-10"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
