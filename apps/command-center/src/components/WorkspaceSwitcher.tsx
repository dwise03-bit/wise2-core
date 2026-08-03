/**
 * WorkspaceSwitcher Component
 * Displays current workspace and allows switching between workspaces
 */

'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/src/context/WorkspaceContext';

export function WorkspaceSwitcher() {
  const { workspace, workspaces, switchWorkspace, isLoading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  if (!workspace) {
    return (
      <div className="h-12 bg-wise-surface-1 border-b border-wise-border flex items-center px-4">
        <div className="text-sm text-wise-text-secondary">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="bg-wise-surface-1 border-b border-wise-border">
      {/* Current Workspace Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-wise-surface-2 transition-colors"
        disabled={isLoading}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Workspace Icon/Avatar */}
          <div className="w-8 h-8 rounded-md bg-wise-blue-electric flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-black">
              {workspace.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Workspace Name and Description */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="text-sm font-semibold text-wise-text-primary truncate">
              {workspace.name}
            </div>
            <div className="text-xs text-wise-text-secondary truncate">
              {workspace.status === 'active' ? 'Active' : workspace.status}
            </div>
          </div>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-wise-text-secondary transition-transform flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Workspace Dropdown Menu */}
      {isOpen && (
        <div className="border-t border-wise-border bg-wise-surface-2">
          <div className="px-3 py-2 max-h-64 overflow-y-auto">
            <div className="text-xs uppercase font-medium text-wise-text-secondary px-1 py-2">
              Your Workspaces
            </div>

            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${
                    ws.id === workspace.id
                      ? 'bg-wise-surface-1 border border-wise-blue-electric text-wise-blue-electric'
                      : 'text-wise-text-primary hover:bg-wise-surface-1'
                  }
                `}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  {ws.id === workspace.id && (
                    <span className="w-1.5 h-1.5 bg-wise-blue-electric rounded-full" />
                  )}
                  <span className="font-medium">{ws.name}</span>
                </div>
                {ws.description && (
                  <div className="text-xs text-wise-text-secondary mt-0.5">
                    {ws.description}
                  </div>
                )}
              </button>
            ))}

            {/* Create New Workspace Button */}
            <div className="border-t border-wise-border mt-2 pt-2">
              <button
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm
                  text-wise-text-secondary hover:text-wise-text-primary
                  hover:bg-wise-surface-1 transition-colors
                  flex items-center gap-2
                `}
              >
                <span>+</span>
                <span>Create Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
