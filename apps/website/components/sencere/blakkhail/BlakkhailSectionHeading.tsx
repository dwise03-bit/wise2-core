'use client';

import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

interface BlakkhailSectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
}

export function BlakkhailSectionHeading({
  eyebrow,
  title,
  align = 'center',
}: BlakkhailSectionHeadingProps) {
  return (
    <div
      className={`${BLAKKHAIL_LAYOUT.container} mb-6 sm:mb-8 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <p className="text-xs uppercase tracking-[0.35em] sm:text-sm" style={{ color: BLAKKHAIL.gold }}>
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl lg:text-5xl"
        style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
    </div>
  );
}
