'use client';

import React from 'react';
import type { Product } from '@/lib/types';
import { productEmoji } from '@/lib/cart-utils';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  compact?: boolean;
}

function formatPrice(price: string | number): number {
  return typeof price === 'number' ? price : parseFloat(price);
}

export function ProductCard({ product, onAddToCart, compact = false }: ProductCardProps) {
  const emoji = productEmoji(product.name, product.category);
  const price = formatPrice(product.price);

  return (
    <article className="cc-card group flex flex-col h-full">
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-cc-lilac to-white border-b border-cc-lavender/40 ${
          compact ? 'h-36' : 'h-44'
        }`}
      >
        <span className="text-5xl md:text-6xl" aria-hidden>
          {emoji}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-cc-purple mb-1">
          {product.category}
        </p>
        <h3 className="text-lg font-lora font-bold text-cc-dark mb-2">{product.name}</h3>
        {!compact ? (
          <p className="text-sm text-cc-dark/70 mb-4 line-clamp-2 flex-1">{product.description}</p>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center justify-between gap-3 mt-auto pt-2">
          <span className="text-xl font-bold text-cc-gold">${price.toFixed(2)}</span>
          {onAddToCart ? (
            <Button
              size="sm"
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
