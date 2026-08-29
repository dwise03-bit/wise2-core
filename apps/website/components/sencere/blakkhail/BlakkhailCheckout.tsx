'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  CartItem,
  calculateCartTotals,
  formatPrice,
  getPriceInCents,
} from '@/lib/sencere-cart';
import { homePath } from '@/lib/site-domains';
import { BlakkhailStoreShell } from './BlakkhailStoreShell';
import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailCheckout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
    const stored = sessionStorage.getItem('sencere_cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  const updateQuantity = (idx: number, qty: number) => {
    if (qty <= 0) {
      removeItem(idx);
      return;
    }
    const updated = [...cartItems];
    updated[idx].quantity = qty;
    setCartItems(updated);
    sessionStorage.setItem('sencere_cart', JSON.stringify(updated));
  };

  const removeItem = (idx: number) => {
    const updated = cartItems.filter((_, i) => i !== idx);
    setCartItems(updated);
    sessionStorage.setItem('sencere_cart', JSON.stringify(updated));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { total } = calculateCartTotals(cartItems);
      const response = await fetch('/api/sencere/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          email,
          total: getPriceInCents(total),
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <BlakkhailStoreShell>
        <div className="py-16 text-center sm:py-24">
          <h1
            className="text-3xl font-black uppercase sm:text-4xl"
            style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
          >
            Your Cart is Empty
          </h1>
          <p className="mt-4 text-base sm:text-lg" style={{ color: BLAKKHAIL.steel }}>
            Explore the Blakk Hail collection and add your first piece.
          </p>
          <Link
            href={host ? homePath(host) : '/sencere'}
            className="mt-8 inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider text-black sm:text-base"
            style={{ backgroundColor: BLAKKHAIL.gold }}
          >
            Shop the Collection
          </Link>
        </div>
      </BlakkhailStoreShell>
    );
  }

  const { subtotal, tax, total } = calculateCartTotals(cartItems);

  return (
    <BlakkhailStoreShell contained={false}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1
          className="mb-8 text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl"
          style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="border p-5 sm:p-6"
                style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold uppercase sm:text-lg" style={{ color: BLAKKHAIL.gold }}>
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: BLAKKHAIL.steel }}>
                      {item.variantName}
                      {Object.keys(item.options).length > 0 &&
                        ` • ${Object.entries(item.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="shrink-0 hover:opacity-70"
                    style={{ color: BLAKKHAIL.steel }}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="p-2"
                      style={{ backgroundColor: BLAKKHAIL.jetBlack, color: BLAKKHAIL.steel }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center font-bold" style={{ color: BLAKKHAIL.steel }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="p-2"
                      style={{ backgroundColor: BLAKKHAIL.jetBlack, color: BLAKKHAIL.steel }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-lg font-bold sm:text-xl" style={{ color: BLAKKHAIL.gold }}>
                    {formatPrice(item.price * item.quantity * 100)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div
              className="mb-6 border p-6"
              style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
            >
              <h2 className="mb-4 text-xl font-black uppercase" style={{ color: BLAKKHAIL.steel }}>
                Order Summary
              </h2>
              <div className="space-y-2 border-b pb-4 text-sm sm:text-base" style={{ borderColor: BLAKKHAIL.darkGold, color: BLAKKHAIL.steel }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(tax * 100)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-xl font-bold sm:text-2xl" style={{ color: BLAKKHAIL.gold }}>
                <span>Total</span>
                <span>{formatPrice(total * 100)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider" style={{ color: BLAKKHAIL.steel }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border px-4 py-3 text-sm sm:text-base"
                  style={{
                    borderColor: BLAKKHAIL.darkGold,
                    backgroundColor: BLAKKHAIL.jetBlack,
                    color: BLAKKHAIL.steel,
                  }}
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: '#f87171' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-bold uppercase tracking-wider text-black disabled:opacity-60 sm:text-base"
                style={{ backgroundColor: BLAKKHAIL.gold }}
              >
                {loading ? 'Processing…' : 'Complete Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </BlakkhailStoreShell>
  );
}
