/**
 * WISE² Studio WebSocket Server
 * Real-time updates for Suno, OBS, and cross-module notifications
 *
 * Architecture:
 * - Socket.io with 3 namespaces: /suno, /obs, /studio
 * - User-based rooms for isolation and privacy
 * - 500ms emission intervals for stats (prevents chattiness)
 * - Production-ready error handling and reconnection support
 *
 * @module websocket
 * @version 1.0.0
 */

import { Server as SocketIOServer, Socket, Namespace } from 'socket.io';
import { createServer } from 'http';
import { EventEmitter } from 'events';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Suno Generation Progress Event
 */
export interface SunoProgressEvent {
  generationId: string;
  progress: number; // 0-100
  eta?: number; // seconds remaining
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
}

/**
 * Suno Completion Event
 */
export interface SunoCompleteEvent {
  generationId: string;
  audioUrl: string;
  duration: number; // seconds
  title?: string;
  style?: string;
  timestamp: number;
}

/**
 * Suno Error Event
 */
export interface SunoErrorEvent {
  generationId: string;
  error: string;
  code?: string;
  timestamp: number;
}

/**
 * OBS Stream Status Event
 */
export interface ObsStreamStatusEvent {
  status: 'offline' | 'connecting' | 'live' | 'reconnecting';
  viewers?: number;
  bitrate?: number; // kbps
  frameRate?: number; // fps
  frameDrops?: number;
  totalFrames?: number;
  timestamp: number;
}

/**
 * OBS Scene Switch Event
 */
export interface ObsSceneSwitchEvent {
  sceneId: string;
  sceneName: string;
  previousSceneId?: string;
  transitionDuration?: number; // ms
  timestamp: number;
}

/**
 * OBS Source Update Event
 */
export interface ObsSourceUpdateEvent {
  sourceId: string;
  sourceName: string;
  properties: Record<string, any>;
  sceneId?: string;
  timestamp: number;
}

/**
 * OBS Real-time Stats Event
 */
export interface ObsStatsEvent {
  fps: number;
  bitrate: number; // kbps
  bandwidthUsage: number; // percentage
  cpuUsage: number; // percentage
  memoryUsage: number; // MB
  droppedFrames: number;
  totalFrames: number;
  avgFrameTime: number; // ms
  timestamp: number;
}

/**
 * Studio Notification Event
 */
export interface StudioNotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    url?: string;
  };
  duration?: number; // ms, 0 = persistent
  timestamp: number;
}

/**
 * Activity Feed Event
 */
export interface ActivityFeedEvent {
  id: string;
  type:
    | 'generation_started'
    | 'generation_completed'
    | 'stream_started'
    | 'stream_ended'
    | 'scene_changed'
    | 'export_completed'
    | 'collaboration_update';
  actor: {
    userId: string;
    username?: string;
    avatar?: string;
  };
  details: Record<string, any>;
  timestamp: number;
}

/**
 * User Session Info
 */
interface UserSession {
  userId: string;
  username?: string;
  email?: string;
  connectedAt: number;
  isActive: boolean;
  subscriptionTier?: string;
}

/**
 * Generation Progress Tracker
 */
interface GenerationTracker {
  generationId: string;
  userId: string;
  progress: number;
  eta: number;
  status: string;
  startedAt: number;
}

/**
 * Stream Metrics Accumulator
 */
interface StreamMetrics {
  fps: number;
  bitrate: number;
  bandwidthUsage: number;
  cpuUsage: number;
  memoryUsage: number;
  droppedFrames: number;
  totalFrames: number;
  avgFrameTime: number;
  lastUpdate: number;
}

// ============================================================================
// WEBSOCKET SERVER CLASS
// ============================================================================

/**
 * WISE² Studio WebSocket Server
 *
 * Manages real-time communication across Suno, OBS, and studio modules.
 * Features:
 * - User-based room isolation
 * - Automatic reconnection handling
 * - Memory-efficient stat emission (500ms intervals)
 * - Production-ready error handling
 */
