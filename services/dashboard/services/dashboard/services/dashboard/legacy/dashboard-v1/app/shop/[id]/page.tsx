'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { Star, ShoppingCart, ArrowLeft, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  rating?: number;
  reviews?: number;
  category?: string;
  in_stock?: boolean;
}

const MOCK_PRODUCTS: Record<string, Product> = {
  '1': {
    id: 1,
    name: 'Tactical Training Holster',
    price: 89.99,
    rating: 4.8,
    reviews: 124,
    description:
      'Professional-grade training holster designed for safety and durability. Features secure retention, smooth draw, and compatibility with standard belt loops.',
    category: 'Training Gear',
    in_stock: true,
  },
  '2': {
    id: 2,
    name: 'Premium Ear Protection',
    price: 129.99,
    rating: 4.9,
    reviews: 89,
    description:
      'Advanced noise-reducing earmuffs with 30dB NRR. Comfortable for extended range sessions, includes carrying case.',
    category: 'Safety Equipment',
    in_stock: true,
  },
  '3': {
    id: 3,
    name: 'Target Practice Ammo (50ct)',
    price: 24.99,
    rating: 4.7,
    reviews: 234,
    description:
      'Premium .22 LR practice ammunition. Consistent velocity, clean burning, perfect for training and zeroing.',
    category: 'Ammunition',
    in_stock: true,
  },
  '4': {
    id: 4,
    name: 'Cleaning Kit Pro',
    price: 59.99,
    rating: 4.9,
    reviews: 156,
    description:
      'Complete firearm maintenance kit. Includes rods, brushes, patches, solvent, and protective case.',
    category: 'Maintenance',
    in_stock: true,
  },
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const p = MOCK_PRODUCTS[params.id];
    if (p) {
      setProduct(p);
    }
  }, [params.id]);

  if (!product) {
    return (
      <main className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Product not found</p>
          <Link href="/shop" className="text-red-600 hover:text-red-500 mt-4 inline-block">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity,
      type: 'product',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="bg-black min-h-screen">
      <nav className="sticky top-0 z-50 bg-black/90 border-b border-gray-900 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Wise Defense
          </Link>
          <Link href="/shop" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 aspect-square flex items-center justify-center">
            <ShoppingCart className="w-24 h-24 text-gray-700" />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-sm text-gray-500 uppercase tracking-wider">{product.category}</p>
            )}

            <h1 className="text-4xl font-bold text-white">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="text-5xl font-bold text-white">${product.price.toFixed(2)}</div>

            {/* Description */}
            <p className="text-lg text-gray-300 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            {product.in_stock ? (
              <div className="flex items-center gap-2 text-green-500">
                <Check className="w-5 h-5" />
                <span>In Stock</span>
              </div>
            ) : (
              <p className="text-red-500">Out of Stock</p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <span className="text-white">Quantity:</span>
                <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 hover:bg-gray-800 rounded transition-colors text-gray-400"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 hover:bg-gray-800 rounded transition-colors text-gray-400"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {added ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </span>
                )}
              </button>

              <Link href="/cart">
                <button className="w-full py-3 bg-gray-900 text-white border border-gray-800 rounded-lg hover:border-red-600 transition-colors font-semibold">
                  View Cart
                </button>
              </Link>
            </div>

            {/* Features */}
            <div className="pt-6 border-t border-gray-800 space-y-3">
              <h3 className="font-semibold text-white">Why Choose This?</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Professional grade quality
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Trusted by instructors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  30-day satisfaction guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
