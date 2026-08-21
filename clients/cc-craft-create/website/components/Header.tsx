'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: 'Shop', href: '/shop' },
    { name: 'Occasions', href: '/occasions' },
    { name: 'Business', href: '/business' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-cc-white border-b border-cc-lavender sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-lora font-bold text-cc-purple">
          CC Craft & Create
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cc-dark font-poppins font-semibold hover:text-cc-purple transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-cc-dark hover:text-cc-purple transition-colors">
            🛒 Cart
          </Link>
          <button
            className="md:hidden text-cc-dark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-cc-lilac border-t border-cc-lavender p-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cc-dark font-poppins font-semibold hover:text-cc-purple transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};
