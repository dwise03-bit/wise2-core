import type { Metadata } from 'next';
import Link from 'next/link';
import { GlowCard, SectionKicker } from '@/components/ui';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';

export const metadata: Metadata = {
  title: 'Parents',
};

export default function ParentsPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <SectionKicker>Grown-ups welcome</SectionKicker>
      <h1 className="mt-2 font-display text-4xl font-black">Parents</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Lil Lizzy is built for kids ages 6+ with a parent-managed shop, no kid social accounts, and play that stays on
        the tag unless you say otherwise.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <GlowCard className="p-6">
          <h2 className="font-display text-xl font-black text-lizzy-yellow">Ages 6+</h2>
          <p className="mt-2 text-sm text-white/70">Handheld play, mini-games, and collectible Boom Stars. No in-app chat with strangers.</p>
        </GlowCard>
        <GlowCard glow="cyan" className="p-6">
          <h2 className="font-display text-xl font-black text-lizzy-cyan">Parent checkout</h2>
          <p className="mt-2 text-sm text-white/70">Purchases live in a parent bag. Kids can wishlist. You decide what ships.</p>
        </GlowCard>
        <GlowCard glow="yellow" className="p-6">
          <h2 className="font-display text-xl font-black text-lizzy-yellow">Privacy first</h2>
          <p className="mt-2 text-sm text-white/70">Tag-to-tag and NFC trades are local. Cloud features stay off until a parent opts in.</p>
        </GlowCard>
      </div>
      <Link href="/privacy" className={`mt-8 ${LIZZY_LAYOUT.btnGhost}`}>
        Read the privacy note
      </Link>
    </main>
  );
}
