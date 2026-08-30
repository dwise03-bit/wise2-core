'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';
import { useCart } from '@/contexts/CartContext';
import {
  getCartShipping,
  getCartSubtotal,
  getCartTax,
  getCartTotal,
} from '@/lib/cart-utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isReady, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (isReady && items.length === 0) {
      router.replace('/cart');
    }
  }, [isReady, items.length, router]);

  const subtotal = getCartSubtotal(items);
  const shipping = getCartShipping(items);
  const tax = getCartTax(subtotal);
  const total = getCartTotal(items);

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      }));

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: 'Local pickup / delivery',
            city: '',
            state: '',
            zip: '',
          },
          items: orderItems,
          notes: customer.notes,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to start checkout');
      }

      const data = await checkoutResponse.json();
      clearCart();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-cc-lilac" />;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero title="Checkout" subtitle="Review your order and complete your purchase." />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {error ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section className="cc-card p-6">
                <h2 className="text-xl font-lora font-bold text-cc-dark mb-4">Your Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-cc-dark mb-2">Full Name</label>
                    <input
                      className="cc-input"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cc-dark mb-2">Email</label>
                    <input
                      type="email"
                      className="cc-input"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cc-dark mb-2">Phone</label>
                    <input
                      type="tel"
                      className="cc-input"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-cc-dark mb-2">Order Notes</label>
                    <textarea
                      className="cc-input resize-none"
                      rows={4}
                      placeholder="Event date, colors, names, or customization details..."
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              <section className="cc-card p-6">
                <h2 className="text-xl font-lora font-bold text-cc-dark mb-4">
                  Cart Items ({items.length})
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between gap-4 border-b border-cc-lavender/40 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-cc-dark">{item.name}</p>
                        <p className="text-sm text-cc-dark/60">Qty {item.quantity}</p>
                      </div>
                      <p className="font-bold text-cc-gold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="bg-cc-lilac rounded-xl p-6 h-fit lg:sticky lg:top-24">
              <h3 className="text-xl font-lora font-bold text-cc-dark mb-4">Order Summary</h3>
              <div className="space-y-3 text-cc-dark mb-6 pb-6 border-b border-cc-lavender">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-cc-gold">${total.toFixed(2)}</span>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Complete Purchase'}
              </Button>
              <p className="text-xs text-cc-dark/60 text-center mt-4">
                {process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
                  ? 'Demo checkout — no payment processed'
                  : 'Secure checkout powered by Stripe'}
              </p>
              <Link href="/cart" className="block mt-4 text-center text-sm text-cc-purple hover:underline">
                Back to cart
              </Link>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
