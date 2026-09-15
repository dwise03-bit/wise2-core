'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getBlakkhailProducts } from '@/lib/sencere-products';
import { checkoutPath, productPath } from '@/lib/site-domains';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { CATEGORY_COMING_SOON, type BlakkhailCategory } from './blakkhail-experience';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import { BlakkhailSectionHeading } from './BlakkhailSectionHeading';
import { BlakkhailVaultReveal } from './BlakkhailVaultReveal';

interface BlakkhailProductsProps {
  category?: BlakkhailCategory | null;
  showVaultInline?: boolean;
}

export function BlakkhailProducts({ category = null, showVaultInline = true }: BlakkhailProductsProps) {
  const [host, setHost] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const allProducts = getBlakkhailProducts();
  const products = useMemo(() => {
    if (!category || category === 'tees') return allProducts;
    if (category === 'hoodies') {
      return allProducts.filter(p => p.slug && (p.slug.includes('hoodie') || p.slug.includes('sweatshirt')));
    }
    return [];
  }, [allProducts, category]);

  const featured = products[0] ?? null;

  if (!category) {
    return (
      <section
        id="collection"
        className="w-full py-24 lg:py-32 px-6"
        style={{ backgroundColor: '#050607' }}
      >
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">
              The Vault
            </p>
            <h2
              className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-tight tracking-tighter mb-6"
              style={{
                color: '#C4A369',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(196, 163, 105, 0.15)'
              }}
            >
              Select on the Intercom
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Use the intercom above — T-SHIRTS, HOODIES, or HATS — to release the vault and shop Blakk Hail.
          </p>
        </div>
      </section>
    );
  }

  if (category === 'hats' || (category === 'hoodies' && products.length === 0)) {
    return (
      <section
        className="w-full py-24 lg:py-32 px-6"
        style={{ backgroundColor: '#050607' }}
      >
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Vault sealed
            </p>
            <h2
              className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-tight tracking-tighter mb-6"
              style={{
                color: '#C4A369',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
              }}
            >
              {category === 'hoodies' ? 'Hoodies' : 'Hats'}
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            {CATEGORY_COMING_SOON[category]}
          </p>
          <a
            href={BLAKKHAIL_LEGACY.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300"
            style={{
              backgroundColor: '#050607',
              color: '#00D9FF',
              border: '2px solid #00D9FF',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00D9FF';
              e.currentTarget.style.color = '#050607';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 217, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#050607';
              e.currentTarget.style.color = '#00D9FF';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.2)';
            }}
          >
            Follow @blakkhail
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      id="collection"
      className="w-full py-24 lg:py-32 px-6 relative"
      style={{ backgroundColor: '#050607' }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)'
      }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 lg:mb-32">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-gray-400 mb-6">
            Vault open
          </p>
          <h2
            className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tighter mb-8"
            style={{
              color: '#C4A369',
              textShadow: `
                0 4px 30px rgba(0, 0, 0, 0.9),
                0 0 60px rgba(196, 163, 105, 0.4),
                0 0 100px rgba(196, 163, 105, 0.15),
                3px 3px 8px rgba(0, 0, 0, 0.8)
              `,
              letterSpacing: '-0.03em'
            }}
          >
            Shop Blakk Hail
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed font-light tracking-wide">
            Authentic pieces built on heritage, culture, and no apologies. Each item represents decades of street credibility.
          </p>
        </div>

        {/* Featured Product */}
        {featured && showVaultInline && (
          <div className="mb-20">
            <BlakkhailVaultReveal
              product={featured}
              category="tees"
              host={host}
              fullscreen={false}
            />
          </div>
        )}

        {/* Premium Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {products.map((product) => (
            <Link
              key={product.id}
              href={productPath(product.slug, host)}
              className="group"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Premium Product Card */}
              <div
                className="relative overflow-hidden bg-zinc-900 transition-all duration-300"
                style={{
                  boxShadow: hoveredId === product.id
                    ? '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 217, 255, 0.2)'
                    : '0 10px 30px rgba(0, 0, 0, 0.6)',
                  transform: hoveredId === product.id ? 'translateY(-8px)' : 'translateY(0)'
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    quality={100}
                  />

                  {/* Hover Overlay - Subtle */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 255, 127, 0.1) 100%)'
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-6 relative z-10 bg-zinc-950 border-t border-zinc-800">
                  <h3 className="text-lg font-bold text-white mb-4 leading-tight">
                    {product.name}
                  </h3>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xl font-bold"
                      style={{ color: '#C4A369' }}
                    >
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <button
                      className="text-xs font-bold uppercase tracking-wider transition-all duration-300 px-4 py-2"
                      style={{
                        backgroundColor: hoveredId === product.id ? '#00FF7F' : 'transparent',
                        color: hoveredId === product.id ? '#050607' : '#00FF7F',
                        border: '1px solid #00FF7F'
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View Cart CTA */}
        {host && (
          <div className="text-center">
            <Link
              href={checkoutPath(host)}
              className="inline-block px-10 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: '#00FF7F',
                color: '#050607',
                boxShadow: '0 0 30px rgba(0, 255, 127, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 255, 127, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 127, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View Cart
              <span className="ml-2">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
