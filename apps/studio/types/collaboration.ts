/**
 * Real-Time Collaboration System Types
 * Comprehensive type definitions for multi-user editing, presence tracking, and project sharing
 */

// ===== COLLABORATOR & PERMISSION TYPES =====

export type CollaboratorRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export type Permission =
  | 'view_project'
  | 'edit_audio'
  | 'edit_mixer'
  | 'upload_gallery'
  | 'comment'
  | 'invite_collaborators'
  | 'manage_permissions'
  | 'delete_project'
  | 'create_version';

export interface Collaborator {
  id: string;
  userId: string;
  projectId: string;
  role: CollaboratorRole;
  permissions: Permission[];
  joinedAt: string;
  lastActiveAt: string;
  status: 'active' | 'inactive';
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  invitedBy: string;
  invitedEmail: string;
  token: string;
  role: CollaboratorRole;
  expiresAt?: string;
  acceptedAt?: string;
  acceptedBy?: string;
  createdAt: string;
}

// ===== PRESENCE TRACKING TYPES =====

export type UserStatus = 'online' | 'away' | 'idle' | 'offline';

export interface CursorPosition {
  x: number;
  y: number;
  track?: string;
  time?: number;
}

export interface UserPresence {
  id: string;
  userId: string;
  projectId: string;
  status: UserStatus;
  cursorPosition?: CursorPosition;
  editingTrackId?: string;
  lastHeartbeat: string;
  socketId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    color?: string; // Hex color for presence indicator
  };
}

export interface PresenceUpdate {
  userId: string;
  status: UserStatus;
  cursorPosition?: CursorPosition;
  editingTrackId?: string;
}

// ===== COMMENT & ANNOTATION TYPES =====

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface ProjectComment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  timestamp?: number; // seconds in audio
  trackId?: string;
  threadId?: string;
  mentions: string[];
  reactions: Record<string, Reaction>;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  replies?: ProjectComment[];
}

export interface CommentThread {
  id: string;
  comments: ProjectComment[];
  unreadCount: number;
}

export interface CreateCommentPayload {
  projectId: string;
  content: string;
  timestamp?: number;
  trackId?: string;
  threadId?: string;
  mentions?: string[];
}

export interface ReactionPayload {
  commentId: string;
  emoji: string;
  action: 'add' | 'remove';
}

// ===== ACTIVITY & AUDIT TYPES =====

export type ActivityAction =
  | 'track_added'
  | 'track_removed'
  | 'track_updated'
  | 'volume_changed'
  | 'mute_toggled'
  | 'solo_toggled'
  | 'bpm_changed'
  | 'gallery_image_added'
  | 'gallery_image_removed'
  | 'comment_added'
  | 'collaborator_added'
  | 'collaborator_removed'
  | 'permission_changed'
  | 'version_created'
  | 'version_reverted';

export interface ActivityLogEntry {
  id: string;
  projectId: string;
  userId: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  details: Record<string, any>;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ActivityFilter {
  userId?: string;
  action?: ActivityAction;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// ===== VERSION CONTROL TYPES =====

export interface VersionSnapshot {
  tracks: Array<{
    id: string;
    name: string;
    volume: number;
    muted: boolean;
    solo: boolean;
  }>;
  masterVolume: number;
  bpm: number;
  playbackPosition: number;
  gallery: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  [key: string]: any;
}

export interface VersionHistoryEntry {
  id: string;
  projectId: string;
  userId: string;
  snapshot: VersionSnapshot;
  label?: string;
  changeLog?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface VersionDiff {
  added: Record<string, any>;
  removed: Record<string, any>;
  changed: Record<string, { old: any; new: any }>;
}

// ===== REAL-TIME SYNC TYPES =====

export type MessageType =
  | 'presence_update'
  | 'track_update'
  | 'mixer_update'
  | 'gallery_update'
  | 'comment_added'
  | 'comment_resolved'
  | 'reaction_added'
  | 'user_joined'
  | 'user_left'
  | 'permission_changed'
  | 'state_sync';

export interface CollaborationMessage {
  type: MessageType;
  projectId: string;
  userId: string;
  timestamp: number;
  data: Record<string, any>;
  clientId?: string; // For deduplication
}

export interface TrackUpdateMessage extends CollaborationMessage {
  type: 'track_update';
  data: {
    trackId: string;
    volume?: number;
    muted?: boolean;
    solo?: boolean;
    name?: string;
  };
}

export interface MixerUpdateMessage extends CollaborationMessage {
  type: 'mixer_update';
  data: {
    masterVolume?: number;
    bpm?: number;
    playbackPosition?: number;
  };
}

export interface GalleryUpdateMessage extends CollaborationMessage {
  type: 'gallery_update';
  data: {
    action: 'add' | 'remove';
    imageId: string;
    imageUrl?: string;
    imageName?: string;
  };
}

// ===== CONFLICT RESOLUTION TYPES =====

export interface ConflictResolution {
  strategy: 'last_write_wins' | 'merge' | 'manual';
  timestamp: number;
  winner?: string; // User ID of the winning change
  details?: Record<string, any>;
}

export interface ConflictDialog {
  id: string;
  projectId: string;
  entityType: string;
  entityId: string;
  conflictingUsers: string[];
  originalValue: any;
  conflictingValues: Record<string, any>;
  resolution?: ConflictResolution;
}

// ===== COLLABORATION STATE TYPES =====

export interface CollaborationState {
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  permissions: Permission[];
  collaborators: Collaborator[];
  presence: UserPresence[];
  comments: ProjectComment[];
  activityLog: ActivityLogEntry[];
  versions: VersionHistoryEntry[];
  conflicts: ConflictDialog[];
  isConnected: boolean;
  lastSyncTime: number;
  pendingChanges: CollaborationMessage[];
}

// ===== WEBSOCKET EVENT TYPES =====

export interface WebSocketEvent {
  type: MessageType;
  payload: any;
  timestamp: number;
}

export interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastReconnectAttempt?: number;
  connectionErrors: number;
  socketId?: string;
}

// ===== NOTIFICATION TYPES =====

export type NotificationType =
  | 'user_joined'
  | 'user_left'
  | 'comment_mentioned'
  | 'permission_changed'
  | 'conflict_alert'
  | 'version_created';

export interface CollaborationNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId: string;
  relatedUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// ===== PERMISSION CHECK TYPES =====

export interface PermissionCheck {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canManagePermissions: boolean;
  canDeleteProject: boolean;
  canCreateVersion: boolean;
  canViewActivity: boolean;
}

// ===== STATISTICS TYPES =====

export interface CollaborationStats {
  totalCollaborators: number;
  activeCollaborators: number;
  totalComments: number;
  unresolvedComments: number;
  totalVersions: number;
  lastActivityTime: string;
  mostActiveTrack: string;
  averageEditorsPerSession: number;
}
