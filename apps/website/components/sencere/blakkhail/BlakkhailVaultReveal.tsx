'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/sencere-products';
import { productPath } from '@/lib/site-domains';
import type { BlakkhailCategory } from './blakkhail-experience';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import styles from './blakkhail-cinematic.module.css';

interface BlakkhailVaultRevealProps {
  product: Product | null;
  category: BlakkhailCategory;
  host: string | null;
  comingSoonMessage?: string;
  onComplete?: () => void;
  fullscreen?: boolean;
}

export function BlakkhailVaultReveal({
  product,
  category,
  host,
  comingSoonMessage,
  onComplete,
  fullscreen = false,
}: BlakkhailVaultRevealProps) {
  const [phase, setPhase] = useState<'door' | 'product' | 'spin' | 'quote'>(fullscreen ? 'door' : 'quote');

  useEffect(() => {
    if (!fullscreen) return;
    const t1 = window.setTimeout(() => setPhase('product'), 1200);
    const t2 = window.setTimeout(() => setPhase('spin'), 2800);
    const t3 = window.setTimeout(() => setPhase('quote'), 4200);
    const t4 = window.setTimeout(() => onComplete?.(), 5200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [fullscreen, onComplete]);

  const imageSrc = product?.image ?? '/sencere-assets/legacy-blakkhail/shop/P7210321.jpg';
  const productName = product?.name ?? `${category === 'hoodies' ? 'Hoodie' : category === 'hats' ? 'Hat' : 'Drop'} — Coming Soon`;
  const price = product ? `$${product.basePrice.toFixed(2)}` : 'TBD';

  const content = (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Lock release */}
      {phase === 'door' && (
        <p
          className={`mb-4 text-center text-xs uppercase tracking-[0.35em] ${styles.lockRelease}`}
          style={{ color: BLAKKHAIL.gold }}
        >
          Lock releases
        </p>
      )}

      {/* Vault door */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden border-4"
        style={{
          borderColor: '#3a3a3a',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        }}
      >
        {/* Door panels */}
        <div
          className={`absolute inset-y-0 left-0 z-10 w-1/2 border-r-2 ${phase !== 'door' ? styles.doorPanelLeft : ''}`}
          style={{
            borderColor: '#444',
            background: 'linear-gradient(90deg, #333 0%, #222 100%)',
          }}
        />
        <div
          className={`absolute inset-y-0 right-0 z-10 w-1/2 border-l-2 ${phase !== 'door' ? styles.doorPanelRight : ''}`}
          style={{
            borderColor: '#444',
            background: 'linear-gradient(270deg, #333 0%, #222 100%)',
          }}
        />

        {/* Product glides out */}
        {phase !== 'door' && (
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center p-6 ${styles.productGlide}`}
          >
            <div
              className={`relative h-full w-full max-w-xs ${phase === 'spin' || phase === 'quote' ? styles.spinShot : ''}`}
            >
              <Image
                src={imageSrc}
                alt={productName}
                fill
                sizes="(max-width: 640px) 80vw, 320px"
                className="object-contain drop-shadow-2xl"
              />
              {/* Steam effect */}
              <div
                className={`pointer-events-none absolute -top-4 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full blur-2xl ${styles.productSteam}`}
                style={{ background: 'rgba(168,168,168,0.35)' }}
                aria-hidden
              />
            </div>
          </div>
        )}
      </div>

      {/* Quote + CTA */}
      {(phase === 'quote' || !fullscreen) && (
        <div className="mt-6 text-center">
          <p
            className="text-lg font-bold italic sm:text-xl"
            style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
          >
            Yo, that&apos;s fire.
          </p>
          {product && host ? (
            <Link
              href={productPath(product.slug, host)}
              className="mt-4 inline-block min-h-11 px-8 py-3 text-sm font-bold uppercase tracking-wider text-black"
              style={{ backgroundColor: BLAKKHAIL.gold }}
            >
              {product.name} — {price}
            </Link>
          ) : (
            <p className="mt-4 text-sm" style={{ color: BLAKKHAIL.steel }}>
              {comingSoonMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(5, 5, 5, 0.97)' }}
        role="status"
        aria-live="polite"
        aria-label="Vault releasing product"
      >
        <div className={`${BLAKKHAIL_LAYOUT.container} w-full`}>
          <p className="mb-6 text-center text-xs uppercase tracking-[0.35em]" style={{ color: BLAKKHAIL.steel }}>
            Door slides · Vault release
          </p>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`${BLAKKHAIL_LAYOUT.container} mb-10 sm:mb-12`}>
      <p className="mb-4 text-center text-xs uppercase tracking-[0.35em]" style={{ color: BLAKKHAIL.steel }}>
        Vault open — featured drop
      </p>
      <div
        className={`${BLAKKHAIL_LAYOUT.frame} mx-auto max-w-2xl overflow-hidden`}
        style={{ borderColor: BLAKKHAIL.gold, backgroundColor: BLAKKHAIL.gunmetal }}
      >
        {content}
      </div>
    </div>
  );
}
