'use client';

import Link from 'next/link';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailHero() {
  return (
    <section id="home" className="w-full" style={{ backgroundColor: BLAKKHAIL.jetBlack }}>
      {/* Legacy iWeb was ~1000px — cap logo so it scales cleanly without crop */}
      <div className={`${BLAKKHAIL_LAYOUT.container} max-w-[1000px] py-0`}>
        <img
          src={BLAKKHAIL_LEGACY.assets.logo}
          alt="Blakk Hail — original fashion since 1994"
          width={675}
          height={152}
          decoding="async"
          fetchPriority="high"
          className="block h-auto w-full"
          style={{ aspectRatio: '675 / 152' }}
        />
      </div>

      <div
        className={`${BLAKKHAIL_LAYOUT.container} flex flex-wrap items-center justify-center gap-3 px-4 py-4 sm:gap-4 sm:py-5`}
      >
        <Link
          href="#collection"
          className="min-h-11 px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black sm:text-base"
          style={{ backgroundColor: BLAKKHAIL.gold }}
        >
          Shop Collection
        </Link>
        <Link
          href="#shop"
          className="min-h-11 border px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] sm:text-base"
          style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
        >
          Featured Apparel
        </Link>
      </div>

      <div id="photo-shoot" className="mx-auto flex w-full max-w-[1000px] flex-col">
        {BLAKKHAIL_LEGACY.assets.heroPhotos.map((src, index) => (
          <div
            key={src}
            className="w-full border-t-[3px]"
            style={{ borderColor: BLAKKHAIL.darkGold }}
          >
            <img
              src={src}
              alt={index === 0 ? 'Blakk Hail photo shoot' : 'Blakk Hail editorial'}
              width={646}
              height={484}
              decoding={index === 0 ? 'sync' : 'async'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className="block h-auto w-full"
              style={{ aspectRatio: '646 / 484' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
