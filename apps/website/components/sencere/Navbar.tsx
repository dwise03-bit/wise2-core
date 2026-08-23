'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, ShoppingBag } from 'lucide-react';
import { nav } from '@/lib/sencere/config';

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Utility bar */}
      <div className="border-b border-[#D4842F]/20 bg-[#1a1a1a] px-6 py-2 text-[10px] uppercase tracking-widest text-[#999] sm:px-10">
        <div className="mx-auto flex max-w-[1536px] items-center justify-end gap-6">
          <a href="#search" className="transition hover:text-[#E8A23A]">
            SEARCH
          </a>
          <a href="#account" className="transition hover:text-[#E8A23A]">
            ACCOUNT
          </a>
          <a href="#cart" className="flex items-center gap-1 transition hover:text-[#E8A23A]">
            CART <span className="ml-1 text-xs">🥦</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[#D4842F]/20 bg-[#1a1a1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          {/* Logo */}
          <Link href="/sencere" className="flex items-center gap-2 shrink-0">
            <Image
              src="/sencere/logo/sencere-icon-mark.png"
              alt="SenCere Creative LLC"
              width={36}
              height={36}
              className="h-9 w-auto"
              priority
            />
            <span className="hidden leading-tight sm:block">
              <span
                className="block text-lg font-black text-[#F5E6D3]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SenCere
              </span>
              <span className="block text-[8px] font-bold tracking-[0.15em] text-[#E8A23A]">
                CREATIVE LLC
              </span>
            </span>
          </Link>

          {/* Nav menu */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {nav.map((item) => {
              const isActive = item.href === '/sencere' ? pathname === '/sencere' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-[#E8A23A]' : 'text-[#D4D4D4] hover:text-[#E8A23A]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <button
              type="button"
              className="text-[#D4D4D4] transition hover:text-[#E8A23A]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="text-[#D4D4D4] transition hover:text-[#E8A23A]"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="relative text-[#D4D4D4] transition hover:text-[#E8A23A]"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8A23A] text-[8px] font-bold text-[#1a1a1a]">
                0
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded p-2 text-[#D4D4D4] transition hover:bg-[#D4842F]/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="sencere-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav id="sencere-mobile-nav" aria-label="Mobile" className="border-t border-[#D4842F]/20 bg-[#0f0f0f] px-6 py-4 lg:hidden">
            <ul className="flex flex-col gap-4">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block text-xs font-bold uppercase tracking-wider transition-colors ${
                      pathname === item.href ? 'text-[#E8A23A]' : 'text-[#D4D4D4] hover:text-[#E8A23A]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-center gap-4 border-t border-[#D4842F]/20 pt-4">
              <button type="button" className="text-[#D4D4D4] transition hover:text-[#E8A23A]">
                <Search className="h-5 w-5" />
              </button>
              <button type="button" className="text-[#D4D4D4] transition hover:text-[#E8A23A]">
                <User className="h-5 w-5" />
              </button>
              <button type="button" className="relative text-[#D4D4D4] transition hover:text-[#E8A23A]">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8A23A] text-[8px] font-bold text-[#1a1a1a]">
                  0
                </span>
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
