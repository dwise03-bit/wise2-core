/**
 * useCollaboration Hook
 * Manages real-time collaboration state, synchronization, and updates
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  initializeSync,
  disconnectSync,
  getSync,
  CollaborationSync,
} from '../lib/CollaborationSync';
import type {
  CollaborationState,
  Collaborator,
  UserPresence,
  ProjectComment,
  ActivityLogEntry,
  VersionHistoryEntry,
  Permission,
  CollaboratorRole,
  CollaborationNotification,
  CreateCommentPayload,
  PermissionCheck,
  PresenceUpdate,
} from '../types/collaboration';

interface UseCollaborationOptions {
  projectId: string;
  userId: string;
  role?: CollaboratorRole;
  apiUrl?: string;
  autoConnect?: boolean;
}

const DEFAULT_PERMISSIONS: Record<CollaboratorRole, Permission[]> = {
  OWNER: [
    'view_project',
    'edit_audio',
    'edit_mixer',
    'upload_gallery',
    'comment',
    'invite_collaborators',
    'manage_permissions',
    'delete_project',
    'create_version',
  ],
  EDITOR: [
    'view_project',
    'edit_audio',
    'edit_mixer',
    'upload_gallery',
    'comment',
    'create_version',
  ],
  VIEWER: ['view_project', 'comment'],
};

export function useCollaboration(options: UseCollaborationOptions) {
  const {
    projectId,
    userId,
    role = 'EDITOR',
    apiUrl = '',
    autoConnect = true,
  } = options;

  const [state, setState] = useState<CollaborationState>({
    projectId,
    userId,
    role,
    permissions: DEFAULT_PERMISSIONS[role],
    collaborators: [],
    presence: [],
    comments: [],
    activityLog: [],
    versions: [],
    conflicts: [],
    isConnected: false,
    lastSyncTime: 0,
    pendingChanges: [],
  });

  const [notifications, setNotifications] = useState<CollaborationNotification[]>([]);
  const syncRef = useRef<CollaborationSync | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Initialize collaboration sync
   */
  useEffect(() => {
    if (!autoConnect || !projectId || !userId) return;

    const sync = initializeSync(projectId, userId, apiUrl);
    syncRef.current = sync;

    // Connection events
    sync.on('connected', handleConnected);
    sync.on('disconnected', handleDisconnected);
    sync.on('error', handleError);

    // Message handlers
    sync.on('presence_update', handlePresenceUpdate);
    sync.on('track_update', handleTrackUpdate);
    sync.on('mixer_update', handleMixerUpdate);
    sync.on('comment_added', handleCommentAdded);
    sync.on('user_joined', handleUserJoined);
    sync.on('user_left', handleUserLeft);
    sync.on('permission_changed', handlePermissionChanged);

    return () => {
      disconnectSync();
      syncRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [projectId, userId, autoConnect, apiUrl]);

  // ===== CONNECTION HANDLERS =====

  const handleConnected = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: true,
      lastSyncTime: Date.now(),
    }));
  }, []);

  const handleDisconnected = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
    }));
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('Collaboration error:', error);
    addNotification({
      type: 'conflict_alert',
      title: 'Connection Error',
      message: 'Failed to sync changes. Will retry automatically.',
    });
  }, []);

  // ===== MESSAGE HANDLERS =====

  const handlePresenceUpdate = useCallback((data: PresenceUpdate) => {
    setState((prev) => {
      const presenceIndex = prev.presence.findIndex((p) => p.userId === data.userId);

      if (presenceIndex >= 0) {
        const updated = [...prev.presence];
        updated[presenceIndex] = {
          ...updated[presenceIndex],
          status: data.status,
          cursorPosition: data.cursorPosition,
          editingTrackId: data.editingTrackId,
          lastHeartbeat: new Date().toISOString(),
        };
        return { ...prev, presence: updated };
      } else {
        return {
          ...prev,
          presence: [
            ...prev.presence,
            {
              id: `presence-${data.userId}`,
              userId: data.userId,
              projectId: prev.projectId,
              status: data.status,
              cursorPosition: data.cursorPosition,
              editingTrackId: data.editingTrackId,
              lastHeartbeat: new Date().toISOString(),
            },
          ],
        };
      }
    });
  }, []);

  const handleTrackUpdate = useCallback((data: any) => {
    // This would typically update the audio engine
    // For now, log the update and emit event
    console.log('Track update received:', data);
  }, []);

  const handleMixerUpdate = useCallback((data: any) => {
    // Update mixer state
    console.log('Mixer update received:', data);
  }, []);

  const handleCommentAdded = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      comments: [...prev.comments, data],
    }));

    addNotification({
      type: 'comment_mentioned',
      title: 'New Comment',
      message: `${data.user?.name || 'Someone'} commented on this project`,
      relatedUser: data.user,
    });
  }, []);

  const handleUserJoined = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      collaborators: [...prev.collaborators, data],
    }));

    addNotification({
      type: 'user_joined',
      title: 'Collaborator Joined',
      message: `${data.user?.name || 'Someone'} joined the project`,
      relatedUser: data.user,
    });
  }, []);

  const handleUserLeft = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((c) => c.userId !== data.userId),
      presence: prev.presence.filter((p) => p.userId !== data.userId),
    }));

    addNotification({
      type: 'user_left',
      title: 'Collaborator Left',
      message: `${data.user?.name || 'Someone'} left the project`,
      relatedUser: data.user,
    });
  }, []);

  const handlePermissionChanged = useCallback((data: any) => {
    if (data.userId === userId) {
      setState((prev) => ({
        ...prev,
        role: data.newRole,
        permissions: DEFAULT_PERMISSIONS[data.newRole],
      }));

      addNotification({
        type: 'permission_changed',
        title: 'Permission Changed',
        message: `Your role changed to ${data.newRole}`,
      });
    }
  }, [userId]);

  // ===== PUBLIC METHODS =====

  /**
   * Add a comment
   */
  const addComment = useCallback(
    async (payload: CreateCommentPayload): Promise<ProjectComment | null> => {
      if (!hasPermission('comment')) {
        console.error('No permission to comment');
        return null;
      }

      const sync = syncRef.current;
      if (!sync) return null;

      const comment: ProjectComment = {
        id: `comment-${Date.now()}`,
        projectId: payload.projectId,
        userId,
        content: payload.content,
        timestamp: payload.timestamp,
        trackId: payload.trackId,
        threadId: payload.threadId,
        mentions: payload.mentions || [],
        reactions: {},
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sync.sendMessage('comment_added', comment);

      setState((prev) => ({
        ...prev,
        comments: [...prev.comments, comment],
      }));

      return comment;
    },
    [userId],
  );

  /**
   * Update presence
   */
  const updatePresence = useCallback((update: Partial<PresenceUpdate>) => {
    const sync = syncRef.current;
    if (!sync) return;

    sync.updatePresence({
      userId,
      status: update.status || 'online',
      cursorPosition: update.cursorPosition,
      editingTrackId: update.editingTrackId,
    });
  }, [userId]);

  /**
   * Update track
   */
  const updateTrack = useCallback(
    (trackId: string, updates: Record<string, any>) => {
      if (!hasPermission('edit_audio')) {
        console.error('No permission to edit audio');
        return;
      }

      const sync = syncRef.current;
      if (!sync) return;

      sync.updateTrack(trackId, updates);

      // Log activity
      logActivity('track_updated', 'track', trackId, updates);
    },
    [],
  );

  /**
   * Update mixer
   */
  const updateMixer = useCallback(
    (updates: Record<string, any>) => {
      if (!hasPermission('edit_mixer')) {
        console.error('No permission to edit mixer');
        return;
      }

      const sync = syncRef.current;
      if (!sync) return;

      sync.updateMixer(updates);

      // Determine action type
      let action = 'mixer_update';
      if ('masterVolume' in updates) action = 'volume_changed';
      if ('bpm' in updates) action = 'bpm_changed';

      logActivity(action as any, 'mixer', undefined, updates);
    },
    [],
  );

  /**
   * Add gallery image
   */
  const addGalleryImage = useCallback(
    (imageId: string, imageUrl: string, imageName: string) => {
      if (!hasPermission('upload_gallery')) {
        console.error('No permission to upload gallery');
        return;
      }

      const sync = syncRef.current;
      if (!sync) return;

      sync.updateGallery('add', imageId, imageUrl, imageName);
      logActivity('gallery_image_added', 'gallery', imageId, { imageUrl, imageName });
    },
    [],
  );

  /**
   * Remove gallery image
   */
  const removeGalleryImage = useCallback((imageId: string) => {
    if (!hasPermission('upload_gallery')) {
      console.error('No permission to remove gallery');
      return;
    }

    const sync = syncRef.current;
    if (!sync) return;

    sync.updateGallery('remove', imageId);
    logActivity('gallery_image_removed', 'gallery', imageId, {});
  }, []);

  /**
   * Add collaborator
   */
  const addCollaborator = useCallback(
    async (email: string, role: CollaboratorRole = 'EDITOR'): Promise<void> => {
      if (!hasPermission('invite_collaborators')) {
        console.error('No permission to invite collaborators');
        return;
      }

      // This would typically call an API endpoint
      const sync = syncRef.current;
      if (!sync) return;

      sync.sendMessage('invite_collaborator', { email, role });
    },
    [],
  );

  /**
   * Remove collaborator
   */
  const removeCollaborator = useCallback((collaboratorId: string) => {
    if (!hasPermission('manage_permissions')) {
      console.error('No permission to remove collaborators');
      return;
    }

    const sync = syncRef.current;
    if (!sync) return;

    sync.sendMessage('remove_collaborator', { collaboratorId });

    setState((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((c) => c.id !== collaboratorId),
    }));
  }, []);

  /**
   * Create version
   */
  const createVersion = useCallback(
    (label?: string, changeLog?: string) => {
      if (!hasPermission('create_version')) {
        console.error('No permission to create version');
        return;
      }

      const sync = syncRef.current;
      if (!sync) return;

      sync.sendMessage('version_created', {
        label,
        changeLog,
        timestamp: Date.now(),
      });

      logActivity('version_created', 'version', undefined, { label, changeLog });
    },
    [],
  );

  /**
   * Log activity
   */
  const logActivity = useCallback(
    (
      action: string,
      entityType: string,
      entityId?: string,
      details?: Record<string, any>,
    ) => {
      const entry: ActivityLogEntry = {
        id: `activity-${Date.now()}`,
        projectId,
        userId,
        action: action as any,
        entityType,
        entityId,
        details: details || {},
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        activityLog: [entry, ...prev.activityLog].slice(0, 100), // Keep last 100
      }));

      const sync = syncRef.current;
      if (sync) {
        sync.sendMessage('activity_logged', entry);
      }
    },
    [projectId, userId],
  );

  /**
   * Check permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return state.permissions.includes(permission);
    },
    [state.permissions],
  );

  /**
   * Get permission check result
   */
  const checkPermissions = useCallback((): PermissionCheck => {
    return {
      canEdit: hasPermission('edit_audio'),
      canComment: hasPermission('comment'),
      canInvite: hasPermission('invite_collaborators'),
      canManagePermissions: hasPermission('manage_permissions'),
      canDeleteProject: hasPermission('delete_project'),
      canCreateVersion: hasPermission('create_version'),
      canViewActivity: true, // All collaborators can view activity
    };
  }, [hasPermission]);

  /**
   * Add notification
   */
  const addNotification = useCallback((notif: Omit<CollaborationNotification, 'id' | 'read' | 'createdAt' | 'projectId'>): void => {
    const notification: CollaborationNotification = {
      id: `notif-${Date.now()}`,
      projectId,
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50

    // Auto-clear after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notification.id),
      );
    }, 5000);
  }, [projectId]);

  /**
   * Connect/reconnect
   */
  const connect = useCallback(() => {
    const sync = syncRef.current;
    if (sync && !sync.isConnected()) {
      sync.requestStateSync();
    }
  }, []);

  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    disconnectSync();
    syncRef.current = null;
  }, []);

  /**
   * Get active collaborators (online presence)
   */
  const getActiveCollaborators = useCallback((): UserPresence[] => {
    return state.presence.filter((p) => p.status === 'online');
  }, [state.presence]);

  /**
   * Get unresolved comments
   */
  const getUnresolvedComments = useCallback((): ProjectComment[] => {
    return state.comments.filter((c) => !c.resolved);
  }, [state.comments]);

  return {
    // State
    state,
    notifications,

    // Connection
    isConnected: state.isConnected,
    connect,
    disconnect,

    // Collaborators
    collaborators: state.collaborators,
    presence: state.presence,
    activeCollaborators: getActiveCollaborators(),
    addCollaborator,
    removeCollaborator,

    // Comments
    comments: state.comments,
    unresolvedComments: getUnresolvedComments(),
    addComment,

    // Activity & History
    activityLog: state.activityLog,
    versions: state.versions,
    logActivity,
    createVersion,

    // Permissions
    role: state.role,
    permissions: state.permissions,
    hasPermission,
    checkPermissions,

    // Updates
    updatePresence,
    updateTrack,
    updateMixer,
    addGalleryImage,
    removeGalleryImage,
  };
}
