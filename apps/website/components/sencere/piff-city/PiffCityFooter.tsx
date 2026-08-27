'use client';

import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

export function PiffCityFooter() {
  return (
    <footer className="bg-[#0f0f0f] py-12">
      <div className="mx-auto max-w-[1536px] px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Brand Info */}
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-[#E8A23A]">
              PIFF CITY
            </h3>
            <p className="mt-4 text-[11px] leading-relaxed text-[#D4D4D4]">
              The lifestyle brand defining culture and creating the future. Own it.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E8A23A]">Shop</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#E8A23A]">New Drops</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Featured</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Apparel</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Accessories</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E8A23A]">Community</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#E8A23A]">Join Us</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Gallery</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Events</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Partners</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E8A23A]">Support</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[#D4D4D4]">
              <li><Link href="#" className="hover:text-[#E8A23A]">Contact</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">FAQ</Link></li>
              <li><Link href="/sencere" className="hover:text-[#E8A23A]">SenCere Creative</Link></li>
              <li><Link href="#" className="hover:text-[#E8A23A]">Press</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E8A23A]">Follow</h4>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-[#D4D4D4] hover:text-[#E8A23A] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#E8A23A] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#E8A23A] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-[#D4D4D4] hover:text-[#E8A23A] transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#E8A23A] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-[10px] text-[#D4D4D4] lg:flex-row">
            <p>© PIFF CITY. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#E8A23A]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#E8A23A]">Terms of Service</Link>
              <Link href="#" className="hover:text-[#E8A23A]">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
