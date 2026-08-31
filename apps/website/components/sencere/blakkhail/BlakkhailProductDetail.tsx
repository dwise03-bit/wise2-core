'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/sencere-products';
import { CartItem } from '@/lib/sencere-cart';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

interface BlakkhailProductDetailProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
}

export function BlakkhailProductDetail({ product, onAddToCart }: BlakkhailProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    Object.entries(product.variants[0].options).forEach(([key, values]) => {
      defaults[key] = values[0];
    });
    return defaults;
  });
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = useCallback(() => {
    onAddToCart({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      quantity,
      price: selectedVariant.price,
      options: selectedOptions,
    });
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2000);
  }, [onAddToCart, product.id, product.name, quantity, selectedOptions, selectedVariant]);

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-2 lg:gap-12">
      <div
        className={`${BLAKKHAIL_LAYOUT.frame} relative aspect-[4/5] w-full`}
        style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 sm:p-8"
        />
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          {product.badge && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: BLAKKHAIL.gold }}>
              {product.badge}
            </p>
          )}
          <h1
            className="text-3xl font-black uppercase tracking-[0.06em] sm:text-4xl lg:text-5xl"
            style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
          >
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: BLAKKHAIL.steel }}>
            {product.description}
          </p>
        </div>

        <div className="border-y py-4" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <p className="text-3xl font-bold sm:text-4xl" style={{ color: BLAKKHAIL.steel }}>
            ${selectedVariant.price.toFixed(2)}
          </p>
        </div>

        {Object.entries(selectedVariant.options).map(([key, values]) => (
          <div key={key}>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wider" style={{ color: BLAKKHAIL.steel }}>
              {key}
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedOptions((prev) => ({ ...prev, [key]: value }))}
                  className="px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors"
                  style={
                    selectedOptions[key] === value
                      ? { backgroundColor: BLAKKHAIL.gold, color: '#0A0A0A' }
                      : {
                          backgroundColor: BLAKKHAIL.gunmetal,
                          color: BLAKKHAIL.steel,
                          border: `1px solid ${BLAKKHAIL.darkGold}`,
                        }
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label className="mb-3 block text-sm font-bold uppercase tracking-wider" style={{ color: BLAKKHAIL.steel }}>
            Quantity
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center text-xl font-bold"
              style={{ backgroundColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-xl font-bold" style={{ color: BLAKKHAIL.steel }}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-11 w-11 items-center justify-center text-xl font-bold"
              style={{ backgroundColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-wider sm:text-base"
          style={{
            backgroundColor: addedToCart ? BLAKKHAIL.steel : BLAKKHAIL.gold,
            color: '#0A0A0A',
          }}
        >
          {addedToCart ? (
            <>
              <Check size={20} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              Add to Cart
            </>
          )}
        </button>

        <div className="border-t pt-6" style={{ borderColor: BLAKKHAIL.darkGold }}>
          <h3 className="mb-3 text-lg font-bold uppercase tracking-wider" style={{ color: BLAKKHAIL.gold }}>
            Details
          </h3>
          <p className="text-sm leading-relaxed sm:text-base" style={{ color: BLAKKHAIL.steel }}>
            {product.longDescription}
          </p>
          <ul className="mt-4 space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm sm:text-base" style={{ color: BLAKKHAIL.steel }}>
                <span style={{ color: BLAKKHAIL.gold }}>•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
