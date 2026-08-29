'use client';

import Link from 'next/link';
import { Brand } from '@/lib/sencere/brands.config';

interface BrandSectionProps {
  brand: Brand;
}

export function BrandSection({ brand }: BrandSectionProps) {
  const isDark = brand.id === 'vandals';

  return (
    <div id={`${brand.id}-section`} className="scroll-mt-16">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#2a2a2a]">
        <div className={`h-8 items-center justify-between border-b flex border-[${brand.accentColor}] px-4 text-[11px] text-[#D4D4D4]`}
          style={{ borderColor: brand.accentColor }}>
          <div>EST. 1994 • ORIGINAL FASHION</div>
          <div className="flex gap-4">
            <span>Customer Service</span>
            <span>Track Order</span>
          </div>
        </div>
        <div className="border-b px-6 py-4" style={{ backgroundColor: brand.headerBg, borderColor: brand.accentColor }}>
          <div className="mx-auto max-w-[1536px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/sencere" className="flex items-center gap-2 hover:opacity-70"
                  style={{ color: isDark ? '#F5E6D3' : '#2a2a2a' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider">← Back to SenCere</span>
                </Link>
                <div className="border-l pl-8" style={{ borderColor: isDark ? '#E8A23A' : '#8B6914' }}>
                  <h1 className="text-[32px] font-black uppercase tracking-widest"
                    style={{ color: isDark ? '#F5E6D3' : '#2a2a2a', fontFamily: 'var(--font-headers)' }}>
                    {brand.name}
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: isDark ? '#E8A23A' : '#8B6914' }}>
                    {brand.tagline}
                  </p>
                </div>
              </div>
              <button
                className="flex items-center gap-2 rounded-sm px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-all min-h-[44px] min-w-[12rem] hover:opacity-90 focus:ring-2 focus:ring-offset-2 active:scale-95"
                style={{ backgroundColor: brand.accentColor, color: isDark ? '#F5E6D3' : '#fff', focusRingColor: brand.accentColor }}
                aria-label={`Shop ${brand.name}`}>
                <span>🛍</span> SHOP NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#1a1a1a] py-16 lg:py-24">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="text-[2.5rem] font-black uppercase leading-tight tracking-tight"
                style={{ color: brand.accentColor, fontFamily: 'var(--font-headers)' }}>
                {brand.name}
              </h2>
              <p className="mt-4 text-[12px] font-bold uppercase tracking-widest" style={{ color: brand.accentColor }}>
                {brand.tagline}
              </p>
              <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-[#D4D4D4]">
                {brand.description}
              </p>
              <div className="mt-8 flex gap-4">
                <button
                  className="px-6 py-3 text-sm font-black uppercase tracking-wide transition min-h-[44px] hover:opacity-90 focus:ring-2 focus:ring-offset-2 active:scale-95 rounded"
                  style={{ backgroundColor: brand.accentColor, color: '#1a1a1a' }}
                  aria-label={`Shop ${brand.name}`}>
                  SHOP {brand.name.split(' ')[0]}
                </button>
                <button
                  className="border-2 px-6 py-3 text-sm font-black uppercase tracking-wide transition min-h-[44px] hover:opacity-80 focus:ring-2 focus:ring-offset-2 active:scale-95 rounded"
                  style={{ borderColor: brand.accentColor, color: brand.accentColor }}
                  aria-label={`Explore ${brand.name}`}>
                  EXPLORE
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="aspect-square rounded-lg bg-[#2a2a2a] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[80px] font-black opacity-20" style={{ color: brand.accentColor }}>
                    {brand.name[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-[#1a1a1a] py-12 lg:py-16">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <div className="mb-12 text-center">
            <h2 className="text-[36px] font-black uppercase tracking-wider" style={{ color: brand.accentColor, fontFamily: 'var(--font-headers)' }}>
              SHOP {brand.name}
            </h2>
            <p className="mt-4 text-[12px] uppercase tracking-widest text-[#D4D4D4]">
              {brand.tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.products.map((product) => (
              <Link key={product.id} href={`/sencere/products/${product.id}`}
                className="group relative overflow-hidden border-2 transition-all duration-300"
                style={{ borderColor: brand.accentColor }}>
                <div className="aspect-square bg-gradient-to-br flex items-center justify-center"
                  style={{ from: isDark ? '#2a1a3a' : '#2a2a2a', to: '#1a1a1a' }}>
                  <div className="text-center">
                    <div className="text-[48px] font-black opacity-20 group-hover:opacity-30 transition-opacity"
                      style={{ color: brand.accentColor }}>
                      {product.id}
                    </div>
                  </div>
                </div>
                <div className="bg-[#0f0f0f] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: brand.accentColor }}>
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-[13px] font-bold uppercase leading-snug text-[#F5E6D3]">
                    {product.name}
                  </h3>
                  <p className="mt-3 text-[12px] font-bold" style={{ color: brand.accentColor }}>
                    {product.price}
                  </p>
                  <button
                    className="mt-4 w-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:opacity-80 focus:ring-2 focus:ring-offset-1 active:scale-95 min-h-[44px] flex items-center justify-center"
                    style={{ borderColor: brand.accentColor, color: brand.accentColor }}
                    aria-label={`Get access to ${product.name}`}>
                    GET ACCESS
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] py-12 text-center" style={{ borderTop: `2px solid ${brand.accentColor}` }}>
        <div className="mx-auto max-w-[1536px] px-6">
          <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: brand.accentColor }}>
            © {new Date().getFullYear()} {brand.name}
          </p>
          <p className="mt-2 text-[10px] text-[#666]">
            Part of the SenCere Creative LLC ecosystem
          </p>
        </div>
      </footer>
    </div>
  );
}
