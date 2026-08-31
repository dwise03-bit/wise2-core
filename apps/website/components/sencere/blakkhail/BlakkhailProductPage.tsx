'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product, getBlakkhailProducts } from '@/lib/sencere-products';
import { CartItem } from '@/lib/sencere-cart';
import { checkoutPath, homePath, productPath } from '@/lib/site-domains';
import { BlakkhailProductDetail } from './BlakkhailProductDetail';
import { BlakkhailStoreShell } from './BlakkhailStoreShell';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

interface BlakkhailProductPageProps {
  product: Product;
}

export function BlakkhailProductPage({ product }: BlakkhailProductPageProps) {
  const router = useRouter();
  const [host, setHost] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setHost(window.location.hostname);
    const stored = sessionStorage.getItem('sencere_cart');
    if (stored) {
      try {
        setCartCount(JSON.parse(stored).length);
      } catch {
        setCartCount(0);
      }
    }
  }, []);

  const related = getBlakkhailProducts().filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = (item: CartItem) => {
    const stored = sessionStorage.getItem('sencere_cart');
    const existing: CartItem[] = stored ? JSON.parse(stored) : [];
    const next = [...existing, item];
    sessionStorage.setItem('sencere_cart', JSON.stringify(next));
    setCartCount(next.length);
  };

  return (
    <BlakkhailStoreShell>
      <Link
        href={host ? homePath(host) : '/sencere/blakkhail'}
        className="inline-flex items-center text-sm font-bold uppercase tracking-wider hover:opacity-80 sm:text-base"
        style={{ color: BLAKKHAIL.gold }}
      >
        ← Back to Collection
      </Link>

      <BlakkhailProductDetail product={product} onAddToCart={handleAddToCart} />

      {related.length > 0 && (
        <section className={`${BLAKKHAIL_LAYOUT.sectionY} border-t`} style={{ borderColor: BLAKKHAIL.darkGold }}>
          <h2
            className="mb-6 text-2xl font-black uppercase tracking-[0.08em] sm:text-3xl"
            style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
          >
            More from Blakk Hail
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                href={productPath(item.slug, host)}
                className={`${BLAKKHAIL_LAYOUT.frame} p-4`}
                style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
              >
                <p className="text-sm font-bold uppercase sm:text-base" style={{ color: BLAKKHAIL.gold }}>
                  {item.name}
                </p>
                <p className="mt-2 text-lg font-bold" style={{ color: BLAKKHAIL.steel }}>
                  ${item.basePrice.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {cartCount > 0 && host && (
        <div
          className="fixed bottom-4 right-4 z-50 px-5 py-4 shadow-lg"
          style={{ backgroundColor: BLAKKHAIL.gold, color: '#0A0A0A' }}
        >
          <p className="text-sm font-bold uppercase">{cartCount} item(s) in cart</p>
          <button
            type="button"
            onClick={() => router.push(checkoutPath(host))}
            className="mt-2 w-full px-4 py-2 text-sm font-bold uppercase"
            style={{ backgroundColor: BLAKKHAIL.jetBlack, color: BLAKKHAIL.gold }}
          >
            View Cart
          </button>
        </div>
      )}
    </BlakkhailStoreShell>
  );
}
