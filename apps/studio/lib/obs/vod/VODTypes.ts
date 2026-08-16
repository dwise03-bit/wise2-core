/**
 * VOD Upload Types and Interfaces
 *
 * Type definitions for Video On Demand (VOD) auto-upload functionality
 */

/**
 * Supported platforms for VOD upload
 */
export type VODPlatform = 'youtube' | 'twitch' | 's3' | 'custom';

/**
 * VOD visibility settings
 */
export type VODVisibility = 'public' | 'unlisted' | 'private';

/**
 * VOD upload status
 */
export type VODUploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'paused';

/**
 * VOD platform configuration
 */
export interface VODPlatformConfig {
  platform: VODPlatform;
  enabled: boolean;
  visibility: VODVisibility;
  autoRetry: boolean;
  maxRetries: number;
  retryDelayMs: number;
  // Platform-specific
  youtube?: YouTubeVODConfig;
  twitch?: TwitchVODConfig;
  s3?: S3VODConfig;
}

/**
 * YouTube-specific configuration
 */
export interface YouTubeVODConfig {
  channelId?: string;
  playlistId?: string;
  notifySubscribers?: boolean;
  madeForKids?: boolean;
  license?: 'creativeCommon' | 'standard';
  enableComments?: boolean;
  enableRatings?: boolean;
  enableStatistics?: boolean;
}

/**
 * Twitch-specific configuration
 */
export interface TwitchVODConfig {
  channelId?: string;
  language?: string;
  isMature?: boolean;
  saveToArchive?: boolean;
  ttl?: number; // Time to live in days
}

/**
 * AWS S3 configuration
 */
export interface S3VODConfig {
  bucket: string;
  region: string;
  prefix?: string;
  acl?: 'private' | 'public-read' | 'authenticated-read';
  storageClass?: 'STANDARD' | 'STANDARD_IA' | 'GLACIER';
  enableVersioning?: boolean;
}

/**
 * VOD metadata
 */
export interface VODMetadata {
  id: string;
  recordingId: string;
  title: string;
  description?: string;
  tags: string[];
  category?: string;
  thumbnail?: {
    url: string;
    uploadedAt?: Date;
  };
  duration: number; // seconds
  fileSize: number; // bytes
  resolution: string; // e.g., "1920x1080"
  frameRate: number;
  bitrate: number; // kbps
  recordedAt: Date;
  createdAt: Date;
}

/**
 * VOD upload job
 */
export interface VODUploadJob {
  id: string;
  recordingId: string;
  recordingPath: string;
  platforms: VODPlatform[];
  metadata: VODMetadata;
  status: VODUploadStatus;
  progress: number; // 0-100
  currentPlatform?: VODPlatform;
  platformResults: Map<VODPlatform, VODPlatformResult>;
  attempts: number;
  lastAttemptAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform upload result
 */
export interface VODPlatformResult {
  platform: VODPlatform;
  status: VODUploadStatus;
  videoId?: string;
  url?: string;
  uploadedAt?: Date;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  error?: string;
  retries: number;
  lastAttemptAt?: Date;
}

/**
 * Thumbnail generation options
 */
export interface ThumbnailOptions {
  generateFromKeyframe?: boolean;
  keyframePosition?: 'middle' | 'start' | 'end' | number; // 0-1 or ms
  width?: number; // default 1280
  height?: number; // default 720
  format?: 'jpg' | 'png' | 'webp';
  quality?: number; // 0-100
}

/**
 * VOD upload configuration
 */
export interface VODUploadConfig {
  autoUploadEnabled: boolean;
  defaultVisibility: VODVisibility;
  platforms: Map<VODPlatform, VODPlatformConfig>;
  thumbnailOptions: ThumbnailOptions;
  maxConcurrentUploads: number;
  uploadRetryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
  storageConfig: {
    tempDirectory: string;
    archiveDirectory: string;
    maxStorageGB: number;
  };
}

/**
 * VOD upload event
 */
export interface VODUploadEvent {
  type:
    | 'upload_started'
    | 'upload_progress'
    | 'platform_started'
    | 'platform_progress'
    | 'platform_completed'
    | 'platform_failed'
    | 'upload_completed'
    | 'upload_failed'
    | 'thumbnail_generated'
    | 'retry_scheduled';
  jobId: string;
  recordingId?: string;
  platform?: VODPlatform;
  progress?: number;
  message?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Upload queue item
 */
export interface UploadQueueItem {
  jobId: string;
  recordingPath: string;
  platforms: VODPlatform[];
  metadata: VODMetadata;
  priority: number; // 0-10, higher = more urgent
  addedAt: Date;
}
