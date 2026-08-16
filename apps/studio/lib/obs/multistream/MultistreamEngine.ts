/**
 * Multistream Engine
 * Encodes video/audio once and broadcasts to multiple platforms simultaneously
 * Handles failover, health monitoring, and per-platform stat tracking
 */

import { EventEmitter } from 'events';
import {
  MultistreamConfig,
  PlatformConfig,
  MultistreamStatus,
  PlatformStreamStatus,
  PlatformStatus,
  MultistreamEvent,
  PlatformStats,
  MultistreamSession,
  MultistreamPlatform,
} from './types';

interface RTMPConnection {
  platform: MultistreamPlatform;
  streamId: string;
  connected: boolean;
  socket?: any; // WebSocket or TCP socket
  buffer: Buffer[];
  backpressure: boolean;
}

interface EncodingStats {
  framesCaptured: number;
  framesEncoded: number;
  framesDropped: number;
  fps: number;
  videoBitrate: number;
  audioBitrate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export class MultistreamEngine extends EventEmitter {
  private config: MultistreamConfig | null = null;
  private isRunning = false;
  private connections: Map<MultistreamPlatform, RTMPConnection> = new Map();

  private status: MultistreamStatus = {
    isActive: false,
    platforms: {},
    totalViewers: 0,
    activePlatforms: 0,
    healthStatus: 'excellent',
    fps: 30,
    videoBitrate: 0,
    audioBitrate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    lastUpdate: new Date(),
  };

  private sessionId = '';
  private sessionStats: Map<MultistreamPlatform, PlatformStats> = new Map();
  private encodingStats: EncodingStats = {
    framesCaptured: 0,
    framesEncoded: 0,
    framesDropped: 0,
    fps: 0,
    videoBitrate: 0,
    audioBitrate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
  };

  private metricsTimer: NodeJS.Timer | null = null;
  private healthCheckTimer: NodeJS.Timer | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize multistream with configuration
   */
  async initialize(config: MultistreamConfig): Promise<void> {
    this.config = config;
    this.sessionId = this.generateSessionId();

    // Initialize platform status tracking
    for (const platform of config.platforms) {
      if (platform.isEnabled) {
        this.status.platforms[platform.platform] = {
          platform: platform.platform,
          status: 'idle',
          frameDrops: 0,
          bufferHealth: 1,
          networkQuality: 'excellent',
        };

        // Initialize session stats
        this.sessionStats.set(platform.platform, {
          platform: platform.platform,
          date: new Date(),
          peakViewers: 0,
          peakBitrate: 0,
          averageBitrate: 0,
          averageLatency: 0,
          frameDropPercentage: 0,
          bufferUnderruns: 0,
          reconnectCount: 0,
          streamDuration: 0,
          downtime: 0,
          uptime: 100,
        });
      }
    }

    this.emit('initialized', { configId: config.id });
  }

  /**
   * Start multistream broadcast
   */
  async start(): Promise<void> {
    if (!this.config) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    if (this.isRunning) {
      throw new Error('Multistream is already running.');
    }

    this.isRunning = true;
    this.status.isActive = true;
    this.status.startedAt = new Date();

    try {
      // Connect to all enabled platforms in parallel
      const connectPromises = this.config.platforms
        .filter((p) => p.isEnabled)
        .map((platform) => this.connectPlatform(platform));

      await Promise.allSettled(connectPromises);

      // Start metrics collection
      this.startMetricsCollection();
      this.startHealthCheck();

      this.emit('started', {
        sessionId: this.sessionId,
        platforms: Array.from(this.connections.keys()),
      } as MultistreamEvent);
    } catch (error) {
      this.isRunning = false;
      this.status.isActive = false;
      throw error;
    }
  }

  /**
   * Stop multistream broadcast
   */
  async stop(): Promise<MultistreamSession> {
    if (!this.isRunning) {
      throw new Error('Multistream is not running.');
    }

    this.isRunning = false;
    this.status.isActive = false;

    // Disconnect all platforms
    const disconnectPromises = Array.from(this.connections.values()).map((conn) =>
      this.disconnectPlatform(conn.platform),
    );

    await Promise.allSettled(disconnectPromises);

    // Stop monitoring
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Create session record
    const session = this.createSessionRecord();

    this.emit('stopped', {
      sessionId: this.sessionId,
      duration: session.duration,
    } as MultistreamEvent);

    return session;
  }

  /**
   * Send encoded frame/chunk to all connected platforms
   */
  async sendEncodedChunk(
    encodedData: Buffer,
    isKeyFrame: boolean,
    timestamp: number,
  ): Promise<void> {
    if (!this.isRunning) return;

    this.encodingStats.framesCaptured++;

    // Send to all connected platforms
    for (const [platform, connection] of this.connections.entries()) {
      if (connection.connected) {
        try {
          this.sendToRTMPStream(connection, encodedData, isKeyFrame, timestamp);
        } catch (error) {
          this.handlePlatformError(platform, error as Error);
        }
      }
    }
  }

  /**
   * Connect to a specific platform
   */
  private async connectPlatform(platform: PlatformConfig): Promise<void> {
    try {
      // Build RTMP URL
      const rtmpUrl = platform.rtmpUrl || this.buildRtmpUrl(platform.platform);
      const fullUrl = `${rtmpUrl}/${platform.streamKey}`;

      // Create RTMP connection
      const connection: RTMPConnection = {
        platform: platform.platform,
        streamId: this.generateStreamId(),
        connected: false,
        buffer: [],
        backpressure: false,
      };

      // Simulate connection (in real implementation, connect via WebSocket/TCP)
      await this.establishRTMPConnection(connection, fullUrl);

      this.connections.set(platform.platform, connection);

      // Update status
      this.updatePlatformStatus(platform.platform, 'live', {
        connectedAt: new Date(),
      });

      this.emit('platform-connected', {
        platform: platform.platform,
        streamId: connection.streamId,
      } as MultistreamEvent);
    } catch (error) {
      this.handlePlatformError(platform.platform, error as Error);
    }
  }

  /**
   * Disconnect from a specific platform
   */
  private async disconnectPlatform(platform: MultistreamPlatform): Promise<void> {
    const connection = this.connections.get(platform);
    if (!connection) return;

    try {
      // Close RTMP connection
      if (connection.socket) {
        connection.socket.end();
      }

      this.updatePlatformStatus(platform, 'disconnected', {
        disconnectedAt: new Date(),
      });

      this.emit('platform-disconnected', {
        platform,
        uptime: this.calculateUptime(platform),
      } as MultistreamEvent);
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
    } finally {
      this.connections.delete(platform);
    }
  }

  /**
   * Establish RTMP connection
   */
  private async establishRTMPConnection(
    connection: RTMPConnection,
    rtmpUrl: string,
  ): Promise<void> {
    // This is where you would actually connect via TCP/WebSocket
    // For demo purposes, we simulate successful connection
    return new Promise((resolve) => {
      setTimeout(() => {
        connection.connected = true;
        resolve();
      }, 100);
    });
  }

  /**
   * Send data to RTMP stream
   */
  private sendToRTMPStream(
    connection: RTMPConnection,
    data: Buffer,
    isKeyFrame: boolean,
    timestamp: number,
  ): void {
    if (!connection.connected) return;

    // Build RTMP packet
    const packet = this.buildRTMPPacket(data, isKeyFrame, timestamp);

    // Handle backpressure
    if (connection.backpressure) {
      connection.buffer.push(packet);

      // Drop frames if buffer too large (failover strategy)
      if (connection.buffer.length > 30) {
        connection.buffer.shift();
        this.encodingStats.framesDropped++;
        this.updatePlatformStats(connection.platform, { frameDrops: 1 });
      }
    } else {
      // Send immediately if socket available
      if (connection.socket) {
        try {
          connection.socket.write(packet);
          this.encodingStats.framesEncoded++;
        } catch (error) {
          connection.backpressure = true;
        }
      }
    }
  }

  /**
   * Build RTMP packet from encoded data
   */
  private buildRTMPPacket(data: Buffer, isKeyFrame: boolean, timestamp: number): Buffer {
    // RTMP packet structure:
    // - 12-byte header (packet type, length, timestamp, stream ID)
    // - payload
    const header = Buffer.alloc(12);

    // Packet type: 0x08 = audio, 0x09 = video
    header[0] = isKeyFrame ? 0x09 : 0x09; // video

    // Length (24-bit big-endian)
    header[1] = (data.length >> 16) & 0xff;
    header[2] = (data.length >> 8) & 0xff;
    header[3] = data.length & 0xff;

    // Timestamp (32-bit big-endian)
    header[4] = (timestamp >> 24) & 0xff;
    header[5] = (timestamp >> 16) & 0xff;
    header[6] = (timestamp >> 8) & 0xff;
    header[7] = timestamp & 0xff;

    // Stream ID (24-bit big-endian, fixed at 1 for now)
    header[8] = 0x00;
    header[9] = 0x00;
    header[10] = 0x00;
    header[11] = 0x01;

    return Buffer.concat([header, data]);
  }

  /**
   * Handle platform-specific error with failover
   */
  private handlePlatformError(platform: MultistreamPlatform, error: Error): void {
    const connection = this.connections.get(platform);

    if (connection) {
      connection.connected = false;
      this.updatePlatformStatus(platform, 'error', {
        errorMessage: error.message,
      });

      // Attempt failover/reconnection if enabled
      if (this.config?.enableFailover) {
        this.scheduleReconnect(platform);
      }
    }

    this.emit('platform-error', {
      platform,
      error: error.message,
    } as MultistreamEvent);
  }

  /**
   * Schedule reconnection after delay
   */
  private scheduleReconnect(platform: MultistreamPlatform): void {
    const delay = this.config?.failoverDelay || 5000;

    setTimeout(async () => {
      if (!this.isRunning) return;

      const platformConfig = this.config?.platforms.find((p) => p.platform === platform);
      if (platformConfig) {
        try {
          await this.connectPlatform(platformConfig);
          this.emit('failover', {
            platform,
            type: 'reconnected',
          } as MultistreamEvent);
        } catch (error) {
          console.error(`Failover reconnect failed for ${platform}:`, error);
        }
      }
    }, delay);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (this.metricsTimer) return;

    const interval = this.config?.metricsInterval || 1000;
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, interval);
  }

