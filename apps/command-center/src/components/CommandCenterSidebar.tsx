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
    new Set(['overview', 'business'])
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

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Business',
      items: [
        {
          id: 'projects',
          label: 'Projects',
          href: '/dashboard/projects',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="9" y2="15" />
              <line x1="15" y1="9" x2="15" y2="15" />
            </svg>
          ),
        },
        {
          id: 'leads',
          label: 'Leads',
          href: '/dashboard/leads',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        },
        {
          id: 'customers',
          label: 'Customers',
          href: '/dashboard/customers',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Create',
      items: [
        {
          id: 'sound-labs',
          label: 'Sound Labs',
          href: '/dashboard/sound-labs',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1v22M17.56 3.56a8 8 0 0 0 0 11.31M6.44 6.44a8 8 0 0 0 0 11.31" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Automate',
      items: [
        {
          id: 'workflows',
          label: 'Workflows',
          href: '/dashboard/workflows',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
              <line x1="12" y1="12" x2="20" y2="7.5" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <line x1="12" y1="12" x2="4" y2="7.5" />
            </svg>
          ),
        },
        {
          id: 'ai',
          label: 'AI Agents',
          href: '/dashboard/ai',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <path d="M12 1v6m0 6v6" />
              <path d="M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24" />
              <path d="M1 12h6m6 0h6" />
              <path d="M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/dashboard/analytics',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="2" x2="12" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'billing',
          label: 'Billing',
          href: '/dashboard/billing',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 4H8a2 2 0 0 0-2 2v2h12V6a2 2 0 0 0-2-2z" />
            </svg>
          ),
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/dashboard/settings',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
          ),
        },
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
