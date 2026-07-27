'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface CommandCenterSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

interface NavSection {
  title: string;
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

/**
 * CommandCenterSidebar - Command Center Navigation
 * Phase 10C: Canonical sidebar with SVG icons
 * 
 * Navigation Structure (Phase 10B):
 * - Overview
 * - Business (Projects, Leads, Customers)
 * - Create (Sound Labs)
 * - Automate (Workflows, AI)
 * - Intelligence (Analytics)
 * - Account (Billing, Settings)
 */
const CommandCenterSidebar: React.FC<CommandCenterSidebarProps> = ({
  collapsed = false,
  onToggle,
  mobile = false,
}) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'create', 'business'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const I = (d: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
  );

  const navSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard',
          icon: I('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') },
      ],
    },
    {
      title: 'Business',
      items: [
        { id: 'business-os', label: 'Overview', href: '/dashboard/business-os',
          icon: I('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>') },
        { id: 'leads', label: 'Prospects', href: '/dashboard/leads',
          icon: I('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>') },
        { id: 'customers', label: 'CRM / Customers', href: '/dashboard/customers',
          icon: I('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>') },
        { id: 'billing', label: 'Billing', href: '/dashboard/billing',
          icon: I('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>') },
        { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics',
          icon: I('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>') },
      ],
    },
    {
      title: 'Create',
      items: [
        { id: 'sound-labs', label: 'Sound Labs', href: '/dashboard/sound-labs',
          icon: I('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') },
        { id: 'gallery', label: 'Gallery', href: '/dashboard/gallery',
          icon: I('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>') },
        { id: 'print-on-demand', label: 'DTF Print Studio', href: '/dashboard/print-on-demand',
          icon: I('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>') },
      ],
    },
    {
      title: 'Live',
      items: [
        { id: 'live-studio', label: 'Live Studio', href: '/dashboard/live-studio',
          icon: I('<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/>') },
      ],
    },
    {
      title: 'Automation',
      items: [
        { id: 'ai', label: 'Digital Brain', href: '/dashboard/ai',
          icon: I('<circle cx="12" cy="12" r="1"/><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>') },
        { id: 'workflows', label: 'Workflows', href: '/dashboard/workflows',
          icon: I('<polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"/><line x1="12" y1="12" x2="20" y2="7.5"/><line x1="12" y1="12" x2="12" y2="21"/><line x1="12" y1="12" x2="4" y2="7.5"/>') },
      ],
    },
    {
      title: 'Devices',
      items: [
        { id: 'devices', label: 'Overview', href: '/dashboard/devices',
          icon: I('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>') },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'account', label: 'Profile', href: '/dashboard/account',
          icon: I('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>') },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings',
          icon: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>') },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <motion.aside
      className={`fixed left-0 top-16 bottom-0 z-40 border-r border-border-subtle bg-gradient-to-b from-wise-surface/50 to-wise-surface_secondary/30 backdrop-blur-md flex flex-col lg:relative lg:top-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {/* Section Header */}
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.title.toLowerCase())}
                className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
              >
                <span>{section.title}</span>
                <motion.span
                  animate={{
                    rotate: expandedSections.has(section.title.toLowerCase())
                      ? 0
                      : -90,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.span>
              </button>
            )}

            {/* Section Items */}
            <motion.div
              animate={{
                height:
                  collapsed ||
                  expandedSections.has(section.title.toLowerCase())
                    ? 'auto'
                    : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={collapsed ? 'space-y-2' : 'space-y-1'}>
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative w-full rounded-lg px-3 py-2 transition-all flex items-center gap-3 text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-wise-electric/30 text-wise-electric'
                        : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
                    }`}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && isActive(item.href) && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-wise-electric" />
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      {!mobile && (
        <motion.button
          onClick={onToggle}
          className="m-3 flex items-center justify-center rounded-lg p-2 hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            ◀
          </motion.span>
        </motion.button>
      )}
    </motion.aside>
  );
};

export default CommandCenterSidebar;
