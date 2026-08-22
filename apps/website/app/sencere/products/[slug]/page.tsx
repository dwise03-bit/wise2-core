'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProductBySlug, SENCERE_PRODUCTS } from '@/lib/sencere-products';
import { ProductDetail } from '@/components/sencere/ProductDetail';
import { CartItem } from '@/lib/sencere-cart';
import { ProductGrid } from '@/components/sencere/ProductGrid';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const product = getProductBySlug(params.slug);
  const [cart, setCart] = useState<CartItem[]>([]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-cormorant text-4xl font-bold text-white mb-4">
            Product Not Found
          </h1>
          <p className="font-montserrat text-gray-400 mb-6">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <a
            href="/sencere/products"
            className="inline-block px-8 py-3 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    const allItems = [...cart, item];
    sessionStorage.setItem('sencere_cart', JSON.stringify(allItems));
  };

  const relatedProducts = SENCERE_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#050505]">
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <a
          href="/sencere/products"
          className="inline-flex items-center gap-2 text-[#0369A1] hover:text-blue-500 transition-colors mb-8 font-montserrat"
        >
          ← Back to Products
        </a>
        <ProductDetail product={product} onAddToCart={handleAddToCart} />
      </section>

      {relatedProducts.length > 0 && (
        <section className="px-4 py-20 max-w-7xl mx-auto border-t border-gray-900">
          <h2 className="font-cormorant text-4xl font-bold text-white mb-8">
            You Might Also Like
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-[#0369A1] text-white px-6 py-4 rounded-lg shadow-lg">
          <p className="font-montserrat font-semibold">{cart.length} item(s) in cart</p>
          <button
            onClick={() => router.push('/sencere/checkout')}
            className="mt-3 w-full px-4 py-2 bg-white text-[#0369A1] rounded font-montserrat font-semibold hover:bg-gray-100 transition-colors"
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}
