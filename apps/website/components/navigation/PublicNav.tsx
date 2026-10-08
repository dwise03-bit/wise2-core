'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { href: '/platform', label: 'Products' },
  { href: '/commerce', label: 'Commerce' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/fieldtech', label: 'Industries' },
  { href: '/work', label: 'Our Work' },
  { href: '/about', label: 'Company' },
  { href: '/contact', label: 'Contact' },
];

export const PublicNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-[#00B8FF]/35 bg-[#050607]/96 text-white shadow-[0_0_28px_rgba(0,184,255,.12)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#8CFF00]"
          aria-label="WISE² home"
        >
          <span className="flex h-9 w-9 items-center justify-center border border-[#00B8FF]/70 bg-gradient-to-br from-white via-[#BFC3C7] to-[#5A6168] text-sm font-black text-[#050607] shadow-[0_0_14px_rgba(0,184,255,.22)]">
            W
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-black tracking-[0.12em] text-[#F2F2F2]">WISE² <span className="text-[#00B8FF]">UNITED</span></span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.26em] text-[#868C86] sm:block">
              AI business operating system
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 px-3 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#C9CEC9] transition duration-200 hover:bg-[#00B8FF]/10 hover:text-[#00B8FF] focus:outline-none focus:ring-2 focus:ring-[#00B8FF]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/start-your-build"
            className="hidden min-h-11 items-center border border-[#00B8FF] bg-[#00B8FF] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#050607] shadow-[0_0_18px_rgba(0,184,255,.35)] transition duration-200 hover:bg-white hover:shadow-[0_0_24px_rgba(0,184,255,.55)] focus:outline-none focus:ring-2 focus:ring-[#00B8FF] md:inline-flex"
          >
            Start
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center border border-[#00B8FF]/45 text-[#DCE7EF] transition hover:border-[#00B8FF] hover:bg-[#00B8FF]/10 focus:outline-none focus:ring-2 focus:ring-[#00B8FF] lg:hidden"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-b border-white/10 bg-[#050607]/98 lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-px bg-white/10 px-4 py-4 sm:px-6">
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="min-h-12 bg-[#0A0E12] px-4 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#DCE7EF] transition hover:bg-[#00B8FF]/10 hover:text-[#00B8FF] focus:outline-none focus:ring-2 focus:ring-[#00B8FF]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/start-your-build"
                className="mt-2 min-h-12 bg-[#00B8FF] px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-[#050607] focus:outline-none focus:ring-2 focus:ring-[#00B8FF]"
                onClick={() => setMobileOpen(false)}
              >
                Start Your Build
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
