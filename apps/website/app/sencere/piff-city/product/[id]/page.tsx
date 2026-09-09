'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PiffCityHeader } from '@/components/sencere/piff-city/PiffCityHeader';
import { PiffCityFooter } from '@/components/sencere/piff-city/PiffCityFooter';

const PRODUCTS = {
  '1': {
    name: 'No berry Cush gray',
    displayName: 'PC Street life no berry kush destress short sleeve',
    category: 'LEGACY',
    price: '$65.99',
    priceNum: 65.99,
    description: 'Original for the culture since 1994.',
    story: 'Premium cotton, gold-accent print, built',
    image: 'placeholder',
  },
  '2': {
    name: 'No berry Cush long sleeve',
    displayName: 'PC Street life no berry kush destress long sleeve hoodie',
    category: 'LEGACY',
    price: '$65.99',
    priceNum: 65.99,
    description: 'Original for the culture since 1994.',
    story: 'Premium cotton, gold-accent print, built',
    image: 'placeholder',
  },
  '3': {
    name: 'Strawberry haze',
    displayName: 'PC Street life Strawberry haze destress long sleeve hoodie',
    category: 'LEGACY',
    price: '$65.99',
    priceNum: 65.99,
    description: 'Original for the culture since 1994.',
    story: 'Premium cotton, gold-accent print, built',
    image: 'placeholder',
  },
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS[params.id as keyof typeof PRODUCTS];
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <PiffCityHeader />

      <main className="mx-auto max-w-[1200px] px-6 py-12">
        {/* Back Link */}
        <Link href="/sencere/piff-city" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#E8A23A] hover:text-[#F5B24A] transition-colors mb-12 border border-[#E8A23A] px-4 py-2">
          ← BACK TO COLLECTION
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="flex items-center justify-center border-4 border-[#333] bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] aspect-square">
            <div className="text-center">
              <div className="text-[96px] font-black text-[#E8A23A] opacity-20">
                {String(params.id).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#E8A23A]">
                {product.category}
              </p>
              <h1 className="mt-4 text-[32px] font-black uppercase leading-tight text-white">
                {product.name}
              </h1>
              <p className="mt-4 text-[13px] text-[#A8A8A8]">
                {product.displayName}
              </p>
            </div>

            <div className="border-t border-[#333] pt-6">
              <p className="text-[18px] font-bold text-[#E8A23A]">
                {product.price}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white">
                SIZE
              </label>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL', '2XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 font-bold text-[12px] transition-all border-2 ${
                      selectedSize === size
                        ? 'border-[#E8A23A] bg-[#E8A23A] text-[#0f0f0f]'
                        : 'border-[#333] text-white hover:border-[#E8A23A]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white">
                QUANTITY
              </label>
              <div className="flex items-center gap-4 border border-[#333] w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#E8A23A] hover:bg-[#1a1a1a] transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#E8A23A] hover:bg-[#1a1a1a] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button className="w-full bg-[#0a0a0a] border-2 border-[#333] px-6 py-4 font-bold uppercase tracking-wider text-white hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2">
              <span>🛒</span> ADD TO CART
            </button>

            {/* Product Story */}
            <div className="border-t border-[#333] space-y-4 pt-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-white">
                THE STORY
              </h3>
              <div className="space-y-2 text-[13px] text-[#A8A8A8]">
                <p>{product.description}</p>
                <p>{product.story}</p>
              </div>
            </div>

            {/* Product Notes */}
            <div className="border-t border-[#333] pt-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-white">
                PRODUCT NOTES
              </h3>
            </div>
          </div>
        </div>
      </main>

      <PiffCityFooter />
    </div>
  );
}
