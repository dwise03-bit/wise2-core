'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailShopScroll() {
  const photos = BLAKKHAIL_LEGACY.assets.shopPhotos;

  return (
    <section
      id="shop"
      className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:gap-6 sm:px-6 lg:px-8"
        style={{ scrollbarWidth: 'thin', scrollbarColor: `${BLAKKHAIL.darkGold} ${BLAKKHAIL.jetBlack}` }}
      >
        {photos.map((src, index) => (
          <div
            key={src}
            className={`${BLAKKHAIL_LAYOUT.frame} relative shrink-0 snap-center`}
            style={{
              borderColor: BLAKKHAIL.darkGold,
              width: 'min(88vw, 560px)',
              aspectRatio: '4 / 5',
            }}
          >
            <Image
              src={src}
              alt={`Blakk Hail apparel ${index + 1}`}
              fill
              sizes="(max-width: 768px) 88vw, 560px"
              className="object-contain p-3 sm:p-5"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
