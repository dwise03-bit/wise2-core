'use client';

import Link from 'next/link';

const BLAKKHAIL_PRODUCTS = [
  {
    id: 1,
    name: 'Original Logo Tee',
    price: '$24.99',
    image: 'Product 1',
    category: 'Apparel',
  },
  {
    id: 2,
    name: 'Vintage Heritage Hoodie',
    price: '$64.99',
    image: 'Product 2',
    category: 'Apparel',
  },
  {
    id: 3,
    name: 'Limited Edition Jacket',
    price: '$89.99',
    image: 'Product 3',
    category: 'Outerwear',
  },
  {
    id: 4,
    name: '1994 Commemorative Tee',
    price: '$26.99',
    image: 'Product 4',
    category: 'Apparel',
  },
  {
    id: 5,
    name: 'Archive Collection Hoodie',
    price: '$69.99',
    image: 'Product 5',
    category: 'Apparel',
  },
  {
    id: 6,
    name: 'Classic Logo Tee - Black',
    price: '$24.99',
    image: 'Product 6',
    category: 'Apparel',
  },
];

export function BlakkhailProducts() {
  return (
    <section id="products" className="bg-[#1a1a1a] py-12 lg:py-16">
      <div className="mx-auto max-w-[1536px] px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-[32px] font-black uppercase tracking-wider text-[#D4842F]" style={{ fontFamily: 'var(--font-headers)' }}>
            THE COLLECTION
          </h2>
          <p className="mt-4 text-[12px] uppercase tracking-widest text-[#D4D4D4]">
            Est. 1994 • Original Fashion for the Cultured
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLAKKHAIL_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/sencere/products/${product.id}`}
              className="group relative overflow-hidden border-2 border-[#D4842F] transition-all duration-300 hover:border-[#E8A23A] hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-[48px] font-black text-[#D4842F] opacity-20 group-hover:opacity-30 transition-opacity">
                    {product.image}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-[#0f0f0f] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4842F]">
                  {product.category}
                </p>
                <h3 className="mt-2 text-[13px] font-bold uppercase leading-snug text-[#F5E6D3]">
                  {product.name}
                </h3>
                <p className="mt-3 text-[12px] font-bold text-[#D4842F]">
                  {product.price}
                </p>
                <button className="mt-4 w-full border border-[#D4842F] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#D4842F] transition-all hover:bg-[#D4842F] hover:text-[#0f0f0f]">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
