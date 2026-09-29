'use client';

import { useState, useCallback } from 'react';
import { Product, ProductVariant } from '@/lib/sencere-products';
import { CartItem } from '@/lib/sencere-cart';
import { ShoppingCart, Check, Package } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
}

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Initialize default options
  const [optionsInitialized, setOptionsInitialized] = useState(false);
  if (!optionsInitialized && selectedVariant) {
    const defaults: { [key: string]: string } = {};
    Object.entries(selectedVariant.options).forEach(([key, values]) => {
      defaults[key] = values[0];
    });
    setSelectedOptions(defaults);
    setOptionsInitialized(true);
  }

  const handleAddToCart = useCallback(() => {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      quantity,
      price: selectedVariant.price,
      options: selectedOptions,
    };

    onAddToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product.id, product.name, selectedVariant, quantity, selectedOptions, onAddToCart]);

  const allImages = [product.image, ...product.gallery];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="relative h-[500px] bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
          <Package className="w-32 h-32 text-white/20" strokeWidth={1} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIdx(idx % (allImages.length || 1))}
              className={`relative h-24 rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 ${
                idx === currentImageIdx
                  ? 'border-[#0369A1]'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <Package className="w-8 h-8 text-white/20" strokeWidth={1} />
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-8">
        <div>
          <h1 className="font-cormorant text-4xl font-bold text-white mb-2">
            {product.name}
          </h1>
          <p className="font-montserrat text-gray-300 text-lg">
            {product.description}
          </p>
        </div>

        {/* Price */}
        <div className="border-t border-b border-gray-700 py-4">
          <p className="font-montserrat text-sm text-gray-400 mb-1">Price</p>
          <p className="font-montserrat text-3xl font-bold text-[#0369A1]">
            ${selectedVariant.price}
          </p>
          {product.turnaround && (
            <p className="font-montserrat text-sm text-gray-400 mt-2">
              Turnaround: {product.turnaround}
            </p>
          )}
          {product.minOrder && (
            <p className="font-montserrat text-sm text-gray-400">
              Minimum order: {product.minOrder} units
            </p>
          )}
        </div>

        {/* Features */}
        <div>
          <h3 className="font-cormorant text-xl font-semibold text-white mb-3">
            Features
          </h3>
          <ul className="space-y-2">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#0369A1] flex-shrink-0 mt-0.5" />
                <span className="font-montserrat text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Variant Selection */}
        {product.variants.length > 1 && (
          <div className="space-y-4">
            <div>
              <label className="font-montserrat text-sm font-semibold text-white">
                Style
              </label>
              <select
                value={selectedVariant.id}
                onChange={(e) => {
                  const variant = product.variants.find(
                    (v) => v.id === e.target.value
                  );
                  if (variant) {
                    setSelectedVariant(variant);
                    setOptionsInitialized(false);
                  }
                }}
                className="w-full mt-2 px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} - ${variant.price}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4">
          {Object.entries(selectedVariant.options).map(([key, values]) => (
            <div key={key}>
              <label className="font-montserrat text-sm font-semibold text-white capitalize">
                {key}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [key]: value,
                      }))
                    }
                    className={`px-4 py-2 rounded-lg font-montserrat text-sm transition-colors ${
                      selectedOptions[key] === value
                        ? 'bg-[#0369A1] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quantity */}
        <div>
          <label className="font-montserrat text-sm font-semibold text-white">
            Quantity
          </label>
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              −
            </button>
            <span className="font-montserrat text-xl font-semibold text-white w-12 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-3 rounded-lg font-montserrat font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            addedToCart
              ? 'bg-green-600 text-white'
              : 'bg-[#0369A1] text-white hover:bg-blue-700'
          }`}
        >
          {addedToCart ? (
            <>
              <Check className="w-5 h-5" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>

        {/* Description */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className="font-cormorant text-xl font-semibold text-white mb-3">
            Details
          </h3>
          <p className="font-montserrat text-gray-400 leading-relaxed">
            {product.longDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