export class StudioWebSocketServer extends EventEmitter {
  private io: SocketIOServer | null = null;
  private httpServer: ReturnType<typeof createServer> | null = null;

  // Namespaces
  private sunoNamespace: Namespace | null = null;
  private obsNamespace: Namespace | null = null;
  private studioNamespace: Namespace | null = null;

  // State Management
  private userSessions = new Map<string, UserSession>();
  private generationTrackers = new Map<string, GenerationTracker>();
  private streamMetrics = new Map<string, StreamMetrics>();
  private statsIntervals = new Map<string, NodeJS.Timer>();

  constructor() {
    super();
  }

  /**
   * Initialize the WebSocket server
   * @param port - HTTP port for Socket.io
   * @param options - Socket.io configuration options
   */
  public initialize(
    port: number = 3006,
    options?: {
      cors?: {
        origin: string | string[];
        credentials?: boolean;
      };
      transports?: string[];
      reconnection?: boolean;
      reconnectionDelay?: number;
    }
  ): void {
    // Create HTTP server
    this.httpServer = createServer();

    // Initialize Socket.io with defaults
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: options?.cors?.origin || ['http://localhost:3005', 'http://localhost:3000'],
        credentials: options?.cors?.credentials ?? true,
      },
      transports: options?.transports || ['websocket', 'polling'],
      reconnection: options?.reconnection ?? true,
      reconnectionDelay: options?.reconnectionDelay ?? 1000,
      maxHttpBufferSize: 1e6, // 1MB max message size
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    // Setup namespaces
    this.setupSunoNamespace();
    this.setupObsNamespace();
    this.setupStudioNamespace();

    // Start listening
    this.httpServer.listen(port, () => {
      console.log(`[WebSocket] Studio server listening on port ${port}`);
      this.emit('ready', { port });
    });

