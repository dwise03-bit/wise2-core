'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';

const PRODUCTS = [
  {
    id: '1',
    name: 'Tactical Training Holster',
    price: 89.99,
    rating: 4.8,
    category: 'Training Gear'
  },
  {
    id: '2',
    name: 'Premium Ear Protection',
    price: 129.99,
    rating: 4.9,
    category: 'Safety Equipment'
  },
  {
    id: '3',
    name: 'Target Practice Ammo (50ct)',
    price: 24.99,
    rating: 4.7,
    category: 'Ammunition'
  },
  {
    id: '4',
    name: 'Cleaning Kit Pro',
    price: 59.99,
    rating: 4.9,
    category: 'Maintenance'
  },
];

export default function ShopPage() {
  const { addToCart } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  const handleAddToCart = (id: string) => {
    const product = PRODUCTS.find(p => p.id === id);
    if (product) {
      addToCart({
        id,
        name: product.name,
        price: product.price,
        quantity: 1,
        type: 'product',
      });
      setAdded(id);
      setTimeout(() => setAdded(null), 2000);
    }
  };

  return (
    <main className="bg-black min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Wise Defense
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
              Training
            </Link>
            <Link href="/cart" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ShoppingBag className="w-5 h-5" />
              Cart
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-24 px-6 border-b border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-8 h-8 text-red-600" />
            <h1 className="text-5xl font-bold text-white">Tactical Gear & Equipment</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Premium firearms training equipment, safety gear, and accessories curated by professionals. Everything you need to train smarter and stay safe.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-16">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-red-600 transition-all duration-300"
              >
                {/* Product Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-700" />
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{product.category}</p>
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{product.rating}</span>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <span className="text-2xl font-bold text-white">
                      ${product.price}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/shop/${product.id}`}>
                        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                          added === product.id
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {added === product.id ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 bg-gray-900/50 border-t border-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-16">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', name: 'Training Gear', desc: 'Holsters, targets, range equipment' },
              { icon: '🛡️', name: 'Safety Equipment', desc: 'Ear protection, eye protection, gloves' },
              { icon: '🔧', name: 'Maintenance', desc: 'Cleaning kits, lubricants, tools' },
            ].map((cat) => (
              <div
                key={cat.name}
                className="bg-black rounded-lg p-8 text-center border border-gray-800 hover:border-red-600 transition-all cursor-pointer group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-gray-400">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Member Exclusive Discounts</h2>
          <p className="text-xl text-gray-400 mb-12">
            Wise Defense members receive exclusive discounts on all shop items. Sign up for training to unlock member pricing.
          </p>
          <Link href="/auth/signup">
            <button className="px-10 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold inline-flex items-center gap-2">
              Become a Member
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; 2026 Wise Defense LLC. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
