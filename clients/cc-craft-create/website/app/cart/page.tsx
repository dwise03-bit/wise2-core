'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: 'Personalized Drink Labels',
    price: 24.99,
    quantity: 2,
    image: '🥤',
  },
  {
    id: 4,
    name: 'Custom Party Package',
    price: 89.99,
    quantity: 1,
    image: '🎁',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-cc-lilac py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-lora font-bold text-cc-dark">Shopping Cart</h1>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-cc-dark mb-6">Your cart is empty</p>
              <Link href="/shop">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="card flex gap-4">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-lora font-bold text-cc-dark">{item.name}</h3>
                        <p className="text-cc-gold font-bold">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-cc-lavender rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-cc-lilac"
                          >
                            −
                          </button>
                          <span className="px-3">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-cc-lilac"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-cc-dark min-w-24 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-cc-lilac rounded-lg p-6 h-fit">
                <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-cc-lavender">
                  <div className="flex justify-between text-cc-dark">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cc-dark">
                    <span>Shipping:</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cc-dark">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-bold text-cc-dark text-lg">Total:</span>
                  <span className="font-bold text-cc-gold text-lg">${total.toFixed(2)}</span>
                </div>

                <Link href="/checkout" className="block mb-4">
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>

                <Link href="/shop" className="block">
                  <Button variant="secondary" className="w-full">
                    Continue Shopping
                  </Button>
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
