/**
 * Stream Session Management
 * Handles stream lifecycle: creation, monitoring, reconnection, and cleanup
 *
 * Manages stream state, metrics, reconnection logic, and session persistence
 */

import { EventEmitter } from 'events';

export interface StreamSessionConfig {
  userId: string;
  streamKey: string;
  resolution?: { width: number; height: number };
  frameRate?: number;
  bitrate?: number; // kbps
  enableRecording?: boolean;
  recordingPath?: string;
  maxDuration?: number; // milliseconds
  reconnectAttempts?: number;
  reconnectDelay?: number; // milliseconds
  platforms?: string[];
}

export interface StreamMetrics {
  startTime: number;
  endTime?: number;
  duration: number; // seconds
  bitrate: number; // kbps
  fps: number;
  droppedFrames: number;
  totalFrames: number;
  bandwidth: number; // mbps
  bytesTransferred: number;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  networkLatency: number; // ms
  bufferHealth: number; // 0-100
}

export interface StreamHealth {
  isHealthy: boolean;
  issues: string[];
  score: number; // 0-100
  warnings: string[];
}

export enum StreamSessionStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  RECONNECTING = 'reconnecting',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

/**
 * Stream Session Manager
 * Manages individual stream sessions and their lifecycle
 */
export class StreamSession extends EventEmitter {
  private sessionId: string;
  private config: Required<StreamSessionConfig>;
  private status: StreamSessionStatus = StreamSessionStatus.INITIALIZING;
  private metrics: StreamMetrics;
  private health: StreamHealth;
  private startTime: number = 0;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private metricsUpdateTimer: NodeJS.Timeout | null = null;
  private recordingPath?: string;

  constructor(config: StreamSessionConfig) {
    super();

    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = {
      userId: config.userId,
      streamKey: config.streamKey,
      resolution: config.resolution || { width: 1920, height: 1080 },
      frameRate: config.frameRate || 30,
      bitrate: config.bitrate || 2500,
      enableRecording: config.enableRecording !== false,
      recordingPath: config.recordingPath || './recordings',
      maxDuration: config.maxDuration || 12 * 60 * 60 * 1000,
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 3000,
      platforms: config.platforms || [],
    };

    this.metrics = {
      startTime: 0,
      duration: 0,
      bitrate: 0,
      fps: 0,
      droppedFrames: 0,
      totalFrames: 0,
      bandwidth: 0,
      bytesTransferred: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0,
      bufferHealth: 100,
    };

    this.health = {
      isHealthy: true,
      issues: [],
      score: 100,
      warnings: [],
    };
  }

  /**
   * Start the stream session
   */
  async start(): Promise<{ sessionId: string; success: boolean }> {
    if (this.status !== StreamSessionStatus.INITIALIZING) {
      throw new StreamSessionError('Stream is already started', 'ALREADY_STARTED');
    }

    try {
      this.startTime = Date.now();
      this.metrics.startTime = this.startTime;
      this.status = StreamSessionStatus.ACTIVE;

      // Start metrics monitoring
      this.startMetricsMonitoring();

      this.emit('started', {
        sessionId: this.sessionId,
        startTime: this.startTime,
        config: this.config,
      });

      console.log(`[Stream] Session started: ${this.sessionId}`);
      return { sessionId: this.sessionId, success: true };
    } catch (error) {
      this.status = StreamSessionStatus.ERROR;
      throw new StreamSessionError(
        `Failed to start stream: ${String(error)}`,
        'START_FAILED'
      );
    }
  }

  /**
   * Stop the stream session
   */
  async stop(): Promise<void> {
    if (this.status === StreamSessionStatus.STOPPED) {
      return;
    }

    try {
      this.status = StreamSessionStatus.STOPPING;
      this.stopMetricsMonitoring();

      this.metrics.endTime = Date.now();
      this.metrics.duration = Math.floor((this.metrics.endTime - this.metrics.startTime) / 1000);

      this.status = StreamSessionStatus.STOPPED;

      this.emit('stopped', {
        sessionId: this.sessionId,
        metrics: this.metrics,
      });

      console.log(`[Stream] Session stopped: ${this.sessionId}`);
    } catch (error) {
      throw new StreamSessionError(
        `Failed to stop stream: ${String(error)}`,
        'STOP_FAILED'
      );
    }
  }

  /**
   * Pause the stream
   */
  async pause(): Promise<void> {
    if (this.status !== StreamSessionStatus.ACTIVE) {
      throw new StreamSessionError('Stream is not active', 'NOT_ACTIVE');
    }

    this.status = StreamSessionStatus.PAUSED;
    this.emit('paused', { sessionId: this.sessionId });
  }

  /**
   * Resume the stream
   */
  async resume(): Promise<void> {
    if (this.status !== StreamSessionStatus.PAUSED) {
      throw new StreamSessionError('Stream is not paused', 'NOT_PAUSED');
    }

    this.status = StreamSessionStatus.ACTIVE;
    this.emit('resumed', { sessionId: this.sessionId });
  }

  /**
   * Update stream metrics from RTMP server
   */
  updateMetrics(newMetrics: Partial<StreamMetrics>): void {
    Object.assign(this.metrics, newMetrics);

    // Recalculate health
    this.evaluateHealth();

    this.emit('metrics:updated', this.metrics);
  }

  /**
   * Start metrics monitoring
   */
  private startMetricsMonitoring(): void {
    this.metricsUpdateTimer = setInterval(() => {
      this.emit('metrics:poll', { sessionId: this.sessionId });
    }, 1000); // Poll every second
  }

