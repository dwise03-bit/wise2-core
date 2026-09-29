/**
 * Streaming Control System - Constants & Configuration
 * Platform configs, defaults, and preset values
 */

import type {
  PlatformConfig,
  Resolution,
  FPS,
  ResolutionSettings,
  EncoderCapability,
  Preset,
} from './streamingTypes';

/**
 * Platform Configurations
 */
export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitch: {
    name: 'Twitch',
    ingestServers: [
      { region: 'US East', url: 'rtmp://live-iad.twitch.tv/live' },
      { region: 'US West', url: 'rtmp://live-lax.twitch.tv/live' },
      { region: 'EU Frankfurt', url: 'rtmp://live-fra.twitch.tv/live' },
      { region: 'EU London', url: 'rtmp://live-lhr.twitch.tv/live' },
      { region: 'AP Singapore', url: 'rtmp://live-sin.twitch.tv/live' },
      { region: 'AP Tokyo', url: 'rtmp://live-nrt.twitch.tv/live' },
    ],
    recommendedBitrate: { min: 2500, max: 6000 },
    supportedResolutions: ['480p', '720p', '1080p'],
    supportedFPS: [30, 60],
    requiresOAuth: true,
    oauthEndpoint: 'https://id.twitch.tv/oauth2/authorize',
    streamKeyPattern: /^[a-zA-Z0-9]{40}$/,
  },
  youtube: {
    name: 'YouTube',
    ingestServers: [
      { region: 'Primary', url: 'rtmp://a.rtmp.youtube.com/live2' },
      { region: 'Backup 1', url: 'rtmp://b.rtmp.youtube.com/live2' },
      { region: 'Backup 2', url: 'rtmp://c.rtmp.youtube.com/live2' },
    ],
    recommendedBitrate: { min: 1500, max: 8000 },
    supportedResolutions: ['480p', '720p', '1080p', '1440p', '2160p'],
    supportedFPS: [24, 30, 48, 50, 60],
    requiresOAuth: true,
    oauthEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  facebook: {
    name: 'Facebook Live',
    ingestServers: [
      { region: 'US Primary', url: 'rtmps://live-api-s.facebook.com:443/rtmp/' },
    ],
    recommendedBitrate: { min: 1000, max: 4000 },
    supportedResolutions: ['480p', '720p', '1080p'],
    supportedFPS: [30],
    requiresOAuth: true,
    oauthEndpoint: 'https://www.facebook.com/v16.0/dialog/oauth',
  },
  'custom-rtmp': {
    name: 'Custom RTMP',
    ingestServers: [{ region: 'Custom', url: '' }],
    recommendedBitrate: { min: 1000, max: 8000 },
    supportedResolutions: ['480p', '720p', '1080p', '1440p', '2160p'],
    supportedFPS: [24, 30, 48, 50, 60],
    requiresOAuth: false,
  },
};

/**
 * Resolution Presets
 */
export const RESOLUTION_PRESETS: Record<Resolution, ResolutionSettings> = {
  '480p': { width: 854, height: 480, label: '480p' },
  '720p': { width: 1280, height: 720, label: '720p' },
  '1080p': { width: 1920, height: 1080, label: '1080p' },
  '1440p': { width: 2560, height: 1440, label: '1440p' },
  '2160p': { width: 3840, height: 2160, label: '2160p' },
};

/**
 * FPS Options
 */
export const FPS_OPTIONS: FPS[] = [24, 30, 48, 50, 60];

/**
 * Bitrate Presets (kbps)
 */
export const BITRATE_PRESETS: Record<Resolution, { min: number; recommended: number; max: number }> = {
  '480p': { min: 500, recommended: 1500, max: 3000 },
  '720p': { min: 1500, recommended: 3500, max: 5000 },
  '1080p': { min: 2500, recommended: 5000, max: 8000 },
  '1440p': { min: 4000, recommended: 7000, max: 12000 },
  '2160p': { min: 6000, recommended: 12000, max: 20000 },
};

/**
 * Encoder Presets (quality/speed tradeoff)
 */
export const ENCODER_PRESETS: Preset[] = [
  'ultrafast',
  'superfast',
  'veryfast',
  'faster',
  'fast',
  'medium',
  'slow',
  'slower',
];

