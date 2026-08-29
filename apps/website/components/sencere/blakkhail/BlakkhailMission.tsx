'use client';

import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailMission() {
  return (
    <section
      id="about"
      className={`${BLAKKHAIL_LAYOUT.section} border-y ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ borderColor: BLAKKHAIL.gunmetal, backgroundColor: BLAKKHAIL.gunmetal }}
    >
      <div className={`${BLAKKHAIL_LAYOUT.container} text-center`}>
        <h2
          className="text-4xl font-black uppercase tracking-[0.08em] sm:text-5xl lg:text-7xl"
          style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
        >
          We Build Legacies
        </h2>
        <p
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed sm:mt-8 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10"
          style={{ color: BLAKKHAIL.steel }}
        >
          We turn ideas into reality through design, creativity, and production. We build brands. We build
          products. We build legacies.
        </p>
        <p
          className="mt-6 text-base font-bold uppercase tracking-[0.2em] sm:mt-8 sm:text-lg lg:text-xl"
          style={{ color: BLAKKHAIL.gold }}
        >
          Take Control. No Apologies.
        </p>
      </div>
    </section>
  );
}
