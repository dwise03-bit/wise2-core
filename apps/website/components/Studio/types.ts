/**
 * WISE² Studio Workspace Types
 * Type definitions for the premium creative canvas interface
 */

export type PanelTab = 'properties' | 'timeline' | 'prompt' | 'inspector';
export type NavCollapse = 'expanded' | 'collapsed';
export type SyncStatus = 'synced' | 'syncing' | 'error';
export type AIStatus = 'idle' | 'processing' | 'streaming' | 'error';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  isPinned?: boolean;
  children?: NavItem[];
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedAsset?: string;
  clipboard?: string;
}

export interface CommandResult {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: Record<string, unknown>;
}

export interface PromptEditorState {
  content: string;
  isGenerating: boolean;
  responseStream: string;
  tokens: {
    input: number;
    output: number;
  };
}

export interface TimelineTrack {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  keyframes: TimelineKeyframe[];
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface TimelineKeyframe {
  id: string;
  time: number;
  value: string | number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface PropertyInspector {
  selectedElementId?: string;
  properties: Record<string, unknown>;
}

export interface StatusIndicators {
  connection: 'online' | 'offline' | 'slow';
  sync: SyncStatus;
  aiStatus: AIStatus;
  deploymentStatus: 'idle' | 'building' | 'deployed';
  saveState: 'saved' | 'unsaved' | 'saving';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
  subscription: 'free' | 'pro' | 'enterprise';
}
