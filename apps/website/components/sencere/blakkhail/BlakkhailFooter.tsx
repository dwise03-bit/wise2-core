'use client';

import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

export function BlakkhailFooter() {
  return (
    <footer className="bg-[#0f0f0f] py-12">
      <div className="mx-auto max-w-[1536px] px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Brand Info */}
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-[#D4842F]">
              BLAKK HAIL
            </h3>
            <p className="mt-4 text-[11px] leading-relaxed text-[#D4D4D4]">
              Original fashion since 1994. Defining culture through authentic style and heritage.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#D4842F]">Shop</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#D4842F]">New Arrivals</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Apparel</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Accessories</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Sale</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#D4842F]">Support</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#D4842F]">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Returns</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">FAQ</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#D4842F]">About</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#D4842F]">Our Story</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Heritage</Link></li>
              <li><Link href="/sencere" className="hover:text-[#D4842F]">SenCere Creative</Link></li>
              <li><Link href="#" className="hover:text-[#D4842F]">Press</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#D4842F]">Follow</h4>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-[#D4D4D4] hover:text-[#D4842F] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#D4842F] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#D4842F] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#D4842F] transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#D4842F] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-[10px] text-[#D4D4D4] lg:flex-row">
            <p>© 1994-2026 BLAKK HAIL. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#D4842F]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#D4842F]">Terms of Service</Link>
              <Link href="#" className="hover:text-[#D4842F]">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
