'use client';

import Link from 'next/link';
import { SENCERE_PRODUCTS } from '@/lib/sencere-products';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

export function ProductShowcase() {
  const featured = SENCERE_PRODUCTS.slice(0, 3);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#050505] to-[#0F172A]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="font-cormorant text-5xl font-bold text-white mb-4">
            Our Collections
          </h2>
          <p className="font-montserrat text-xl text-gray-400 max-w-2xl">
            Custom apparel, printing, and fabrication solutions designed for brands that demand excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/sencere/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-all group"
          >
            View All Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
