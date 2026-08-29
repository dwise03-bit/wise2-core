'use client';

import Image from 'next/image';
import { BLAKKHAIL_ASSETS } from './blakkhail-experience';
import { BLAKKHAIL } from './brand-tokens';
import styles from './blakkhail-cinematic.module.css';

interface BlakkhailPiffCityEndCardProps {
  onComplete?: () => void;
}

export function BlakkhailPiffCityEndCard({ onComplete }: BlakkhailPiffCityEndCardProps) {
  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#050505' }}
      role="img"
      aria-label="Piff City logo"
    >
      <div className={`flex flex-col items-center ${styles.logoSmash}`}>
        <div className="relative h-40 w-40 sm:h-52 sm:w-52">
          <Image
            src={BLAKKHAIL_ASSETS.piffCitySkull}
            alt="Piff City skull logo"
            fill
            sizes="(max-width: 640px) 160px, 208px"
            className="object-contain"
            priority
          />
        </div>
        <p
          className="mt-6 text-4xl font-black uppercase tracking-[0.14em] sm:text-5xl lg:text-6xl"
          style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
        >
          Piff City
        </p>
        <div className="relative mt-4 h-12 w-48 sm:h-14 sm:w-56">
          <Image
            src={BLAKKHAIL_ASSETS.wordmark}
            alt="Blakk Hail wordmark"
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
      </div>
      <button
        type="button"
        className="absolute bottom-8 text-xs uppercase tracking-[0.3em] hover:opacity-80"
        style={{ color: BLAKKHAIL.steel }}
        onClick={onComplete}
      >
        Enter shop →
      </button>
    </div>
  );
}
