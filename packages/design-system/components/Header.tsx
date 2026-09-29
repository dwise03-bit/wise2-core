'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  logo?: React.ReactNode;
  logoLink?: string;
  navItems?: Array<{ label: string; href: string }>;
  userMenu?: {
    name: string;
    email?: string;
    avatar?: string;
    onLogout?: () => void;
    onProfile?: () => void;
  };
  onMenuClick?: () => void;
  variant?: 'default' | 'dashboard';
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  logoLink = '/',
  navItems = [],
  userMenu,
  onMenuClick,
  variant = 'default',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    onMenuClick?.();
  };

  return (
    <>
      {/* Header Container */}
      <header
        className={`sticky top-0 z-fixed bg-wise-bg/80 backdrop-blur-md border-b border-wise-subtle transition-all ${
          variant === 'dashboard' ? 'lg:ml-80' : ''
        }`}
        style={{
          background: 'rgba(5, 5, 5, 0.8)',
        }}
      >
        <div className="h-16 lg:h-16 flex items-center justify-between px-4 lg:px-6 max-w-none">
          {/* Logo / Brand */}
          <Link
            href={logoLink}
            className="flex items-center gap-2 text-wise-text-primary font-bold text-lg hover:opacity-80 transition-opacity"
          >
            {logo || (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-wise-primary flex items-center justify-center text-white font-bold">
                  W
                </div>
                <span>WISE²</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-wise-text-secondary hover:text-wise-text-primary transition-colors hover:border-b-2 hover:border-wise-primary pb-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu / Mobile Menu */}
          <div className="flex items-center gap-4">
            {userMenu ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-wise-surface-2 transition-colors"
                >
                  {userMenu.avatar ? (
                    <img
                      src={userMenu.avatar}
                      alt={userMenu.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-wise-primary flex items-center justify-center text-white text-xs font-bold">
                      {userMenu.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-wise-text-primary hidden sm:inline">
                    {userMenu.name}
                  </span>
                </button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-wise-surface-2 border border-wise-subtle shadow-lg py-2 z-dropdown">
                    {userMenu.email && (
                      <div className="px-4 py-2 border-b border-wise-subtle">
                        <p className="text-xs text-wise-text-muted">{userMenu.email}</p>
                      </div>
                    )}
                    {userMenu.onProfile && (
                      <button
                        onClick={() => {
                          userMenu.onProfile?.();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-wise-text-primary hover:bg-wise-surface transition-colors"
                      >
                        Profile
                      </button>
                    )}
                    {userMenu.onLogout && (
                      <button
                        onClick={() => {
                          userMenu.onLogout?.();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-wise-text-primary hover:bg-wise-surface transition-colors border-t border-wise-subtle text-danger"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden lg:inline px-4 py-2 rounded-md bg-wise-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-wise-surface-2 transition-colors"
            >
              <svg
                className="w-6 h-6 text-wise-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-wise-subtle bg-wise-surface px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-wise-text-primary hover:bg-wise-surface-2 transition-colors font-semibold"
              >
                {item.label}
              </Link>
            ))}
            {!userMenu && (
              <Link
                href="/auth/login"
                className="block px-3 py-2 rounded-md bg-wise-primary text-white font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Sign In
              </Link>
            )}
          </nav>
        )}
      </header>
    </>
  );
};
