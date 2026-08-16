/**
 * OBS Backend - Main Exports
 * Complete OBS integration with RTMP, platform routing, scenes, and source capture
 */

// RTMP Server
export {
  RtmpServer,
  RtmpServerError,
  initRtmpServer,
  getRtmpServer,
  type RtmpServerConfig,
  type RtmpStream,
} from './rtmpServer';

// Platform Integration
export {
  PlatformIntegration,
  PlatformError,
  initPlatformIntegration,
  getPlatformIntegration,
  type PlatformType,
  type PlatformCredentials,
  type PlatformStreamConfig,
  type PlatformStreamStatus,
} from './platformIntegration';

// Stream Session Management
export {
  StreamSession,
  StreamSessionManager,
  StreamSessionError,
  StreamSessionStatus,
  initStreamSessionManager,
  getStreamSessionManager,
  type StreamSessionConfig,
  type StreamMetrics,
  type StreamHealth,
} from './streamSession';

// Scene Manager
export {
  SceneManager,
  SceneManagerError,
  initSceneManager,
  getSceneManager,
  type SceneConfig,
  type Scene,
  type SceneSource,
  type TransitionEffect,
} from './sceneManager';

// Source Capture & Composition
export {
  ScreenCaptureSource,
  WebcamCaptureSource,
  BrowserSourceCapture,
  AudioMixer,
  SourceComposition,
  SourceCaptureError,
  type ScreenCaptureOptions,
  type WebcamCaptureOptions,
  type BrowserSourceOptions,
  type AudioMixOptions,
  type CaptureSource,
  type CompositionFrame,
  type CaptureSourceType,
} from './sourceCapture';

// Stream Pipeline (Video Composition, Audio Mixing, Encoding, RTMP, Recording)
export {
  StreamPipeline,
  StreamPipelineError,
  initStreamPipeline,
  getStreamPipeline,
  VideoCompositionEngine,
  AudioMixingEngine,
  VideoEncoder,
  AudioEncoder,
  Mp4Muxer,
  RtmpStreamer,
  QualityAdaptationManager,
  type StreamPipelineConfig,
  type VideoSource,
  type AudioSource,
  type AudioEffect,
  type StreamMetrics as StreamMetricsConfig,
  type QualityProfile,
} from './streamPipeline';

/**
 * OBS Backend Unified API
 * Combines all modules for complete streaming solution
 */
export class ObsBackend {
  private rtmpServer: InstanceType<typeof import('./rtmpServer').RtmpServer>;
  private platformIntegration: InstanceType<typeof import('./platformIntegration').PlatformIntegration>;
  private sessionManager: InstanceType<typeof import('./streamSession').StreamSessionManager>;
  private sceneManager: InstanceType<typeof import('./sceneManager').SceneManager>;

  constructor() {
    this.rtmpServer = getRtmpServer();
    this.platformIntegration = getPlatformIntegration();
    this.sessionManager = getStreamSessionManager();
    this.sceneManager = getSceneManager();
  }

  /**
   * Get RTMP server
   */
  getRtmpServer() {
    return this.rtmpServer;
  }

  /**
   * Get platform integration
   */
  getPlatformIntegration() {
    return this.platformIntegration;
  }

  /**
   * Get session manager
   */
  getSessionManager() {
    return this.sessionManager;
  }

  /**
   * Get scene manager
   */
  getSceneManager() {
    return this.sceneManager;
  }

  /**
   * Get full system status
   */
  getStatus() {
    return {
      rtmp: this.rtmpServer.getStatus(),
      sessions: this.sessionManager.getStatus(),
      scenes: this.sceneManager.getStats(),
      platforms: this.platformIntegration.getConfiguredPlatforms(),
    };
  }

  /**
   * Initialize full system
   */
  async initialize(): Promise<void> {
    try {
      console.log('[OBS Backend] Initializing...');

      // Start RTMP server
      await this.rtmpServer.start();

      console.log('[OBS Backend] Initialization complete');
    } catch (error) {
      throw new Error(`Failed to initialize OBS backend: ${String(error)}`);
    }
  }

  /**
   * Shutdown full system
   */
  async shutdown(): Promise<void> {
    try {
      console.log('[OBS Backend] Shutting down...');

      // Stop RTMP server
      await this.rtmpServer.stop();

      console.log('[OBS Backend] Shutdown complete');
    } catch (error) {
      throw new Error(`Failed to shutdown OBS backend: ${String(error)}`);
    }
  }
}

/**
 * Global OBS backend instance
 */
let obsBackendInstance: ObsBackend | null = null;

/**
 * Initialize OBS backend
 */
export function initObsBackend(): ObsBackend {
  if (!obsBackendInstance) {
    obsBackendInstance = new ObsBackend();
  }
  return obsBackendInstance;
}

/**
 * Get OBS backend instance
 */
export function getObsBackend(): ObsBackend {
  if (!obsBackendInstance) {
    return initObsBackend();
  }
  return obsBackendInstance;
}
