import type { Metadata } from 'next';
import { AddButton } from '@/components/AddButton';
import { BrandImg } from '@/components/BrandImg';
import { GlowCard, SectionKicker } from '@/components/ui';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';
import { TAG_FEATURES, TAG_SPECS } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'LED Tag',
};

export default function LedTagPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <SectionKicker>Hardware + play</SectionKicker>
      <h1 className="mt-2 font-display text-4xl font-black">Lil Lizzy LED Tag</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Prototype #1 of the Boom Tag: a handheld 8-bit world with D-pad play, Boom Buddy sound, and tap-to-trade
        friendship.
      </p>
      <div className="mt-8 grid items-center gap-6 lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden rounded-lizzy-lg border border-lizzy-pink/35 shadow-pink">
          <BrandImg src="/brand/spec-board.jpg" alt="Boom Tag prototype development board" className="absolute inset-0 h-full w-full object-cover object-bottom" />
        </div>
        <GlowCard className="p-6">
          <p className="font-display text-xl font-black text-lizzy-yellow">Collect. Trade. Play. Repeat.</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {TAG_FEATURES.map((feat) => (
              <li key={feat}>{feat}</li>
            ))}
          </ul>
          <p className="mt-5 font-display text-3xl text-lizzy-pink">$129</p>
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Retail target $99–$149</p>
          <div className="mt-6">
            <AddButton id="led-tag" label="Shop the LED Tag" />
          </div>
        </GlowCard>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TAG_SPECS.map((spec) => (
          <GlowCard key={spec.label} glow="cyan" className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-cyan">{spec.label}</p>
            <p className="mt-1 font-display text-lg font-bold">{spec.value}</p>
          </GlowCard>
        ))}
      </div>
    </main>
  );
}
