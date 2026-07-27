'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface CommandCenterTopBarProps {
  onMobileMenuToggle: () => void;
  onSidebarToggle: () => void;
  mobileMenuOpen: boolean;
}

const CommandCenterTopBar: React.FC<CommandCenterTopBarProps> = ({
  onMobileMenuToggle,
  onSidebarToggle,
  mobileMenuOpen,
}) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const breadcrumb = pathname
    .replace('/dashboard', '')
    .split('/')
    .filter(Boolean)
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || 'W';

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-[var(--topbar-height)] border-b border-border-subtle bg-wise-surface/90 backdrop-blur-lg">
      <div className="flex h-full items-center justify-between px-3 lg:px-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="p-1.5 lg:hidden rounded-md hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>
              }
            </svg>
          </button>

          <button
            onClick={onSidebarToggle}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted min-w-0">
            <Link href="/dashboard" className="hover:text-wise-electric transition-colors shrink-0">
              WISE²
            </Link>
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                <span className="opacity-30">/</span>
                <span className={i === breadcrumb.length - 1 ? 'text-text-secondary truncate' : 'shrink-0'}>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-md hover:bg-white/5 transition-colors p-1.5"
              aria-label="User menu"
            >
              <div className="w-6 h-6 rounded-md bg-wise-electric/20 border border-wise-electric/30 flex items-center justify-center text-[10px] font-bold text-wise-electric">
                {initials}
              </div>
              <span className="hidden lg:inline text-xs text-text-secondary">
                {user?.firstName || user?.email?.split('@')[0] || 'Account'}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 rounded-lg border border-border-medium bg-wise-surface shadow-overlay animate-fade-in overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border-subtle">
                  <p className="text-sm font-medium text-text-primary">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/dashboard/account" onClick={() => setUserMenuOpen(false)} className="block px-3 py-1.5 text-sm text-text-secondary hover:bg-white/5 transition-colors">Profile</Link>
                  <Link href="/dashboard/billing" onClick={() => setUserMenuOpen(false)} className="block px-3 py-1.5 text-sm text-text-secondary hover:bg-white/5 transition-colors">Billing</Link>
                  <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)} className="block px-3 py-1.5 text-sm text-text-secondary hover:bg-white/5 transition-colors">Settings</Link>
                </div>
                <div className="border-t border-border-subtle py-1">
                  <button
                    onClick={() => {
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CommandCenterTopBar;
