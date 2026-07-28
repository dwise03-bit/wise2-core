/**
 * Workspace Dashboard Page
 * Main landing page for a workspace
 */

'use client';

import React from 'react';
import { useWorkspace } from '@/src/context/WorkspaceContext';

export default function WorkspaceDashboardPage() {
  const { workspace, member, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-wise-surface-1 rounded w-1/3" />
          <div className="h-32 bg-wise-surface-1 rounded" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8">
        <div className="bg-wise-surface-1 border border-wise-border rounded-lg p-6">
          <p className="text-wise-text-secondary">No workspace selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-wise-text-primary mb-2">
          {workspace.name}
        </h1>
        <p className="text-wise-text-secondary">
          {workspace.description || 'Welcome to your workspace'}
        </p>
      </div>

      {/* Workspace Info Card */}
      <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
        <h2 className="text-lg font-semibold text-wise-text-primary mb-4">Workspace Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status */}
          <div>
            <div className="text-xs uppercase font-medium text-wise-text-secondary mb-1">
              Status
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-wise-green-neon rounded-full" />
              <span className="text-sm font-medium text-wise-text-primary capitalize">
                {workspace.status}
              </span>
            </div>
          </div>

          {/* Type */}
          <div>
            <div className="text-xs uppercase font-medium text-wise-text-secondary mb-1">
              Type
            </div>
            <div className="text-sm font-medium text-wise-text-primary capitalize">
              {workspace.workspaceType}
            </div>
          </div>

          {/* Your Role */}
          {member && (
            <div>
              <div className="text-xs uppercase font-medium text-wise-text-secondary mb-1">
                Your Role
              </div>
              <div className="text-sm font-medium text-wise-blue-electric capitalize">
                {member.role}
              </div>
            </div>
          )}

          {/* Created */}
          <div>
            <div className="text-xs uppercase font-medium text-wise-text-secondary mb-1">
              Created
            </div>
            <div className="text-sm font-medium text-wise-text-primary">
              {new Date(workspace.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
        <h2 className="text-lg font-semibold text-wise-text-primary mb-4">Enabled Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {workspace.features?.map((feature) => (
            <div
              key={feature}
              className="
                px-3 py-2 rounded-md
                bg-wise-surface-2 border border-wise-border
                text-sm font-medium text-wise-text-primary
                flex items-center gap-2
              "
            >
              <span className="w-1.5 h-1.5 bg-wise-green-neon rounded-full" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
        <h2 className="text-lg font-semibold text-wise-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Placeholder Actions */}
          {[
            { label: 'View Workflows', icon: '⚙️' },
            { label: 'AI Workforce', icon: '🤖' },
            { label: 'Analytics', icon: '📊' },
            { label: 'Settings', icon: '⚡' },
          ].map((action) => (
            <button
              key={action.label}
              className="
                p-4 rounded-lg
                bg-wise-surface-2 border border-wise-border
                hover:border-wise-blue-electric hover:shadow-blue-glow-md
                transition-all duration-200
                text-center
              "
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium text-wise-text-primary">
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-lg bg-wise-surface-2 border-l-4 border-l-wise-orange-warning p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <h3 className="font-semibold text-wise-text-primary">Phase 4 In Progress</h3>
            <p className="text-sm text-wise-text-secondary mt-1">
              This workspace dashboard is a placeholder for Phase 4B. Full Command Center dashboard will be available in Phase 4C.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
