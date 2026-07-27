'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface FooterLink {
  href: string;
  label: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { href: '/platform', label: 'Platform' },
      { href: '/sound-labs', label: 'Sound Labs' },
      { href: '/audit', label: 'AI Audit' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/powered-businesses', label: 'Powered Businesses' },
      { href: '/consulting', label: 'Consulting' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
];

/**
 * PublicFooter - Canonical public website footer
 * Appears on all public-facing pages
 * Features: comprehensive site navigation, no invented social media
 * Routes verified against Phase 10B spec
 */
export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-t border-white/10 bg-gradient-to-b from-slate-900/30 to-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                W2
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                WISE²
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Enterprise AI operating system for creators, businesses, and entrepreneurs.
            </p>
            <div className="text-xs text-slate-500">
              <p>© {currentYear} WISE² Genesis. All rights reserved.</p>
            </div>
          </div>

          {/* Links Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>WISE² • Advanced. Automated. Autonomous.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors duration-200">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors duration-200">
              Terms
            </Link>
            <a
              href="mailto:contact@wise2.net"
              className="hover:text-slate-300 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
