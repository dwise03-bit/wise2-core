'use client';

import Link from 'next/link';

const PIFF_CITY_PRODUCTS = [
  { id: 1, name: 'Flagship Tee - Gold', price: '$32.99', category: 'Apparel' },
  { id: 2, name: 'Culture Movement Hoodie', price: '$72.99', category: 'Apparel' },
  { id: 3, name: 'Future Capsule Jacket', price: '$95.99', category: 'Outerwear' },
  { id: 4, name: 'City Lifestyle Cap', price: '$28.99', category: 'Accessories' },
  { id: 5, name: 'Movement Joggers', price: '$65.99', category: 'Apparel' },
  { id: 6, name: 'Signature Crew Tee', price: '$34.99', category: 'Apparel' },
];

export function PiffCityProducts() {
  return (
    <section id="products" className="bg-[#1a1a1a] py-12 lg:py-16">
      <div className="mx-auto max-w-[1536px] px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-[36px] font-black uppercase tracking-wider text-[#E8A23A]" style={{ fontFamily: 'var(--font-headers)' }}>
            SHOP THE MOVEMENT
          </h2>
          <p className="mt-4 text-[12px] uppercase tracking-widest text-[#D4D4D4]">
            Curated collection for the culture
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PIFF_CITY_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/sencere/products/${product.id}`}
              className="group relative overflow-hidden border-2 border-[#E8A23A] transition-all duration-300 hover:border-[#F5B24A] hover:shadow-lg hover:shadow-[#E8A23A]/20"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-[48px] font-black text-[#E8A23A] opacity-20 group-hover:opacity-30 transition-opacity">
                    {product.id}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-[#0f0f0f] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8A23A]">
                  {product.category}
                </p>
                <h3 className="mt-2 text-[13px] font-bold uppercase leading-snug text-[#F5E6D3]">
                  {product.name}
                </h3>
                <p className="mt-3 text-[12px] font-bold text-[#E8A23A]">
                  {product.price}
                </p>
                <button className="mt-4 w-full border border-[#E8A23A] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#E8A23A] transition-all hover:bg-[#E8A23A] hover:text-[#0f0f0f]">
                  Shop Now
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
