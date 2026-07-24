/**
 * API Types and Interfaces
 * Shared type definitions for Suno and OBS API endpoints
 */

// ============================================================================
// SUNO TYPES
// ============================================================================

export interface SunoGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number; // in seconds
  temperature?: number;
  tags?: string[];
}

export interface SunoGenerationResponse {
  id: string;
  prompt: string;
  style?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface SunoStatusResponse {
  id: string;
  prompt: string;
  style?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  musicUrl?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface SunoHistoryItem {
  id: string;
  prompt: string;
  style?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  musicUrl?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SunoHistoryResponse {
  items: SunoHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SunoExportRequest {
  format: 'mp3' | 'wav' | 'flac';
  bitrate?: number;
}

export interface SunoExportResponse {
  id: string;
  format: string;
  downloadUrl: string;
  expiresIn: number; // seconds
}

// ============================================================================
// OBS TYPES
// ============================================================================

export interface ObsScene {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ObsSceneCreateRequest {
  name: string;
}

export interface ObsSceneUpdateRequest {
  name?: string;
  order?: number;
}

export interface ObsSceneDeleteRequest {
  id: string;
}

export interface ObsSource {
  id: string;
  sceneId: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'image' | 'scene' | 'custom';
  settings: Record<string, any>;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ObsSourceCreateRequest {
  sceneId: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'image' | 'scene' | 'custom';
  settings?: Record<string, any>;
}

export interface ObsSourceUpdateRequest {
  name?: string;
  settings?: Record<string, any>;
  enabled?: boolean;
  order?: number;
}

export interface ObsStreamStartRequest {
  sceneId?: string;
  serviceUrl?: string;
  streamKey?: string;
}

export interface ObsStreamStartResponse {
  status: 'starting' | 'active';
  streamId: string;
  startedAt: string;
  rtmpUrl?: string;
}

export interface ObsStreamStopResponse {
  status: 'stopped';
  stoppedAt: string;
  duration: number; // seconds
  bytesTransferred: number;
}

export interface ObsStreamStats {
  status: 'active' | 'inactive';
  streamId?: string;
  duration?: number; // seconds
  bitrate?: number; // kbps
  fps?: number;
  droppedFrames?: number;
  totalFrames?: number;
  bandwidth?: number; // mbps
  bytesTransferred?: number;
  cpuUsage?: number; // percentage
  memoryUsage?: number; // percentage
  updatedAt: string;
}

// ============================================================================
// COMMON API TYPES
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  code: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface UserContext {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface ApiRequest {
  userContext?: UserContext;
  body?: any;
  query?: Record<string, string | string[]>;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
