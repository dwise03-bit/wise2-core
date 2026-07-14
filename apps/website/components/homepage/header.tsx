'use client';

import React from 'react';
import { Button } from '@wise2/design-system/components';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-wise-border-subtle bg-wise-bg/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-wise-primary to-wise-primary-active rounded flex items-center justify-center font-bold text-white text-sm">
            W2
          </div>
          <span className="font-bold text-lg hidden sm:inline text-wise-text-primary">WISE²</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-wise-text-primary">
          <a href="/live-studio" className="hover:text-wise-primary transition">LIVE STUDIO</a>
          <a href="/live-streaming" className="hover:text-wise-primary transition">LIVE STREAMING</a>
          <a href="#products" className="hover:text-wise-primary transition">PRODUCTS</a>
          <a href="#pricing" className="hover:text-wise-primary transition">PRICING</a>
          <a href="#company" className="hover:text-wise-primary transition">COMPANY</a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="small">
            LOGIN
          </Button>
          <Button variant="primary" size="small">
            START FREE
          </Button>
        </div>
      </div>
    </header>
  );
}
