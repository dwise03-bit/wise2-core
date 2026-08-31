import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { SectionKicker } from '@/components/ui';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';
import { PRODUCTS } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Accessories',
};

export default function AccessoriesPage() {
  const items = PRODUCTS.filter((item) => item.category === 'accessory');
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <SectionKicker>Signature shine</SectionKicker>
      <h1 className="mt-2 font-display text-4xl font-black">Accessories</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Star Hair Clip, Sparkle Mic, Star Necklace, and Boom Bracelets. Stack them with the LED Tag or wear them on
        their own.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </main>
  );
}
