/**
 * WISE² Workspace Context
 * Provides workspace state and switching across the application
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { Workspace, WorkspaceMember, WorkspaceRole } from '@/src/types/workspace';

interface WorkspaceContextType {
  // Current workspace
  workspace: Workspace | null;
  member: WorkspaceMember | null;
  role: WorkspaceRole | null;

  // User's workspaces
  workspaces: Workspace[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  setWorkspace: (workspace: Workspace) => void;
  switchWorkspace: (workspaceId: number | string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;

  // Permissions
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canManageModules: boolean;
  isOwner: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialWorkspaceSlug?: string;
}

/**
 * WorkspaceProvider wraps the application and provides workspace context
 * Must wrap any component that uses useWorkspace hook
 */
export function WorkspaceProvider({ children, initialWorkspaceSlug }: WorkspaceProviderProps) {
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate permissions based on role
  const permissions = useCallback(() => {
    if (!member) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canManageMembers: false,
        canManageModules: false,
        isOwner: false,
      };
    }

    const isOwnerRole = member.role === 'owner';
    const isAdmin = member.role === 'admin';
    const isMember = member.role === 'member';

    return {
      canCreate: isOwnerRole || isAdmin || isMember,
      canRead: true, // All members can read
      canUpdate: isOwnerRole || isAdmin || isMember,
      canDelete: isOwnerRole || isAdmin,
      canManageMembers: isOwnerRole || isAdmin,
      canManageModules: isOwnerRole || isAdmin,
      isOwner: isOwnerRole,
    };
  }, [member]);

  const perms = permissions();

  // Fetch user's workspaces
  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workspaces');
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      const data = await response.json();
      setWorkspaces(data.workspaces || []);
      return data.workspaces || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    }
  }, []);

  // Fetch specific workspace
  const fetchWorkspace = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/workspaces/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch workspace');
      const data = await response.json();

      setWorkspaceState(data.workspace);
      setMember(data.member);
      setError(null);

      return data.workspace;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, []);

  // Initialize workspace on mount or when initialWorkspaceSlug changes
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        setIsLoading(true);

        // Fetch all workspaces first
        const allWorkspaces = await fetchWorkspaces();

        if (!allWorkspaces || allWorkspaces.length === 0) {
          setError(new Error('No workspaces available'));
          return;
        }

        // Use initialWorkspaceSlug if provided, otherwise use first workspace
        const targetSlug = initialWorkspaceSlug || allWorkspaces[0]?.slug;

        if (targetSlug) {
          await fetchWorkspace(targetSlug);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize workspace'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspace();
  }, [initialWorkspaceSlug, fetchWorkspaces, fetchWorkspace]);

  // Set workspace manually
  const setWorkspace = useCallback((newWorkspace: Workspace) => {
    setWorkspaceState(newWorkspace);
  }, []);

  // Switch to a different workspace
  const switchWorkspace = useCallback(
    async (workspaceId: number | string) => {
      try {
        setIsLoading(true);
        const targetWorkspace = workspaces.find(
          (w) => w.id === workspaceId || w.slug === workspaceId
        );

        if (!targetWorkspace) {
          throw new Error('Workspace not found');
        }

        await fetchWorkspace(targetWorkspace.slug);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to switch workspace'));
      } finally {
        setIsLoading(false);
      }
    },
    [workspaces, fetchWorkspace]
  );

  // Refresh current workspace
  const refreshWorkspace = useCallback(async () => {
    if (!workspace) return;
    try {
      setIsLoading(true);
      await fetchWorkspace(workspace.slug);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh workspace'));
    } finally {
      setIsLoading(false);
    }
  }, [workspace, fetchWorkspace]);

  const value: WorkspaceContextType = {
    workspace,
    member,
    role: member?.role || null,
    workspaces,
    isLoading,
    error,
    setWorkspace,
    switchWorkspace,
    refreshWorkspace,
    ...perms,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

/**
 * Hook to use workspace context
 * Must be called from within WorkspaceProvider
 */
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}

/**
 * Hook to get current workspace with fallback
 */
export function useCurrentWorkspace(): Workspace {
  const { workspace } = useWorkspace();
  if (!workspace) {
    throw new Error('No workspace selected');
  }
  return workspace;
}

/**
 * Hook to check if user has permission
 */
export function useWorkspacePermission(permission: keyof Omit<WorkspaceContextType, 'workspace' | 'member' | 'role' | 'workspaces' | 'isLoading' | 'error' | 'setWorkspace' | 'switchWorkspace' | 'refreshWorkspace'>) {
  const context = useWorkspace();
  return context[permission] as boolean;
}
