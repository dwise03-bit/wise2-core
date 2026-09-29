'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Occasions', href: '/occasions' },
    { name: 'Business', href: '/business' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About CC', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-cc-white border-b border-cc-lavender sticky top-0 z-50 safe-top">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-4">
        <Link href="/" className="text-xl md:text-2xl font-lora font-bold text-cc-purple shrink-0">
          CC Craft & Create
        </Link>

        <nav className="hidden lg:flex gap-6 xl:gap-8" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cc-dark font-poppins font-semibold text-sm hover:text-cc-purple transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/cart"
            className="relative text-cc-dark hover:text-cc-purple transition-colors font-poppins font-semibold text-sm"
            aria-label={`Cart with ${itemCount} items`}
          >
            <span aria-hidden>🛒</span>
            {itemCount > 0 ? (
              <span className="absolute -top-2 -right-3 bg-cc-gold text-cc-dark text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="lg:hidden text-cc-dark text-2xl leading-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          className="lg:hidden bg-cc-lilac border-t border-cc-lavender p-4 flex flex-col gap-3"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cc-dark font-poppins font-semibold hover:text-cc-purple transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
};
