'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ShopPage() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const products = [
    {
      id: 'product-1',
      name: 'Premium Sound Effects Pack',
      price: 49.99,
      description: 'Over 1000 royalty-free sound effects for your projects',
      category: 'Audio',
    },
    {
      id: 'product-2',
      name: 'Stock Music Library',
      price: 99.99,
      description: 'Unlimited access to royalty-free music tracks',
      category: 'Music',
    },
    {
      id: 'product-3',
      name: 'Professional Font Bundle',
      price: 29.99,
      description: '50+ premium fonts for design and web projects',
      category: 'Design',
    },
    {
      id: 'product-4',
      name: 'Video Editing Suite',
      price: 199.99,
      description: 'Complete video editing templates and effects',
      category: 'Video',
    },
    {
      id: 'product-5',
      name: 'Photography Presets',
      price: 19.99,
      description: '100 Lightroom and Capture One presets',
      category: 'Photography',
    },
    {
      id: 'product-6',
      name: 'Brand Design System',
      price: 149.99,
      description: 'Complete design system with components and guidelines',
      category: 'Design',
    },
  ];

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  return (
    <div className="min-h-screen bg-wise-bg-primary pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-wise-text-primary mb-4">Shop</h1>
          <p className="text-wise-text-secondary text-lg">
            Premium digital products and resources for creators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded">
                  {product.category}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`text-2xl transition-colors ${
                    wishlist.includes(product.id) ? 'text-lime-400' : 'text-wise-text-secondary hover:text-lime-400'
                  }`}
                >
                  ♥
                </button>
              </div>
              <h3 className="text-xl font-bold text-wise-text-primary mb-2">{product.name}</h3>
              <p className="text-wise-text-secondary mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-lime-400">${product.price}</span>
                <Link
                  href={`/checkout?product=${product.id}`}
                  className="px-4 py-2 bg-lime-400 text-black font-bold rounded hover:bg-lime-300 transition-colors"
                >
                  Buy
                </Link>
              </div>
            </div>
          ))}
        </div>

        {wishlist.length > 0 && (
          <div className="mt-12 bg-wise-bg-secondary border border-wise-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-wise-text-primary mb-4">Wishlist ({wishlist.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {wishlist.map((itemId) => {
                const product = products.find((p) => p.id === itemId);
                return (
                  <div key={itemId} className="flex justify-between items-center p-3 bg-wise-bg-primary rounded">
                    <span className="text-wise-text-secondary">{product?.name}</span>
                    <span className="text-lime-400 font-bold">${product?.price}</span>
                  </div>
                );
              })}
            </div>
            <button className="px-6 py-3 bg-lime-400 text-black font-bold rounded hover:bg-lime-300 transition-colors">
              Buy All Wishlist Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
