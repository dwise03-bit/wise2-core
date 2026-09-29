'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarHeart, ChefHat, Sparkles, Star, UtensilsCrossed } from 'lucide-react';
import { BrandWordmark, ClocheMark, GlassCard, Wise2Badge } from '@/components/ui';
import { SiteHeader } from '@/components/SiteHeader';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { CATERING_PACKAGES, MENU_ITEMS, OWNER_PROFILE } from '@/lib/demo-data';
import { useOwner } from '@/contexts/OwnerContext';

const popular = MENU_ITEMS.filter((item) => item.popular).slice(0, 3);
const moments = [
  { icon: CalendarHeart, title: 'Private celebrations', copy: 'Birthdays, anniversaries and intimate dinners built around your people.' },
  { icon: Sparkles, title: 'Elevated catering', copy: 'Beautiful presentation, warm hospitality and a menu made for the moment.' },
  { icon: ChefHat, title: "Chef's Table", copy: 'A limited-seat tasting experience with Fergie at the center of the evening.' },
];

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
    <div className={`${FERGIE_LAYOUT.page} fergie-luxe-bg`}>
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden border-b border-fergie-gold/10">
          <div className="absolute inset-0">
            <img src={CATERING_PACKAGES[0].image} alt="Fergie's Table dining experience" className="h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-fergie-deep/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-fergie-black via-transparent to-black/40" />
          </div>
          <div className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
            <div className="max-w-2xl fade-up">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fergie-gold/25 bg-black/45 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-fergie-gold backdrop-blur-xl">
                <Star className="h-3 w-3 fill-current" /> Private dining · Catering · Celebrations
              </div>
              <BrandWordmark size="lg" />
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.38em] text-fergie-gold">WE COOK. YOU CONNECT.</p>
              <h1 className="mt-5 max-w-xl font-serif text-4xl font-semibold leading-[1.05] text-white sm:text-6xl">
                Food made for the moments <span className="text-fergie-rose">people remember.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Fergie brings soulful flavor, polished presentation and genuine hospitality to intimate dinners, celebrations and catered gatherings.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/book" onClick={() => setRole('guest')} className={FERGIE_LAYOUT.btnGold}>Plan your event <ArrowRight className="ml-2 h-4 w-4" /></Link>
                <Link href="/menu" onClick={() => setRole('guest')} className={FERGIE_LAYOUT.btnGhost}>Explore the menu</Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.18em] text-white/45">
                <span>Made with flavor</span><span>Served with love</span><span>Savôré every moment</span>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -inset-8 rounded-full bg-fergie-royal/25 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-fergie-gold/25 bg-black/50 p-3 shadow-2xl backdrop-blur-xl">
                <img src={MENU_ITEMS.find((item) => item.id === 'entree-short-rib')?.image} alt="Fergie's signature plated entrée" className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
                <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/10 bg-black/75 p-5 backdrop-blur-xl">
                  <p className="font-script text-2xl text-fergie-rose">Cooking with Fergie</p>
                  <p className="mt-1 text-sm text-white/65">Big flavor. Beautiful tables. Hospitality that feels personal.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-fergie-gold">Signature experiences</p>
            <h2 className="mt-3 font-serif text-4xl">Your gathering, elevated.</h2>
            <p className="mt-4 text-white/60">From a table for two to a room full of family, every experience is designed around connection.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {moments.map(({ icon: Icon, title, copy }) => (
              <GlassCard key={title} className="group p-7 transition hover:-translate-y-1 hover:border-fergie-gold/35">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-fergie-gold/25 bg-fergie-royal/15 text-fergie-gold"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-6 font-serif text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{copy}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.025] py-20" id="menu">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="font-script text-2xl text-fergie-rose">From Fergie's kitchen</p><h2 className="mt-1 font-serif text-4xl">Guest favorites</h2></div>
              <Link href="/menu" onClick={() => setRole('guest')} className="inline-flex items-center text-sm font-semibold text-fergie-gold">View full menu <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {popular.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-fergie-charcoal/70">
                  <div className="relative overflow-hidden"><img src={item.image} alt={item.name} className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /></div>
                  <div className="p-6"><div className="flex items-start justify-between gap-3"><h3 className="font-serif text-xl">{item.name}</h3><span className="font-semibold text-fergie-gold">${item.price}</span></div><p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8" id="catering">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-fergie-gold">Catering, your way</p><h2 className="mt-3 font-serif text-4xl">Choose the feeling. Fergie handles the table.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {CATERING_PACKAGES.map((pkg) => (
              <article key={pkg.id} className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] border border-fergie-gold/15">
                <img src={pkg.image} alt={pkg.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-fergie-rose">{pkg.guests}</p><h3 className="mt-2 font-serif text-3xl">{pkg.name}</h3></div><p className="whitespace-nowrap text-sm font-semibold text-fergie-gold">From ${pkg.priceFrom}/guest</p></div><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{pkg.description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8" id="about">
          <div className="relative overflow-hidden rounded-[2rem] border border-fergie-gold/20 bg-gradient-to-br from-fergie-deep/80 via-fergie-charcoal to-black p-8 md:p-12">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-fergie-royal/20 blur-3xl" />
            <div className="relative grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-center">
              <div className="flex aspect-square max-w-sm items-center justify-center rounded-[2rem] border border-fergie-gold/20 bg-black/35"><div className="text-center"><ClocheMark className="mx-auto h-20 w-20" /><p className="mt-5 font-display text-7xl text-fergie-gold">F</p></div></div>
              <div><p className="font-script text-3xl text-fergie-rose">Cooking with Fergie</p><h2 className="mt-2 font-serif text-4xl">Made with flavor. Served with love.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/65">This is food with a point of view: comforting, polished and made to bring people closer. Fergie's Table &amp; Savôré turns dinner into an experience without losing the warmth of a home-cooked table.</p><p className="mt-5 text-sm text-white/45">{OWNER_PROFILE.city} · {OWNER_PROFILE.hours}</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8" id="book">
          <div className="rounded-[2rem] border border-fergie-gold/30 bg-fergie-gold px-6 py-12 text-center text-fergie-black shadow-glow-gold md:px-12 md:py-16">
            <UtensilsCrossed className="mx-auto h-8 w-8" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.3em]">Your table is waiting</p><h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-semibold md:text-5xl">Tell Fergie what you're celebrating.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/65">Share your date, guest count and vision. We'll help shape the right menu and experience.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/book" onClick={() => setRole('guest')} className="inline-flex items-center justify-center rounded-full bg-fergie-black px-7 py-3 font-semibold text-white">Plan your event <ArrowRight className="ml-2 h-4 w-4" /></Link><a href={`mailto:${OWNER_PROFILE.email}`} className="inline-flex items-center justify-center rounded-full border border-black/25 px-7 py-3 font-semibold">Email Fergie</a></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-5 py-10 text-center"><p className="font-serif text-lg">{OWNER_PROFILE.business}</p><p className="mt-2 text-sm text-white/45">{OWNER_PROFILE.city} · {OWNER_PROFILE.phone}</p><div className="mt-5 flex justify-center gap-5 text-xs text-white/35"><Link href="/privacy">Privacy</Link><Link href="/support">Support</Link><Link href="/business" onClick={() => setRole('owner')}>Fergie's Command</Link></div><Wise2Badge className="mt-5" /></footer>
    </div>
  );
}
