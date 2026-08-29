'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBlakkhailProducts } from '@/lib/sencere-products';
import { checkoutPath, productPath } from '@/lib/site-domains';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailProducts() {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const products = getBlakkhailProducts();

  return (
    <section
      id="collection"
      className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <div className={BLAKKHAIL_LAYOUT.container}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={productPath(product.slug, host)}
              className={`${BLAKKHAIL_LAYOUT.frame} group overflow-hidden`}
              style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-contain p-5 sm:p-6"
                />
              </div>
              <div className="border-t px-4 py-4 sm:px-6 sm:py-5" style={{ borderColor: BLAKKHAIL.darkGold }}>
                <p
                  className="text-base font-bold uppercase tracking-wide sm:text-lg lg:text-xl"
                  style={{ color: BLAKKHAIL.gold }}
                >
                  {product.name}
                </p>
                <p className="mt-2 text-xl font-bold sm:text-2xl" style={{ color: BLAKKHAIL.steel }}>
                  ${product.basePrice.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {host && (
          <div className="mt-10 text-center sm:mt-12">
            <Link
              href={checkoutPath(host)}
              className="inline-block px-10 py-4 text-sm font-bold uppercase tracking-wider text-black sm:text-base lg:text-lg"
              style={{ backgroundColor: BLAKKHAIL.gold }}
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
