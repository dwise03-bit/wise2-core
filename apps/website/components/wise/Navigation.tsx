'use client';

import Link from 'next/link';
import { useState } from 'react';
import { branding } from '@/data/wise2-content';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/worlds', label: 'Our Worlds' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/process', label: 'Process' },
    { href: '/work', label: 'Work' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-wise-bg-primary/80 border-b border-wise-accent-green-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-wise-accent-green font-display">
            W²
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-wise-text-primary hover:text-wise-accent-green transition-colors font-display"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/intake"
              className="px-6 py-2 bg-wise-accent-green text-wise-bg-primary font-bold rounded hover:brightness-110 transition-all"
            >
              Start
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-wise-accent-green p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-wise-accent-green-border">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-wise-text-primary hover:text-wise-accent-green transition-colors font-display"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/intake"
              className="block mt-4 px-6 py-2 bg-wise-accent-green text-wise-bg-primary font-bold rounded text-center"
              onClick={() => setIsOpen(false)}
            >
              Start Project
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
