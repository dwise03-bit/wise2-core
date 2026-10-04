'use client';

import { motion, type Variants } from 'framer-motion';
import { Users, Wand2, Sliders, CloudDownload, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface Stage {
  n: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const STAGES: Stage[] = [
  { n: '01', icon: Users, title: 'TELL US YOUR VISION', desc: 'Answer a few simple questions about your brand, audience, style & goals.' },
  { n: '02', icon: Wand2, title: 'WE CREATE OPTIONS', desc: 'Our AI Sound Engine generates multiple concepts with lyrics, melodies, vocals & instrumentals.' },
  { n: '03', icon: Sliders, title: 'REVIEW & REFINE', desc: 'You choose your favorite. Request revisions. We fine-tune every detail until it’s perfect.' },
  { n: '04', icon: CloudDownload, title: 'DELIVER & OWN IT', desc: 'Receive studio-quality files ready for any platform with full commercial rights.' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function ProcessFlow() {
  return (
    <section id="how-it-works" className="relative bg-black py-24 px-5 md:px-8 scroll-mt-16">
      {/* ambient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(176,141,87,0.05),_transparent_60%)]" />

      <div className="relative max-w-[1440px] mx-auto">
        <SectionHeading index="02" kicker="The Process" title="HOW IT" highlight="WORKS" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative grid md:grid-cols-4 gap-6 md:gap-5"
        >
          {/* connecting rail (desktop) */}
          <div className="hidden md:block absolute top-9 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#b08d57]/40 to-transparent" />

          {STAGES.map(({ n, icon: Icon, title, desc }) => (
            <motion.div
              key={n}
              variants={item}
              className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-[#0c0c0c] to-[#060606] p-6 text-center transition-all duration-300 hover:border-[#b08d57]/50 hover:-translate-y-1"
            >
              <div className="relative mx-auto mb-5 w-16 h-16 rounded-full bg-black border-2 border-[#b08d57] flex items-center justify-center shadow-[0_0_20px_rgba(176,141,87,0.35)] transition-transform duration-300 group-hover:scale-105">
                <Icon size={24} className="text-[#b08d57]" aria-hidden="true" />
                <span className="absolute -top-2 -right-2 font-mono text-[10px] font-bold tracking-widest text-black bg-[#b08d57] rounded-full w-7 h-7 flex items-center justify-center">
                  {n}
                </span>
              </div>
              <h3 className="text-xs font-black tracking-wide mb-2">{title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
