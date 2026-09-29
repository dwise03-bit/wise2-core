'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black/98 backdrop-blur-xl border-b border-zinc-800/50" style={{
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 217, 255, 0.1)'
    }}>
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo - Premium */}
        <Link href="/" className="flex-shrink-0 group">
          <span
            className="text-3xl font-black uppercase tracking-tighter transition-all duration-300"
            style={{
              color: '#C4A369',
              textShadow: '0 0 20px rgba(196, 163, 105, 0.4), 0 4px 12px rgba(0,0,0,0.8)'
            }}
          >
            BH
          </span>
        </Link>

        {/* Desktop Navigation - Premium */}
        <div className="hidden md:flex items-center gap-12">
          {[
            { label: 'Collection', href: '#collection' },
            { label: 'Story', href: '#about' },
            { label: 'Culture', href: BLAKKHAIL_LEGACY.social.instagram }
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.label === 'Culture' ? '_blank' : undefined}
              className="text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-cyan-400 transition-all duration-300 relative group/nav"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent group-hover/nav:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Premium CTA + Menu */}
        <div className="flex items-center gap-6">
          <a
            href="#collection"
            className="hidden sm:inline-block px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 relative"
            style={{
              backgroundColor: '#00FF7F',
              color: '#050607',
              boxShadow: '0 0 30px rgba(0, 255, 127, 0.4), 0 10px 30px rgba(0, 0, 0, 0.5)',
              border: '2px solid #00FF7F'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 255, 127, 0.7), 0 15px 50px rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 127, 0.4), 0 10px 30px rgba(0, 0, 0, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Shop
          </a>

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3 6h18M3 12h18M3 18h18"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Premium */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/50 bg-black/98 backdrop-blur-xl" style={{
          boxShadow: 'inset 0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {['Collection', 'Story', 'Culture'].map((item) => (
              <a
                key={item}
                href={item === 'Culture' ? BLAKKHAIL_LEGACY.social.instagram : `#${item.toLowerCase()}`}
                target={item === 'Culture' ? '_blank' : undefined}
                className="block text-sm font-bold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-zinc-800">
              <a
                href="#collection"
                className="block w-full px-6 py-4 text-xs font-black uppercase tracking-widest text-center"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#050607',
                  boxShadow: '0 0 30px rgba(0, 255, 127, 0.4)'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop Collection
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
