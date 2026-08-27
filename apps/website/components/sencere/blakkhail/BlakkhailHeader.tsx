'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export function BlakkhailHeader() {
  return (
    <div className="sticky top-0 z-50 bg-[#2a2a2a]">
      {/* Utility Bar */}
      <div className="flex h-8 items-center justify-between border-b border-[#D4842F] bg-[#1a1a1a] px-4 text-[11px] text-[#D4D4D4]">
        <div>EST. 1994 • ORIGINAL FASHION</div>
        <div className="flex gap-4">
          <span>Customer Service</span>
          <span>Track Order</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-[#D4842F] bg-[#E8D4B8] px-6 py-4">
        <div className="mx-auto max-w-[1536px]">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href="/sencere" className="flex items-center gap-2 text-[#2a2a2a] hover:opacity-70">
                <ArrowLeft size={20} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Back to SenCere</span>
              </Link>
              <div className="border-l border-[#8B6914] pl-8">
                <h1 className="text-[32px] font-black uppercase tracking-widest text-[#2a2a2a]" style={{ fontFamily: 'var(--font-headers)' }}>
                  BLAKK HAIL
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B6914]">1994 Original Fashion</p>
              </div>
            </div>

            {/* Cart */}
            <button className="flex items-center gap-2 rounded-sm bg-[#D4842F] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#C56F24]">
              <ShoppingCart size={16} />
              View Cart
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#2a2a2a] px-6">
        <div className="mx-auto max-w-[1536px]">
          <ul className="flex gap-8 py-3 text-[11px] font-bold uppercase tracking-wider text-[#D4D4D4]">
            <li><Link href="#products" className="hover:text-[#D4842F]">Collection</Link></li>
            <li><Link href="#story" className="hover:text-[#D4842F]">Our Story</Link></li>
            <li><Link href="#" className="hover:text-[#D4842F]">Contact</Link></li>
            <li><Link href="#" className="hover:text-[#D4842F]">Look Book</Link></li>
            <li><Link href="#" className="hover:text-[#D4842F]">Video</Link></li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
