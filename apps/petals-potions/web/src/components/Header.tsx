'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-pp-dark/95 backdrop-blur border-b border-pp-gold/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pp-gold to-pp-green flex items-center justify-center text-pp-dark font-bold text-lg group-hover:scale-110 transition-transform">
            ✿
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-pp-gold font-serif-header text-sm font-bold">PETALS</span>
            <span className="text-pp-cream font-serif-header text-xs -mt-1">& POTIONS</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-pp-cream hover:text-pp-gold transition-colors font-serif-display">
            Products
          </Link>
          <Link href="/ritual-quiz" className="text-pp-cream hover:text-pp-gold transition-colors font-serif-display">
            Ritual Quiz
          </Link>
          <Link href="/blends" className="text-pp-cream hover:text-pp-gold transition-colors font-serif-display">
            Custom Blends
          </Link>
          <Link href="/subscription" className="text-pp-cream hover:text-pp-gold transition-colors font-serif-display">
            Subscribe
          </Link>
          <Link href="/about" className="text-pp-cream hover:text-pp-gold transition-colors font-serif-display">
            Our Story
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative p-2">
            <svg className="w-6 h-6 text-pp-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-pp-gold text-pp-purple text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0</span>
          </Link>
          <Link href="/account" className="btn-secondary text-sm">
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-pp-gold hover:bg-pp-gold/10 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-pp-gold/20 bg-pp-navy/50 backdrop-blur">
          <div className="px-4 py-4 space-y-3">
            <Link href="/products" className="block text-pp-cream hover:text-pp-gold transition-colors py-2">
              Products
            </Link>
            <Link href="/ritual-quiz" className="block text-pp-cream hover:text-pp-gold transition-colors py-2">
              Ritual Quiz
            </Link>
            <Link href="/blends" className="block text-pp-cream hover:text-pp-gold transition-colors py-2">
              Custom Blends
            </Link>
            <Link href="/subscription" className="block text-pp-cream hover:text-pp-gold transition-colors py-2">
              Subscribe
            </Link>
            <Link href="/about" className="block text-pp-cream hover:text-pp-gold transition-colors py-2">
              Our Story
            </Link>
            <div className="pt-4 border-t border-pp-gold/20 flex gap-3">
              <Link href="/account" className="flex-1 btn-secondary text-sm text-center">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
