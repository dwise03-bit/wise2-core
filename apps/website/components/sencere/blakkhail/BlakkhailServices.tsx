'use client';

import { BLAKKHAIL, BLAKKHAIL_SERVICES } from './brand-tokens';

export function BlakkhailServices() {
  return (
    <section id="services" className="py-14" style={{ backgroundColor: BLAKKHAIL.jetBlack }}>
      <div className="mx-auto max-w-[1536px] px-6">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: BLAKKHAIL.gold }}>
            Capabilities
          </p>
          <h2
            className="mt-3 text-3xl font-black uppercase tracking-[0.1em]"
            style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
          >
            Production & Fabrication
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLAKKHAIL_SERVICES.map((service) => (
            <div
              key={service}
              className="border px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-[#D6A331]"
              style={{ borderColor: BLAKKHAIL.darkGold, color: BLAKKHAIL.steel, backgroundColor: BLAKKHAIL.gunmetal }}
            >
              {service}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