  /**
   * Stop metrics monitoring
   */
  private stopMetricsMonitoring(): void {
    if (this.metricsUpdateTimer) {
      clearInterval(this.metricsUpdateTimer);
      this.metricsUpdateTimer = null;
    }
  }

  /**
   * Handle connection error and attempt reconnection
   */
  async handleError(error: Error): Promise<void> {
    this.health.issues.push(error.message);
    this.health.isHealthy = false;

    if (this.reconnectAttempts > 0 && this.status !== StreamSessionStatus.STOPPED) {
      this.status = StreamSessionStatus.RECONNECTING;
      this.reconnectAttempts--;

      const delay = this.config.reconnectDelay * (6 - this.reconnectAttempts); // Exponential backoff

      this.emit('reconnecting', {
        sessionId: this.sessionId,
        attempt: this.config.reconnectAttempts - this.reconnectAttempts,
        maxAttempts: this.config.reconnectAttempts,
        delay,
      });

      this.reconnectTimer = setTimeout(() => {
        this.status = StreamSessionStatus.ACTIVE;
        this.emit('reconnected', { sessionId: this.sessionId });
      }, delay);
    } else {
      this.status = StreamSessionStatus.ERROR;
      this.emit('error', {
        sessionId: this.sessionId,
        error: error.message,
        canReconnect: false,
      });
    }
  }

  /**
   * Evaluate stream health
   */
  private evaluateHealth(): void {
    this.health.issues = [];
    this.health.warnings = [];
    let score = 100;

    // Check dropped frames
    if (this.metrics.droppedFrames > 0) {
      const dropRate = this.metrics.droppedFrames / this.metrics.totalFrames;
      if (dropRate > 0.05) {
        this.health.issues.push('High frame drop rate');
        score -= 30;
      } else if (dropRate > 0.02) {
        this.health.warnings.push('Some frame drops detected');
        score -= 10;
      }
    }

    // Check buffer health
    if (this.metrics.bufferHealth < 20) {
      this.health.issues.push('Buffer underrun risk');
      score -= 25;
    } else if (this.metrics.bufferHealth < 50) {
      this.health.warnings.push('Low buffer health');
      score -= 10;
    }

    // Check CPU usage
    if (this.metrics.cpuUsage > 90) {
      this.health.issues.push('High CPU usage');
      score -= 20;
    } else if (this.metrics.cpuUsage > 75) {
      this.health.warnings.push('Elevated CPU usage');
      score -= 5;
    }

    // Check network latency
    if (this.metrics.networkLatency > 200) {
      this.health.warnings.push('High network latency');
      score -= 10;
    }

    this.health.isHealthy = this.health.issues.length === 0;
    this.health.score = Math.max(0, score);

    if (!this.health.isHealthy) {
      this.emit('health:degraded', this.health);
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get current status
   */
  getStatus(): StreamSessionStatus {
    return this.status;
  }

  /**
   * Get metrics
   */
  getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  /**
   * Get health
   */
  getHealth(): StreamHealth {
    return { ...this.health };
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.config.userId,
      status: this.status,
      startTime: this.startTime,
      metrics: this.metrics,
      health: this.health,
      config: {
        resolution: this.config.resolution,
        frameRate: this.config.frameRate,
        bitrate: this.config.bitrate,
        platforms: this.config.platforms,
      },
    };
  }

  /**
   * Cancel reconnect timer
   */
  cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.stopMetricsMonitoring();
    this.cancelReconnect();
    this.removeAllListeners();
  }
}

/**
 * Stream Session Manager
 * Manages multiple stream sessions
 */
export class StreamSessionManager {
  private sessions = new Map<string, StreamSession>();

  /**
   * Create new stream session
   */
  createSession(config: StreamSessionConfig): StreamSession {
    const session = new StreamSession(config);
    this.sessions.set(session.getSessionId(), session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): StreamSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get user's active sessions
   */
  getUserSessions(userId: string): StreamSession[] {
    const userSessions: StreamSession[] = [];
    for (const session of this.sessions.values()) {
      const info = session.getSessionInfo();
      if (info.userId === userId && info.status !== StreamSessionStatus.STOPPED) {
        userSessions.push(session);
      }
    }
    return userSessions;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): StreamSession[] {
    const activeSessions: StreamSession[] = [];
    for (const session of this.sessions.values()) {
      if (
        session.getStatus() === StreamSessionStatus.ACTIVE ||
        session.getStatus() === StreamSessionStatus.RECONNECTING
      ) {
        activeSessions.push(session);
      }
    }
    return activeSessions;
  }

  /**
   * Remove session
   */
  async removeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await session.cleanup();
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Get manager status
   */
  getStatus() {
    return {
      totalSessions: this.sessions.size,
      activeSessions: this.getActiveSessions().length,
      sessions: Array.from(this.sessions.values()).map(s => s.getSessionInfo()),
    };
  }
}

/**
 * Custom error class for stream session errors
 */
export class StreamSessionError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'StreamSessionError';
  }
}

/**
 * Global stream session manager
 */
let sessionManager: StreamSessionManager | null = null;

/**
 * Initialize stream session manager
 */
export function initStreamSessionManager(): StreamSessionManager {
  if (!sessionManager) {
    sessionManager = new StreamSessionManager();
  }
  return sessionManager;
}

/**
 * Get stream session manager
 */
export function getStreamSessionManager(): StreamSessionManager {
  if (!sessionManager) {
    return initStreamSessionManager();
  }
  return sessionManager;
}
