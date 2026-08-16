'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CommandCenterSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

// NavSection already has badge via NavItem

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const ICON_PATHS: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
  users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  folder: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  waveform: '<path d="M2 12h2l2-6 3 12 3-8 2 4h2"/><circle cx="20" cy="12" r="1"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  broadcast: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/>',
  film: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  brain: '<path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/><line x1="9" y1="22" x2="15" y2="22"/>',
  workflow: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  discord: '<path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
};

const Icon: React.FC<{ name: string; size?: number }> = ({ name, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || '' }}
  />
);

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { id: 'dashboard', label: 'Command Center', href: '/dashboard', icon: 'grid' },
    ],
  },
  {
    id: 'revenue-os',
    title: 'Revenue OS',
    items: [
      { id: 'revenue-os', label: 'Revenue OS', href: '/revenue-os', icon: 'target' },
      { id: 'revenue-os-leads', label: 'Leads', href: '/revenue-os/leads', icon: 'users' },
      { id: 'revenue-os-agents', label: 'AI Workforce', href: '/revenue-os/agents', icon: 'cpu' },
      { id: 'revenue-os-estimates', label: 'Estimates', href: '/revenue-os/estimates', icon: 'dollar' },
      { id: 'revenue-os-analytics', label: 'Analytics', href: '/revenue-os/analytics', icon: 'chart' },
    ],
  },
  {
    id: 'business',
    title: 'Business',
    items: [
      { id: 'business-os', label: 'Overview', href: '/dashboard/business-os', icon: 'briefcase' },
      { id: 'leads', label: 'Prospects', href: '/dashboard/leads', icon: 'users' },
      { id: 'customers', label: 'CRM / Customers', href: '/dashboard/customers', icon: 'user' },
      { id: 'billing', label: 'Billing', href: '/dashboard/billing', icon: 'dollar' },
      { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: 'chart' },
    ],
  },
  {
    id: 'create',
    title: 'Create',
    items: [
      { id: 'sound-labs', label: 'Sound Labs', href: '/dashboard/sound-labs', icon: 'music' },
      { id: 'sound-labs-jingle-lab', label: 'Jingle Lab', href: '/dashboard/sound-labs/jingle-lab', icon: 'waveform' },
      { id: 'sound-labs-library', label: 'Audio Library', href: '/dashboard/sound-labs/library', icon: 'book' },
      { id: 'gallery', label: 'Gallery', href: '/dashboard/gallery', icon: 'image' },
      { id: 'print-on-demand', label: 'Print Shop', href: '/dashboard/print-on-demand', icon: 'printer' },
    ],
  },
  {
    id: 'live',
    title: 'Live',
    items: [
      { id: 'live-studio', label: 'Live Studio', href: '/dashboard/live-studio', icon: 'broadcast' },
      { id: 'live-studio-recordings', label: 'Recordings', href: '/dashboard/live-studio/recordings', icon: 'film' },
      { id: 'live-studio-scenes', label: 'Scenes', href: '/dashboard/live-studio/scenes', icon: 'monitor' },
      { id: 'live-studio-go-live', label: 'Go Live', href: '/dashboard/live-studio/go-live', icon: 'video' },
    ],
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    items: [
      { id: 'ai', label: 'Hermes', href: '/dashboard/ai', icon: 'brain' },
      { id: 'second-brain', label: 'Second Brain', href: '/dashboard/second-brain', icon: 'brain' },
      { id: 'workflows', label: 'Workflows', href: '/dashboard/workflows', icon: 'workflow' },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { id: 'live', label: 'Live Ops', href: '/dashboard/live', icon: 'activity', badge: 'LIVE' },
      { id: 'devices', label: 'WISE OS / Edge', href: '/dashboard/devices', icon: 'cpu' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    items: [
      { id: 'discord', label: 'Discord', href: '/dashboard/discord', icon: 'discord' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      { id: 'account', label: 'Profile', href: '/dashboard/account', icon: 'user' },
      { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    ],
  },
];

const CommandCenterSidebar: React.FC<CommandCenterSidebarProps> = ({
  collapsed = false,
  onToggle,
  mobile = false,
}) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['dashboard', 'revenue-os', 'business', 'create', 'live', 'intelligence'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  // Section roots that also have child routes in the nav. They highlight only
  // on an exact match, otherwise the root would light up alongside its child.
  const EXACT_MATCH_ONLY = ['/dashboard', '/revenue-os'];

  const isActive = (href: string) =>
    pathname === href ||
    (!EXACT_MATCH_ONLY.includes(href) && pathname.startsWith(href + '/'));

  const sidebarWidth = collapsed ? 'w-[64px]' : 'w-[260px]';

  return (
    <aside
      aria-label="Main navigation"
      className={`fixed left-0 top-[var(--topbar-height)] bottom-0 z-40 flex flex-col border-r border-border-subtle bg-wise-surface transition-[width] duration-200 lg:relative lg:top-0 ${sidebarWidth}`}
    >
      {!collapsed && (
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle">
          <div className="w-7 h-7 rounded-md bg-wise-electric flex items-center justify-center text-[11px] font-black text-wise-black tracking-tight">
            W2
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text-primary leading-none">WISE²</div>
            <div className="text-2xs text-text-muted mt-0.5">Command Center</div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex items-center justify-center py-3 border-b border-border-subtle">
          <div className="w-7 h-7 rounded-md bg-wise-electric flex items-center justify-center text-[11px] font-black text-wise-black tracking-tight">
            W2
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-2" role="navigation" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const hasActiveChild = section.items.some((item) => isActive(item.href));

          return (
            <div key={section.id} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`flex w-full items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] rounded-md transition-colors ${
                    hasActiveChild ? 'text-text-secondary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  aria-expanded={isExpanded}
                >
                  <span>{section.title}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className={`transition-transform duration-150 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}

              <div
                className={`overflow-hidden transition-all duration-150 ${
                  collapsed || isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
                        active
                          ? 'bg-wise-electric/10 text-wise-electric'
                          : 'text-text-muted hover:bg-white/[0.04] hover:text-text-secondary'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={`flex-shrink-0 ${active ? 'text-wise-electric' : ''}`}>
                        <Icon name={item.icon} />
                      </span>
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="text-[9px] font-bold tracking-wider text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-wise-electric" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {!mobile && (
        <div className="border-t border-border-subtle p-2">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center rounded-md p-1.5 hover:bg-white/[0.04] transition-colors text-text-muted"
            title={collapsed ? 'Expand' : 'Collapse'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
};

export default CommandCenterSidebar;
