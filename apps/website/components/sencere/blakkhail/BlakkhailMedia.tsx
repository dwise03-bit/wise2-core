'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailMedia() {
  const { youtubeId, title } = BLAKKHAIL_LEGACY.video;

  return (
    <>
      <section
        id="look-book"
        className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
        style={{ backgroundColor: BLAKKHAIL.jetBlack }}
      >
        {BLAKKHAIL_LEGACY.assets.lookBook.map((src) => (
          <div key={src} className={BLAKKHAIL_LAYOUT.container}>
            <div className={BLAKKHAIL_LAYOUT.frame} style={{ borderColor: BLAKKHAIL.darkGold }}>
              <Image
              src={src}
              alt="Blakk Hail look book"
              width={1600}
              height={1200}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
            </div>
          </div>
        ))}
      </section>

      <section
        id="video"
        className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
        style={{ backgroundColor: BLAKKHAIL.jetBlack }}
      >
        <div className={BLAKKHAIL_LAYOUT.container}>
          <div
            className={`${BLAKKHAIL_LAYOUT.frame} relative w-full overflow-hidden`}
            style={{ borderColor: BLAKKHAIL.darkGold, aspectRatio: '16 / 9' }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
