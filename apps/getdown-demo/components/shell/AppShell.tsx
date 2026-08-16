'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ChevronLeft,
  Droplets,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { NAV, NAV_GROUPS } from '@/lib/nav';
import { GetDownMark, PoweredByWise } from './Brand';
import { TourLauncher } from '../tour/TourOverlay';
import { useTour } from '../tour/TourProvider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { demoMode, setDemoMode } = useTour();

  return (
    <div className="gd-canvas flex min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-gd-line bg-gd-abyss/85 backdrop-blur-xl transition-[width] duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[236px]'
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-gd-line px-4 py-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gd-electric/40 bg-gd-electric/10">
            <Droplets className="h-4.5 w-4.5 text-gd-electric" strokeWidth={2.4} />
          </div>
          {!collapsed && <GetDownMark size="sm" />}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => {
            const items = NAV.filter((n) => n.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-3">
                {!collapsed && (
                  <p className="px-2.5 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-gd-steel/60">
                    {group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href) ?? false;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
                          active
                            ? 'bg-gd-electric/14 text-white'
                            : 'text-gd-steel hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-gd-neon shadow-glow-neon" />
                        )}
                        <Icon
                          className={`h-4 w-4 shrink-0 ${active ? 'text-gd-electric' : ''}`}
                          strokeWidth={2}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <span className="ml-auto rounded-full bg-gd-neon/18 px-1.5 py-0.5 text-[9px] font-bold text-gd-neon">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-gd-line px-3 py-3">
          {!collapsed && (
            <div className="mb-3">
              <p className="font-display text-[11px] font-extrabold uppercase tracking-wider text-white">
                Get Down Pressure Washing
              </p>
              <p className="mt-0.5 text-[10px] text-gd-steel">Multifamily Exterior Cleaning</p>
              <div className="mt-2">
                <PoweredByWise />
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-gd-line bg-gd-abyss/80 px-5 py-3 backdrop-blur-xl">
          <div className="relative min-w-[200px] flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gd-steel" />
            <input
              placeholder="Search properties, customers, jobs, estimates…"
              className="w-full rounded-lg border border-gd-line bg-gd-hull/70 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gd-steel/70 focus:border-gd-electric/50 focus:outline-none focus:ring-1 focus:ring-gd-electric/30"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gd-electric/45 bg-gd-electric/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gd-electric transition-all hover:bg-gd-electric/25">
              <Plus className="h-3.5 w-3.5" />
              New
            </button>

            <TourLauncher />

            <button
              onClick={() => setDemoMode(!demoMode)}
              title="Toggle owner demo mode"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] transition-all ${
                demoMode
                  ? 'border-gd-amber/50 bg-gd-amber/15 text-gd-amber'
                  : 'border-white/12 bg-white/[0.03] text-gd-steel'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Owner Demo {demoMode ? 'On' : 'Off'}
            </button>

            <button className="relative rounded-lg border border-white/10 p-2 text-gd-steel transition-colors hover:bg-white/5 hover:text-white">
              <MessageSquare className="h-4 w-4" />
            </button>
            <button className="relative rounded-lg border border-white/10 p-2 text-gd-steel transition-colors hover:bg-white/5 hover:text-white">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gd-neon" />
            </button>

            <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-gd-electric to-gd-deep font-display text-[11px] font-black text-gd-void">
                GD
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold text-white">Owner</p>
                <p className="text-[10px] text-gd-steel">Get Down Pressure Washing</p>
              </div>
            </div>
          </div>
        </header>

        {demoMode && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-gd-amber/20 bg-gd-amber/[0.07] px-4 py-1.5 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gd-amber">
              Owner Demo — Simulated Data
            </span>
            <span className="text-[10px] text-gd-amber/70">
              Customers, properties, and financials on these screens are fictional and do not
              represent actual Get Down results. No messages, charges, or posts are sent.
            </span>
          </div>
        )}

        <main className="flex-1 px-5 py-6 pb-28">{children}</main>
      </div>
    </div>
  );
}
