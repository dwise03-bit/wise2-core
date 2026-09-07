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
import { CompleteTheFit } from './CompleteTheFit';

export function BlakkhailStorefront() {
  const [host, setHost] = useState<string | null>(null);
  const products = getBlakkhailProducts();
  const hero = BLAKKHAIL_LEGACY.assets.heroPhotos;
  const shop = BLAKKHAIL_LEGACY.assets.shopPhotos;
  useEffect(() => setHost(window.location.hostname), []);
  return <>
    <section id="home" className="relative w-full overflow-hidden">
      {/* Full-bleed hero with overlay text */}
      <div className="relative w-full min-h-screen md:min-h-[90vh] flex items-end">
        {/* Hero Image */}
        <Image
          src={hero[0]}
          alt="Blakk Hail collection by SenCere Creative LLC"
          fill
          priority
          sizes="100vw"
          className={`object-cover ${cinematic.hallwayBreathe}`}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />

        {/* Text content - bottom left */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 pb-12 sm:pb-16 lg:pb-24">
          <div className="max-w-2xl">
            {/* Logo Mark */}
            <Image
              src={BLAKKHAIL_LEGACY.assets.logo}
              alt="SenCere Creative rabbit logo"
              width={80}
              height={80}
              className="h-12 w-12 object-contain mb-8 opacity-90"
            />

            {/* Main Tagline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[0.9] tracking-[-0.04em] mb-6"
              style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
            >
              Built for the ones who move different
            </h1>

            {/* Subtext */}
            <p
              className="text-sm sm:text-base uppercase tracking-[0.15em] mb-12 opacity-90"
              style={{ color: BLAKKHAIL.steel }}
            >
              No apologies. No compromises.
            </p>

            {/* CTA */}
            <a
              href="#shop"
              className="inline-flex items-center gap-3 border-b-2 pb-3 text-xs uppercase tracking-[0.2em] group hover:opacity-70 transition-opacity"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              Explore the collection
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
    <section id="latest-drop" className="py-0 bg-black">
      {/* Editorial section header */}
      <div className={`${BLAKKHAIL_LAYOUT.container} pt-20 pb-12`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0 border-b pb-8" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: BLAKKHAIL.steel }}>Latest Editorial</p>
            <h2 className="text-5xl md:text-7xl uppercase tracking-tight leading-[0.9]" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>The Control Series</h2>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-right" style={{ color: BLAKKHAIL.steel }}>Three studies in power and movement</p>
        </div>
      </div>

      {/* Large lifestyle photography grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 sm:px-12 lg:px-16 pb-20">
        {/* First image - full height on left */}
        <div className="relative overflow-hidden group md:row-span-2 aspect-auto md:min-h-[80vh]">
          <Image
            src={BLAKKHAIL_LEGACY.assets.latestDrop[0]}
            alt="Blakk Hail latest drop look 1"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
            <p className="text-sm uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.gold }}>Take Control / 01</p>
          </div>
        </div>

        {/* Right side - stacked images */}
        <div className="relative overflow-hidden group aspect-[4/5] md:aspect-auto md:h-[38vh]">
          <Image
            src={BLAKKHAIL_LEGACY.assets.latestDrop[1]}
            alt="Blakk Hail latest drop look 2"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10">
            <p className="text-sm uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.gold }}>Take Control / 02</p>
          </div>
        </div>

        {/* Bottom right image */}
        <div className="relative overflow-hidden group aspect-[4/5] md:aspect-auto md:h-[38vh]">
          <Image
            src={BLAKKHAIL_LEGACY.assets.latestDrop[2]}
            alt="Blakk Hail latest drop look 3"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10">
            <p className="text-sm uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.gold }}>Take Control / 03</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className={`${BLAKKHAIL_LAYOUT.container} pb-20 border-b`} style={{ borderColor: BLAKKHAIL.darkGold }}>
        <p className="max-w-2xl text-base leading-relaxed" style={{ color: BLAKKHAIL.neutral600 }}>Cut, rebuilt, and worn without permission. The Control Series is a study in power and movement—a collection designed for people who refuse the expected.</p>
      </div>
    </section>
    <CompleteTheFit />
    <section className="border-b py-20 sm:py-32 bg-black" style={{ borderColor: BLAKKHAIL.darkGold }}>
      <div className={`${BLAKKHAIL_LAYOUT.container} max-w-4xl`}>
        <p className="text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: BLAKKHAIL.steel }}>The Brand Story</p>
        <h2 className="text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.9] tracking-tight mb-12" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Original fashion for people who move differently.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <p className="text-base leading-relaxed" style={{ color: BLAKKHAIL.neutral600 }}>Blakk Hail is independent streetwear rooted in self-expression, design, and the everyday uniform. Made in the city. Worn everywhere.</p>
          <a href="#about" className="inline-flex items-center gap-2 border-b pb-2 text-xs uppercase tracking-[0.18em] w-fit group hover:opacity-70 transition-opacity" style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}>
            Read our story
            <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
    <section id="shop" className="py-20 sm:py-32 bg-black">
      <div className={BLAKKHAIL_LAYOUT.container}>
        {/* Section header */}
        <div className="mb-16 md:mb-24 border-b pb-8" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: BLAKKHAIL.steel }}>The Essentials</p>
          <h2 className="text-5xl md:text-7xl uppercase tracking-tight leading-[0.9] mb-4" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Shop the collection</h2>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.steel }}>{products.length} pieces / Curated for life</p>
        </div>

        {/* Product showcase in lifestyle layouts */}
        <div className="space-y-20 md:space-y-32">
          {products.map((product, index) => (
            <Link key={product.id} href={productPath(product.slug, host)} className="group block">
              {/* Alternate layout direction */}
              {index % 2 === 0 ? (
                // Left image, right text
                <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 lg:gap-20 items-center">
                  <div className="relative aspect-[4/5] overflow-hidden order-2 md:order-1">
                    <Image
                      src={product.image || shop[index % shop.length]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col justify-center order-1 md:order-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: BLAKKHAIL.steel }}>Product {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="text-3xl md:text-4xl uppercase tracking-tight leading-[0.95] mb-4" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>{product.name}</h3>
                    <p className="text-sm mb-6" style={{ color: BLAKKHAIL.neutral600 }}>Part of the essential collection. Designed for everyday wear with an edge.</p>
                    <div className="flex items-end justify-between pt-6 border-t" style={{ borderColor: BLAKKHAIL.darkGold }}>
                      <span className="text-sm uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.gold }}>${product.basePrice.toFixed(2)}</span>
                      <ArrowUpRight size={16} style={{ color: BLAKKHAIL.gold }} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ) : (
                // Right image, left text
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12 lg:gap-20 items-center">
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: BLAKKHAIL.steel }}>Product {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="text-3xl md:text-4xl uppercase tracking-tight leading-[0.95] mb-4" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>{product.name}</h3>
                    <p className="text-sm mb-6" style={{ color: BLAKKHAIL.neutral600 }}>Part of the essential collection. Designed for everyday wear with an edge.</p>
                    <div className="flex items-end justify-between pt-6 border-t" style={{ borderColor: BLAKKHAIL.darkGold }}>
                      <span className="text-sm uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.gold }}>${product.basePrice.toFixed(2)}</span>
                      <ArrowUpRight size={16} style={{ color: BLAKKHAIL.gold }} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={product.image || shop[index % shop.length]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
    <section id="look-book" className="relative py-0 overflow-hidden bg-black">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] min-h-[70vh] md:min-h-screen">
        {/* Full-height lifestyle image */}
        <div className="relative overflow-hidden order-2 md:order-1 min-h-[50vh] md:min-h-auto">
          <Image
            src={hero[1]}
            alt="Blakk Hail look book"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Text section with breathing room */}
        <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-20 order-1 md:order-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: BLAKKHAIL.steel }}>Editorial</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.9] tracking-tight mb-8" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Take control.<br />No apologies.</h2>
            <p className="text-sm leading-relaxed max-w-md mb-12" style={{ color: BLAKKHAIL.neutral600 }}>The Blakk Hail aesthetic is about power in simplicity. Cut differently. Worn deliberately. A uniform for those who move to their own rhythm.</p>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 border-b pb-3 text-xs uppercase tracking-[0.2em] group hover:opacity-70 transition-opacity"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              Connect with Blakk Hail
              <ArrowUpRight size={15} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
    <section id="drop" className="py-20 sm:py-32 border-y bg-black" style={{ borderColor: BLAKKHAIL.darkGold }}>
      <div className={BLAKKHAIL_LAYOUT.container}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: BLAKKHAIL.steel }}>Latest Release</p>
            <h2 className="text-5xl md:text-6xl uppercase leading-[0.9] tracking-tight mb-8" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Built for the ones who move different.</h2>
            <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: BLAKKHAIL.neutral600 }}>A limited Blakk Hail release from SenCere Creative LLC. No apologies. No restocks promised. Each piece is a statement.</p>
            <a
              href="#shop"
              className="inline-flex items-center gap-2 border-b pb-2 text-xs uppercase tracking-[0.18em] group hover:opacity-70 transition-opacity"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              Shop the drop
              <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
          <div className="relative w-full aspect-[2/3] overflow-hidden">
            <Image
              src={BLAKKHAIL_LEGACY.assets.dropAd}
              alt="Blakk Hail new drop campaign"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
    <section id="about" className="py-20 sm:py-32 bg-black border-t" style={{ borderColor: BLAKKHAIL.darkGold }}>
      <div className={`${BLAKKHAIL_LAYOUT.container} text-center`}>
        <p className="text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: BLAKKHAIL.steel }}>Blakk Hail · A SenCere Creative LLC brand</p>
        <h2 className="mx-auto text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight" style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}>Design.<br />Create.<br />Produce.<br />Deliver.</h2>
      </div>
    </section>
  </>;
}
