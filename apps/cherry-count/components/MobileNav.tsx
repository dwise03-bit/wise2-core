'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { CHERRY_QUICK_ACTIONS } from '@/lib/brand-tokens';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', Icon: Package },
  { href: '/pop-ups', label: 'Pop-Ups', Icon: Calendar },
  { href: '/more', label: 'More', Icon: Menu },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus: Plus,
  DollarSign: Plus,
  CalendarPlus: Calendar,
  QrCode: Package,
  Barcode: Package,
  UserPlus: Menu,
};

export function MobileNav() {
  const pathname = usePathname();
  const [showActions, setShowActions] = useState(false);

  if (pathname.startsWith('/presentation') || pathname === '/') return null;

  return (
    <>
      {showActions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-cherry-lg border border-cherry-bubblegum/20 bg-cherry-soft p-6 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold uppercase">Quick Actions</h3>
              <button
                onClick={() => setShowActions(false)}
                className="touch-target flex items-center justify-center rounded-full border border-white/10 p-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CHERRY_QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setShowActions(false)}
                  className="glass-panel touch-target flex items-center gap-3 p-4 text-sm font-medium transition hover:border-cherry-hot/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cherry-hot/20 text-cherry-hot">
                    +
                  </span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-cherry-bubblegum/15 bg-cherry-soft/90 backdrop-blur-xl pb-[var(--safe-bottom)]">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            if (item.href === '/pop-ups') {
              return (
                <div key="fab" className="relative -mt-6">
                  <button
                    onClick={() => setShowActions(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cherry-hot to-cherry-red shadow-glow-sm transition hover:brightness-110 active:scale-95"
                    aria-label="Quick actions"
                  >
                    <Plus className="h-7 w-7 text-white" />
                  </button>
                </div>
              );
            }

            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`touch-target flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium uppercase tracking-wide transition ${
                  active ? 'text-cherry-hot' : 'text-white/50 hover:text-white/80'
                }`}
              >
                <item.Icon className={`h-5 w-5 ${active ? 'text-cherry-hot' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
