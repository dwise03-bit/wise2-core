/**
 * Streaming Control System - Type Definitions
 * Professional streaming platform integration types
 */

export type StreamingPlatform = 'twitch' | 'youtube' | 'facebook' | 'custom-rtmp';

export type Resolution = '480p' | '720p' | '1080p' | '1440p' | '2160p';
export type FPS = 24 | 30 | 48 | 50 | 60;
export type Encoder = 'x264' | 'nvidia-nvenc' | 'amd-vce' | 'intel-qsv';
export type Preset = 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower';

export type StreamStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'error' | 'paused';
export type HealthStatus = 'good' | 'okay' | 'poor';

export interface ResolutionSettings {
  width: number;
  height: number;
  label: Resolution;
}

export interface BitrateSettings {
  mode: 'auto' | 'custom';
  min: number; // kbps
  max: number; // kbps
  current: number; // kbps
}

export interface EncoderSettings {
  encoder: Encoder;
  preset: Preset;
  keyframeInterval: number; // seconds
  bFrames: number;
  profile: 'baseline' | 'main' | 'high';
  level: string; // e.g., '4.2'
}

export interface StreamSettings {
  platform: StreamingPlatform;
  resolution: ResolutionSettings;
  fps: FPS;
  bitrate: BitrateSettings;
  encoder: EncoderSettings;
}

export interface PlatformCredentials {
  platform: StreamingPlatform;
  streamKey: string;
  streamUrl?: string;
  oauthToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  ingestServer?: string;
}

export interface StreamStats {
  viewerCount: number;
  bitrateCurrent: number; // kbps
  bitrateAverage: number; // kbps
  frameRateCurrent: number;
  frameRateTarget: number;
  droppedFrames: number;
  droppedFramePercentage: number;
  encodingLag: number; // ms
  networkLatency: number; // ms
  cpuUsage: number; // %
  gpuUsage: number; // %
  reconnectCount: number;
  uptime: number; // seconds
}

export interface StreamState {
  status: StreamStatus;
  settings: StreamSettings;
  credentials: PlatformCredentials | null;
  stats: StreamStats;
  health: HealthStatus;
  lastError?: string;
  isPaused: boolean;
  pauseTimeRemaining?: number; // seconds
}

export interface StreamGraph {
  timestamp: number;
  value: number;
}

export interface PlatformConfig {
  name: string;
  ingestServers: {
    region: string;
    url: string;
    fallback?: string;
  }[];
  recommendedBitrate: {
    min: number;
    max: number;
  };
  supportedResolutions: Resolution[];
  supportedFPS: FPS[];
  maxStreamDuration?: number; // seconds, undefined for unlimited
  requiresOAuth: boolean;
  oauthEndpoint?: string;
  streamKeyPattern?: RegExp;
}

export interface EncoderCapability {
  name: string;
  available: boolean;
  hwAccelerated: boolean;
  supportedResolutions: Resolution[];
  maxFPS: number;
}

export interface StreamingControlContextType {
  state: StreamState;
  updateSettings: (settings: Partial<StreamSettings>) => void;
  updateCredentials: (credentials: PlatformCredentials) => void;
  startStream: () => Promise<void>;
  stopStream: () => Promise<void>;
  pauseStream: () => Promise<void>;
  resumeStream: () => Promise<void>;
  testStream: () => Promise<boolean>;
  resetStreamKey: () => Promise<string>;
  captureScreenshot: () => Promise<Blob | null>;
}

export interface StreamGraphData {
  fps: StreamGraph[];
  bitrate: StreamGraph[];
  maxLength: number;
}
