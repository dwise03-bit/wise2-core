'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

interface PodcastLayoutProps {
  children: React.ReactNode;
  currentTab?: 'dashboard' | 'generate' | 'downloads' | 'billing';
}

export function PodcastLayout({ children, currentTab }: PodcastLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/podcast/dashboard', id: 'dashboard' },
    { label: 'Generate', href: '/podcast/generate', id: 'generate' },
    { label: 'Downloads', href: '/podcast/downloads', id: 'downloads' },
    { label: 'Billing', href: '/podcast/checkout', id: 'billing' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/podcast/dashboard" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                  PM
                </div>
                <span className="font-bold text-lg hidden sm:inline">Podcast Music</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentTab === item.id
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex gap-1 mt-4 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  currentTab === item.id
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2026 WISE² Podcast Music. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
