'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export function VandalsHeader() {
  return (
    <div className="sticky top-0 z-50 bg-[#1a1a1a]">
      {/* Utility Bar */}
      <div className="flex h-8 items-center justify-between border-b border-[#5B2D7F] bg-[#0f0f0f] px-4 text-[11px] text-[#D4D4D4]">
        <div>PIFF CITY VANDALS • THE UNDERGROUND</div>
        <div className="flex gap-4">
          <span>Inquire</span>
          <span>Connect</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-[#5B2D7F] bg-gradient-to-r from-[#1a1a1a] via-[#2a1a3a] to-[#1a1a1a] px-6 py-6">
        <div className="mx-auto max-w-[1536px]">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href="/sencere" className="flex items-center gap-2 text-[#5B2D7F] hover:opacity-70">
                <ArrowLeft size={20} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Back to SenCere</span>
              </Link>
              <div className="border-l border-[#5B2D7F] pl-8">
                <h1 className="text-[36px] font-black uppercase tracking-widest text-[#5B2D7F]" style={{ fontFamily: 'var(--font-headers)' }}>
                  VANDALS
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4D4D4]">The Rebels. The Art. The Underground.</p>
              </div>
            </div>

            {/* CTA */}
            <button className="flex items-center gap-2 rounded-sm bg-[#5B2D7F] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#6B3D8F]">
              <ShoppingCart size={16} />
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#1a1a1a] px-6">
        <div className="mx-auto max-w-[1536px]">
          <ul className="flex gap-8 py-3 text-[11px] font-bold uppercase tracking-wider text-[#D4D4D4]">
            <li><Link href="#products" className="hover:text-[#5B2D7F]">Releases</Link></li>
            <li><Link href="#story" className="hover:text-[#5B2D7F]">Manifesto</Link></li>
            <li><Link href="#" className="hover:text-[#5B2D7F]">Art</Link></li>
            <li><Link href="#" className="hover:text-[#5B2D7F]">Rebels</Link></li>
            <li><Link href="#" className="hover:text-[#5B2D7F]">Connect</Link></li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
