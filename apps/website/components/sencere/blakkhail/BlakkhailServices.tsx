'use client';

import {
  Layers,
  Printer,
  Zap,
  Flame,
  Scissors,
  Box,
  Wrench,
  Monitor,
  Shirt,
} from 'lucide-react';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

const SERVICES = [
  { label: 'Apparel &\nDecoration', Icon: Shirt },
  { label: 'Vinyl &\nPrint', Icon: Printer },
  { label: 'Sublimation', Icon: Layers },
  { label: 'Laser\nEngraving', Icon: Zap },
  { label: 'Heat\nPress', Icon: Flame },
  { label: 'Sewing &\nFinishing', Icon: Scissors },
  { label: '3D\nPrinting', Icon: Box },
  { label: 'CNC &\nFabrication', Icon: Wrench },
  { label: 'Mac Studio\n(Design)', Icon: Monitor },
] as const;

export function BlakkhailServices() {
  return (
    <section
      id="services"
      className={`${BLAKKHAIL_LAYOUT.section} border-y`}
      style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.jetBlack }}
    >
      {/* Section heading */}
      <div className={`${BLAKKHAIL_LAYOUT.container} pb-8 pt-12 text-center sm:pb-10 sm:pt-14`}>
        <p
          className="text-[10px] uppercase tracking-[0.35em] sm:text-xs"
          style={{ color: BLAKKHAIL.gold }}
        >
          What We Do
        </p>
        <h2
          className="mt-3 text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl lg:text-5xl"
          style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
        >
          Production &amp; Fabrication
        </h2>
      </div>

      {/* Icon grid */}
      <div
        className="border-t"
        style={{ borderColor: BLAKKHAIL.darkGold }}
      >
        <div
          className={`${BLAKKHAIL_LAYOUT.container} grid grid-cols-3 divide-x divide-y sm:grid-cols-5 lg:grid-cols-9`}
          style={{ '--tw-divide-opacity': '1', borderColor: BLAKKHAIL.gunmetal } as React.CSSProperties}
        >
          {SERVICES.map(({ label, Icon }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-3 px-3 py-6 text-center transition-colors hover:bg-[#1a1a1a] sm:px-4 sm:py-8"
            >
              <Icon
                size={28}
                className="shrink-0 transition-colors group-hover:text-[#D6A331]"
                style={{ color: BLAKKHAIL.darkGold }}
                aria-hidden
              />
              <span
                className="whitespace-pre-line text-[9px] font-bold uppercase leading-4 tracking-[0.18em] sm:text-[10px]"
                style={{ color: BLAKKHAIL.steel }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
