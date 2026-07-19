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
    <nav className="fixed w-full top-0 z-50 group">
      {/* Background with Glass Effect */}
      <div className="absolute inset-0 bg-wise-bg-primary/90 backdrop-blur-xl border-b border-wise-accent-green/30 group-hover:border-wise-accent-green/50 transition-colors duration-300" />

      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-wise-accent-green/0 via-wise-accent-green/20 to-wise-accent-green/0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-wise-accent-green font-display hover:text-white transition-colors duration-300">
            W²
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-wise-text-primary hover:text-wise-accent-green transition-colors duration-300 font-display group/link"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-wise-accent-green group-hover/link:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link
              href="/start-your-build"
              className="px-6 py-2 relative group/btn rounded-lg font-bold text-wise-bg-primary hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-wise-accent-green rounded-lg group-hover/btn:bg-white transition-all duration-300" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-wise-accent-green to-wise-accent-green rounded-lg opacity-0 group-hover/btn:opacity-100 blur transition-all duration-300" />
              <span className="relative">✦ Start</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-wise-accent-green p-2 hover:bg-wise-accent-green/10 rounded-lg transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-wise-accent-green/30 bg-wise-bg-primary/50 backdrop-blur-sm -mx-4 px-4 rounded-b-xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-wise-text-primary hover:text-wise-accent-green hover:pl-2 transition-all duration-300 font-display"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/start-your-build"
              className="block mt-4 px-6 py-2 bg-wise-accent-green/80 hover:bg-wise-accent-green text-wise-bg-primary font-bold rounded-lg text-center transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              ✦ Start Build
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
