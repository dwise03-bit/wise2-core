'use client';

import Link from 'next/link';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

const assurances = [
  ['Shipping', 'Shipping timing is confirmed at checkout for your destination.'],
  ['Returns', 'Review the returns and exchange terms before placing your order.'],
  ['Sizing', 'Use the size selector on each product page; fit notes appear when available.'],
  ['Support', 'Questions about a piece? Reach the Blakk Hail team directly by email.'],
];

export function BlakkhailTrust() {
  return (
    <section id="trust" className="relative overflow-hidden border-y py-20 lg:py-28" style={{ backgroundColor: BLAKKHAIL.gunmetal, borderColor: BLAKKHAIL.darkGold }}>
      <div className={`${BLAKKHAIL_LAYOUT.container} relative z-10`}>
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: BLAKKHAIL.gold }}>04 / THE STANDARD</p>
            <h2 className="mt-5 text-4xl font-black uppercase leading-[.95] tracking-[.06em] text-white sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>Buy with<br />confidence.</h2>
            <p className="mt-6 max-w-sm text-sm leading-7" style={{ color: BLAKKHAIL.steel }}>The statement is loud. The process should be simple. Every order starts with clear information and direct support.</p>
          </div>
          <div className="grid gap-px border border-[#6f5417] bg-[#6f5417] sm:grid-cols-2">
            {assurances.map(([label, text]) => (
              <div key={label} className="min-h-32 bg-[#111111] p-6 transition-colors hover:bg-[#17130b]">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.gold }}>{label}</p>
                <p className="mt-3 text-sm leading-6" style={{ color: BLAKKHAIL.steel }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-[0.18em]">
          <Link href="/sencere/contact" className="border px-5 py-3 transition-colors hover:bg-[#D4AF37] hover:text-black" style={{ borderColor: BLAKKHAIL.darkGold, color: BLAKKHAIL.gold }}>Contact the studio</Link>
          <Link href="#collection" className="px-5 py-3" style={{ color: BLAKKHAIL.steel }}>View the drop ↓</Link>
        </div>
      </div>
    </section>
  );
}
