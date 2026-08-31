import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'text-center mb-10 md:mb-12' : 'mb-8'}>
      {eyebrow ? (
        <p className="text-sm font-poppins font-bold uppercase tracking-widest text-cc-gold mb-2">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`text-3xl md:text-4xl font-lora font-bold ${
          light ? 'text-white' : 'text-cc-dark'
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-3 text-base md:text-lg max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          } ${light ? 'text-cc-lilac' : 'text-cc-dark/80'}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
