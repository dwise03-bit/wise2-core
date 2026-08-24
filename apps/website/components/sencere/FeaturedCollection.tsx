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
    brand: 'piff-city',
    type: 'Hoodie',
    description: 'Premium hoodie with signature rabbit graphic',
  },
  {
    id: 2,
    name: 'VANDALS TIE DYE TEE',
    price: '$44.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
    brand: 'vandals',
    type: 'T-Shirt',
    description: 'Tie-dye with underground aesthetic',
  },
  {
    id: 3,
    name: 'PIFF CITY SNAPBACK',
    price: '$34.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
    brand: 'piff-city',
    type: 'Hat',
    description: 'Classic snapback with embroidered logo',
  },
  {
    id: 4,
    name: 'THREE-EYE RABBIT TEE',
    price: '$39.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
    brand: 'piff-city',
    type: 'T-Shirt',
    description: 'Iconic three-eyed rabbit design',
  },
  {
    id: 5,
    name: 'VANDALS HOODIE',
    price: '$39.99',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
    brand: 'vandals',
    type: 'Hoodie',
    description: 'Purple underground rebel aesthetic',
  },
  {
    id: 6,
    name: 'SENCERE CREATIVE TEE',
    price: 'Free',
    image: '/sencere-assets/piff-city-rabbit.jpeg',
    brand: 'sencere',
    type: 'T-Shirt',
    description: 'Founder exclusive collaboration',
  },
];

const brandColors: Record<string, { bg: string; accent: string; border: string }> = {
  'piff-city': {
    bg: '#2a1f0f',
    accent: '#E8A23A',
    border: '#E8A23A',
  },
  vandals: {
    bg: '#1a0f2a',
    accent: '#7B3F9F',
    border: '#7B3F9F',
  },
  sencere: {
    bg: '#1a1a1a',
    accent: '#D4D4D4',
    border: '#D4842F',
  },
};

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
          {products.map((product) => {
            const colors = brandColors[product.brand];
            return (
              <Link
                key={product.id}
                href={`/sencere/products/${product.id}`}
                className="group relative"
              >
                {/* Product Card */}
                <div className="relative overflow-hidden border border-[#D4842F]/20 bg-[#0f0f0f] transition-all duration-300 hover:border-current" style={{ borderColor: colors.border }}>
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: colors.bg }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                    />

                    {/* Brand Label */}
                    <div className="absolute left-2 top-2 px-2 py-1" style={{ backgroundColor: colors.accent }}>
                      <span className="text-[7px] font-black uppercase tracking-widest text-[#1a1a1a]">
                        {product.brand === 'piff-city' ? 'PIFF CITY' : product.brand === 'vandals' ? 'VANDALS' : 'SENCERE'}
                      </span>
                    </div>

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute right-2 top-2" style={{ backgroundColor: colors.accent }}>
                        <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#1a1a1a]">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Type Label */}
                    <div className="absolute bottom-2 left-2 text-[8px] font-bold uppercase tracking-wider text-[#F5E6D3] opacity-80">
                      {product.type}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="border-t p-3" style={{ borderColor: `${colors.border}40` }}>
                    <h3 className="text-[9px] font-black uppercase leading-tight tracking-wider text-[#F5E6D3]">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-[10px] font-bold" style={{ color: colors.accent }}>
                      {product.price}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
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
