'use client';

import Link from 'next/link';
import { LIZZY_LAYOUT } from '@/lib/brand-tokens';
import { money } from '@/lib/catalog';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { cart, setQty, remove, clear, cartTotal } = useCart();

  return (
    <main className={`${LIZZY_LAYOUT.page} ${LIZZY_LAYOUT.container} py-10`}>
      <h1 className="font-display text-4xl font-black">Your bag</h1>
      {cart.length === 0 ? (
        <div className="mt-8">
          <p className="text-white/70">Nothing in the bag yet. The Boom is waiting.</p>
          <Link href="/shop" className={`mt-6 ${LIZZY_LAYOUT.btnPrimary}`}>
            Shop the drop
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {cart.map((line) => (
            <div key={line.product.id} className="flex flex-col gap-3 rounded-lizzy border border-white/10 bg-lizzy-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-bold">{line.product.name}</p>
                <p className="text-sm text-lizzy-yellow">{money(line.product.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-wider text-white/50">
                  Qty
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) => setQty(line.product.id, Number(e.target.value))}
                    className="ml-2 w-16 rounded-lg border border-white/15 bg-lizzy-ink px-2 py-1 text-white"
                  />
                </label>
                <button type="button" onClick={() => remove(line.product.id)} className="text-sm text-lizzy-pink">
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
            <p className="font-display text-2xl font-black">Total {money(cartTotal)}</p>
            <div className="flex gap-3">
              <button type="button" onClick={clear} className={LIZZY_LAYOUT.btnGhost}>
                Clear
              </button>
              <button type="button" className={LIZZY_LAYOUT.btnPrimary} onClick={() => alert('Preview shop: checkout is not live yet. The Boom is coming.')}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
