import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandImg } from '@/components/BrandImg';
import { GlowCard, SectionKicker } from '@/components/ui';
import { LIZZY_LAYOUT, UNIVERSE } from '@/lib/brand-tokens';

export const metadata: Metadata = {
  title: 'The BoomPopsters',
};

export default function BoompopstersPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <SectionKicker>Universe</SectionKicker>
      <h1 className="mt-2 font-display text-4xl font-black">The BoomPopsters</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Music. Friendship. Adventure. Lil Lizzy leads a crew of colorful BoomPopster mascots in an 8-bit world you
        can collect, trade, and play.
      </p>
      <div className="relative mt-8 min-h-[320px] overflow-hidden rounded-lizzy-lg border border-lizzy-cyan/35 shadow-cyan">
        <BrandImg src="/brand/style-board.jpg" alt="Lil Lizzy and the BoomPopsters universe" className="absolute inset-0 h-full w-full object-cover object-center" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {UNIVERSE.map((item) => (
          <GlowCard key={item.title} className="p-6">
            <h2 className="font-display text-2xl font-black text-lizzy-yellow">{item.title}</h2>
            <p className="mt-2 text-sm text-white/70">{item.copy}</p>
          </GlowCard>
        ))}
      </div>
      <Link href="/shop" className={`mt-8 ${LIZZY_LAYOUT.btnPrimary}`}>
        Join the Boom!
      </Link>
    </main>
  );
}
