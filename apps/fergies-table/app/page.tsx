'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BrandWordmark, ClocheMark, GlassCard, Wise2Badge } from '@/components/ui';
import { SiteHeader } from '@/components/SiteHeader';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { CATERING_PACKAGES, MENU_ITEMS, OWNER_PROFILE } from '@/lib/demo-data';
import { useOwner } from '@/contexts/OwnerContext';

const popular = MENU_ITEMS.filter((item) => item.popular);

export default function WebsitePage() {
  const { setRole, isNative } = useOwner();
  const router = useRouter();

  useEffect(() => {
    if (isNative) {
      setRole('owner');
      router.replace('/business');
    }
  }, [isNative, router, setRole]);

  return (
    <div className={`${FERGIE_LAYOUT.page} smoke-bg`}>
      <SiteHeader />

      <section className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-fergie-royal/25 blur-3xl" />
        </div>
        <ClocheMark className="relative h-20 w-20" spinning />
        <div className="relative mt-6 fade-up">
          <BrandWordmark size="lg" />
        </div>
        <p className="relative mt-5 text-xs uppercase tracking-[0.28em] text-fergie-gold/80">
          Real Food. Real Love. Real Results.
        </p>
        <p className="relative mt-4 max-w-md text-base leading-relaxed text-white/70">
          Home-based catering in {OWNER_PROFILE.city}. We cook. You connect. A luxury table for dinners, soirées, and Sunday gatherings.
        </p>
        <div className="relative mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Link href="/menu" onClick={() => setRole('guest')} className={`flex-1 ${FERGIE_LAYOUT.btnPrimary}`}>
            Order now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/catering" onClick={() => setRole('guest')} className={`flex-1 ${FERGIE_LAYOUT.btnGhost}`}>
            Catering
          </Link>
        </div>
        <p className="relative mt-8 font-script text-2xl text-fergie-rose">Savôré every moment.</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16" id="about">
        <GlassCard glow className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="font-script text-2xl text-fergie-rose">Chef Fergie</p>
            <h2 className="mt-1 font-serif text-3xl">Made with flavor. Served with love.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Fergie&apos;s Table &amp; Savôré is a home-based catering house: intimate dinners, cocktail soirées, and Sunday tables that feel like family with gold on the rim. Atlanta-born hospitality, plated like a private dining room.
            </p>
            <p className="mt-3 text-sm text-white/55">
              {OWNER_PROFILE.hours} · {OWNER_PROFILE.phone}
            </p>
          </div>
          <div className="flex items-center justify-center rounded-fergie bg-gradient-to-b from-fergie-royal/40 to-fergie-deep py-12">
            <span className="font-display text-6xl text-fergie-gold">F</span>
          </div>
        </GlassCard>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8" id="menu">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-script text-xl text-fergie-rose">The plates</p>
            <h2 className="font-serif text-3xl">Popular from the kitchen</h2>
          </div>
          <Link href="/menu" onClick={() => setRole('guest')} className="text-sm text-fergie-gold">
            Full menu
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((item) => (
            <GlassCard key={item.id} className="overflow-hidden p-0">
              <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm font-semibold text-fergie-gold">${item.price}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-white/55">{item.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16" id="catering">
        <p className="font-script text-xl text-fergie-rose">For the room</p>
        <h2 className="mb-6 font-serif text-3xl">Catering packages</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {CATERING_PACKAGES.map((pkg) => (
            <GlassCard key={pkg.id} className="overflow-hidden p-0" glow>
              <img src={pkg.image} alt={pkg.name} className="h-40 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl">{pkg.name}</h3>
                  <p className="text-sm text-fergie-gold">From ${pkg.priceFrom}/guest</p>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wider text-fergie-rose/70">{pkg.guests}</p>
                <p className="mt-2 text-sm text-white/65">{pkg.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        <Link href="/catering" onClick={() => setRole('guest')} className={`mt-6 ${FERGIE_LAYOUT.btnGhost}`}>
          See packages
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8" id="book">
        <GlassCard gold className="p-8 text-center md:p-12">
          <p className="font-script text-3xl text-fergie-rose">Hold the date</p>
          <h2 className="mt-2 font-serif text-3xl">Book your table</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/65">
            Private dinners, catering, and Chef&apos;s Table nights. Tell us the occasion and guest count. Fergie confirms by phone.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/book" onClick={() => setRole('guest')} className={FERGIE_LAYOUT.btnPrimary}>
              Request a table
            </Link>
            <a href={`mailto:${OWNER_PROFILE.email}`} className={FERGIE_LAYOUT.btnGhost}>
              Email Chef Fergie
            </a>
          </div>
        </GlassCard>
      </section>

      <footer className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-sm text-white/55">
          {OWNER_PROFILE.business} · {OWNER_PROFILE.city}
        </p>
        <p className="mt-1 text-sm text-fergie-gold">{OWNER_PROFILE.phone}</p>
        <Link
          href="/business"
          onClick={() => setRole('owner')}
          className="mt-6 inline-block text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-fergie-gold"
        >
          Fergie&apos;s Command
        </Link>
        <p className="mt-3 text-[11px] text-white/35">
          <Link href="/privacy" className="hover:text-fergie-gold">
            Privacy
          </Link>
          {' · '}
          <Link href="/support" className="hover:text-fergie-gold">
            Support
          </Link>
        </p>
        <Wise2Badge className="mt-4" />
      </footer>
    </div>
  );
}
