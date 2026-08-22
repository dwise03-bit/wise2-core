'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Phone, ArrowRight } from 'lucide-react';
import { nav, company } from '@/lib/sencere/config';

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#8C6518]/30 bg-[#050505]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <Link href="/sencere" className="flex items-center gap-3 shrink-0">
          <Image
            src="/sencere/logo/sencere-icon-mark.png"
            alt="SenCere Creative LLC crest"
            width={44}
            height={42}
            className="h-10 w-auto"
            priority
          />
          <span className="leading-tight">
            <span
              className="block text-xl font-bold text-[#F7F7F7]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SenCere
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-[#D6A331]">
              CREATIVE LLC
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const isActive = item.href === '/sencere' ? pathname === '/sencere' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 text-xs font-semibold tracking-[0.12em] transition-colors ${
                  isActive ? 'text-[#D6A331]' : 'text-[#C8C8C8] hover:text-[#F1C65A]'
                }`}
              >
                <span className="relative pb-1">
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-[#D6A331]" />
                  )}
                </span>
                {item.label === 'SERVICES' && <ChevronDown className="h-3 w-3" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link
            href="/sencere/quote"
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-5 py-2.5 text-xs font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110"
          >
            GET A QUOTE
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <a
            href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1.5 rounded-md border border-[#D6A331] px-5 py-2.5 text-xs font-bold tracking-wide text-[#F7F7F7] transition hover:bg-[#D6A331]/10"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            BOOK A CALL
          </a>
        </div>

        <button
          type="button"
          className="rounded-md border border-[#8C6518]/50 p-2 text-[#F7F7F7] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="sencere-mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="sencere-mobile-nav" aria-label="Mobile" className="border-t border-[#8C6518]/30 bg-[#080808] px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block text-sm font-semibold tracking-wide ${
                    pathname === item.href ? 'text-[#D6A331]' : 'text-[#C8C8C8]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/sencere/quote"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-5 py-3 text-xs font-bold tracking-wide text-[#0a0a0a]"
            >
              GET A QUOTE <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-center gap-1.5 rounded-md border border-[#D6A331] px-5 py-3 text-xs font-bold tracking-wide text-[#F7F7F7]"
            >
              <Phone className="h-3.5 w-3.5" /> BOOK A CALL
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
