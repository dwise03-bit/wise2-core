'use client';

import { Product } from '@/lib/sencere-products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  featured?: Product;
  title?: string;
}

export function ProductGrid({ products, featured, title }: ProductGridProps) {
  const displayProducts = featured
    ? [featured, ...products.filter((p) => p.id !== featured.id)]
    : products;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {title && (
        <h2 className="font-cormorant text-4xl font-bold mb-8 text-white">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {displayProducts.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            featured={featured && product.id === featured.id}
          />
        ))}
      </div>
    </section>
  );
}
