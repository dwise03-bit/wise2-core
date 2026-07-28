/**
 * Workspace Selector Page
 * Choose which workspace to access
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Workspace } from '@/src/types/workspace';

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasNavigatedRef = React.useRef(false);

  // Fetch workspaces on mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) throw new Error('Failed to fetch workspaces');
        const data = await response.json();
        setWorkspaces(data.workspaces || []);
        setError(null);

        // If only one workspace, redirect to it (only once)
        if (data.workspaces?.length === 1 && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          const workspace = data.workspaces[0];
          router.push(`/workspaces/${workspace.slug}/dashboard`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch workspaces'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleSelectWorkspace = (workspaceSlug: string) => {
    router.push(`/workspaces/${workspaceSlug}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wise-bg-darkest flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-wise-blue-electric border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-wise-text-secondary">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-wise-bg-darkest flex items-center justify-center p-4">
        <div className="bg-wise-surface-1 border border-wise-border rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-wise-red-alert rounded-full" />
            <h1 className="text-lg font-semibold text-wise-red-alert">Error</h1>
          </div>
          <p className="text-sm text-wise-text-secondary">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-wise-bg-darkest flex items-center justify-center p-4">
        <div className="bg-wise-surface-1 border border-wise-border rounded-lg p-6 max-w-md w-full">
          <h1 className="text-lg font-semibold text-wise-text-primary mb-2">No Workspaces</h1>
          <p className="text-sm text-wise-text-secondary mb-4">
            You don't have access to any workspaces. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-bg-darkest p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-wise-text-primary mb-2">Select Workspace</h1>
          <p className="text-wise-text-secondary">
            Choose a workspace to access its dashboard and features
          </p>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelectWorkspace(ws.slug)}
              className="group text-left"
            >
              <div className="
                rounded-lg bg-wise-surface-1 border border-wise-border p-6
                hover:border-wise-blue-electric hover:shadow-blue-glow-md
                transition-all duration-200
                cursor-pointer
              ">
                {/* Workspace Icon */}
                <div className="
                  w-12 h-12 rounded-lg bg-wise-blue-electric
                  flex items-center justify-center mb-4
                  text-xl font-bold text-black
                  group-hover:scale-110 transition-transform
                ">
                  {ws.name.charAt(0).toUpperCase()}
                </div>

                {/* Workspace Name */}
                <h2 className="text-lg font-semibold text-wise-text-primary mb-1 group-hover:text-wise-blue-electric transition-colors">
                  {ws.name}
                </h2>

                {/* Workspace Description */}
                {ws.description && (
                  <p className="text-sm text-wise-text-secondary mb-3 line-clamp-2">
                    {ws.description}
                  </p>
                )}

                {/* Workspace Status */}
                <div className="flex items-center gap-2 pt-3 border-t border-wise-border">
                  <span className="w-1.5 h-1.5 bg-wise-green-neon rounded-full" />
                  <span className="text-xs font-medium text-wise-text-secondary">
                    {ws.status === 'active' ? 'Active' : ws.status}
                  </span>
                </div>

                {/* Workspace Type */}
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-wise-surface-2 border border-wise-border text-wise-text-secondary rounded">
                    {ws.workspaceType}
                  </span>
                </div>

                {/* Arrow Icon */}
                <div className="mt-4 pt-4 border-t border-wise-border flex justify-end">
                  <svg
                    className="w-4 h-4 text-wise-blue-electric group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Create New Workspace CTA */}
        <div className="mt-8 p-6 rounded-lg bg-wise-surface-1 border border-wise-border border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-wise-text-primary mb-1">Create New Workspace</h3>
              <p className="text-sm text-wise-text-secondary">
                Set up a new workspace for a different business or project
              </p>
            </div>
            <button className="
              px-4 py-2 bg-wise-blue-electric text-black font-semibold rounded-md
              hover:opacity-90 active:scale-95 transition-all
              flex items-center gap-2
            ">
              <span>+</span>
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