  /**
   * Collect and update metrics
   */
  private collectMetrics(): void {
    this.status.fps = this.encodingStats.fps;
    this.status.videoBitrate = this.encodingStats.videoBitrate;
    this.status.audioBitrate = this.encodingStats.audioBitrate;
    this.status.cpuUsage = this.encodingStats.cpuUsage;
    this.status.memoryUsage = this.encodingStats.memoryUsage;
    this.status.lastUpdate = new Date();

    // Calculate active platforms and viewers
    this.status.activePlatforms = Array.from(this.connections.values()).filter(
      (c) => c.connected,
    ).length;

    this.emit('metrics-update', {
      status: this.status,
    } as MultistreamEvent);
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(() => {
      this.checkHealth();
    }, 5000);
  }

  /**
   * Check health of all connections
   */
  private checkHealth(): void {
    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'excellent';

    for (const [platform, connection] of this.connections.entries()) {
      if (!connection.connected) {
        healthStatus = 'poor';
        continue;
      }

      const platformStatus = this.status.platforms[platform];
      if (platformStatus) {
        if (platformStatus.bufferHealth! < 0.5) {
          healthStatus = 'fair';
        }
        if ((platformStatus.frameDrops || 0) > 10) {
          healthStatus = 'poor';
        }
      }
    }

    this.status.healthStatus = healthStatus;
  }

