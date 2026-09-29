'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getBlakkhailOutfits, getOutfitProducts } from '@/lib/sencere-products';
import { productPath } from '@/lib/site-domains';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function CompleteTheFit() {
  const outfits = getBlakkhailOutfits();

  if (!outfits || outfits.length === 0) {
    return null;
  }

  return (
    <section className="border-b bg-black py-20 sm:py-32" style={{ borderColor: BLAKKHAIL.darkGold }}>
      <div className={BLAKKHAIL_LAYOUT.container}>
        {/* Section Header */}
        <div className="mb-16 md:mb-24 border-b pb-8" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: BLAKKHAIL.steel }}>
            Curated Collections
          </p>
          <h2
            className="text-5xl md:text-7xl uppercase tracking-tight leading-[0.9]"
            style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
          >
            Complete the fit
          </h2>
          <p className="mt-6 text-sm max-w-2xl" style={{ color: BLAKKHAIL.neutral600 }}>
            Pre-styled outfit combinations. Each fit is curated to move as a complete uniform.
          </p>
        </div>

        {/* Outfit Showcase - Alternating Layout */}
        <div className="space-y-20 md:space-y-32">
          {outfits.map((outfit, index) => {
            const outfitProducts = getOutfitProducts(outfit.id);

            return (
              <Link key={outfit.id} href="#shop" className="group block">
                {/* Alternate layout direction */}
                {index % 2 === 0 ? (
                  // Image on left
                  <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 lg:gap-20 items-center">
                    <div className="relative aspect-[4/5] overflow-hidden order-2 md:order-1">
                      <Image
                        src={outfit.image}
                        alt={outfit.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col justify-center order-1 md:order-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: BLAKKHAIL.steel }}>
                        {outfit.id}
                      </p>
                      <h3
                        className="text-3xl md:text-4xl uppercase tracking-tight leading-[0.95] mb-4"
                        style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
                      >
                        {outfit.name}
                      </h3>
                      <p className="text-sm mb-6 leading-relaxed" style={{ color: BLAKKHAIL.neutral600 }}>
                        {outfit.tagline}
                      </p>

                      {/* Product Previews */}
                      <div className="flex gap-3 mb-8">
                        {outfitProducts.slice(0, 4).map((product) => (
                          <div
                            key={product.id}
                            className="h-12 w-12 overflow-hidden border"
                            style={{ borderColor: BLAKKHAIL.gold }}
                          >
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-end justify-between pt-6 border-t" style={{ borderColor: BLAKKHAIL.darkGold }}>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: BLAKKHAIL.steel }}>
                            Bundle price
                          </p>
                          <p className="text-lg" style={{ color: BLAKKHAIL.gold }}>
                            ${outfit.bundlePrice.toFixed(2)}
                          </p>
                          {outfit.savings > 0 && (
                            <p className="text-xs mt-1" style={{ color: BLAKKHAIL.steel }}>
                              Save ${outfit.savings.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight size={18} style={{ color: BLAKKHAIL.gold }} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Image on right
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12 lg:gap-20 items-center">
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: BLAKKHAIL.steel }}>
                        {outfit.id}
                      </p>
                      <h3
                        className="text-3xl md:text-4xl uppercase tracking-tight leading-[0.95] mb-4"
                        style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
                      >
                        {outfit.name}
                      </h3>
                      <p className="text-sm mb-6 leading-relaxed" style={{ color: BLAKKHAIL.neutral600 }}>
                        {outfit.tagline}
                      </p>

                      {/* Product Previews */}
                      <div className="flex gap-3 mb-8">
                        {outfitProducts.slice(0, 4).map((product) => (
                          <div
                            key={product.id}
                            className="h-12 w-12 overflow-hidden border"
                            style={{ borderColor: BLAKKHAIL.gold }}
                          >
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-end justify-between pt-6 border-t" style={{ borderColor: BLAKKHAIL.darkGold }}>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: BLAKKHAIL.steel }}>
                            Bundle price
                          </p>
                          <p className="text-lg" style={{ color: BLAKKHAIL.gold }}>
                            ${outfit.bundlePrice.toFixed(2)}
                          </p>
                          {outfit.savings > 0 && (
                            <p className="text-xs mt-1" style={{ color: BLAKKHAIL.steel }}>
                              Save ${outfit.savings.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight size={18} style={{ color: BLAKKHAIL.gold }} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={outfit.image}
                        alt={outfit.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
