import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandImg } from '@/components/BrandImg';
import { GlowCard, SectionKicker, StarList } from '@/components/ui';
import { ACCESSORY_LOOKS, EXPRESSIONS, LIZZY_LAYOUT, PALETTE, PERSONALITY, STYLE_TRAITS } from '@/lib/brand-tokens';

export const metadata: Metadata = {
  title: 'Meet Lil Lizzy',
};

export default function MeetPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <SectionKicker>Character</SectionKicker>
      <h1 className="mt-2 font-display text-4xl font-black">Meet Lil Lizzy</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Lead singer and actress of the BoomPopsters. Confident, creative, kind, determined, and always ready for the
        next drop.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[420px] overflow-hidden rounded-lizzy-lg border border-lizzy-pink/35 shadow-pink">
          <BrandImg src="/brand/lizzy-sheet.jpg" alt="Lil Lizzy character sheet" className="absolute inset-0 h-full w-full object-cover object-top" />
        </div>
        <GlowCard className="space-y-5 p-6">
          <p className="font-display text-2xl font-black text-lizzy-yellow">I sing. I shine. I boom!</p>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-cyan">Personality</p>
            <StarList items={PERSONALITY} />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-cyan">Style</p>
            <StarList items={STYLE_TRAITS} />
          </div>
          <div className="flex gap-2">
            {PALETTE.map((swatch) => (
              <span key={swatch.name} title={swatch.name} className="h-8 w-8 rounded-full border border-white/20" style={{ background: swatch.hex }} />
            ))}
          </div>
          <Link href="/shop" className={LIZZY_LAYOUT.btnPrimary}>
            Shop her world
          </Link>
        </GlowCard>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <GlowCard glow="cyan" className="p-6">
          <SectionKicker>Expressions</SectionKicker>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXPRESSIONS.map((mood) => (
              <span key={mood} className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {mood}
              </span>
            ))}
          </div>
        </GlowCard>
        <GlowCard glow="yellow" className="p-6">
          <SectionKicker>Signature accessories</SectionKicker>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {ACCESSORY_LOOKS.map((item) => (
              <li key={item.name}>
                <span className="font-bold text-white">{item.name}.</span> {item.note}
              </li>
            ))}
          </ul>
        </GlowCard>
      </div>
    </main>
  );
}
