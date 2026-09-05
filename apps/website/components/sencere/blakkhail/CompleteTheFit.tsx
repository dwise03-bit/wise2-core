'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getBlakkhailOutfits, getOutfitProducts } from '@/lib/sencere-products';
import { productPath } from '@/lib/site-domains';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function CompleteTheFit() {
  const outfits = getBlakkhailOutfits();

  return (
    <section className="border-b py-16 sm:py-24" style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: '#050505' }}>
      <div className={BLAKKHAIL_LAYOUT.container}>
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between border-b pb-4" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>
              05 / Complete the fit
            </p>
            <h2
              className="mt-3 text-3xl uppercase tracking-[-.03em] sm:text-5xl"
              style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
            >
              Your next street uniform
            </h2>
          </div>
          <span className="hidden text-xs uppercase tracking-[0.18em] sm:block" style={{ color: BLAKKHAIL.steel }}>
            {outfits.length} Fits
          </span>
        </div>

        {/* Outfit Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => {
            const outfitProducts = getOutfitProducts(outfit.id);

            return (
              <Link
                key={outfit.id}
                href={`#shop`}
                className="group relative overflow-hidden bg-black"
              >
                {/* Hero Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={outfit.image}
                    alt={outfit.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* "Complete the Fit" Badge */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-3">
                      <div className="px-4 py-2 border-2" style={{ borderColor: BLAKKHAIL.gold }}>
                        <span
                          className="text-xs font-black uppercase tracking-widest"
                          style={{ color: BLAKKHAIL.gold }}
                        >
                          Complete The Fit
                        </span>
                      </div>
                      <button
                        className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                        style={{ color: BLAKKHAIL.gold }}
                        onClick={(e) => e.preventDefault()}
                      >
                        Explore <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Outfit Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 sm:p-6">
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.steel }}>
                    {outfit.id}
                  </p>
                  <h3
                    className="mt-2 text-lg font-bold uppercase tracking-tight"
                    style={{ color: BLAKKHAIL.gold }}
                  >
                    {outfit.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: BLAKKHAIL.neutral600 }}>
                    {outfit.tagline}
                  </p>

                  {/* Product Previews */}
                  <div className="mt-4 flex gap-2">
                    {outfitProducts.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="h-10 w-10 overflow-hidden border"
                        style={{ borderColor: BLAKKHAIL.steel }}
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: BLAKKHAIL.steel }}>
                        Bundle price
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: BLAKKHAIL.gold }}
                      >
                        ${outfit.bundlePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: BLAKKHAIL.steel }}>
                        Save
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: BLAKKHAIL.gold }}
                      >
                        ${outfit.savings.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex items-center justify-between border-t pt-8" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <p className="max-w-xl text-sm leading-7" style={{ color: BLAKKHAIL.neutral600 }}>
            Curated outfit combinations ready to ship. Mix and match from our collection to build your own complete fit.
          </p>
          <Link
            href="#shop"
            className="ml-6 flex shrink-0 items-center gap-2 border-b pb-1 text-xs uppercase tracking-[0.18em]"
            style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
          >
            Shop all pieces <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
