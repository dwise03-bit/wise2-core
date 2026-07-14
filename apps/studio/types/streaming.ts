/**
 * Streaming and Live Studio Type Definitions
 */

/**
 * Stream Status
 */
export type StreamStatus = 'idle' | 'starting' | 'streaming' | 'stopping' | 'error';
export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopping';

/**
 * Streaming Configuration
 */
export interface StreamConfig {
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  scheduledFor?: Date;
  visibility: 'public' | 'private' | 'unlisted';
}

/**
 * Stream Status Info
 */
export interface StreamStatusInfo {
  isLive: boolean;
  status: StreamStatus;
  viewerCount: number;
  uptime: number; // seconds
  bitrate: number; // kbps
  resolution: string; // e.g., "1080p"
  frameRate: number; // fps
}

/**
 * Stream Destination
 */
export type DestinationType = 'youtube' | 'twitch' | 'facebook' | 'linkedin' | 'rtmp' | 'custom';

export interface StreamDestination {
  id: string;
  type: DestinationType;
  name: string;
  isConnected: boolean;
  isActive: boolean;
  url?: string;
  streamKey?: string;
}

/**
 * Scene Definition
 */
export interface Scene {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  sources: SceneSource[];
  isActive: boolean;
}

export interface SceneSource {
  id: string;
  type: 'camera' | 'screen' | 'media' | 'image' | 'text';
  name: string;
  enabled: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  properties: Record<string, any>;
}

/**
 * Recording Info
 */
export interface Recording {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  fileSize: number; // bytes
  trackCount: number;
  isArchived: boolean;
  path?: string;
}

/**
 * Mixer Channel
 */
export interface MixerChannelConfig {
  id: string;
  name: string;
  label: string;
  type: 'mic' | 'music' | 'system' | 'guest' | 'playback' | 'master';
  volume: number; // -60 to 6 dB
  peakLevel: number; // dB
  isMuted: boolean;
  isSolo: boolean;
  pan: number; // -100 to 100
  eq?: EQConfig;
  compressor?: CompressorConfig;
}

export interface EQConfig {
  enabled: boolean;
  bands: {
    hz: number;
    gain: number; // dB
    q: number;
  }[];
}

export interface CompressorConfig {
  enabled: boolean;
  threshold: number; // dB
  ratio: number;
  attackTime: number; // ms
  releaseTime: number; // ms
}

/**
 * System Metrics
 */
export interface SystemMetrics {
  cpuUsage: number; // 0-100%
  memoryUsage: number; // 0-100%
  diskUsage: number; // bytes
  diskTotal: number; // bytes
  networkBandwidth: number; // Mbps
  temperature?: number; // Celsius
}

/**
 * Stream Health
 */
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface StreamHealth {
  status: HealthStatus;
  bitrate: number;
  frameDrops: number;
  latency: number; // ms
  bufferHealth: number; // 0-100%
}

/**
 * Chat Message
 */
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadges: string[];
  message: string;
  timestamp: Date;
  isModerator: boolean;
}

/**
 * Keyboard Shortcut
 */
export interface KeyboardShortcut {
  name: string;
  description: string;
  keys: string[];
  action: () => void;
  category: 'stream' | 'recording' | 'scene' | 'mixer' | 'chat';
}
