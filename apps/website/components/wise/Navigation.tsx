'use client';

import Link from 'next/link';
import { useState } from 'react';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/studio', label: 'Studio' },
    { href: '/live', label: 'Live' },
    { href: '/services', label: 'Services' },
    { href: '/process', label: 'Process' },
    { href: '/work', label: 'Work' },
    { href: '/heroes', label: 'Visionaries' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 group">
      {/* WISE² Black with Neon Green Border */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl border-b border-lime-400/30 group-hover:border-lime-400/50 transition-colors duration-300" />

      {/* Neon Glow Line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-lime-400/0 via-lime-400/30 to-lime-400/0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* WISE² Logo */}
          <Link href="/" className="text-2xl font-bold text-lime-400 hover:text-lime-300 transition-colors duration-300" style={{ fontFamily: 'Beyond The Mountains' }}>
            WISE<sup className="text-xs">²</sup>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-300 hover:text-lime-400 transition-colors duration-300 font-mono text-sm tracking-wider group/link"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 group-hover/link:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link
              href="/"
              className="px-6 py-2 relative group/btn rounded font-bold text-black hover:scale-105 transition-all duration-300 bg-lime-400"
            >
              <div className="absolute -inset-0.5 bg-lime-400/50 rounded blur opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
              <span className="relative">START</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-lime-400 p-2 hover:bg-lime-400/10 rounded-lg transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-lime-400/30 bg-black/80 backdrop-blur-sm -mx-4 px-4 rounded-b-xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-300 hover:text-lime-400 hover:pl-2 transition-all duration-300 font-mono text-sm"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              className="block mt-4 px-6 py-2 bg-lime-400 text-black font-bold rounded text-center transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              START
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
