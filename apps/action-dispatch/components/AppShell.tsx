'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  Phone,
  Settings,
  Truck,
  Users,
} from 'lucide-react';
import { NAV } from '@/lib/brand-tokens';

const ICONS = {
  LayoutDashboard,
  Phone,
  Truck,
  Users,
  Briefcase,
  Settings,
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-carbon text-snow">
      <div className="flex min-h-screen">
        <nav
          aria-label="Command navigation"
          className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col border-r border-white/10 bg-smoked/90 px-2 py-4 lg:flex"
        >
          <Link href="/" className="mb-6 flex h-12 items-center justify-center rounded-2xl bg-ice/10 text-ice">
            <span className="font-display text-lg font-black">W²</span>
            <span className="sr-only">WISE² Command Center</span>
          </Link>
          <ul className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = ICONS[item.icon];
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`touch-target flex flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] uppercase tracking-[0.12em] ${
                      active ? 'bg-ice/15 text-ice' : 'text-chrome hover:bg-white/5 hover:text-snow'
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="text-center leading-tight">{item.label.split(' ')[0]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          {children}
          <nav
            aria-label="Mobile command navigation"
            className="sticky bottom-0 z-20 border-t border-white/10 bg-smoked/95 px-2 py-2 pb-[calc(0.5rem+var(--safe-bottom))] lg:hidden"
          >
            <ul className="grid grid-cols-6 gap-1">
              {NAV.map((item) => {
                const Icon = ICONS[item.icon];
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`touch-target flex flex-col items-center justify-center gap-1 rounded-xl text-[9px] uppercase tracking-[0.12em] ${
                        active ? 'text-ice' : 'text-chrome'
                      }`}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {item.label.split(' ')[0]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
