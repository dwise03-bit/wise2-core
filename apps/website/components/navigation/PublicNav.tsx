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
  { href: '/platform', label: 'Platform' },
  { href: '/products', label: 'Products' },
  { href: '/hvac', label: 'HVAC' },
  { href: '/wise-defense', label: 'Defense' },
  { href: '/case-studies/get-down', label: 'Case Studies' },
  { href: '/about', label: 'About' },
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
    <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/10 bg-[#050607]/94 text-white backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
          aria-label="WISE² home"
        >
          <span className="flex h-9 w-9 items-center justify-center border border-[#8EDBFF]/40 bg-[#DCE7EF] text-sm font-black text-[#050607]">
            W
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-black tracking-[0.12em]">WISE²</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8FA0AE] sm:block">
              Field-built systems
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 px-3 py-3 text-sm font-semibold text-[#B7C0CB] transition duration-200 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/start-your-build"
            className="hidden min-h-11 items-center bg-[#DCE7EF] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#050607] transition duration-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] md:inline-flex"
          >
            Start
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-[#DCE7EF] transition hover:border-[#8EDBFF]/60 hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] lg:hidden"
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
                  className="min-h-12 bg-[#0A0E12] px-4 py-3 text-sm font-semibold text-[#DCE7EF] transition hover:bg-[#0F171F] focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/start-your-build"
                className="mt-2 min-h-12 bg-[#DCE7EF] px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-[#050607] focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
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
