/**
 * RTMP Server Integration
 * Manages RTMP stream ingestion and routing to platforms
 *
 * This module initializes an RTMP server (using Node RTMP or Nginx integration)
 * and handles stream key validation, authentication, and routing.
 */

import { EventEmitter } from 'events';

export interface RtmpServerConfig {
  port: number;
  enableRecording?: boolean;
  recordingPath?: string;
  maxStreamDuration?: number; // milliseconds
  bandwidthLimit?: number; // kbps
  requireAuth?: boolean;
  hostname?: string;
}

export interface RtmpStream {
  id: string;
  streamKey: string;
  userId: string;
  startTime: number;
  endTime?: number;
  bytesTransferred: number;
  droppedFrames: number;
  fps: number;
  bitrate: number;
  resolution?: {
    width: number;
    height: number;
  };
  platform?: string;
  recordingPath?: string;
  isActive: boolean;
}

/**
 * RTMP Server Manager
 * Handles RTMP stream ingestion and platform routing
 */
export class RtmpServer extends EventEmitter {
  private config: RtmpServerConfig;
  private isRunning = false;
  private activeStreams = new Map<string, RtmpStream>();
  private streamValidator: ((streamKey: string, userId: string) => Promise<boolean>) | null = null;

  constructor(config: RtmpServerConfig) {
    super();
    this.config = {
      port: config.port,
      enableRecording: config.enableRecording !== false,
      recordingPath: config.recordingPath || './recordings',
      maxStreamDuration: config.maxStreamDuration || 12 * 60 * 60 * 1000, // 12 hours
      bandwidthLimit: config.bandwidthLimit || 10000, // 10 mbps
      requireAuth: config.requireAuth !== false,
      hostname: config.hostname || 'localhost',
    };
  }

  /**
   * Start the RTMP server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('RTMP server is already running');
    }

    try {
      // In production, this would initialize:
      // 1. Node-rtmp-server or connect to Nginx RTMP module
      // 2. Set up stream event handlers
      // 3. Initialize bandwidth monitoring

      console.log(`[RTMP Server] Starting on ${this.config.hostname}:${this.config.port}`);
      this.isRunning = true;
      this.emit('started', { port: this.config.port, hostname: this.config.hostname });
    } catch (error) {
      this.isRunning = false;
      throw new Error(`Failed to start RTMP server: ${String(error)}`);
    }
  }

  /**
   * Stop the RTMP server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Close all active streams
      for (const [streamKey, stream] of this.activeStreams.entries()) {
        if (stream.isActive) {
          await this.endStream(streamKey);
        }
      }

      console.log('[RTMP Server] Stopping...');
      this.isRunning = false;
      this.emit('stopped');
    } catch (error) {
      throw new Error(`Failed to stop RTMP server: ${String(error)}`);
    }
  }

  /**
   * Set custom stream validator
   * Called when a stream starts to validate the stream key
   */
  setStreamValidator(validator: (streamKey: string, userId: string) => Promise<boolean>): void {
    this.streamValidator = validator;
  }

  /**
   * Handle incoming RTMP stream
   * This would be called by the RTMP server when a stream connects
   */
  async handleStreamStart(streamKey: string, userId: string): Promise<RtmpStream> {
    // Validate stream key if required
    if (this.config.requireAuth && this.streamValidator) {
      const isValid = await this.streamValidator(streamKey, userId);
      if (!isValid) {
        throw new RtmpServerError('Invalid stream key', 'INVALID_STREAM_KEY');
      }
    }

    // Create stream record
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stream: RtmpStream = {
      id: streamId,
      streamKey,
      userId,
      startTime: Date.now(),
      bytesTransferred: 0,
      droppedFrames: 0,
      fps: 0,
      bitrate: 0,
      isActive: true,
    };

    this.activeStreams.set(streamKey, stream);
    this.emit('stream:start', stream);

    console.log(`[RTMP] Stream started: ${streamId} (key: ${streamKey})`);
    return stream;
  }

  /**
   * Handle stream data reception
   * Update stream statistics
   */
  async updateStreamStats(streamKey: string, stats: {
    bytesReceived: number;
    droppedFrames?: number;
    fps?: number;
    bitrate?: number;
    resolution?: { width: number; height: number };
  }): Promise<void> {
    const stream = this.activeStreams.get(streamKey);
    if (!stream) {
      throw new RtmpServerError('Stream not found', 'STREAM_NOT_FOUND');
    }

    stream.bytesTransferred += stats.bytesReceived;
    if (stats.droppedFrames !== undefined) stream.droppedFrames = stats.droppedFrames;
    if (stats.fps !== undefined) stream.fps = stats.fps;
    if (stats.bitrate !== undefined) stream.bitrate = stats.bitrate;
    if (stats.resolution !== undefined) stream.resolution = stats.resolution;

    this.emit('stream:stats', stream);
  }

  /**
   * End a stream
   */
  async endStream(streamKey: string): Promise<void> {
    const stream = this.activeStreams.get(streamKey);
    if (!stream) {
      throw new RtmpServerError('Stream not found', 'STREAM_NOT_FOUND');
    }

    stream.endTime = Date.now();
    stream.isActive = false;

    this.emit('stream:end', stream);
    console.log(`[RTMP] Stream ended: ${stream.id}`);
  }

  /**
   * Get active stream by key
   */
  getStream(streamKey: string): RtmpStream | undefined {
    return this.activeStreams.get(streamKey);
  }

  /**
   * Get all active streams
   */
  getActiveStreams(): RtmpStream[] {
    return Array.from(this.activeStreams.values()).filter(s => s.isActive);
  }

  /**
   * Get stream by user ID
   */
  getUserStream(userId: string): RtmpStream | undefined {
    for (const stream of this.activeStreams.values()) {
      if (stream.userId === userId && stream.isActive) {
        return stream;
      }
    }
    return undefined;
  }

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      running: this.isRunning,
      activeStreams: this.getActiveStreams().length,
      totalStreams: this.activeStreams.size,
      config: {
        port: this.config.port,
        hostname: this.config.hostname,
        recordingEnabled: this.config.enableRecording,
        bandwidthLimit: this.config.bandwidthLimit,
      },
    };
  }
}

/**
 * Custom error class for RTMP server errors
 */
export class RtmpServerError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'RtmpServerError';
  }
}

/**
 * RTMP Server singleton
 */
let rtmpServer: RtmpServer | null = null;

/**
 * Initialize RTMP server
 */
export function initRtmpServer(config?: Partial<RtmpServerConfig>): RtmpServer {
  if (!rtmpServer) {
    const port = config?.port || parseInt(process.env.RTMP_PORT || '1935');
    const recordingPath = config?.recordingPath || process.env.RECORDING_PATH || './recordings';

    rtmpServer = new RtmpServer({
      port,
      recordingPath,
      ...config,
    });
  }

  return rtmpServer;
}

/**
 * Get RTMP server instance
 */
export function getRtmpServer(): RtmpServer {
  if (!rtmpServer) {
    return initRtmpServer();
  }
  return rtmpServer;
}
