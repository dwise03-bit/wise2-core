'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { GlassCard, PageHeader } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { useOrders } from '@/contexts/OrderContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, setQty, removeFromCart, cartTotal, checkout } = useOrders();
  const [placed, setPlaced] = useState<string | null>(null);
  const router = useRouter();

  const place = () => {
    const order = checkout('Menu order');
    if (order) setPlaced(order.id);
  };

  if (placed) {
    return (
      <div className={`${FERGIE_LAYOUT.container} py-6`}>
        <GlassCard glow gold className="text-center">
          <p className="font-script text-3xl text-fergie-rose">Served with love.</p>
          <p className="mt-2 font-serif text-2xl">Order {placed} is in</p>
          <p className="mt-3 text-sm text-white/60">Chef Fergie has the ticket. Track it under My Orders.</p>
          <button type="button" onClick={() => router.push('/orders')} className={`mt-6 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
            Track order
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Your Order" subtitle="Almost at the table" />
      {cart.length === 0 ? (
        <GlassCard className="text-center">
          <p className="text-sm text-white/55">Your cloche is empty.</p>
          <Link href="/menu" className={`mt-4 ${FERGIE_LAYOUT.btnPrimary}`}>
            Browse the menu
          </Link>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-2">
            {cart.map((line) => (
              <GlassCard key={line.item.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="font-medium">{line.item.name}</p>
                  <p className="text-xs text-fergie-gold">${line.item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="touch-target flex h-8 w-8 items-center justify-center rounded-full border border-white/15"
                    onClick={() => setQty(line.item.id, line.qty - 1)}
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm">{line.qty}</span>
                  <button
                    type="button"
                    className="touch-target flex h-8 w-8 items-center justify-center rounded-full border border-fergie-gold/40 text-fergie-gold"
                    onClick={() => setQty(line.item.id, line.qty + 1)}
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="touch-target text-white/40"
                    onClick={() => removeFromCart(line.item.id)}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="mt-4 flex items-center justify-between" gold>
            <span className="text-sm text-white/60">Total</span>
            <span className="font-serif text-2xl text-fergie-gold">${cartTotal}</span>
          </GlassCard>
          <button type="button" onClick={place} className={`mt-4 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
            Place order
          </button>
        </>
      )}
    </div>
  );
}
