/**
 * WorkspaceNavigation Component
 * Main navigation menu for the 8 workspace sections
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    href: '/command-center',
    icon: '🎯',
    description: 'Mission control dashboard',
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    href: '/workspaces',
    icon: '🏢',
    description: 'Switch businesses',
  },
  {
    id: 'automation',
    label: 'Automation',
    href: '/automation',
    icon: '⚙️',
    description: 'Workflows & rules',
  },
  {
    id: 'workforce',
    label: 'Digital Workforce',
    href: '/workforce',
    icon: '🤖',
    description: 'AI team status',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    href: '/knowledge',
    icon: '🧠',
    description: 'Brain & search',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: '📊',
    description: 'Metrics & insights',
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    href: '/infrastructure',
    icon: '🔧',
    description: 'System health',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚡',
    description: 'Configuration',
  },
];

export function WorkspaceNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
      <div className="text-xs uppercase font-medium text-wise-text-secondary px-3 py-2">
        Navigation
      </div>

      {NAV_ITEMS.map((item) => {
        // Check if this nav item matches the current path
        const isActive = pathname.includes(item.id);

        return (
          <Link
            key={item.id}
            href={`${pathname.split('/').slice(0, 3).join('/')}${item.href}`}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
              ${
                isActive
                  ? 'bg-wise-surface-2 border border-wise-blue-electric text-wise-blue-electric'
                  : 'text-wise-text-secondary hover:text-wise-text-primary hover:bg-wise-surface-2'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.label}</div>
              <div className="text-xs opacity-75 truncate hidden md:block">
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
