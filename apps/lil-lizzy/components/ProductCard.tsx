'use client';

import { BrandImg } from '@/components/BrandImg';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';
import { money, type Product } from '@/lib/catalog';
import { useCart } from '@/contexts/CartContext';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <article className="overflow-hidden rounded-lizzy border border-lizzy-pink/25 bg-lizzy-card/80 shadow-pink">
      <div className="relative h-44">
        <BrandImg src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-lizzy-yellow px-3 py-1 text-[10px] font-black uppercase tracking-wider text-lizzy-ink">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-black">{product.name}</h3>
          <p className="font-display text-lg text-lizzy-yellow">{money(product.price)}</p>
        </div>
        <p className="text-sm text-white/70">{product.blurb}</p>
        <button type="button" onClick={() => add(product.id)} className={`w-full ${LIZZY_LAYOUT.btnPrimary}`}>
          Add to bag
        </button>
      </div>
    </article>
  );
}
