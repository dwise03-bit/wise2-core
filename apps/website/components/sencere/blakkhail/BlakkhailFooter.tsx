'use client';

import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailFooter() {
  return (
    <footer className="relative w-full bg-black border-t border-zinc-800">
      {/* Background Accent */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0, 217, 255, 0.1) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Blakk Hail
              </p>
              <p
                className="text-sm leading-relaxed text-gray-400"
                style={{ color: 'rgba(196, 163, 105, 0.8)' }}
              >
                Take Control • No Apologies<br />
                <span className="text-xs text-gray-500">Est. 1994</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Heritage streetwear designed for the culture. Original fashion since 1994.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-6">
              Shop
            </p>
            <ul className="space-y-3">
              <li>
                <a href="#collection" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  T-Shirts
                </a>
              </li>
              <li>
                <a href="#collection" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  Hoodies
                </a>
              </li>
              <li>
                <a href="#collection" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  Accessories
                </a>
              </li>
              <li>
                <a href="#collection" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  View All
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-6">
              Support
            </p>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/shipping" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="/returns" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-6">
              Connect
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={BLAKKHAIL_LEGACY.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={BLAKKHAIL_LEGACY.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={BLAKKHAIL_LEGACY.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a href="mailto:contact@blakkhail.com" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-500 text-center md:text-left">
            © 1994–2026 Blakk Hail. All rights reserved. | SenCere Creative LLC
          </p>

          {/* Bottom Links */}
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="/cookies" className="hover:text-gray-300 transition-colors">
              Cookies
            </a>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.15em] mb-2"
            style={{ color: '#C4A369' }}
          >
            Heritage Streetwear Since 1994
          </p>
          <p className="text-xs text-gray-600">
            Built for the culture. No apologies.
          </p>
        </div>
      </div>
    </footer>
  );
}
