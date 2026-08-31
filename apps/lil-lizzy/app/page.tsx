import Link from 'next/link';
import { Heart, Mic2, Music, Sparkles, Star } from 'lucide-react';
import { AddButton } from '@/components/AddButton';
import { BrandImg } from '@/components/BrandImg';
import { GlowCard, SectionKicker, StarList } from '@/components/ui';
import {
  ACCESSORY_LOOKS,
  EXPRESSIONS,
  FAVORITES,
  LIZZY_LAYOUT,
  OUTFITS,
  PALETTE,
  PERSONALITY,
  STYLE_TRAITS,
  UNIVERSE,
} from '@/lib/brand-tokens';

const favoriteIcons = {
  Music,
  Sparkles,
  Mic2,
  Heart,
} as const;

export default function HomePage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} relative starfield`}>
      <section className={`${LIZZY_LAYOUT.container} grid gap-6 py-8 lg:grid-cols-[0.9fr_1.2fr_0.9fr] lg:items-start lg:py-12`}>
        <GlowCard className="space-y-5 p-5">
          <div>
            <SectionKicker>Lead singer & actress</SectionKicker>
            <h1 className="mt-2 font-display text-3xl font-black leading-tight">The BoomPopsters</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Lil Lizzy is the heart and voice of the BoomPopsters. She lights up every stage with her voice, her
              dreams, and even bigger positivity.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-yellow">Personality</p>
              <StarList items={PERSONALITY} />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-yellow">Style</p>
              <StarList items={STYLE_TRAITS} />
            </div>
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-yellow">Favorite things</p>
            <div className="flex flex-wrap gap-3">
              {FAVORITES.map((item) => {
                const Icon = favoriteIcons[item.icon];
                return (
                  <div key={item.label} className="grid w-16 place-items-center gap-1">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-lizzy-cyan/40 bg-lizzy-ink text-lizzy-cyan">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white/70">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-lizzy-yellow">Color palette</p>
            <div className="flex gap-2">
              {PALETTE.map((swatch) => (
                <span
                  key={swatch.name}
                  title={swatch.name}
                  className="h-8 w-8 rounded-full border border-white/20"
                  style={{ background: swatch.hex }}
                />
              ))}
            </div>
          </div>
        </GlowCard>

        <div className="relative">
          <div className="relative overflow-hidden rounded-lizzy-lg border border-lizzy-pink/40 shadow-pink">
            <BrandImg
              src="/brand/lizzy-hero.jpg"
              alt="Lil Lizzy, lead singer of the BoomPopsters, peace sign and sparkle mic"
              className="h-[520px] w-full object-cover object-[center_18%] sm:h-[620px]"
            />
            <div className="absolute right-4 top-6 max-w-[11rem] rounded-full border border-lizzy-cyan/50 bg-lizzy-ink/70 p-4 text-center backdrop-blur">
              <p className="font-display text-sm font-black leading-snug text-lizzy-yellow">I SING.</p>
              <p className="font-display text-sm font-black leading-snug text-lizzy-cyan">I SHINE.</p>
              <p className="font-display text-sm font-black leading-snug text-lizzy-pink">I BOOM!</p>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <Link href="/meet" className={LIZZY_LAYOUT.btnPrimary}>
              <Star className="h-4 w-4 text-lizzy-yellow" fill="currentColor" />
              Meet Lil Lizzy
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <GlowCard glow="cyan" className="p-5">
            <SectionKicker>Expressions</SectionKicker>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {EXPRESSIONS.map((mood, i) => (
                <div key={mood} className="text-center">
                  <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-lizzy-pink/50">
                    <BrandImg
                      src="/brand/lizzy-sheet.jpg"
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${20 + (i % 3) * 30}% ${18 + Math.floor(i / 3) * 28}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/70">{mood}</p>
                </div>
              ))}
            </div>
          </GlowCard>
          <GlowCard glow="yellow" className="p-5">
            <SectionKicker>Signature accessories</SectionKicker>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {ACCESSORY_LOOKS.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/10 bg-lizzy-ink/50 p-3">
                  <p className="font-display text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-[11px] text-white/60">{item.note}</p>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </section>

      <section className={`${LIZZY_LAYOUT.container} py-6`}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <SectionKicker>Lookbook</SectionKicker>
            <h2 className="font-display text-2xl font-black">Outfits, stage, and the crew</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {OUTFITS.map((outfit) => (
            <GlowCard key={outfit.name} className="overflow-hidden">
              <div className="relative h-40">
                <BrandImg src="/brand/lizzy-sheet.jpg" alt={outfit.name} className="h-full w-full object-cover object-top" />
              </div>
              <div className="p-3">
                <p className="font-display font-bold">{outfit.name}</p>
                <p className="text-xs text-white/55">{outfit.note}</p>
              </div>
            </GlowCard>
          ))}
          <GlowCard className="overflow-hidden md:col-span-1">
            <div className="relative h-40">
              <BrandImg src="/brand/lookbook-strip.jpg" alt="On stage, behind the scenes, with the BoomPopsters" className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <p className="font-display font-bold">With the BoomPopsters</p>
              <p className="text-xs text-white/55">On stage · Behind the scenes · Crew</p>
            </div>
          </GlowCard>
        </div>
      </section>

      <section className={`${LIZZY_LAYOUT.container} py-10`}>
        <GlowCard className="grid items-center gap-6 overflow-hidden p-5 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div>
            <SectionKicker>Lil Lizzy LED Tag</SectionKicker>
            <h2 className="mt-2 font-display text-3xl font-black">Play. Trade. Connect. Boom!</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              A pocket-size 8-bit world with Lil Lizzy on the screen, Boom Stars to earn, and NFC tap-to-trade with
              friends. Rechargeable. Portable. Built to boom.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Full color screen', 'USB-C', 'Bluetooth', 'NFC', 'Mini-games', 'Boom Buddy'].map((feat) => (
                <span key={feat} className="rounded-full border border-lizzy-cyan/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-lizzy-cyan">
                  {feat}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <AddButton id="led-tag" label="Shop the LED Tag" />
              <Link href="/led-tag" className={LIZZY_LAYOUT.btnGhost}>
                See the tech
              </Link>
            </div>
          </div>
          <div className="relative h-64 overflow-hidden rounded-lizzy border border-lizzy-pink/30 sm:h-80">
            <BrandImg src="/brand/spec-board.jpg" alt="Lil Lizzy Boom Tag prototype" className="h-full w-full object-cover object-bottom" />
          </div>
        </GlowCard>
      </section>

      <section className={`${LIZZY_LAYOUT.container} grid gap-5 pb-12 md:grid-cols-2`}>
        <GlowCard className="p-6">
          <SectionKicker>Accessories</SectionKicker>
          <h2 className="mt-2 font-display text-2xl font-black">Signature shine</h2>
          <p className="mt-3 text-sm text-white/70">Star clip, sparkle mic, necklace, and Boom Bracelets.</p>
          <Link href="/accessories" className={`mt-6 ${LIZZY_LAYOUT.btnPrimary}`}>
            Shop accessories
          </Link>
        </GlowCard>
        <GlowCard glow="cyan" className="p-6">
          <SectionKicker>Universe</SectionKicker>
          <h2 className="mt-2 font-display text-2xl font-black">The BoomPopsters</h2>
          <div className="mt-4 grid gap-3">
            {UNIVERSE.map((item) => (
              <div key={item.title}>
                <p className="font-display font-bold text-lizzy-yellow">{item.title}</p>
                <p className="text-sm text-white/65">{item.copy}</p>
              </div>
            ))}
          </div>
          <Link href="/boompopsters" className={`mt-6 ${LIZZY_LAYOUT.btnPrimary}`}>
            Join the Boom!
          </Link>
        </GlowCard>
      </section>
    </main>
  );
}
