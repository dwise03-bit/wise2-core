'use client';

import Link from 'next/link';
import { useState } from 'react';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || '/dashboard';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/platform', label: 'Platform' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/powered-businesses', label: 'Powered Businesses' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 group">
      {/* WISE² Black with Electric Blue Border */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl border-b border-blue-500/30 group-hover:border-blue-500/50 transition-colors duration-300" style={{ borderBottomColor: 'rgba(0, 148, 255, 0.3)' }} />

      {/* Electric Blue Glow Line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 transition-all duration-300" style={{ backgroundImage: 'linear-gradient(to right, rgba(0, 148, 255, 0) 0%, rgba(0, 148, 255, 0.3) 50%, rgba(0, 148, 255, 0) 100%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* WISE² Logo */}
          <Link href="/" className="text-2xl font-bold transition-colors duration-300 flex items-center gap-0.5" style={{ color: '#0094FF', fontFamily: 'Beyond The Mountains' }}>
            WISE<sup className="text-xs">²</sup>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link: any) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-300 transition-colors duration-300 font-mono text-sm tracking-wide group/link"
                style={{ '--hover-color': '#0094FF' } as any}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover/link:w-full transition-all duration-300" style={{ backgroundColor: '#0094FF' }} />
              </Link>
            ))}
            <Link
              href={dashboardUrl}
              className="px-6 py-2 relative group/btn rounded-lg font-bold text-white hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: '#0094FF', boxShadow: '0 0 12px rgba(0, 148, 255, 0.3)' }}
            >
              <div className="absolute -inset-0.5 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition-all duration-300" style={{ backgroundColor: 'rgba(0, 148, 255, 0.3)' }} />
              <span className="relative">COMMAND CENTER</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
            style={{ color: '#0094FF' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t bg-black/80 backdrop-blur-sm -mx-4 px-4 rounded-b-xl transition-all duration-300" style={{ borderTopColor: 'rgba(0, 148, 255, 0.3)' }}>
            {links.map((link: any) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-300 hover:pl-2 transition-all duration-300 font-mono text-sm"
                style={{ color: 'rgb(209, 213, 219)' }}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={dashboardUrl}
              className="block mt-4 px-6 py-2 text-white font-bold rounded-lg text-center transition-all duration-300 w-full"
              style={{ backgroundColor: '#0094FF' }}
              onClick={() => setIsOpen(false)}
            >
              COMMAND CENTER
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
