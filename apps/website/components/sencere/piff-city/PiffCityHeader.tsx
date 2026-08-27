'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export function PiffCityHeader() {
  return (
    <div className="sticky top-0 z-50 bg-[#1a1a1a]">
      {/* Utility Bar */}
      <div className="flex h-8 items-center justify-between border-b border-[#E8A23A] bg-[#0f0f0f] px-4 text-[11px] text-[#D4D4D4]">
        <div>PIFF CITY • THE FLAGSHIP BRAND</div>
        <div className="flex gap-4">
          <span>Customer Service</span>
          <span>Track Order</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-[#E8A23A] bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] px-6 py-6">
        <div className="mx-auto max-w-[1536px]">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href="/sencere" className="flex items-center gap-2 text-[#E8A23A] hover:opacity-70">
                <ArrowLeft size={20} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Back to SenCere</span>
              </Link>
              <div className="border-l border-[#E8A23A] pl-8">
                <h1 className="text-[40px] font-black uppercase tracking-widest text-[#E8A23A]" style={{ fontFamily: 'var(--font-headers)' }}>
                  PIFF CITY
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4D4D4]">The Lifestyle. The Culture. The Future.</p>
              </div>
            </div>

            {/* Cart */}
            <button className="flex items-center gap-2 rounded-sm bg-[#E8A23A] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0f0f0f] transition-all hover:bg-[#F5B24A]">
              <ShoppingCart size={16} />
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#1a1a1a] px-6">
        <div className="mx-auto max-w-[1536px]">
          <ul className="flex gap-8 py-3 text-[11px] font-bold uppercase tracking-wider text-[#D4D4D4]">
            <li><Link href="#products" className="hover:text-[#E8A23A]">Shop</Link></li>
            <li><Link href="#story" className="hover:text-[#E8A23A]">About</Link></li>
            <li><Link href="#" className="hover:text-[#E8A23A]">Gallery</Link></li>
            <li><Link href="#" className="hover:text-[#E8A23A]">Community</Link></li>
            <li><Link href="#" className="hover:text-[#E8A23A]">Contact</Link></li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