    // Error handling
    this.httpServer.on('error', (error) => {
      console.error('[WebSocket] HTTP Server Error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Setup Suno Namespace
   * Handles music generation progress and completion
   */
  private setupSunoNamespace(): void {
    this.sunoNamespace = this.io!.of('/suno');

    this.sunoNamespace.on('connection', (socket: Socket) => {
      const userId = socket.handshake.auth.userId as string;
      const username = socket.handshake.auth.username as string;

      console.log(`[Suno] User connected: ${userId}`);

      // Join user-specific room
      socket.join(`user:${userId}`);
      this.registerUserSession(userId, { username });

      // Emit connection confirmation
      socket.emit('connected', {
        userId,
        timestamp: Date.now(),
      });

      // Handle generation progress updates
      socket.on('progress', (data: SunoProgressEvent) => {
        this.handleSunoProgress(userId, data);
      });

      // Handle generation completion
      socket.on('complete', (data: SunoCompleteEvent) => {
        this.handleSunoComplete(userId, data);
      });

      // Handle errors
      socket.on('error_report', (data: SunoErrorEvent) => {
        this.handleSunoError(userId, data);
      });

      // Request progress status
      socket.on('status_request', (generationId: string) => {
        const tracker = this.generationTrackers.get(generationId);
        if (tracker) {
          socket.emit('status_response', {
            generationId,
            progress: tracker.progress,
            eta: tracker.eta,
            status: tracker.status,
            timestamp: Date.now(),
          });
        }
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        console.log(`[Suno] User disconnected: ${userId}`);
        this.cleanupUserSession(userId, 'suno');
      });
    });
  }

  /**
   * Setup OBS Namespace
   * Handles streaming status, scene switching, and real-time metrics
   */
  private setupObsNamespace(): void {
    this.obsNamespace = this.io!.of('/obs');

    this.obsNamespace.on('connection', (socket: Socket) => {
      const userId = socket.handshake.auth.userId as string;
      const streamId = socket.handshake.query.streamId as string;

      console.log(`[OBS] User connected: ${userId}, Stream: ${streamId}`);

      // Join user and stream rooms
      socket.join(`user:${userId}`);
      socket.join(`stream:${streamId}`);

      // Emit connection confirmation
      socket.emit('connected', {
        userId,
        streamId,
        timestamp: Date.now(),
      });

      // Handle scene switches
      socket.on('scene_switch', (data: ObsSceneSwitchEvent) => {
        this.handleObsSceneSwitch(userId, streamId, data);
      });

      // Handle source updates
      socket.on('source_update', (data: ObsSourceUpdateEvent) => {
        this.handleObsSourceUpdate(userId, streamId, data);
      });

      // Handle stream status changes
      socket.on('stream_status', (data: ObsStreamStatusEvent) => {
        this.handleObsStreamStatus(userId, streamId, data);
      });

      // Handle stats from OBS
      socket.on('stats', (data: ObsStatsEvent) => {
        this.accumulateStreamMetrics(streamId, data);
      });

      // Request current stats
      socket.on('stats_request', () => {
        const metrics = this.streamMetrics.get(streamId);
        if (metrics) {
          socket.emit('stats_response', metrics);
        }
      });

      // Start stats emission if not already running for this stream
      if (!this.statsIntervals.has(streamId)) {
        this.startStatsEmission(streamId);
      }

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        console.log(`[OBS] User disconnected: ${userId}, Stream: ${streamId}`);
        this.cleanupUserSession(userId, 'obs');
      });
    });
  }

  /**
   * Setup Studio Namespace
   * Handles cross-module notifications and activity feeds
   */
  private setupStudioNamespace(): void {
    this.studioNamespace = this.io!.of('/studio');

    this.studioNamespace.on('connection', (socket: Socket) => {
      const userId = socket.handshake.auth.userId as string;

      console.log(`[Studio] User connected: ${userId}`);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Emit connection confirmation
      socket.emit('connected', {
        userId,
        timestamp: Date.now(),
      });

      // Handle notification dismissal
      socket.on('notification_dismiss', (notificationId: string) => {
        console.log(`[Studio] Notification dismissed: ${notificationId}`);
      });

      // Handle activity feed subscriptions
      socket.on('subscribe_feed', (filters?: Record<string, any>) => {
        socket.join(`feed:${userId}`);
        socket.emit('feed_subscribed', {
          userId,
          filters: filters || {},
          timestamp: Date.now(),
        });
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        console.log(`[Studio] User disconnected: ${userId}`);
        this.cleanupUserSession(userId, 'studio');
      });
    });
  }

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Handle Suno progress updates
   */
  private handleSunoProgress(userId: string, data: SunoProgressEvent): void {
    // Update tracker
    this.generationTrackers.set(data.generationId, {
      generationId: data.generationId,
      userId,
      progress: data.progress,
      eta: data.eta || 0,
      status: data.status,
      startedAt: Date.now(),
    });

    // Emit to user's room
    this.sunoNamespace!.to(`user:${userId}`).emit('sunoProgress', data);
    console.log(
      `[Suno] Progress: ${data.generationId} - ${data.progress}% (ETA: ${data.eta}s)`
    );
  }

  /**
   * Handle Suno completion
   */
  private handleSunoComplete(userId: string, data: SunoCompleteEvent): void {
    // Emit to user's room
    this.sunoNamespace!.to(`user:${userId}`).emit('sunoComplete', data);

    // Emit to activity feed
    this.studioNamespace!.to(`feed:${userId}`).emit('activityFeed', {
      id: `activity:${data.generationId}`,
      type: 'generation_completed',
      actor: { userId },
      details: {
        generationId: data.generationId,
        duration: data.duration,
        title: data.title,
      },
      timestamp: data.timestamp,
    } as ActivityFeedEvent);

    // Cleanup tracker
    this.generationTrackers.delete(data.generationId);

    console.log(`[Suno] Completed: ${data.generationId} (${data.duration}s)`);
  }

  /**
   * Handle Suno errors
   */
  private handleSunoError(userId: string, data: SunoErrorEvent): void {
    // Emit to user's room
    this.sunoNamespace!.to(`user:${userId}`).emit('sunoError', data);

    // Send notification
    this.sendNotification(userId, {
      type: 'error',
      title: 'Generation Failed',
      message: data.error,
    });

    // Cleanup tracker
    this.generationTrackers.delete(data.generationId);

    console.error(`[Suno] Error: ${data.generationId} - ${data.error}`);
  }

  /**
   * Handle OBS scene switches
   */
  private handleObsSceneSwitch(
    userId: string,
    streamId: string,
    data: ObsSceneSwitchEvent
  ): void {
    // Emit to stream's room
    this.obsNamespace!.to(`stream:${streamId}`).emit('sceneSwitch', data);

    // Emit to activity feed
    this.studioNamespace!.to(`feed:${userId}`).emit('activityFeed', {
      id: `activity:scene:${data.sceneId}`,
      type: 'scene_changed',
      actor: { userId },
      details: {
        sceneId: data.sceneId,
        sceneName: data.sceneName,
        previousSceneId: data.previousSceneId,
      },
      timestamp: data.timestamp,
    } as ActivityFeedEvent);

    console.log(
      `[OBS] Scene switched: ${data.previousSceneId} → ${data.sceneId}`
    );
  }

  /**
   * Handle OBS source updates
   */
  private handleObsSourceUpdate(
    userId: string,
    streamId: string,
    data: ObsSourceUpdateEvent
  ): void {
    // Emit to stream's room
    this.obsNamespace!.to(`stream:${streamId}`).emit('sourceUpdate', data);

    console.log(
      `[OBS] Source updated: ${data.sourceId} (${data.sourceName})`
    );
  }

  /**
   * Handle OBS stream status changes
   */
  private handleObsStreamStatus(
    userId: string,
    streamId: string,
    data: ObsStreamStatusEvent
  ): void {
    // Emit to stream's room
    this.obsNamespace!.to(`stream:${streamId}`).emit('streamStatus', data);

    // Send notification on status change
    if (data.status === 'live') {
      this.sendNotification(userId, {
        type: 'success',
        title: 'Stream Live',
        message: `Stream is now live (${data.viewers} viewers)`,
      });
    } else if (data.status === 'offline') {
      this.sendNotification(userId, {
        type: 'info',
        title: 'Stream Offline',
        message: 'Stream has ended',
      });
    }

    console.log(`[OBS] Stream status: ${data.status} (${data.viewers} viewers)`);
  }

  /**
   * Accumulate stream metrics for emission
   */
  private accumulateStreamMetrics(streamId: string, data: ObsStatsEvent): void {
    // Store metrics (will be emitted on 500ms interval)
    this.streamMetrics.set(streamId, {
      fps: data.fps,
      bitrate: data.bitrate,
      bandwidthUsage: data.bandwidthUsage,
      cpuUsage: data.cpuUsage,
      memoryUsage: data.memoryUsage,
      droppedFrames: data.droppedFrames,
      totalFrames: data.totalFrames,
      avgFrameTime: data.avgFrameTime,
      lastUpdate: Date.now(),
    });
  }

  /**
   * Start 500ms stats emission for a stream
   */
  private startStatsEmission(streamId: string): void {
    const interval = setInterval(() => {
      const metrics = this.streamMetrics.get(streamId);
      if (metrics) {
        this.obsNamespace!.to(`stream:${streamId}`).emit('statsUpdate', {
          ...metrics,
          timestamp: Date.now(),
        } as ObsStatsEvent);
      }
    }, 500); // 500ms = not too chatty

    this.statsIntervals.set(streamId, interval);
  }

  /**
   * Stop stats emission for a stream
   */
  private stopStatsEmission(streamId: string): void {
    const interval = this.statsIntervals.get(streamId);
    if (interval) {
      clearInterval(interval);
      this.statsIntervals.delete(streamId);
    }
    this.streamMetrics.delete(streamId);
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Register or update user session
   */
  private registerUserSession(
    userId: string,
    info?: Partial<UserSession>
  ): void {
    const existing = this.userSessions.get(userId);
    this.userSessions.set(userId, {
      userId,
      connectedAt: existing?.connectedAt || Date.now(),
      isActive: true,
      ...existing,
      ...info,
    });
  }

  /**
   * Clean up user session
   */
  private cleanupUserSession(userId: string, namespace?: string): void {
    if (namespace === 'suno') {
      // Cleanup Suno trackers for this user
      for (const [id, tracker] of this.generationTrackers) {
        if (tracker.userId === userId) {
          this.generationTrackers.delete(id);
        }
      }
    }

    if (namespace === 'obs') {
      // Cleanup OBS streams for this user
      for (const streamId of this.statsIntervals.keys()) {
        if (streamId.startsWith(`${userId}:`)) {
          this.stopStatsEmission(streamId);
        }
      }
    }

    // Check if user is still connected anywhere
    const connections = this.io!.sockets.sockets;
    const userConnected = Array.from(connections.values()).some(
      (socket) => socket.handshake.auth.userId === userId
    );

    if (!userConnected) {
      this.userSessions.delete(userId);
    }
  }

  /**
   * Send notification to user
   */
  public sendNotification(
    userId: string,
    notification: Partial<StudioNotificationEvent>
  ): void {
    const event: StudioNotificationEvent = {
      id: `notif:${Date.now()}:${Math.random()}`,
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message || '',
      timestamp: Date.now(),
      ...notification,
    };

    this.studioNamespace!.to(`user:${userId}`).emit('notification', event);
  }

  /**
   * Broadcast activity to feed
   */
  public broadcastActivity(
    userId: string,
    activity: Partial<ActivityFeedEvent>
  ): void {
    const event: ActivityFeedEvent = {
      id: `activity:${Date.now()}:${Math.random()}`,
      type: activity.type as any,
      actor: activity.actor || { userId },
      details: activity.details || {},
      timestamp: Date.now(),
      ...activity,
    };

    this.studioNamespace!.to(`feed:${userId}`).emit('activityFeed', event);
  }

  /**
   * Get user session info
   */
  public getUserSession(userId: string): UserSession | undefined {
    return this.userSessions.get(userId);
  }

  /**
   * Get all active sessions
   */
  public getActiveSessions(): UserSession[] {
    return Array.from(this.userSessions.values()).filter((s) => s.isActive);
  }

  /**
   * Get generation progress
   */
  public getGenerationProgress(generationId: string): GenerationTracker | undefined {
    return this.generationTrackers.get(generationId);
  }

  /**
   * Graceful shutdown
   */
  public shutdown(): Promise<void> {
    return new Promise((resolve) => {
      // Clear all intervals
      for (const interval of this.statsIntervals.values()) {
        clearInterval(interval);
      }
      this.statsIntervals.clear();

      // Close Socket.io
      if (this.io) {
        this.io.close();
      }

      // Close HTTP server
      if (this.httpServer) {
        this.httpServer.close(() => {
          console.log('[WebSocket] Server shut down gracefully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

let serverInstance: StudioWebSocketServer | null = null;

/**
 * Get or create WebSocket server singleton
 */
export function getWebSocketServer(): StudioWebSocketServer {
  if (!serverInstance) {
    serverInstance = new StudioWebSocketServer();
  }
  return serverInstance;
}

/**
 * Initialize server singleton
 */
export function initializeWebSocketServer(port?: number, options?: any): StudioWebSocketServer {
  const server = getWebSocketServer();
  server.initialize(port, options);
  return server;
}
