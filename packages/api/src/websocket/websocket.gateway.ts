/**
 * WISE² API WebSocket Gateway
 * Bridge between NestJS API and Studio WebSocket Server
 *
 * This gateway handles:
 * - Forwarding Suno API responses to WebSocket clients
 * - Broadcasting OBS stream metrics
 * - Sending notifications and activity updates
 * - Managing user sessions and rooms
 *
 * Architecture:
 * API Service → WebSocket Gateway → Socket.io Server → Browser Clients
 *
 * @module websocket
 * @version 1.0.0
 */

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventEmitter } from 'events';

/**
 * WebSocket Gateway Service
 * Provides methods for emitting events to connected clients
 */
@Injectable()
export class WebSocketGateway extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(WebSocketGateway.name);
  private wsServer: any = null;

  async onModuleInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async onModuleDestroy() {
    this.logger.log('WebSocket Gateway destroyed');
  }

  /**
   * Initialize with external WebSocket server instance
   * Call this after creating the WebSocket server
   */
  public initialize(wsServer: any): void {
    this.wsServer = wsServer;
    this.logger.log('WebSocket server instance registered');
  }

  // ========================================================================
  // SUNO MUSIC GENERATION
  // ========================================================================

  /**
   * Emit generation progress to user
   * Called when Suno API reports progress
   */
  public emitSunoProgress(
    userId: string,
    generationId: string,
    progress: number,
    eta: number,
    status: string
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    this.wsServer.sunoNamespace.to(`user:${userId}`).emit('sunoProgress', {
      generationId,
      progress,
      eta,
      status,
      timestamp: Date.now(),
    });

    this.logger.debug(`Progress: ${generationId} - ${progress}% (ETA: ${eta}s)`);
  }

  /**
   * Emit generation completion to user
   * Called when Suno generation is complete
   */
  public emitSunoComplete(
    userId: string,
    generationId: string,
    audioUrl: string,
    duration: number,
    title?: string,
    style?: string
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    const event = {
      generationId,
      audioUrl,
      duration,
      title,
      style,
      timestamp: Date.now(),
    };

    // Emit to user
    this.wsServer.sunoNamespace.to(`user:${userId}`).emit('sunoComplete', event);

    // Emit to activity feed
    this.wsServer.studioNamespace.to(`feed:${userId}`).emit('activityFeed', {
      id: `activity:${generationId}`,
      type: 'generation_completed',
      actor: { userId },
      details: {
        generationId,
        duration,
        title,
        style,
      },
      timestamp: Date.now(),
    });

    this.logger.log(`Generation complete: ${generationId} (${duration}s)`);
  }

  /**
   * Emit generation error to user
   * Called when Suno generation fails
   */
  public emitSunoError(
    userId: string,
    generationId: string,
    error: string,
    code?: string
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    this.wsServer.sunoNamespace.to(`user:${userId}`).emit('sunoError', {
      generationId,
      error,
      code,
      timestamp: Date.now(),
    });

    // Send notification
    this.sendNotification(userId, {
      type: 'error',
      title: 'Generation Failed',
      message: error,
    });

    this.logger.error(
      `Generation error: ${generationId} - ${error}`,
      code && `(Code: ${code})`
    );
  }

  // ========================================================================
  // OBS STREAMING
  // ========================================================================

  /**
   * Emit stream status change to stream subscribers
   * Called when stream goes live/offline/reconnecting
   */
  public emitStreamStatus(
    userId: string,
    streamId: string,
    status: 'offline' | 'connecting' | 'live' | 'reconnecting',
    viewers?: number,
    bitrate?: number,
    frameRate?: number,
    frameDrops?: number,
    totalFrames?: number
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    const event = {
      status,
      viewers,
      bitrate,
      frameRate,
      frameDrops,
      totalFrames,
      timestamp: Date.now(),
    };

    this.wsServer.obsNamespace.to(`stream:${streamId}`).emit('streamStatus', event);

    // Send notification
    if (status === 'live') {
      this.sendNotification(userId, {
        type: 'success',
        title: 'Stream Live',
        message: viewers
          ? `Your stream is now live with ${viewers} viewers`
          : 'Your stream is now live',
      });
    } else if (status === 'offline') {
      this.sendNotification(userId, {
        type: 'info',
        title: 'Stream Offline',
        message: 'Your stream has ended',
      });
    } else if (status === 'reconnecting') {
      this.sendNotification(userId, {
        type: 'warning',
        title: 'Stream Reconnecting',
        message: 'Attempting to reconnect to streaming platform...',
      });
    }

    this.logger.log(`Stream ${streamId} status: ${status} (${viewers} viewers)`);
  }

  /**
   * Emit scene switch event
   * Called when user changes OBS scenes
   */
  public emitSceneSwitch(
    userId: string,
    streamId: string,
    sceneId: string,
    sceneName: string,
    previousSceneId?: string,
    transitionDuration?: number
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    const event = {
      sceneId,
      sceneName,
      previousSceneId,
      transitionDuration,
      timestamp: Date.now(),
    };

    // Emit to stream
    this.wsServer.obsNamespace.to(`stream:${streamId}`).emit('sceneSwitch', event);

    // Emit to activity feed
    this.wsServer.studioNamespace.to(`feed:${userId}`).emit('activityFeed', {
      id: `activity:scene:${sceneId}`,
      type: 'scene_changed',
      actor: { userId },
      details: {
        sceneId,
        sceneName,
        previousSceneId,
      },
      timestamp: Date.now(),
    });

    this.logger.debug(`Scene switched: ${previousSceneId} → ${sceneId}`);
  }

  /**
   * Emit source update event
   * Called when OBS source properties change
   */
  public emitSourceUpdate(
    userId: string,
    streamId: string,
    sourceId: string,
    sourceName: string,
    properties: Record<string, any>,
    sceneId?: string
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    const event = {
      sourceId,
      sourceName,
      properties,
      sceneId,
      timestamp: Date.now(),
    };

    this.wsServer.obsNamespace.to(`stream:${streamId}`).emit('sourceUpdate', event);

    this.logger.debug(`Source updated: ${sourceId} (${sourceName})`);
  }

  /**
   * Emit real-time stream statistics
   * Called at regular intervals (e.g., 1s) from stream monitoring
   */
  public emitStreamStats(
    streamId: string,
    fps: number,
    bitrate: number,
    bandwidthUsage: number,
    cpuUsage: number,
    memoryUsage: number,
    droppedFrames: number,
    totalFrames: number,
    avgFrameTime: number
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    // Accumulate metrics in gateway (will be emitted on 500ms interval)
    this.wsServer.obsNamespace.to(`stream:${streamId}`).emit('statsUpdate', {
      fps,
      bitrate,
      bandwidthUsage,
      cpuUsage,
      memoryUsage,
      droppedFrames,
      totalFrames,
      avgFrameTime,
      timestamp: Date.now(),
    });
  }

  // ========================================================================
  // STUDIO NOTIFICATIONS
  // ========================================================================

  /**
   * Send notification to user
   * @param userId - Target user ID
   * @param type - Notification type (info, warning, error, success)
   * @param title - Notification title
   * @param message - Notification message
   * @param action - Optional action button
   * @param duration - Optional auto-dismiss duration (ms, 0 = persistent)
   */
  public sendNotification(
    userId: string,
    options: {
      type?: 'info' | 'warning' | 'error' | 'success';
      title?: string;
      message?: string;
      action?: { label: string; url?: string };
      duration?: number;
    }
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    this.wsServer.sendNotification(userId, {
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      action: options.action,
      duration: options.duration,
    });

    this.logger.debug(`Notification sent to ${userId}: ${options.title}`);
  }

  /**
   * Broadcast activity to user's feed
   */
  public broadcastActivity(
    userId: string,
    type: string,
    details: Record<string, any>,
    actorId?: string,
    actorName?: string
  ): void {
    if (!this.wsServer) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    this.wsServer.broadcastActivity(userId, {
      type: type as any,
      actor: {
        userId: actorId || userId,
        username: actorName,
      },
      details,
    });

    this.logger.debug(`Activity broadcast to ${userId}: ${type}`);
  }

  // ========================================================================
  // QUERY METHODS
  // ========================================================================

  /**
   * Get user session information
   */
  public getUserSession(userId: string) {
    if (!this.wsServer) {
      return null;
    }
    return this.wsServer.getUserSession(userId);
  }

  /**
   * Get all active user sessions
   */
  public getActiveSessions() {
    if (!this.wsServer) {
      return [];
    }
    return this.wsServer.getActiveSessions();
  }

  /**
   * Get generation progress
   */
  public getGenerationProgress(generationId: string) {
    if (!this.wsServer) {
      return null;
    }
    return this.wsServer.getGenerationProgress(generationId);
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    const session = this.getUserSession(userId);
    return session?.isActive ?? false;
  }
}
