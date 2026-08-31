'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCTS } from '@/lib/catalog';

function ShopResults() {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const items = useMemo(
    () => (q ? PRODUCTS.filter((item) => `${item.name} ${item.blurb} ${item.category}`.toLowerCase().includes(q)) : PRODUCTS),
    [q],
  );

  return (
    <>
      <p className="mt-3 max-w-2xl text-white/70">
        {q ? `Showing ${items.length} result${items.length === 1 ? '' : 's'} for “${q}”.` : 'LED Tag, accessories, and the Stage Ready pack.'}
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </>
  );
}

export function ShopGrid() {
  return (
    <Suspense fallback={<p className="mt-6 text-white/60">Loading the drop...</p>}>
      <ShopResults />
    </Suspense>
  );
}