export const PRESET_DESCRIPTIONS: Record<Preset, string> = {
  ultrafast: 'Maximum speed, lower quality - Best for low-end systems',
  superfast: 'Very fast encoding - Good for real-time streaming',
  veryfast: 'Fast encoding - Balanced quality and speed',
  faster: 'Faster than default',
  fast: 'Fast preset',
  medium: 'Default preset - Good balance',
  slow: 'High quality - Slower encoding',
  slower: 'Very high quality - Slowest encoding',
};

/**
 * Encoder Options
 */
export const ENCODER_OPTIONS = {
  'x264': { name: 'x264 (Software)', hwAccelerated: false },
  'nvidia-nvenc': { name: 'NVIDIA NVENC', hwAccelerated: true },
  'amd-vce': { name: 'AMD VCE', hwAccelerated: true },
  'intel-qsv': { name: 'Intel QSV', hwAccelerated: true },
};

export const ENCODER_CAPABILITIES: Record<string, EncoderCapability> = {
  'x264': {
    name: 'x264 (Software)',
    available: true,
    hwAccelerated: false,
    supportedResolutions: ['480p', '720p', '1080p', '1440p', '2160p'],
    maxFPS: 60,
  },
  'nvidia-nvenc': {
    name: 'NVIDIA NVENC',
    available: false, // Check at runtime
    hwAccelerated: true,
    supportedResolutions: ['480p', '720p', '1080p', '1440p', '2160p'],
    maxFPS: 60,
  },
  'amd-vce': {
    name: 'AMD VCE',
    available: false, // Check at runtime
    hwAccelerated: true,
    supportedResolutions: ['480p', '720p', '1080p', '1440p'],
    maxFPS: 60,
  },
  'intel-qsv': {
    name: 'Intel QSW',
    available: false, // Check at runtime
    hwAccelerated: true,
    supportedResolutions: ['480p', '720p', '1080p', '1440p', '2160p'],
    maxFPS: 60,
  },
};

/**
 * Default Streaming Settings
 */
export const DEFAULT_STREAM_SETTINGS = {
  platform: 'twitch' as const,
  resolution: RESOLUTION_PRESETS['720p'],
  fps: 30 as const,
  bitrate: {
    mode: 'auto' as const,
    min: 1500,
    max: 5000,
    current: 3500,
  },
  encoder: {
    encoder: 'x264' as const,
    preset: 'veryfast' as const,
    keyframeInterval: 2,
    bFrames: 3,
    profile: 'high' as const,
    level: '4.2',
  },
};

/**
 * Stats Graph Configuration
 */
export const STATS_GRAPH_CONFIG = {
  maxDataPoints: 60, // 60 seconds of data
  updateInterval: 1000, // Update every second
  animationDuration: 300, // ms
};

/**
 * Health Status Thresholds
 */
export const HEALTH_THRESHOLDS = {
  good: {
    droppedFramePercentage: { max: 2 },
    cpuUsage: { max: 70 },
    gpuUsage: { max: 80 },
    networkLatency: { max: 100 },
    encodingLag: { max: 50 },
  },
  okay: {
    droppedFramePercentage: { max: 5 },
    cpuUsage: { max: 85 },
    gpuUsage: { max: 90 },
    networkLatency: { max: 200 },
    encodingLag: { max: 100 },
  },
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to streaming server',
  INVALID_STREAM_KEY: 'Invalid stream key format',
  NETWORK_ERROR: 'Network error - check your connection',
  ENCODER_ERROR: 'Encoder initialization failed',
  OAUTH_FAILED: 'OAuth authentication failed',
  SETTINGS_INVALID: 'Invalid streaming settings',
  STREAM_ALREADY_RUNNING: 'A stream is already running',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  STREAM_STARTED: 'Stream started successfully',
  STREAM_STOPPED: 'Stream stopped',
  STREAM_PAUSED: 'Stream paused',
  STREAM_RESUMED: 'Stream resumed',
  TEST_PASSED: 'Stream test passed',
  STREAM_KEY_RESET: 'Stream key reset successfully',
  SETTINGS_SAVED: 'Settings saved',
  OAUTH_SUCCESS: 'Authenticated successfully',
};

/**
 * UI Constants
 */
export const UI_CONSTANTS = {
  MAX_STREAM_KEY_DISPLAY_LENGTH: 30,
  PAUSE_MAX_DURATION: 30, // seconds
  RECONNECT_MAX_ATTEMPTS: 5,
  RECONNECT_BACKOFF_MS: 2000,
  SCREENSHOT_QUALITY: 0.95,
};
