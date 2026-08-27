'use client';

import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

export function VandalsFooter() {
  return (
    <footer className="bg-[#0f0f0f] py-12">
      <div className="mx-auto max-w-[1536px] px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Brand Info */}
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-[#5B2D7F]">
              VANDALS
            </h3>
            <p className="mt-4 text-[11px] leading-relaxed text-[#D4D4D4]">
              Piff City Vandals. Where rebellion meets art. The underground collective.
            </p>
          </div>

          {/* Releases */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5B2D7F]">Releases</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#5B2D7F]">Latest Drops</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Apparel</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Limited Editions</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Archive</Link></li>
            </ul>
          </div>

          {/* Movement */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5B2D7F]">Movement</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#5B2D7F]">Manifesto</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Artists</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Collective</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Collaborate</Link></li>
            </ul>
          </div>

          {/* Network */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5B2D7F]">Network</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#5B2D7F]">Get in Touch</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Support</Link></li>
              <li><Link href="/sencere" className="hover:text-[#5B2D7F]">SenCere Creative</Link></li>
              <li><Link href="#" className="hover:text-[#5B2D7F]">Underground</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5B2D7F]">Connect</h4>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-[#D4D4D4] hover:text-[#5B2D7F] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#5B2D7F] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#5B2D7F] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#5B2D7F] transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#5B2D7F] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-[10px] text-[#D4D4D4] lg:flex-row">
            <p>© PIFF CITY VANDALS. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#5B2D7F]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#5B2D7F]">Terms</Link>
              <Link href="#" className="hover:text-[#5B2D7F]">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
