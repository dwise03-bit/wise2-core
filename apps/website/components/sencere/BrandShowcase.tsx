'use client';

import Link from 'next/link';

const brands = [
  {
    id: 'blakkhail',
    name: 'BLAKKHAIL',
    tagline: 'LEGACY / ORIGIN',
    description: 'The foundation.\nThe history.\nThe real.',
    href: '#blakkhail-section',
    buttonText: 'EXPLORE BLAKKHAIL',
    accentColor: '#D4842F',
  },
  {
    id: 'piff-city',
    name: 'PIFF CITY',
    tagline: 'THE FLAGSHIP BRAND',
    description: 'The lifestyle.\nThe culture.\nThe future.',
    href: '#piff-city-section',
    buttonText: 'SHOP PIFF CITY',
    accentColor: '#E8A23A',
  },
  {
    id: 'vandals',
    name: 'VANDALS',
    tagline: 'UNDERGROUND REBELLION',
    description: 'The rebels.\nThe art.\nThe vandals.',
    href: '#vandals-section',
    buttonText: 'EXPLORE VANDALS',
    accentColor: '#5B2D7F',
  },
];

export function BrandShowcase() {
  return (
    <section className="relative bg-[#0f0f0f] py-16 lg:py-24">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2
            className="text-[32px] font-bold uppercase leading-tight tracking-wider text-[#F5E6D3] sm:text-[40px]"
            style={{ fontFamily: 'var(--font-headers)' }}
          >
            OUR BRANDS. ONE MOVEMENT.
          </h2>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {brands.map((brand) => (
            <div key={brand.id} className="group relative">
              {/* Card Background with border */}
              <div
                className="relative overflow-hidden border-2 transition-all duration-300"
                style={{
                  borderColor: brand.accentColor,
                  backgroundColor: '#1a1a1a',
                }}
              >
                {/* Content overlay */}
                <div className="relative z-10 flex h-80 flex-col items-center justify-center px-6 py-12 text-center lg:h-96">
                  {/* Brand name */}
                  <h3
                    className="whitespace-pre-line text-[24px] font-black uppercase leading-tight tracking-wider"
                    style={{
                      fontFamily: 'var(--font-headers)',
                      color: brand.accentColor,
                    }}
                  >
                    {brand.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className="mt-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: brand.accentColor }}
                  >
                    {brand.tagline}
                  </p>

                  {/* Description */}
                  <p className="mt-6 whitespace-pre-line text-[12px] leading-relaxed text-[#D4D4D4]">
                    {brand.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={brand.href}
                    className="mt-8 border-2 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:bg-opacity-10"
                    style={{
                      borderColor: brand.accentColor,
                      color: brand.accentColor,
                    }}
                  >
                    {brand.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
