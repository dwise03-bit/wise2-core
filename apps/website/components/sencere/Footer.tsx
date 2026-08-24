import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { company } from '@/lib/sencere/config';
import { TikTokIcon } from './icons';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#D4842F]/20 bg-[#0f0f0f]">
      <div className="mx-auto max-w-[1536px] px-6 py-12 sm:px-10 lg:py-16">
        {/* 5-Column Footer Grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Column 1: Brand + Tagline */}
          <div>
            <h3
              className="text-[16px] font-black uppercase tracking-wider text-[#F5E6D3]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SENCERE
              <br />
              CREATIVE LLC
            </h3>
            <p className="mt-3 text-[11px] leading-relaxed text-[#999]">
              STAY LIT.<br />
              STAY LOYAL.<br />
              STAY PIFF.
            </p>
          </div>

          {/* Column 2: SHOP */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#E8A23A]">SHOP</h4>
            <ul className="mt-4 space-y-2 text-[12px] text-[#D4D4D4]">
              <li>
                <Link href="/sencere/products" className="transition hover:text-[#E8A23A]">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/sencere/apparel" className="transition hover:text-[#E8A23A]">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/sencere/collections" className="transition hover:text-[#E8A23A]">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/sencere/hats" className="transition hover:text-[#E8A23A]">
                  Hats
                </Link>
              </li>
              <li>
                <Link href="/sencere/accessories" className="transition hover:text-[#E8A23A]">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#E8A23A]">
              COMPANY
            </h4>
            <ul className="mt-4 space-y-2 text-[12px] text-[#D4D4D4]">
              <li>
                <Link href="/sencere/about" className="transition hover:text-[#E8A23A]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/sencere/story" className="transition hover:text-[#E8A23A]">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/sencere/brand" className="transition hover:text-[#E8A23A]">
                  Brand Statement
                </Link>
              </li>
              <li>
                <Link href="/sencere/lookbook" className="transition hover:text-[#E8A23A]">
                  Lookbook
                </Link>
              </li>
              <li>
                <Link href="/sencere/contact" className="transition hover:text-[#E8A23A]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#E8A23A]">HELP</h4>
            <ul className="mt-4 space-y-2 text-[12px] text-[#D4D4D4]">
              <li>
                <Link href="/sencere/faq" className="transition hover:text-[#E8A23A]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/sencere/shipping" className="transition hover:text-[#E8A23A]">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="transition hover:text-[#E8A23A]">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: SOCIAL + INFO */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#E8A23A]">
              CONNECT
            </h4>
            <div className="mt-4 flex items-center gap-3">
              {company.social.instagram && (
                <a
                  href={company.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4842F]/30 text-[#D4D4D4] transition hover:border-[#E8A23A] hover:text-[#E8A23A]"
                  aria-label="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                </a>
              )}
              {company.social.tiktok && (
                <a
                  href={company.social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4842F]/30 text-[#D4D4D4] transition hover:border-[#E8A23A] hover:text-[#E8A23A]"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {company.social.youtube && (
                <a
                  href={company.social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4842F]/30 text-[#D4D4D4] transition hover:border-[#E8A23A] hover:text-[#E8A23A]"
                  aria-label="YouTube"
                >
                  <Youtube className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#999]">{company.location}</p>
            <p className="text-[11px] text-[#999]">{company.phone}</p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-[#D4842F]/15 py-4 text-center text-[10px] text-[#666]">
        © {currentYear} {company.name}. Powered by{' '}
        <Link href="https://wise2.net" className="text-[#E8A23A] transition hover:underline">
          WISE²
        </Link>
        .
      </div>
    </footer>
  );
}
