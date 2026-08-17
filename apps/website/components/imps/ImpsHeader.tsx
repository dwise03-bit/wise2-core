'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';

export function ImpsHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-black via-black to-black/80 border-b border-blue-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-xl text-white">
              WISE<sup className="text-blue-400 text-xs">²</sup>
            </span>
            <span className="font-bold text-sm tracking-widest text-blue-400">IMPS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">HOME</a>
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">FEATURES</a>
            <a href="#specs" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">SPECS</a>
            <a href="#gallery" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">GALLERY</a>
            <a href="#shop" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">SHOP</a>
            <a href="#support" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">SUPPORT</a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 transition">
              <ShoppingCart size={20} className="text-blue-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">0</span>
            </button>
            <button className="hidden md:block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-black font-bold text-sm rounded-lg transition">
              PRE-ORDER NOW
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3 border-t border-blue-500/20 pt-4">
            <a href="#home" className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition py-2">HOME</a>
            <a href="#features" className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition py-2">FEATURES</a>
            <a href="#specs" className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition py-2">SPECS</a>
            <a href="#gallery" className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition py-2">GALLERY</a>
            <a href="#shop" className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition py-2">SHOP</a>
            <a href="#support" className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition py-2">SUPPORT</a>
            <button className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-black font-bold text-sm rounded-lg transition">
              PRE-ORDER NOW
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
