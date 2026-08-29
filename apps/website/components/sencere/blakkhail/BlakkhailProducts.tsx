'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getBlakkhailProducts } from '@/lib/sencere-products';
import { checkoutPath, productPath } from '@/lib/site-domains';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { CATEGORY_COMING_SOON, type BlakkhailCategory } from './blakkhail-experience';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import { BlakkhailSectionHeading } from './BlakkhailSectionHeading';
import { BlakkhailVaultReveal } from './BlakkhailVaultReveal';

interface BlakkhailProductsProps {
  category?: BlakkhailCategory | null;
  showVaultInline?: boolean;
}

export function BlakkhailProducts({ category = null, showVaultInline = true }: BlakkhailProductsProps) {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const allProducts = getBlakkhailProducts();
  const products = useMemo(() => {
    if (!category || category === 'tees') return allProducts;
    return [];
  }, [allProducts, category]);

  const featured = products[0] ?? null;

  if (!category) {
    return (
      <section
        id="collection"
        className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
        style={{ backgroundColor: BLAKKHAIL.jetBlack }}
      >
        <BlakkhailSectionHeading eyebrow="The Vault" title="Select on the Intercom" />
        <div className={`${BLAKKHAIL_LAYOUT.container} text-center`}>
          <p className="mx-auto max-w-lg text-base sm:text-lg" style={{ color: BLAKKHAIL.steel }}>
            Use the intercom above — T-SHIRTS, HOODIES, or HATS — to release the vault and shop Blakk
            Hail.
          </p>
        </div>
      </section>
    );
  }

  if (category === 'hoodies' || category === 'hats') {
    return (
      <section
        id="collection"
        className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
        style={{ backgroundColor: BLAKKHAIL.jetBlack }}
      >
        <BlakkhailSectionHeading
          eyebrow="Vault sealed"
          title={category === 'hoodies' ? 'Hoodies' : 'Hats'}
        />
        <div className={`${BLAKKHAIL_LAYOUT.container} text-center`}>
          <p className="mx-auto max-w-lg text-base sm:text-lg" style={{ color: BLAKKHAIL.steel }}>
            {CATEGORY_COMING_SOON[category]}
          </p>
          <a
            href={BLAKKHAIL_LEGACY.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block min-h-11 border px-8 py-3 text-sm font-bold uppercase tracking-wider"
            style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
          >
            Follow @blakkhail
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      id="collection"
      className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <BlakkhailSectionHeading eyebrow="Vault open" title="Shop Blakk Hail" />
      {featured && showVaultInline && (
        <BlakkhailVaultReveal
          product={featured}
          category="tees"
          host={host}
          fullscreen={false}
        />
      )}
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
                  className="object-cover p-2 sm:p-3"
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
