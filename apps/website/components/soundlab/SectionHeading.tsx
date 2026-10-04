'use client';

import { motion } from 'framer-motion';

interface SectionHeadingProps {
  /** Two-digit index shown as an editorial marker, e.g. "02". */
  index?: string;
  /** Small uppercase eyebrow above the title. */
  kicker?: string;
  /** Leading white portion of the title. */
  title: string;
  /** Gold-highlighted trailing word(s). */
  highlight?: string;
  /** Optional supporting line under the title. */
  sub?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  index,
  kicker,
  title,
  highlight,
  sub,
  align = 'center',
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-12 md:mb-16 ${isCenter ? 'text-center mx-auto max-w-2xl' : 'text-left max-w-3xl'}`}
    >
      {(index || kicker) && (
        <div
          className={`flex items-center gap-3 mb-4 ${isCenter ? 'justify-center' : 'justify-start'}`}
        >
          {index && (
            <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-[#b08d57]">
              {index}
            </span>
          )}
          <span className="h-px w-8 bg-gradient-to-r from-[#b08d57] to-transparent" />
          {kicker && (
            <span className="text-[11px] font-bold tracking-[0.3em] text-gray-500 uppercase">
              {kicker}
            </span>
          )}
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.02]">
        <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          {title}
        </span>{' '}
        {highlight && (
          <span className="text-[#b08d57] drop-shadow-[0_0_18px_rgba(176,141,87,0.4)]">
            {highlight}
          </span>
        )}
      </h2>

      {sub && (
        <p className={`mt-4 text-sm md:text-base text-gray-400 leading-relaxed ${isCenter ? 'mx-auto' : ''}`}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}
