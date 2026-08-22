'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartItem, calculateCartTotals, formatPrice, getPriceInCents } from '@/lib/sencere-cart';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('sencere_cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-cormorant text-4xl font-bold text-white mb-4">Your Cart is Empty</h1>
          <p className="font-montserrat text-gray-400 mb-6">
            Add some products to get started!
          </p>
          <a
            href="/sencere/products"
            className="inline-block px-8 py-3 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const { subtotal, tax, total } = calculateCartTotals(cartItems);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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
    } catch (err) {
      setError('Failed to initiate checkout. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (idx: number, qty: number) => {
    if (qty <= 0) {
      removeItem(idx);
    } else {
      const updated = [...cartItems];
      updated[idx].quantity = qty;
      setCartItems(updated);
      sessionStorage.setItem('sencere_cart', JSON.stringify(updated));
    }
  };

  const removeItem = (idx: number) => {
    const updated = cartItems.filter((_, i) => i !== idx);
    setCartItems(updated);
    sessionStorage.setItem('sencere_cart', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#050505] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-cormorant text-4xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-montserrat font-semibold text-white">
                      {item.productName}
                    </h3>
                    <p className="font-montserrat text-sm text-gray-400">
                      {item.variantName}
                    </p>
                    {Object.keys(item.options).length > 0 && (
                      <p className="font-montserrat text-xs text-gray-500 mt-1">
                        {Object.entries(item.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="p-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-300" />
                    </button>
                    <span className="font-montserrat text-white w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="p-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                  <p className="font-montserrat font-semibold text-[#0369A1]">
                    {formatPrice((item.price * item.quantity) * 100)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Form */}
          <div>
            {/* Summary */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
              <h2 className="font-cormorant text-2xl font-bold text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-800">
                <div className="flex justify-between font-montserrat text-gray-300">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal * 100)}</span>
                </div>
                <div className="flex justify-between font-montserrat text-gray-300">
                  <span>Tax:</span>
                  <span>{formatPrice(tax * 100)}</span>
                </div>
              </div>
              <div className="flex justify-between font-cormorant text-2xl font-bold text-white">
                <span>Total:</span>
                <span className="text-[#0369A1]">{formatPrice(total * 100)}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 font-montserrat text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block font-montserrat font-semibold text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <p className="font-montserrat text-xs text-gray-500 text-center mt-4">
                You will be redirected to Stripe to complete your purchase securely.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
