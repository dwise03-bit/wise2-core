/**
 * Collaboration System Type Definitions
 * Defines all interfaces and enums for real-time collaboration features
 */

/**
 * Permission definitions for roles
 * Defines the 9 core permissions across 3 roles
 */
export type PermissionType =
  | 'edit_track'
  | 'edit_mixer'
  | 'edit_gallery'
  | 'edit_metadata'
  | 'manage_collaborators'
  | 'manage_versions'
  | 'export_project'
  | 'delete_project'
  | 'share_project';

/**
 * Role-based permission mapping
 * Owner: 9/9 permissions
 * Editor: 7/9 permissions (can't manage collabs/delete project)
 * Viewer: 0/9 permissions (read-only)
 */
export const ROLE_PERMISSIONS: Record<string, PermissionType[]> = {
  OWNER: [
    'edit_track',
    'edit_mixer',
    'edit_gallery',
    'edit_metadata',
    'manage_collaborators',
    'manage_versions',
    'export_project',
    'delete_project',
    'share_project',
  ],
  EDITOR: [
    'edit_track',
    'edit_mixer',
    'edit_gallery',
    'edit_metadata',
    'manage_versions',
    'export_project',
    'share_project',
  ],
  VIEWER: [],
};

/**
 * WebSocket event types for collaboration
 */
export enum WebSocketEventType {
  // Presence events
  PRESENCE_JOIN = 'presence:join',
  PRESENCE_LEAVE = 'presence:leave',
  CURSOR_MOVE = 'cursor:move',

  // Edit events
  TRACK_EDIT = 'track:edit',
  MIXER_EDIT = 'mixer:edit',
  GALLERY_EDIT = 'gallery:edit',

  // Comment events
  COMMENT_ADD = 'comment:add',
  COMMENT_REPLY = 'comment:reply',
  COMMENT_RESOLVE = 'comment:resolve',

  // Version events
  VERSION_SNAPSHOT = 'version:snapshot',
  VERSION_ROLLBACK = 'version:rollback',

  // Error events
  ERROR = 'error',
  SYNC_REQUEST = 'sync:request',
  SYNC_RESPONSE = 'sync:response',
}

/**
 * Activity action types (14+ types for audit logging)
 */
export enum ActivityActionType {
  // Track actions
  TRACK_ADDED = 'track_added',
  TRACK_REMOVED = 'track_removed',
  TRACK_EDITED = 'track_edited',
  TRACK_VOLUME_CHANGED = 'track_volume_changed',
  TRACK_PAN_CHANGED = 'track_pan_changed',

  // Mixer actions
  MIXER_SETTINGS_CHANGED = 'mixer_settings_changed',
  BPM_CHANGED = 'bpm_changed',
  MASTER_VOLUME_CHANGED = 'master_volume_changed',

  // Gallery actions
  GALLERY_ITEM_ADDED = 'gallery_item_added',
  GALLERY_ITEM_REMOVED = 'gallery_item_removed',

  // Collaboration actions
  COLLABORATOR_ADDED = 'collaborator_added',
  COLLABORATOR_REMOVED = 'collaborator_removed',
  PERMISSION_CHANGED = 'permission_changed',

  // Comment actions
  COMMENT_ADDED = 'comment_added',
  COMMENT_DELETED = 'comment_deleted',
  COMMENT_RESOLVED = 'comment_resolved',

  // Version actions
  VERSION_CREATED = 'version_created',
  VERSION_ROLLED_BACK = 'version_rolled_back',

  // Project actions
  PROJECT_METADATA_UPDATED = 'project_metadata_updated',
}

/**
 * WebSocket message payload for track edits
 */
export interface TrackEditPayload {
  trackId: string;
  field: 'volume' | 'pan' | 'name' | 'muted';
  value: any;
  timestamp: number;
  userId: string;
}

/**
 * WebSocket message payload for cursor movements
 */
export interface CursorPositionPayload {
  userId: string;
  x: number;
  y: number;
  track?: string;
  time?: number;
  userName: string;
  userColor: string;
}

/**
 * Real-time presence information
 */
export interface UserPresenceInfo {
  userId: string;
  userName: string;
  userEmail: string;
  status: 'online' | 'away' | 'idle';
  cursorPosition?: CursorPositionPayload;
  editingTrackId?: string;
  lastHeartbeat: Date;
}

/**
 * Comment thread structure
 */
export interface CommentThread {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  timestamp?: number;
  trackId?: string;
  threadId?: string;
  resolved: boolean;
  mentions: string[];
  reactions: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Version snapshot data
 */
export interface VersionSnapshot {
  id: string;
  projectId: string;
  userId: string;
  snapshot: Record<string, any>;
  label?: string;
  changeLog?: string;
  createdAt: Date;
}

/**
 * Edit conflict detection
 */
export interface ConflictInfo {
  trackId: string;
  userId: string;
  field: string;
  value: any;
  timestamp: number;
}

/**
 * Rate limit tracking
 */
export interface RateLimitEntry {
  userId: string;
  projectId: string;
  trackId: string;
  timestamp: number;
}
