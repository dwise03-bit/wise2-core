'use client';

import { useState } from 'react';
import { SENCERE_PRODUCTS, getAllProductCategories } from '@/lib/sencere-products';
import { ProductGrid } from '@/components/sencere/ProductGrid';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllProductCategories();
  const filteredProducts = selectedCategory
    ? SENCERE_PRODUCTS.filter((p) => p.category === selectedCategory)
    : SENCERE_PRODUCTS;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <h1 className="font-cormorant text-5xl md:text-6xl font-bold text-white mb-4">
          Our Collections
        </h1>
        <p className="font-montserrat text-xl text-gray-400 max-w-2xl">
          From custom apparel to fabrication, discover everything SenCere Creative has to offer.
        </p>
      </section>

      {/* Category Filter */}
      <section className="px-4 py-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-montserrat font-medium transition-all ${
              selectedCategory === null
                ? 'bg-[#0369A1] text-white'
                : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-montserrat font-medium transition-all capitalize ${
                selectedCategory === category
                  ? 'bg-[#0369A1] text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <ProductGrid
        products={filteredProducts}
        featured={filteredProducts[0]}
        title={selectedCategory ? undefined : 'Featured'}
      />

      {/* CTA Section */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#0369A1]/20 to-transparent border border-[#0369A1]/30 rounded-lg p-8 text-center">
          <h2 className="font-cormorant text-3xl font-bold text-white mb-3">
            Custom Order?
          </h2>
          <p className="font-montserrat text-gray-400 mb-6">
            Don&apos;t see what you&apos;re looking for? We create bespoke solutions for every brand.
          </p>
          <a
            href="/sencere/contact"
            className="inline-block px-8 py-3 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-colors"
          >
            Request a Custom Order
          </a>
        </div>
      </section>
    </div>
  );
}
