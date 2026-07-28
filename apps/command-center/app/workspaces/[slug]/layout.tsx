/**
 * Workspace Layout
 * Wraps workspace-specific pages with workspace context and UI
 */

import React from 'react';
import { WorkspaceProvider } from '@/src/context/WorkspaceContext';
import { WorkspaceSwitcher } from '@/src/components/WorkspaceSwitcher';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

export default function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  return (
    <WorkspaceProvider initialWorkspaceSlug={params.slug}>
      <div className="flex h-screen bg-wise-bg-darkest">
        {/* Sidebar */}
        <div className="w-64 bg-wise-surface-1 border-r border-wise-border flex flex-col">
          {/* Workspace Switcher */}
          <WorkspaceSwitcher />

          {/* Navigation Menu (Placeholder) */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Navigation items will go here in Phase 4C */}
            <div className="text-xs uppercase font-medium text-wise-text-secondary px-3 py-2">
              Navigation
            </div>
            <div className="text-xs text-wise-text-secondary px-3 py-2">
              (To be implemented in Phase 4C)
            </div>
          </nav>

          {/* Footer/Settings (Placeholder) */}
          <div className="border-t border-wise-border p-4 space-y-2">
            <button className="
              w-full px-3 py-2 rounded-md text-sm text-wise-text-secondary
              hover:bg-wise-surface-2 hover:text-wise-text-primary
              transition-colors text-left
            ">
              Settings
            </button>
            <button className="
              w-full px-3 py-2 rounded-md text-sm text-wise-text-secondary
              hover:bg-wise-surface-2 hover:text-wise-text-primary
              transition-colors text-left
            ">
              Help
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar (Placeholder) */}
          <div className="h-12 bg-wise-surface-1 border-b border-wise-border px-6 flex items-center justify-between">
            <div className="text-sm text-wise-text-secondary">
              Command Center
            </div>
            <div className="text-xs text-wise-text-secondary">
              {/* Breadcrumb or other top-bar content */}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
