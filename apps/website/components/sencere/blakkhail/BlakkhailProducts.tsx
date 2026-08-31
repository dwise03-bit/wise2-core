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
        style={{ backgroundColor: BLAKKHAIL.white }}
      >
        <BlakkhailSectionHeading eyebrow="The Vault" title="Select on the Intercom" />
        <div className={`${BLAKKHAIL_LAYOUT.container} text-center`}>
          <p className="mx-auto max-w-lg text-base sm:text-lg" style={{ color: BLAKKHAIL.neutral600 }}>
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
        style={{ backgroundColor: BLAKKHAIL.white }}
      >
        <BlakkhailSectionHeading
          eyebrow="Vault sealed"
          title={category === 'hoodies' ? 'Hoodies' : 'Hats'}
        />
        <div className={`${BLAKKHAIL_LAYOUT.container} text-center`}>
          <p className="mx-auto max-w-lg text-base sm:text-lg" style={{ color: BLAKKHAIL.neutral600 }}>
            {CATEGORY_COMING_SOON[category]}
          </p>
          <a
            href={BLAKKHAIL_LEGACY.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block min-h-10 border px-6 py-2.5 text-sm font-semibold uppercase tracking-wide"
            style={{ borderColor: BLAKKHAIL.accentBrown, color: BLAKKHAIL.accentBrown }}
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
      style={{ backgroundColor: BLAKKHAIL.white }}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={productPath(product.slug, host)}
              className="group overflow-hidden transition-opacity hover:opacity-75"
              style={{ borderBottom: `1px solid ${BLAKKHAIL.neutral200}` }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="px-2 py-4 sm:px-3 sm:py-5">
                <p
                  className="text-sm font-semibold uppercase tracking-wide sm:text-base"
                  style={{ color: BLAKKHAIL.black }}
                >
                  {product.name}
                </p>
                <p className="mt-2 text-lg font-semibold sm:text-xl" style={{ color: BLAKKHAIL.neutral700 }}>
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
              className="inline-block px-8 py-3 text-sm font-semibold uppercase tracking-wide"
              style={{ backgroundColor: BLAKKHAIL.accentBrown, color: BLAKKHAIL.white }}
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
