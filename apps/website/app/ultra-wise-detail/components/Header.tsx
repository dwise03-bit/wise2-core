'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'HOME', href: '#home' },
    { label: 'SERVICES', href: '#services' },
    { label: 'PACKAGES', href: '#packages' },
    { label: 'GALLERY', href: '#gallery' },
    { label: 'REVIEWS', href: '#reviews' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded border-2 border-orange-500 flex items-center justify-center">
              <div className="text-orange-500 font-black text-xs md:text-sm">UWD</div>
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="text-white font-black text-sm md:text-base leading-tight">
                ULTRA WISE
              </div>
              <div className="text-blue-500 font-black text-sm md:text-base leading-tight">
                DETAIL
              </div>
              <div className="text-gray-500 text-xs leading-none">
                PREMIUM DETAILING & AUTO RECON
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-bold text-gray-300 hover:text-orange-500 transition"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:block">
            <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm transition transform hover:scale-105">
              BOOK MY DETAIL
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-orange-500" />
            ) : (
              <Menu className="w-6 h-6 text-orange-500" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-900">
            <nav className="flex flex-col gap-3 pt-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-2 py-2 text-sm font-bold text-gray-300 hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button className="mt-3 w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm">
                BOOK MY DETAIL
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
