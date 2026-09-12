'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-pp-midnight border-t border-pp-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pp-gold to-pp-green flex items-center justify-center text-pp-dark text-sm font-bold">
                ✿
              </div>
              <div>
                <p className="text-pp-gold font-serif-header text-xs font-bold">PETALS</p>
                <p className="text-pp-cream font-serif-header text-xs -mt-1">& POTIONS</p>
              </div>
            </div>
            <p className="text-pp-cream/60 font-serif-display text-sm leading-relaxed">
              Your Ritual. Your Blend. Your Healing.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-serif-header font-bold text-pp-cream mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/blends" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Custom Blends
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Subscribe
                </Link>
              </li>
              <li>
                <Link href="/starter-kit" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Starter Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-serif-header font-bold text-pp-cream mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ritual-quiz" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Ritual Quiz
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  About Paige
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif-header font-bold text-pp-cream mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-pp-cream/60 hover:text-pp-gold font-serif-display text-sm transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pp-gold/20 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-pp-cream/40 font-serif-display text-xs text-center md:text-left mb-4 md:mb-0">
            &copy; 2024 Petals & Potions. All rights reserved. Made with love for your healing.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="text-pp-gold/60 hover:text-pp-gold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.29 20v-7.21H5.73V9.25h2.56V7.69c0-2.54 1.55-3.93 3.83-3.93 1.09 0 2.02.08 2.29.12v2.65h-1.57c-1.23 0-1.47.59-1.47 1.45v1.89h2.93l-.39 3.54h-2.54V20" />
              </svg>
            </a>
            <a href="#" className="text-pp-gold/60 hover:text-pp-gold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M19.5 4.1c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .7.1 1C7.7 7.1 4.6 5.5 2.5 3c-.3.5-.5 1.1-.5 1.7 0 1.5.7 2.8 1.9 3.6-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.1-1.1.1-.3 0-.6 0-.9-.1.6 1.9 2.3 3.2 4.3 3.3-1.4 1.1-3.2 1.7-5.1 1.7-.3 0-.7 0-1-.1 1.9 1.2 4.2 1.9 6.6 1.9 7.9 0 12.2-6.6 12.2-12.2 0-.2 0-.4 0-.6.8-.6 1.6-1.4 2.2-2.3" />
              </svg>
            </a>
            <a href="#" className="text-pp-gold/60 hover:text-pp-gold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm3.6 10c0 2-1.6 3.6-3.6 3.6S6.4 12 6.4 10 8 6.4 10 6.4s3.6 1.6 3.6 3.6zm1.6-5.8c0 .4-.4.8-.8.8s-.8-.4-.8-.8.4-.8.8-.8.8.4.8.8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
