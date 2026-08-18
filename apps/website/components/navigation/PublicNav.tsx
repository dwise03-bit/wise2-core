'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlatformIcon,
  SoundLabsIcon,
  AuditIcon,
  BusinessesIcon,
  PricingIcon,
  ConsultingIcon,
  MenuIcon,
  CloseIcon,
} from './NavigationIcons';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const PRIMARY_LINKS: NavLink[] = [
  { href: '/platform', label: 'Platform', icon: <PlatformIcon size={18} /> },
  { href: '/trading', label: 'Trading', icon: <PlatformIcon size={18} /> },
  { href: '/services/digital-twin', label: 'Digital Twin', icon: <PlatformIcon size={18} /> },
  { href: '/sound-labs', label: 'Sound Labs', icon: <SoundLabsIcon size={18} /> },
  { href: '/audit', label: 'AI Audit', icon: <AuditIcon size={18} /> },
  { href: '/powered-businesses', label: 'Powered Businesses', icon: <BusinessesIcon size={18} /> },
  { href: '/pricing', label: 'Pricing', icon: <PricingIcon size={18} /> },
  { href: '/printshop', label: 'Print Shop', icon: <PlatformIcon size={18} /> },
];

const MORE_LINKS: NavLink[] = [
  { href: '/consulting', label: 'Consulting', icon: <ConsultingIcon size={18} /> },
  { href: '/about', label: 'About', icon: <ConsultingIcon size={18} /> },
  { href: '/contact', label: 'Contact', icon: <ConsultingIcon size={18} /> },
  { href: '/privacy', label: 'Privacy', icon: <ConsultingIcon size={18} /> },
  { href: '/terms', label: 'Terms', icon: <ConsultingIcon size={18} /> },
];

interface PublicNavProps {
  showCommandCenter?: boolean;
}

/**
 * PublicNav - Canonical public website navigation
 * Used across all public-facing pages (landing, marketing, etc.)
 * Desktop: horizontal nav with dropdown
 * Mobile: hamburger menu with full nav
 * Features: CTA for "GET YOUR FREE AI AUDIT", authenticated user state
 */
export const PublicNav: React.FC<PublicNavProps> = ({ showCommandCenter = true }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dashboardUrl = '/dashboard';
  const loginUrl = '/auth/login';
  const isAuthenticated = false; // TODO: Connect to real auth system

  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b"
      style={{
        borderColor: 'rgba(199, 255, 46, 0.2)',
        background: 'linear-gradient(to right, #090909, #050505, #090909)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm" style={{ background: 'linear-gradient(135deg, #C7FF2E, #B36BFF)' }}>
              W
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-white text-lg tracking-widest" style={{ fontFamily: 'Orbitron' }}>
              WISE²
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#9BA3B1]">
                Business OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: '#8D98A5',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C7FF2E';
                  e.currentTarget.style.backgroundColor = 'rgba(199, 255, 46, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8D98A5';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all duration-200"
                style={{
                  color: '#8D98A5',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C7FF2E';
                  e.currentTarget.style.backgroundColor = 'rgba(199, 255, 46, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8D98A5';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                More
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-48 rounded-lg overflow-hidden"
                      style={{
                        border: '1px solid rgba(199, 255, 46, 0.2)',
                        backgroundColor: 'rgba(11, 11, 11, 0.95)',
                        backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 20px rgba(199, 255, 46, 0.1)',
                    }}
                  >
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2.5 text-sm transition-all duration-200"
                        style={{
                          color: '#8D98A5',
                          borderBottom: '1px solid rgba(199, 255, 46, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#C7FF2E';
                          e.currentTarget.style.backgroundColor = 'rgba(199, 255, 46, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#8D98A5';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary build CTA */}
            <Link
              href="/start-your-build"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                color: '#C7FF2E',
                backgroundColor: 'rgba(199, 255, 46, 0.1)',
                border: '1px solid rgba(199, 255, 46, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(199, 255, 46, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(199, 255, 46, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(199, 255, 46, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(199, 255, 46, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(199, 255, 46, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Start Your Build
            </Link>

            {/* Login / Open System */}
            {isAuthenticated ? (
              <Link
                href={dashboardUrl}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: '#C7FF2E',
                  color: '#050505',
                  boxShadow: '0 0 15px rgba(199, 255, 46, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(199, 255, 46, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(199, 255, 46, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Open System →
              </Link>
            ) : (
              <Link
                href={loginUrl}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: '#C7FF2E',
                  color: '#050505',
                  boxShadow: '0 0 15px rgba(199, 255, 46, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(199, 255, 46, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(199, 255, 46, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Login →
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-slate-300 hover:text-white"
            >
              {mobileOpen ? (
                <CloseIcon size={24} />
              ) : (
                <MenuIcon size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 lg:hidden"
            style={{
              borderBottom: '1px solid rgba(199, 255, 46, 0.2)',
              backgroundColor: 'rgba(11, 11, 11, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-2">
              {/* Primary Links */}
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="h-px bg-white/5 my-2" />

              {/* More Links */}
              {MORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="h-px bg-white/5 my-2" />

              {/* Mobile CTAs */}
              <Link
                href="/start-your-build"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#C7FF2E] bg-[#C7FF2E]/10 border border-[#C7FF2E]/30 hover:border-[#C7FF2E]/50 hover:bg-[#C7FF2E]/15 transition-all duration-200 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Start Your Build
              </Link>
              <Link
                href={isAuthenticated ? dashboardUrl : loginUrl}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-black bg-[#C7FF2E] hover:brightness-110 transition-colors duration-200 text-center"
                onClick={() => setMobileOpen(false)}
              >
                {isAuthenticated ? 'Open System' : 'Login'} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
