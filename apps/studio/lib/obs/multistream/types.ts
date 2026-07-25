/**
 * Multistream Broadcasting Types
 * Support for simultaneous broadcasting to multiple platforms
 */

export type MultistreamPlatform = 'twitch' | 'youtube' | 'facebook' | 'linkedin' | 'custom-rtmp';

export type PlatformStatus = 'idle' | 'connecting' | 'live' | 'error' | 'disconnected';

/**
 * Platform-specific configuration
 */
export interface PlatformConfig {
  id: string;
  platform: MultistreamPlatform;
  name: string;
  streamKey: string;
  rtmpUrl?: string; // For custom RTMP endpoints
  isEnabled: boolean;
  isConnected: boolean;
  status: PlatformStatus;

  // Platform-specific settings
  settings: {
    latencyMode?: 'normal' | 'low' | 'ultra-low'; // YouTube/Twitch
    bitrate?: number; // Platform max bitrate
    maxDelay?: number; // ms
    autoReconnect?: boolean;
  };
}

/**
 * Multistream configuration
 */
export interface MultistreamConfig {
  id: string;
  name: string;
  description?: string;

  // Enabled platforms
  platforms: PlatformConfig[];

  // Global settings
  encodingPreset: 'ultrafast' | 'fast' | 'medium' | 'slow';
  videoBitrate: number; // kbps
  audioBitrate: number; // kbps
  resolution: '720p' | '1080p' | '1440p' | '2160p';
  fps: number; // 30, 60

  // Failover/Recovery
  enableFailover: boolean;
  failoverDelay: number; // ms to wait before failover

  // Monitoring
  enableMetrics: boolean;
  metricsInterval: number; // ms

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Per-platform streaming status
 */
export interface PlatformStreamStatus {
  platform: MultistreamPlatform;
  status: PlatformStatus;
  statusCode?: number;
  errorMessage?: string;

  // Live stats
  viewerCount?: number;
  bitrate?: number; // actual bitrate
  latency?: number; // ms
  frameDrops?: number;

  // Timing
  connectedAt?: Date;
  disconnectedAt?: Date;
  uptime?: number; // seconds

  // Health
  bufferHealth?: number; // 0-1
  networkQuality?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

/**
 * Overall multistream status
 */
export interface MultistreamStatus {
  isActive: boolean;
  startedAt?: Date;

  // Per-platform status
  platforms: Record<string, PlatformStreamStatus>;

  // Aggregate metrics
  totalViewers: number;
  activePlatforms: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

  // Encoding stats
  fps: number;
  videoBitrate: number;
  audioBitrate: number;
  cpuUsage: number; // 0-100
  memoryUsage: number; // MB

  // Last update
  lastUpdate: Date;
}

/**
 * Multistream event
 */
export interface MultistreamEvent {
  type:
    | 'started'
    | 'stopped'
    | 'platform-connected'
    | 'platform-disconnected'
    | 'platform-error'
    | 'failover'
    | 'metrics-update'
    | 'error';
  platform?: MultistreamPlatform;
  timestamp: Date;
  data?: Record<string, any>;
  error?: string;
}

/**
 * Historical stats for a platform
 */
export interface PlatformStats {
  platform: MultistreamPlatform;
  date: Date;

  // Peak stats during the broadcast
  peakViewers: number;
  peakBitrate: number;
  averageBitrate: number;
  averageLatency: number; // ms

  // Quality metrics
  frameDropPercentage: number;
  bufferUnderruns: number;
  reconnectCount: number;

  // Uptime
  streamDuration: number; // seconds
  downtime: number; // seconds
  uptime: number; // percentage

  // Engagement (if available from platform)
  totalChatMessages?: number;
  uniqueChatters?: number;
}

/**
 * Multistream session record
 */
export interface MultistreamSession {
  id: string;
  configId: string;

  // Timing
  startedAt: Date;
  stoppedAt?: Date;
  duration?: number; // seconds

  // Platforms used
  platforms: string[]; // array of platform names

  // Aggregate stats
  totalViewers: number;
  totalChatMessages?: number;

  // Per-platform stats
  platformStats: PlatformStats[];

  // Metadata
  title?: string;
  category?: string;
  tags?: string[];
}
