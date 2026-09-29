/**
 * WISE² Studio WebSocket Client
 * Browser-side client for connecting to the WebSocket server
 *
 * Usage:
 * ```typescript
 * const client = new StudioWebSocketClient({
 *   url: 'http://localhost:3006',
 *   userId: 'user-123',
 *   username: 'John Doe'
 * });
 *
 * // Subscribe to Suno events
 * client.suno.on('sunoProgress', (event) => {
 *   console.log(`Generation ${event.generationId}: ${event.progress}%`);
 * });
 *
 * // Subscribe to OBS events
 * client.obs.on('streamStatus', (event) => {
 *   console.log(`Stream status: ${event.status}`);
 * });
 *
 * // Subscribe to notifications
 * client.studio.on('notification', (notif) => {
 *   console.log(notif.message);
 * });
 * ```
 *
 * @module websocket-client
 * @version 1.0.0
 */

import { io, Socket } from 'socket.io-client';
import type {
  SunoProgressEvent,
  SunoCompleteEvent,
  SunoErrorEvent,
  ObsStreamStatusEvent,
  ObsSceneSwitchEvent,
  ObsSourceUpdateEvent,
  ObsStatsEvent,
  StudioNotificationEvent,
  ActivityFeedEvent,
} from './websocket';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ClientConfig {
  url: string;
  userId: string;
  username?: string;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

export interface ClientOptions {
  autoConnect?: boolean;
  debug?: boolean;
}

// ============================================================================
// NAMESPACE CLIENTS
// ============================================================================

/**
 * Suno Namespace Client
 */
export class SunoNamespaceClient {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Function>>();
  private isConnected = false;

  constructor(private config: ClientConfig) {}

  public connect(socket: Socket): void {
    this.socket = socket;

    socket.on('connected', (data) => {
      this.isConnected = true;
      this.emit('connected', data);
    });

    socket.on('sunoProgress', (event: SunoProgressEvent) => {
      this.emit('sunoProgress', event);
    });

    socket.on('sunoComplete', (event: SunoCompleteEvent) => {
      this.emit('sunoComplete', event);
    });

    socket.on('sunoError', (event: SunoErrorEvent) => {
      this.emit('sunoError', event);
    });

    socket.on('status_response', (data) => {
      this.emit('statusResponse', data);
    });

    socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('disconnected', null);
    });
  }

  /**
   * Request generation progress
   */
  public requestStatus(generationId: string): void {
    if (this.socket) {
      this.socket.emit('status_request', generationId);
    }
  }

  /**
   * Subscribe to events
   */
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit events to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[Suno] Event listener error for "${event}":`, error);
        }
      });
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

/**
 * OBS Namespace Client
 */
export class ObsNamespaceClient {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Function>>();
  private isConnected = false;
  private streamId: string = '';

  constructor(private config: ClientConfig) {}

  public connect(socket: Socket, streamId?: string): void {
    this.socket = socket;
    this.streamId = streamId || '';

    socket.on('connected', (data) => {
      this.isConnected = true;
      this.emit('connected', data);
    });

    socket.on('streamStatus', (event: ObsStreamStatusEvent) => {
      this.emit('streamStatus', event);
    });

    socket.on('sceneSwitch', (event: ObsSceneSwitchEvent) => {
      this.emit('sceneSwitch', event);
    });

    socket.on('sourceUpdate', (event: ObsSourceUpdateEvent) => {
      this.emit('sourceUpdate', event);
    });

    socket.on('statsUpdate', (event: ObsStatsEvent) => {
      this.emit('statsUpdate', event);
    });

    socket.on('stats_response', (data: ObsStatsEvent) => {
      this.emit('statsResponse', data);
    });

    socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('disconnected', null);
    });
  }

  /**
   * Notify of scene switch
   */
  public sceneSwitch(data: Partial<ObsSceneSwitchEvent>): void {
    if (this.socket) {
      this.socket.emit('scene_switch', {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Notify of source update
   */
  public sourceUpdate(data: Partial<ObsSourceUpdateEvent>): void {
    if (this.socket) {
      this.socket.emit('source_update', {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Notify of stream status change
   */
  public streamStatus(data: Partial<ObsStreamStatusEvent>): void {
    if (this.socket) {
      this.socket.emit('stream_status', {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Send stats from OBS
   */
  public sendStats(data: Partial<ObsStatsEvent>): void {
    if (this.socket) {
      this.socket.emit('stats', {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Request current stats
   */
  public requestStats(): void {
    if (this.socket) {
      this.socket.emit('stats_request');
    }
  }

  /**
   * Subscribe to events
   */
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit events to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[OBS] Event listener error for "${event}":`, error);
        }
      });
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

/**
 * Studio Namespace Client
 */
export class StudioNamespaceClient {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Function>>();
  private isConnected = false;

  constructor(private config: ClientConfig) {}

