'use client';

import { useMemo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { MENU_ITEMS, type MenuCategory } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

const CATEGORIES: Array<MenuCategory | 'All'> = ['All', 'Starters', 'Entrees', 'Sides', 'Desserts'];

export default function MenuPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const { addToCart, cart, soldOut } = useOrders();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const items = useMemo(
    () => (category === 'All' ? MENU_ITEMS : MENU_ITEMS.filter((item) => item.category === category)),
    [category],
  );

  const onAdd = (id: string) => {
    const item = MENU_ITEMS.find((m) => m.id === id);
    if (!item) return;
    addToCart(item);
    setJustAdded(id);
    window.setTimeout(() => setJustAdded((current) => (current === id ? null : current)), 900);
  };

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Our Menu" subtitle="Made with flavor" />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              category === cat
                ? 'border-fergie-gold bg-fergie-gold text-fergie-black'
                : 'border-fergie-gold/20 text-white/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3" data-tour="menu-list">
        {items.map((item) => {
          const inCart = cart.find((line) => line.item.id === item.id);
          const added = justAdded === item.id;
          const out = soldOut.includes(item.id);
          return (
            <GlassCard key={item.id} className="flex gap-3 overflow-hidden p-2">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-fergie-rose/70">{item.category}</p>
                  </div>
                  <p className="font-semibold text-fergie-gold">${item.price}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-white/55">{item.description}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  {out ? <StatusPill label="Sold out" tone="muted" /> : inCart ? <StatusPill label={`${inCart.qty} in order`} /> : <span />}
                  <button
                    type="button"
                    disabled={out}
                    onClick={() => onAdd(item.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fergie-royal to-fergie-gold px-3 py-1.5 text-xs font-semibold text-white active:scale-95 disabled:opacity-40"
                  >
                    {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    {out ? 'Unavailable' : added ? 'Added' : 'Add to order'}
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
