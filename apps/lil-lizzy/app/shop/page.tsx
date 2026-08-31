import type { Metadata } from 'next';
import { ShopGrid } from './ShopGrid';
import { SectionKicker } from '@/components/ui';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';

export const metadata: Metadata = {
  title: 'Shop',
};

export default function ShopPage() {
  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <SectionKicker>Shop all</SectionKicker>
      <h1 className="mt-2 font-display text-4xl font-black">Shop the Boom</h1>
      <ShopGrid />
    </main>
  );
}
