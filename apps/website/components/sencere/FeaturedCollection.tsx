'use client';

import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: 'PIFF CITY RABBIT HOODIE',
    price: '$79.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
    badge: 'Best Seller',
  },
  {
    id: 2,
    name: 'VANDALS TIE DYE TEE',
    price: '$44.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
  },
  {
    id: 3,
    name: 'PIFF CITY SNAPBACK',
    price: '$34.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
  },
  {
    id: 4,
    name: 'THREE-EYE RABBIT TEE',
    price: '$39.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
  },
  {
    id: 5,
    name: 'VANDALS HOODIE',
    price: '$39.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
  },
  {
    id: 6,
    name: 'SENCERE CREATIVE TEE',
    price: 'Free',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
  },
];

export function FeaturedCollection() {
  return (
    <section className="relative bg-[#1a1a1a] py-16 lg:py-24">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2
            className="text-[32px] font-bold uppercase leading-tight tracking-wider text-[#E8A23A] sm:text-[40px]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FEATURED COLLECTION
          </h2>
          <p className="mt-3 text-[12px] font-bold uppercase tracking-widest text-[#999]">
            LIMITED PIECES. MAXIMUM IMPACT.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 lg:gap-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/sencere/products/${product.id}`}
              className="group relative"
            >
              {/* Product Card */}
              <div className="relative overflow-hidden bg-[#0f0f0f]">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute right-2 top-2 bg-[#E8A23A] px-2 py-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#1a1a1a]">
                        {product.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="border-t border-[#D4842F]/30 p-3">
                  <h3 className="text-[10px] font-black uppercase leading-tight tracking-wider text-[#F5E6D3]">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-[11px] font-bold text-[#E8A23A]">{product.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 flex justify-center lg:mt-16">
          <Link
            href="/sencere/products"
            className="inline-block border-2 border-[#E8A23A] px-6 py-3 text-[11px] font-black uppercase tracking-wider text-[#E8A23A] transition-all hover:bg-[#E8A23A]/10"
          >
            VIEW ALL COLLECTIONS →
          </Link>
        </div>
      </div>
    </section>
  );
}