  /**
   * Update platform status
   */
  private updatePlatformStatus(
    platform: MultistreamPlatform,
    status: PlatformStatus,
    updates?: Partial<PlatformStreamStatus>,
  ): void {
    this.status.platforms[platform] = {
      ...this.status.platforms[platform],
      status,
      ...updates,
    };
  }

  /**
   * Update platform stats
   */
  private updatePlatformStats(platform: MultistreamPlatform, updates: Partial<PlatformStats>): void {
    const stats = this.sessionStats.get(platform);
    if (stats) {
      Object.assign(stats, updates);
    }
  }

  /**
   * Calculate uptime for platform
   */
  private calculateUptime(platform: MultistreamPlatform): number {
    const platformStatus = this.status.platforms[platform];
    if (platformStatus?.connectedAt && platformStatus?.disconnectedAt) {
      return (
        (platformStatus.disconnectedAt.getTime() - platformStatus.connectedAt.getTime()) /
        1000
      );
    }
    return 0;
  }

  /**
   * Build RTMP URL for platform
   */
  private buildRtmpUrl(platform: MultistreamPlatform): string {
    switch (platform) {
      case 'twitch':
        return 'rtmp://live.twitch.tv/app';
      case 'youtube':
        return 'rtmps://a.rtmp.youtube.com/live2';
      case 'facebook':
        return 'rtmps://live-api-s.facebook.com:443/rtmp/';
      case 'linkedin':
        return 'rtmps://a.rtmp.linkedin.com/live';
      default:
        return 'rtmp://localhost:1935/live';
    }
  }

  /**
   * Create session record from collected stats
   */
  private createSessionRecord(): MultistreamSession {
    const now = new Date();
    const startedAt = this.status.startedAt || now;
    const duration = (now.getTime() - startedAt.getTime()) / 1000;

    return {
      id: this.sessionId,
      configId: this.config?.id || '',
      startedAt,
      stoppedAt: now,
      duration,
      platforms: Array.from(this.connections.keys()),
      totalViewers: this.status.totalViewers,
      platformStats: Array.from(this.sessionStats.values()),
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique stream ID
   */
  private generateStreamId(): string {
    return `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current status
   */
  getStatus(): MultistreamStatus {
    return { ...this.status };
  }

  /**
   * Get session stats
   */
  getSessionStats(): MultistreamSession | null {
    if (this.isRunning) return null;
    return this.createSessionRecord();
  }

  /**
   * Enable/disable a platform mid-stream
   */
  async togglePlatform(platform: MultistreamPlatform, enabled: boolean): Promise<void> {
    if (!this.config) return;

    const platformConfig = this.config.platforms.find((p) => p.platform === platform);
    if (!platformConfig) return;

    if (enabled && !this.connections.has(platform)) {
      await this.connectPlatform(platformConfig);
    } else if (!enabled && this.connections.has(platform)) {
      await this.disconnectPlatform(platform);
    }
  }

  /**
   * Get list of active platforms
   */
  getActivePlatforms(): MultistreamPlatform[] {
    return Array.from(this.connections.entries())
      .filter(([, conn]) => conn.connected)
      .map(([platform]) => platform);
  }
}

export default MultistreamEngine;
