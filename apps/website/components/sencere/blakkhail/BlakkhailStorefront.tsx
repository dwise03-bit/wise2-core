'use client';
import Image from 'next/image';
import Link from 'next/link';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

const BLAKKHAIL_PRODUCTS = [
  {
    id: 1,
    name: 'No berry Cush gray',
    displayName: 'PC Street life no berry kush destress short sleeve',
    price: '$65',
    category: 'LEGACY',
    description: 'Part of the essential collection. Designed for everyday wear with an edge.'
  },
  {
    id: 2,
    name: 'No berry Cush long sleeve',
    displayName: 'PC Street life no berry kush destress long sleeve hoodie',
    price: '$65',
    category: 'LEGACY',
    description: 'Part of the essential collection. Designed for everyday wear with an edge.'
  },
  {
    id: 3,
    name: 'Strawberry haze',
    displayName: 'PC Street life Strawberry haze destress long sleeve hoodie',
    price: '$65',
    category: 'LEGACY',
    description: 'Part of the essential collection. Designed for everyday wear with an edge.'
  },
];

export function BlakkhailStorefront() {
  const shopPhotos = BLAKKHAIL_LEGACY.assets.shopPhotos;

  return (
    <section id="collection" className="bg-[#0a0a0a] py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">02 / SHOP</p>
          <h2 className="mt-4 text-[48px] font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-headers)' }}>
            THE ESSENTIALS
          </h2>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[14px] text-[#A8A8A8]">Street HAZE collection</p>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#E8A23A]">3PIECES</p>
          </div>
          <div className="mt-4 h-px bg-[#333]" />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BLAKKHAIL_PRODUCTS.map((product, index) => (
            <Link
              key={product.id}
              href={`/sencere/blakkhail/product/${product.id}`}
              className="group cursor-pointer transition-all duration-300"
            >
              {/* Product Image Container */}
              <div className="mb-6 aspect-[3/4] overflow-hidden bg-[#1a1a1a] relative">
                <Image
                  src={shopPhotos[index % shopPhotos.length]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#E8A23A]">
                  {product.category}
                </p>
                <h3 className="text-[16px] font-bold leading-tight text-white">
                  {product.name}
                </h3>
                <p className="text-[13px] text-[#A8A8A8]">
                  {product.displayName}
                </p>
                <p className="mt-4 text-[14px] font-bold text-[#E8A23A]">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
