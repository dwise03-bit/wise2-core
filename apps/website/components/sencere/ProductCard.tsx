'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/sencere-products';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured }: ProductCardProps) {
  const displayPrice =
    product.variants.length > 1
      ? `From $${product.basePrice}`
      : `$${product.basePrice}`;

  return (
    <Link href={`/sencere/products/${product.slug}`}>
      <div
        className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl ${
          featured ? 'col-span-2 row-span-2' : ''
        }`}
      >
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 right-4 z-20 bg-[#0369A1] text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.badge}
          </div>
        )}

        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden bg-[#0F172A]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            priority={featured}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-cormorant text-xl font-semibold text-white mb-1">
            {product.name}
          </h3>
          <p className="font-montserrat text-sm text-gray-300 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-lg font-semibold text-[#0369A1]">
              {displayPrice}
            </span>
            {product.turnaround && (
              <span className="font-montserrat text-xs text-gray-400">
                {product.turnaround}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
