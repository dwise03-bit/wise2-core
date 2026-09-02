'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBlakkhailProducts } from '@/lib/sencere-products';
import { productPath } from '@/lib/site-domains';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import cinematic from './blakkhail-cinematic.module.css';

export function BlakkhailStorefront() {
  const [host, setHost] = useState<string | null>(null);
  const products = getBlakkhailProducts();
  const hero = BLAKKHAIL_LEGACY.assets.heroPhotos;
  const shop = BLAKKHAIL_LEGACY.assets.shopPhotos;
  useEffect(() => setHost(window.location.hostname), []);
  return <>
    <section id="home" className="border-b" style={{ borderColor: BLAKKHAIL.neutral200 }}>
      {/* Art Gallery Hero with Tagline */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] min-h-[70vh] md:min-h-[80vh] bg-[#050505]">
        {/* Left: Hero Image */}
        <div className="relative overflow-hidden order-2 md:order-1">
          <Image
            src={hero[0]}
            alt="Blakk Hail collection by SenCere Creative LLC"
            fill
            priority
            sizes="100vw"
            className={`object-cover ${cinematic.hallwayBreathe}`}
          />
          <div className={`absolute inset-0 bg-[#D6A331]/[.06] mix-blend-screen ${cinematic.flickerLight}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </div>

        {/* Right: Tagline Gallery */}
        <div className="relative flex flex-col justify-center items-start p-6 sm:p-10 lg:p-16 order-1 md:order-2 bg-gradient-to-b from-black/40 to-black/20">
          <div className="relative z-10 w-full">
            {/* Logo Mark */}
            <Image
              src={BLAKKHAIL_LEGACY.assets.logo}
              alt="SenCere Creative rabbit logo"
              width={80}
              height={80}
              className="h-16 w-16 object-contain mb-6 sm:mb-8 opacity-80"
            />

            {/* Main Tagline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-[0.95] tracking-[-0.04em] mb-6 sm:mb-8"
              style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
            >
              Built for the ones who move different
            </h1>

            {/* Subtext */}
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.3em] mb-10 sm:mb-12"
              style={{ color: BLAKKHAIL.steel }}
            >
              No apologies. No compromises.
            </p>

            {/* CTA */}
            <a
              href="#shop"
              className="inline-flex items-center gap-3 border-b pb-2 text-xs uppercase tracking-[0.2em] group hover:opacity-70 transition-opacity"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              Explore the collection
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>

          {/* Accent Border */}
          <div
            className="absolute top-0 left-0 w-1 h-16 opacity-60"
            style={{ backgroundColor: BLAKKHAIL.gold }}
          />
        </div>
      </div>
    </section>
    <section className="border-b py-16 sm:py-24" style={{ borderColor: BLAKKHAIL.neutral200 }}><div className={`${BLAKKHAIL_LAYOUT.container} grid gap-8 md:grid-cols-[1fr_1.5fr] md:gap-20`}><p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.neutral600 }}>01 / The brand</p><div><h2 className="max-w-3xl text-3xl font-medium uppercase leading-[.95] tracking-[-.035em] sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>Original fashion for people who move differently.</h2><p className="mt-8 max-w-xl text-sm leading-7" style={{ color: BLAKKHAIL.neutral600 }}>Blakk Hail is independent streetwear rooted in self-expression, design, and the everyday uniform. Made in the city. Worn everywhere.</p><a href="#about" className="mt-8 inline-flex items-center gap-2 border-b pb-1 text-xs uppercase tracking-[0.18em]">Read our story <ArrowUpRight size={14} /></a></div></div></section>
    <section id="shop" className={`${BLAKKHAIL_LAYOUT.container} py-14 sm:py-20`}><div className="mb-8 flex items-end justify-between border-b pb-4" style={{ borderColor: BLAKKHAIL.darkGold }}><div><p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>02 / Shop</p><h2 className="mt-3 text-3xl uppercase tracking-[-.03em] sm:text-5xl" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>The essentials</h2></div><span className="hidden text-xs uppercase tracking-[0.18em] sm:block">{products.length} pieces</span></div><div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-3">{products.map((product, index) => <Link key={product.id} href={productPath(product.slug, host)} className="group"><div className="relative aspect-[4/5] overflow-hidden bg-[#2A2A2A]"><Image src={product.image || shop[index % shop.length]} alt={product.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" /></div><div className="flex items-start justify-between gap-3 pt-3 text-xs uppercase tracking-[0.08em]" style={{ color: BLAKKHAIL.steel }}><span>{product.name}</span><span>${product.basePrice.toFixed(2)}</span></div></Link>)}</div></section>
    <section id="look-book" className="border-y" style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}><div className="grid md:grid-cols-2"><div className="relative min-h-[55vh]"><Image src={hero[1]} alt="Blakk Hail look book" fill sizes="50vw" className="object-cover" /></div><div className="flex flex-col justify-between p-6 sm:p-12 lg:p-20"><p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>03 / Look book</p><h2 className="max-w-md text-5xl uppercase leading-[.9] tracking-[-.04em] sm:text-7xl" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Take control.<br />No apologies.</h2><a href="#contact" className="mt-12 flex items-center justify-between border-b pb-3 text-xs uppercase tracking-[0.18em]" style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.steel }}>Connect with Blakk Hail <ArrowUpRight size={15} /></a></div></div></section>
    <section id="latest-drop" className="border-b py-14 sm:py-20" style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: '#080808' }}><div className={BLAKKHAIL_LAYOUT.container}><div className="mb-8 flex items-end justify-between border-b pb-4" style={{ borderColor: BLAKKHAIL.darkGold }}><div><p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>04 / Latest drop</p><h2 className="mt-3 text-4xl uppercase tracking-[-.03em] sm:text-6xl" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>The control series</h2></div><span className="hidden text-xs uppercase tracking-[0.18em] sm:block" style={{ color: BLAKKHAIL.steel }}>01—03 / Editorial</span></div><div className="grid gap-3 md:grid-cols-3">{BLAKKHAIL_LEGACY.assets.latestDrop.map((photo, index) => <figure key={photo} className="group relative overflow-hidden bg-black"><Image src={photo} alt={`Blakk Hail latest drop look ${index + 1}`} width={1280} height={900} className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" /><figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 text-xs uppercase tracking-[0.16em]" style={{ color: BLAKKHAIL.gold }}>Take control / 0{index + 1}</figcaption></figure>)}</div><p className="mt-8 max-w-xl text-sm leading-7" style={{ color: BLAKKHAIL.neutral600 }}>Cut, rebuilt, and worn without permission. The latest Blakk Hail drop is a moving uniform for people who refuse the expected.</p></div></section>
    <section id="drop" className={`${BLAKKHAIL_LAYOUT.container} py-14 sm:py-20`}><div className="grid items-center gap-8 border-y py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-14 sm:py-12" style={{ borderColor: BLAKKHAIL.darkGold }}><div><p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>04 / The new drop</p><h2 className="mt-4 max-w-md text-4xl uppercase leading-[.9] tracking-[-.04em] sm:text-6xl" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Built for the ones who move different.</h2><p className="mt-6 max-w-md text-sm leading-7" style={{ color: BLAKKHAIL.neutral600 }}>A limited Blakk Hail release from SenCere Creative LLC. No apologies. No restocks promised.</p><a href="#shop" className="mt-8 inline-flex items-center gap-2 border-b pb-2 text-xs uppercase tracking-[0.18em]" style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}>Shop the drop <ArrowUpRight size={14} /></a></div><div className="relative mx-auto w-full max-w-md overflow-hidden bg-[#050505]"><Image src={BLAKKHAIL_LEGACY.assets.dropAd} alt="Blakk Hail new drop campaign" width={1003} height={1568} className="h-auto w-full object-cover" /></div></div></section>
    <section id="about" className="py-16 sm:py-24"><div className={`${BLAKKHAIL_LAYOUT.container} text-center`}><p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.neutral600 }}>Blakk Hail · A SenCere Creative LLC brand</p><h2 className="mx-auto mt-6 max-w-4xl text-4xl uppercase leading-[.92] tracking-[-.04em] sm:text-7xl" style={{ fontFamily: 'var(--font-display)' }}>Design. Create.<br />Produce. Deliver.</h2></div></section>
  </>;
}
