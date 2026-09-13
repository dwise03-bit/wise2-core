'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import { BlakkhailSectionHeading } from './BlakkhailSectionHeading';

export function BlakkhailLookBook() {
  return (
    <section
      id="look-book"
      className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <BlakkhailSectionHeading eyebrow="Editorial" title="Look Book" />
      <div className="mx-auto mb-10 flex max-w-[1400px] items-center justify-between gap-4 px-6">
        <p className="max-w-xl text-sm leading-relaxed" style={{ color: BLAKKHAIL.steel }}>
          Street-level cuts, archive pieces, and the latest visual drops from Blakk Hail.
        </p>
        <a
          href={BLAKKHAIL_LEGACY.social.instagram}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-[#D4AF37] hover:text-black"
          style={{ borderColor: BLAKKHAIL.darkGold, color: BLAKKHAIL.gold }}
        >
          View Instagram ↗
        </a>
      </div>
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
  );
}

export function BlakkhailVideo() {
  const { youtubeId, title } = BLAKKHAIL_LEGACY.video;

  return (
    <section
      id="video"
      className={`${BLAKKHAIL_LAYOUT.section} ${BLAKKHAIL_LAYOUT.sectionY}`}
      style={{ backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <BlakkhailSectionHeading eyebrow="Media" title="Video" />
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
  );
}

/** @deprecated Use BlakkhailLookBook + BlakkhailVideo separately for page ordering */
export function BlakkhailMedia() {
  return (
    <>
      <BlakkhailLookBook />
      <BlakkhailVideo />
    </>
  );
}
