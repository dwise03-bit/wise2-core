'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/lib/useStore';

export default function WebstorePage() {
  const { cart, addToCart } = useStore();
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const products = [
    {
      id: 'template-1',
      name: 'Brand Identity Template',
      price: 29.99,
      description: 'Complete brand identity package including logo, color palette, and guidelines',
    },
    {
      id: 'template-2',
      name: 'Audio Branding Kit',
      price: 39.99,
      description: 'Professional audio branding assets for your business',
    },
    {
      id: 'template-3',
      name: 'Social Media Pack',
      price: 24.99,
      description: 'Ready-to-use social media templates and graphics',
    },
    {
      id: 'template-4',
      name: 'Video Production Bundle',
      price: 79.99,
      description: 'Everything you need for professional video production',
    },
    {
      id: 'template-5',
      name: 'Email Marketing Suite',
      price: 34.99,
      description: 'Complete email marketing templates and automation setup',
    },
    {
      id: 'template-6',
      name: 'Content Calendar',
      price: 19.99,
      description: '12-month content calendar with planning tools',
    },
  ];

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      1
    );
    showToast(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-wise-bg-primary pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-wise-text-primary mb-4">Webstore</h1>
          <p className="text-wise-text-secondary text-lg">
            Templates, tools, and resources for your creative business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors"
            >
              <h3 className="text-xl font-bold text-wise-text-primary mb-2">{product.name}</h3>
              <p className="text-wise-text-secondary mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-lime-400">${product.price}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-4 py-2 bg-lime-400 text-black font-bold rounded hover:bg-lime-300 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.items.length > 0 && (
          <div className="mt-12 bg-wise-bg-secondary border border-wise-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-wise-text-primary mb-4">Cart ({cart.items.length})</h2>
            <div className="mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="text-wise-text-secondary mb-2 flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="text-lime-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="text-xl font-bold text-lime-400 mb-4">
              Total: ${cart.total.toFixed(2)}
            </div>
            <Link
              href="/checkout"
              className="px-6 py-3 bg-lime-400 text-black font-bold rounded hover:bg-lime-300 transition-colors"
            >
              Checkout →
            </Link>
          </div>
        )}

        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed bottom-4 right-4 bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold shadow-lg animate-in slide-in-from-bottom-4 duration-300">
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
