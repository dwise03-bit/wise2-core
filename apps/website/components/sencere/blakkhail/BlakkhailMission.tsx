'use client';

import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

function Wise2WordmarkInline() {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label="WISE²"
    >
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-black"
        style={{ backgroundColor: BLAKKHAIL.gold, color: BLAKKHAIL.jetBlack }}
      >
        W
      </span>
      <span className="font-black tracking-[0.06em]">WISE²</span>
    </span>
  );
}

export function BlakkhailMission() {
  return (
    <section
      id="about"
      className={`${BLAKKHAIL_LAYOUT.section} border-y ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
    >
      <div className={`${BLAKKHAIL_LAYOUT.container}`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-16 lg:items-start">

          {/* Left: OUR MISSION */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.4em] sm:text-xs"
              style={{ color: BLAKKHAIL.gold }}
            >
              Our Mission
            </p>
            <h2
              className="mt-3 text-3xl font-black uppercase tracking-[0.06em] sm:text-4xl lg:text-5xl"
              style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
            >
              We Build Legacies
            </h2>
            <p
              className="mt-6 text-base leading-relaxed sm:text-lg sm:leading-8 lg:text-xl lg:leading-9"
              style={{ color: BLAKKHAIL.steel }}
            >
              We turn ideas into reality through design, creativity, and production. We build brands.
              We build products. We build legacies.
            </p>
            <p
              className="mt-6 text-sm font-black uppercase tracking-[0.25em] sm:text-base lg:text-lg"
              style={{ color: BLAKKHAIL.gold }}
            >
              Take Control.&nbsp;&nbsp;No Apologies.
            </p>
          </div>

          {/* Right: POWERED BY WISE² */}
          <div
            className="flex flex-col items-center gap-5 rounded-sm border px-6 py-8 text-center"
            style={{
              borderColor: BLAKKHAIL.darkGold,
              backgroundColor: BLAKKHAIL.jetBlack,
              boxShadow: '0 0 32px rgba(214,163,49,0.1)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.35em] sm:text-xs"
              style={{ color: BLAKKHAIL.steel }}
            >
              Powered By
            </p>

            {/* WISE² logo block */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-sm text-2xl font-black"
                style={{ backgroundColor: BLAKKHAIL.gold, color: BLAKKHAIL.jetBlack }}
              >
                W
              </div>
              <p
                className="text-2xl font-black tracking-[0.08em] sm:text-3xl"
                style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
              >
                WISE²
              </p>
            </div>

            <div
              className="w-12 border-t"
              style={{ borderColor: BLAKKHAIL.darkGold }}
            />

            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em] leading-6 sm:text-xs"
              style={{ color: BLAKKHAIL.steel }}
            >
              Smart Systems.
              <br />
              Stronger Businesses.
              <br />
              Scalable Growth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
