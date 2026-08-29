'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailHero() {
  return (
    <section
      id="home"
      className={`${BLAKKHAIL_LAYOUT.section} relative overflow-hidden`}
      style={{ backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <div
        className={`${BLAKKHAIL_LAYOUT.frame} w-full`}
        style={{ borderColor: BLAKKHAIL.darkGold }}
      >
        <Image
          src={BLAKKHAIL_LEGACY.assets.logo}
          alt="Blakk Hail — original fashion since 1994"
          width={1200}
          height={270}
          priority
          className="h-auto w-full object-contain"
        />
      </div>

      <div id="photo-shoot" className={`${BLAKKHAIL_LAYOUT.section} flex flex-col gap-4 sm:gap-6`}>
        {BLAKKHAIL_LEGACY.assets.heroPhotos.map((src, index) => (
          <div
            key={src}
            className={BLAKKHAIL_LAYOUT.frame}
            style={{ borderColor: BLAKKHAIL.darkGold }}
          >
            <Image
              src={src}
              alt={index === 0 ? 'Blakk Hail photo shoot' : 'Blakk Hail editorial'}
              width={1600}
              height={1067}
              priority={index === 0}
              className="h-auto w-full object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
