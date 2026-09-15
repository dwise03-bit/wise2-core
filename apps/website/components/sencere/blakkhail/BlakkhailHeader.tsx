'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <span
            className="text-2xl font-black uppercase tracking-tighter transition-all duration-300"
            style={{
              color: '#C4A369',
              textShadow: '0 0 10px rgba(196, 163, 105, 0.2)'
            }}
          >
            BH
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          <a href="#collection" className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors">
            Collection
          </a>
          <a href="#about" className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors">
            Story
          </a>
          <a
            href={BLAKKHAIL_LEGACY.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors"
          >
            Culture
          </a>
        </div>

        {/* CTA Button + Menu Toggle */}
        <div className="flex items-center gap-6">
          <a
            href="#collection"
            className="hidden sm:inline-block px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300"
            style={{
              backgroundColor: '#050607',
              color: '#00FF7F',
              border: '1px solid #00FF7F',
              boxShadow: '0 0 20px rgba(0, 255, 127, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00FF7F';
              e.currentTarget.style.color = '#050607';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#050607';
              e.currentTarget.style.color = '#00FF7F';
            }}
          >
            Shop
          </a>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3 6h18M3 12h18M3 18h18"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black/98 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            <a
              href="#collection"
              className="block text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collection
            </a>
            <a
              href="#about"
              className="block text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Story
            </a>
            <a
              href={BLAKKHAIL_LEGACY.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              Culture
            </a>
            <div className="pt-4 border-t border-zinc-800">
              <a
                href="#collection"
                className="block w-full px-6 py-3 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#050607'
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
