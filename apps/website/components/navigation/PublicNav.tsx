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
        borderColor: 'rgba(57, 255, 20, 0.2)',
        background: 'linear-gradient(to right, #0B0B0B, #050505, #0B0B0B)',
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #39FF14, #7CFF00)' }}>
              W2
            </div>
            <span className="hidden sm:inline font-bold text-white text-lg tracking-widest" style={{ fontFamily: 'Orbitron' }}>
              WISE²
            </span>
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
                  e.currentTarget.style.color = '#39FF14';
                  e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
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
                  e.currentTarget.style.color = '#39FF14';
                  e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
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
                      border: '1px solid rgba(57, 255, 20, 0.2)',
                      backgroundColor: 'rgba(11, 11, 11, 0.95)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 20px rgba(57, 255, 20, 0.1)',
                    }}
                  >
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2.5 text-sm transition-all duration-200"
                        style={{
                          color: '#8D98A5',
                          borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#39FF14';
                          e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
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
            {/* Free AI Audit CTA - Secondary (Electric Blue) */}
            <Link
              href="/audit"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                color: '#0094FF',
                backgroundColor: 'rgba(0, 148, 255, 0.1)',
                border: '1px solid rgba(0, 148, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 148, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(0, 148, 255, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 148, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 148, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 148, 255, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Free AI Audit
            </Link>

            {/* Login / Command Center - Primary (Neon Green) */}
            {isAuthenticated ? (
              <Link
                href={dashboardUrl}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: '#39FF14',
                  color: '#050505',
                  boxShadow: '0 0 15px rgba(57, 255, 20, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Command Center →
              </Link>
            ) : (
              <Link
                href={loginUrl}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: '#39FF14',
                  color: '#050505',
                  boxShadow: '0 0 15px rgba(57, 255, 20, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.3)';
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
              borderBottom: '1px solid rgba(57, 255, 20, 0.2)',
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
                href="/audit"
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15 transition-all duration-200 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get Free AI Audit
              </Link>
              <Link
                href={isAuthenticated ? dashboardUrl : loginUrl}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-center"
                onClick={() => setMobileOpen(false)}
              >
                {isAuthenticated ? 'Command Center' : 'Login'} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
