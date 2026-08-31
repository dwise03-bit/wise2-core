import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  variant?: 'lilac' | 'purple';
}

export function PageHero({ title, subtitle, variant = 'lilac' }: PageHeroProps) {
  const isPurple = variant === 'purple';

  return (
    <section
      className={
        isPurple
          ? 'bg-cc-purple text-white py-12 px-4'
          : 'bg-cc-lilac text-cc-dark py-12 px-4'
      }
    >
      <div className="max-w-6xl mx-auto text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-lora font-bold mb-3">{title}</h1>
        {subtitle ? (
          <p className={isPurple ? 'text-cc-lilac text-lg max-w-2xl' : 'text-cc-dark text-lg max-w-2xl'}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
