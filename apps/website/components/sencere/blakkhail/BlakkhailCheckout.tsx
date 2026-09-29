'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, Lock } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { homePath } from '@/lib/site-domains';
import { BlakkhailStoreShell } from './BlakkhailStoreShell';
import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailCheckout() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    try {
      const { subtotal, tax, total } = calculateTotals();

      // TODO: Add Stripe payment processing before creating order
      // For now, just create the order directly
      const response = await fetch('/api/storefront/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          customerEmail: email,
          totalPrice: total,
          customer: formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Clear cart and redirect to success page
        localStorage.removeItem('blakkhail-cart');
        window.location.href = `/checkout/success?orderId=${data.orderId}`;
      } else {
        setError(data.error || 'Failed to create order');
      }
    } catch (err) {
      setError('Failed to process order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  if (items.length === 0) {
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
            href={host ? homePath(host) : '/sencere/blakkhail'}
            className="mt-8 inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider text-black sm:text-base"
            style={{ backgroundColor: BLAKKHAIL.gold }}
          >
            Shop the Collection
          </Link>
        </div>
      </BlakkhailStoreShell>
    );
  }

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
            {items.map((item) => (
              <div
                key={item.id}
                className="border p-5 sm:p-6"
                style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold uppercase sm:text-lg" style={{ color: BLAKKHAIL.gold }}>
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: BLAKKHAIL.steel }}>
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
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
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2"
                      style={{ backgroundColor: BLAKKHAIL.jetBlack, color: BLAKKHAIL.steel }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-lg font-bold sm:text-xl" style={{ color: BLAKKHAIL.gold }}>
                    ${(item.price * item.quantity).toFixed(2)}
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-xl font-bold sm:text-2xl" style={{ color: BLAKKHAIL.gold }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider" style={{ color: BLAKKHAIL.steel }}>
                  Email *
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

              <div className="space-y-3 border-t pt-4" style={{ borderColor: BLAKKHAIL.darkGold }}>
                <p className="text-xs font-bold uppercase" style={{ color: BLAKKHAIL.steel }}>
                  Shipping Details *
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    required
                    className="w-full border px-3 py-2 text-sm"
                    style={{
                      borderColor: BLAKKHAIL.darkGold,
                      backgroundColor: BLAKKHAIL.jetBlack,
                      color: BLAKKHAIL.steel,
                    }}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    required
                    className="w-full border px-3 py-2 text-sm"
                    style={{
                      borderColor: BLAKKHAIL.darkGold,
                      backgroundColor: BLAKKHAIL.jetBlack,
                      color: BLAKKHAIL.steel,
                    }}
                  />
                </div>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  required
                  className="w-full border px-3 py-2 text-sm"
                  style={{
                    borderColor: BLAKKHAIL.darkGold,
                    backgroundColor: BLAKKHAIL.jetBlack,
                    color: BLAKKHAIL.steel,
                  }}
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                    className="w-full border px-3 py-2 text-sm"
                    style={{
                      borderColor: BLAKKHAIL.darkGold,
                      backgroundColor: BLAKKHAIL.jetBlack,
                      color: BLAKKHAIL.steel,
                    }}
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                    className="w-full border px-3 py-2 text-sm"
                    style={{
                      borderColor: BLAKKHAIL.darkGold,
                      backgroundColor: BLAKKHAIL.jetBlack,
                      color: BLAKKHAIL.steel,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    required
                    className="w-full border px-3 py-2 text-sm"
                    style={{
                      borderColor: BLAKKHAIL.darkGold,
                      backgroundColor: BLAKKHAIL.jetBlack,
                      color: BLAKKHAIL.steel,
                    }}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    required
                    className="w-full border px-3 py-2 text-sm"
                    style={{
                      borderColor: BLAKKHAIL.darkGold,
                      backgroundColor: BLAKKHAIL.jetBlack,
                      color: BLAKKHAIL.steel,
                    }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm" style={{ color: '#f87171' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-bold uppercase tracking-wider text-black disabled:opacity-60 sm:text-base flex items-center justify-center gap-2"
                style={{ backgroundColor: BLAKKHAIL.gold }}
              >
                <Lock className="h-4 w-4" />
                {loading ? 'Processing…' : 'Complete Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </BlakkhailStoreShell>
  );
}