  public connect(socket: Socket): void {
    this.socket = socket;

    socket.on('connected', (data) => {
      this.isConnected = true;
      this.emit('connected', data);
    });

    socket.on('notification', (event: StudioNotificationEvent) => {
      this.emit('notification', event);
    });

    socket.on('activityFeed', (event: ActivityFeedEvent) => {
      this.emit('activityFeed', event);
    });

    socket.on('feed_subscribed', (data) => {
      this.emit('feedSubscribed', data);
    });

    socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('disconnected', null);
    });
  }

  /**
   * Dismiss a notification
   */
  public dismissNotification(notificationId: string): void {
    if (this.socket) {
      this.socket.emit('notification_dismiss', notificationId);
    }
  }

  /**
   * Subscribe to activity feed
   */
  public subscribeFeed(filters?: Record<string, any>): void {
    if (this.socket) {
      this.socket.emit('subscribe_feed', filters);
    }
  }

  /**
   * Subscribe to events
   */
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit events to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[Studio] Event listener error for "${event}":`, error);
        }
      });
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

// ============================================================================
// MAIN CLIENT
// ============================================================================

/**
 * WISE² Studio WebSocket Client
 *
 * Main client for managing connections to all three namespaces
 */
export class StudioWebSocketClient {
  private config: ClientConfig;
  private options: ClientOptions;

  public suno: SunoNamespaceClient;
  public obs: ObsNamespaceClient;
  public studio: StudioNamespaceClient;

  private sunoSocket: Socket | null = null;
  private obsSocket: Socket | null = null;
  private studioSocket: Socket | null = null;

  private connectionListeners = new Map<string, Set<Function>>();
  private isInitialized = false;

  constructor(config: ClientConfig, options: ClientOptions = {}) {
    this.config = config;
    this.options = {
      autoConnect: true,
      debug: false,
      ...options,
    };

    this.suno = new SunoNamespaceClient(config);
    this.obs = new ObsNamespaceClient(config);
    this.studio = new StudioNamespaceClient(config);

    if (this.options.autoConnect) {
      this.connect().catch((error) => {
        console.error('[WebSocket] Connection failed:', error);
      });
    }
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log('Connecting to WebSocket server...');

    try {
      // Connect to Suno namespace
      this.sunoSocket = io(`${this.config.url}/suno`, {
        auth: {
          userId: this.config.userId,
          username: this.config.username,
        },
        reconnection: true,
        reconnectionDelay: this.config.reconnectionDelay || 1000,
        reconnectionDelayMax: this.config.reconnectionDelayMax || 5000,
        reconnectionAttempts: this.config.reconnectionAttempts || 5,
      });

      this.sunoSocket.on('error', (error) => {
        console.error('[Suno] Connection error:', error);
        this.emit('error', { namespace: 'suno', error });
      });

      this.suno.connect(this.sunoSocket);

      // Connect to OBS namespace
      this.obsSocket = io(`${this.config.url}/obs`, {
        auth: {
          userId: this.config.userId,
          username: this.config.username,
        },
        query: {
          streamId: '', // Can be set later with setStreamId
        },
        reconnection: true,
        reconnectionDelay: this.config.reconnectionDelay || 1000,
        reconnectionDelayMax: this.config.reconnectionDelayMax || 5000,
        reconnectionAttempts: this.config.reconnectionAttempts || 5,
      });

      this.obsSocket.on('error', (error) => {
        console.error('[OBS] Connection error:', error);
        this.emit('error', { namespace: 'obs', error });
      });

      this.obs.connect(this.obsSocket);

      // Connect to Studio namespace
      this.studioSocket = io(`${this.config.url}/studio`, {
        auth: {
          userId: this.config.userId,
          username: this.config.username,
        },
        reconnection: true,
        reconnectionDelay: this.config.reconnectionDelay || 1000,
        reconnectionDelayMax: this.config.reconnectionDelayMax || 5000,
        reconnectionAttempts: this.config.reconnectionAttempts || 5,
      });

      this.studioSocket.on('error', (error) => {
        console.error('[Studio] Connection error:', error);
        this.emit('error', { namespace: 'studio', error });
      });

      this.studio.connect(this.studioSocket);

      this.isInitialized = true;
      this.emit('ready', {});

      this.log('Connected to all namespaces');
    } catch (error) {
      console.error('[WebSocket] Failed to initialize connections:', error);
      throw error;
    }
  }

  /**
   * Set stream ID for OBS namespace
   */
  public setStreamId(streamId: string): void {
    if (this.obsSocket) {
      this.obsSocket.disconnect();
    }

    this.obsSocket = io(`${this.config.url}/obs`, {
      auth: {
        userId: this.config.userId,
        username: this.config.username,
      },
      query: {
        streamId,
      },
    });

    this.obs.connect(this.obsSocket, streamId);
    this.log(`Stream ID set to: ${streamId}`);
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    if (this.sunoSocket) {
      this.sunoSocket.disconnect();
    }
    if (this.obsSocket) {
      this.obsSocket.disconnect();
    }
    if (this.studioSocket) {
      this.studioSocket.disconnect();
    }

    this.isInitialized = false;
    this.emit('disconnected', {});
    this.log('Disconnected from server');
  }

  /**
   * Check connection status
   */
  public isConnected(): boolean {
    return (
      this.suno.getConnected() &&
      this.obs.getConnected() &&
      this.studio.getConnected()
    );
  }

  /**
   * Listen to client-level events
   */
  public on(event: 'ready' | 'disconnected' | 'error', callback: Function): () => void {
    if (!this.connectionListeners.has(event)) {
      this.connectionListeners.set(event, new Set());
    }
    this.connectionListeners.get(event)!.add(callback);

    return () => {
      this.connectionListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit connection-level events
   */
  private emit(event: string, data: any): void {
    const callbacks = this.connectionListeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[WebSocket] Event listener error for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

let clientInstance: StudioWebSocketClient | null = null;

/**
 * Get or create WebSocket client singleton
 */
export function getWebSocketClient(
  config?: ClientConfig,
  options?: ClientOptions
): StudioWebSocketClient {
  if (!clientInstance) {
    if (!config) {
      throw new Error('Config is required for first initialization');
    }
    clientInstance = new StudioWebSocketClient(config, options);
  }
  return clientInstance;
}

/**
 * Create a new WebSocket client instance
 */
export function createWebSocketClient(
  config: ClientConfig,
  options?: ClientOptions
): StudioWebSocketClient {
  return new StudioWebSocketClient(config, options);
}
