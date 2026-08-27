'use client';

import Link from 'next/link';

const VANDALS_PRODUCTS = [
  { id: 1, name: 'Rebellion Tee', price: '$29.99', category: 'Apparel' },
  { id: 2, name: 'Underground Hoodie', price: '$68.99', category: 'Apparel' },
  { id: 3, name: 'Vandal Jacket', price: '$92.99', category: 'Outerwear' },
  { id: 4, name: 'Anarchist Cap', price: '$26.99', category: 'Accessories' },
  { id: 5, name: 'Rebellion Cargo', price: '$62.99', category: 'Apparel' },
  { id: 6, name: 'Art Collector Tee', price: '$31.99', category: 'Apparel' },
];

export function VandalsProducts() {
  return (
    <section id="products" className="bg-[#1a1a1a] py-12 lg:py-16">
      <div className="mx-auto max-w-[1536px] px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-[36px] font-black uppercase tracking-wider text-[#5B2D7F]" style={{ fontFamily: 'var(--font-headers)' }}>
            LIMITED RELEASES
          </h2>
          <p className="mt-4 text-[12px] uppercase tracking-widest text-[#D4D4D4]">
            Uncensored. Unapologetic. Underground.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VANDALS_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/sencere/products/${product.id}`}
              className="group relative overflow-hidden border-2 border-[#5B2D7F] transition-all duration-300 hover:border-[#6B3D8F] hover:shadow-lg hover:shadow-[#5B2D7F]/20"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-[#2a1a3a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-[48px] font-black text-[#5B2D7F] opacity-20 group-hover:opacity-30 transition-opacity">
                    {product.id}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-[#0f0f0f] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5B2D7F]">
                  {product.category}
                </p>
                <h3 className="mt-2 text-[13px] font-bold uppercase leading-snug text-[#F5E6D3]">
                  {product.name}
                </h3>
                <p className="mt-3 text-[12px] font-bold text-[#5B2D7F]">
                  {product.price}
                </p>
                <button className="mt-4 w-full border border-[#5B2D7F] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5B2D7F] transition-all hover:bg-[#5B2D7F] hover:text-[#F5E6D3]">
                  Get Access
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
