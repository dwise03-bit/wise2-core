'use client';

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

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();

  const subtotal = getCartSubtotal(items);
  const shipping = getCartShipping(items);
  const tax = getCartTax(subtotal);
  const total = getCartTotal(items);

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero title="Shopping Cart" subtitle="Review your items before checkout." />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl font-lora font-bold text-cc-dark mb-3">Your cart is empty</p>
              <p className="text-cc-dark/70 mb-8">Browse our collections and add something special.</p>
              <Link href="/shop">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="cc-card p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="text-4xl shrink-0" aria-hidden>{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-lora font-bold text-cc-dark">{item.name}</h3>
                        <p className="text-cc-gold font-bold">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center border border-cc-lavender rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-cc-lilac min-w-[44px]"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-4 py-2 min-w-[44px] text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-cc-lilac min-w-[44px]"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-cc-dark min-w-[80px] text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-cc-lilac rounded-xl p-6 h-fit lg:sticky lg:top-24">
                <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 pb-6 border-b border-cc-lavender text-cc-dark">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span className="text-cc-dark">Total</span>
                  <span className="text-cc-gold">${total.toFixed(2)}</span>
                </div>
                <Link href="/checkout" className="block mb-3">
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>
                <Link href="/shop" className="block">
                  <Button variant="secondary" className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
