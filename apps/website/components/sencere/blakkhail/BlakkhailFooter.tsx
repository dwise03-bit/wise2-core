'use client';

import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailFooter() {
  return (
    <footer className="relative w-full bg-black border-t border-zinc-800" style={{
      boxShadow: 'inset 0 10px 40px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(0, 217, 255, 0.1) 0%, transparent 70%)'
      }} />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
        {/* Premium Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Section - Premium */}
          <div className="col-span-1 space-y-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Brand</p>
              <p
                className="text-4xl font-black uppercase leading-tight tracking-tighter"
                style={{
                  color: '#C4A369',
                  textShadow: '0 4px 15px rgba(0, 0, 0, 0.8)'
                }}
              >
                Blakk<br />Hail
              </p>
              <p className="text-xs text-gray-500 mt-4 uppercase tracking-wider" style={{ color: '#00D9FF' }}>
                Take Control • No Apologies
              </p>
              <p className="text-xs text-gray-600 mt-2">Est. 1994</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Heritage streetwear designed for the culture. Original fashion since 1994.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">Shop</p>
            <ul className="space-y-4">
              {['T-Shirts', 'Hoodies', 'Accessories', 'View All'].map((item) => (
                <li key={item}>
                  <a href="#collection" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">Support</p>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Shipping', 'Returns'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">Connect</p>
            <ul className="space-y-4">
              {[
                { name: 'Instagram', url: BLAKKHAIL_LEGACY.social.instagram },
                { name: 'Twitter', url: BLAKKHAIL_LEGACY.social.twitter },
                { name: 'Discord', url: BLAKKHAIL_LEGACY.social.discord },
                { name: 'Email', url: 'mailto:contact@blakkhail.com' }
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-cyan-400 transition-colors font-medium"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider - Premium */}
        <div className="border-t border-zinc-800/50 my-16" style={{
          boxShadow: '0 1px 10px rgba(196, 163, 105, 0.1)'
        }} />

        {/* Bottom Footer - Premium */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xs text-gray-500 text-center md:text-left font-medium">
            © 1994–2026 Blakk Hail. All rights reserved. | SenCere Creative LLC
          </p>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors font-medium">Privacy</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-gray-300 transition-colors font-medium">Terms</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-gray-300 transition-colors font-medium">Cookies</a>
          </div>
        </div>

        {/* Premium Heritage Badge */}
        <div className="mt-16 pt-12 border-t border-zinc-800/50 text-center">
          <p
            className="text-xs font-black uppercase tracking-[0.2em] mb-3"
            style={{
              color: '#C4A369',
              textShadow: '0 0 15px rgba(196, 163, 105, 0.3)'
            }}
          >
            Heritage Streetwear Since 1994
          </p>
          <p className="text-xs text-gray-600 tracking-wide">
            Built for the culture. No apologies. No limits.
          </p>
        </div>
      </div>
    </footer>
  );
}
