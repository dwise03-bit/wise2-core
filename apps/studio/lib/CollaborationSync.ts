/**
 * Real-Time Collaboration Sync Engine
 * Handles WebSocket communication, conflict resolution, and state synchronization
 */

import { EventEmitter } from 'events';
import type {
  CollaborationMessage,
  MessageType,
  ConnectionState,
  CollaborationState,
  UserPresence,
  PresenceUpdate,
  ConflictDialog,
} from '../types/collaboration';

interface MessageHandler {
  (data: any): void;
}

interface ReconnectConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class CollaborationSync extends EventEmitter {
  private projectId: string;
  private userId: string;
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = {
    isConnected: false,
    isReconnecting: false,
    connectionErrors: 0,
    socketId: undefined,
  };

  private messageHandlers: Map<MessageType, MessageHandler[]> = new Map();
  private pendingMessages: CollaborationMessage[] = [];
  private messageQueue: CollaborationMessage[] = [];
  private clientId: string = this.generateClientId();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;

  private reconnectConfig: ReconnectConfig = {
    maxAttempts: 10,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
  };

  private lastSyncTime = 0;
  private conflictResolutionTimeout = 5000;

  constructor(projectId: string, userId: string, apiUrl: string = '') {
    super();
    this.projectId = projectId;
    this.userId = userId;

    const wsUrl = this.buildWebSocketUrl(apiUrl);
    this.initializeWebSocket(wsUrl);
  }

  /**
   * Build WebSocket URL from API URL
   */
  private buildWebSocketUrl(apiUrl: string): string {
    if (typeof window === 'undefined') {
      return '';
    }

    // If running in browser and no API URL provided, use current origin
    const baseUrl = apiUrl || window.location.origin;
    const wsProtocol =
      baseUrl.includes('https://') ||
      baseUrl.includes('wss://')
        ? 'wss://'
        : 'ws://';

    const host = baseUrl
      .replace(/^https?:\/\//, '')
      .replace(/^wss?:\/\//, '');

    return `${wsProtocol}${host}/ws/collaboration/${this.projectId}`;
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(wsUrl: string): void {
    if (!wsUrl || typeof window === 'undefined') {
      console.warn('WebSocket URL not available or not in browser');
      return;
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => this.handleConnectionOpen();
      this.socket.onmessage = (event) => this.handleMessage(event);
      this.socket.onerror = (error) => this.handleConnectionError(error);
      this.socket.onclose = () => this.handleConnectionClose();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection open
   */
  private handleConnectionOpen(): void {
    console.log('✓ Collaboration sync connected');

    this.connectionState = {
      isConnected: true,
      isReconnecting: false,
      connectionErrors: 0,
      socketId: this.clientId,
    };

    this.reconnectAttempts = 0;
    this.emit('connected');

    // Send authentication message
    this.send({
      type: 'auth',
      projectId: this.projectId,
      userId: this.userId,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    // Flush pending messages
    this.flushPendingMessages();

    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: CollaborationMessage = JSON.parse(event.data);

      // Ignore own messages (already applied optimistically)
      if (message.clientId === this.clientId) {
        return;
      }

      // Update last sync time
      this.lastSyncTime = Date.now();

      // Route to appropriate handler
      const handlers = this.messageHandlers.get(message.type) || [];
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error handling ${message.type}:`, error);
        }
      });

      // Emit generic message event
      this.emit('message', message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket connection error
   */
  private handleConnectionError(error: Event): void {
    console.error('Collaboration sync error:', error);
    this.connectionState.connectionErrors++;
    this.emit('error', error);

    if (this.connectionState.connectionErrors > 3) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection close
   */
  private handleConnectionClose(): void {
    console.log('Collaboration sync disconnected');

    this.connectionState.isConnected = false;
    this.stopHeartbeat();
    this.emit('disconnected');

    // Attempt to reconnect
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.reconnectConfig.maxAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.connectionState.isReconnecting = true;

    const delay = Math.min(
      this.reconnectConfig.initialDelay *
        Math.pow(this.reconnectConfig.backoffMultiplier, this.reconnectAttempts),
      this.reconnectConfig.maxDelay,
    );

    this.reconnectAttempts++;
    this.connectionState.lastReconnectAttempt = Date.now();

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      const wsUrl = this.buildWebSocketUrl('');
      this.initializeWebSocket(wsUrl);
    }, delay);
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: any): void {
    if (!this.connectionState.isConnected || !this.socket) {
      this.pendingMessages.push(message);
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
      this.pendingMessages.push(message);
    }
  }

  /**
   * Flush pending messages after reconnection
   */
  private flushPendingMessages(): void {
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];

    messages.forEach((message) => {
      this.send(message);
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionState.isConnected) {
        this.send({
          type: 'ping',
          timestamp: Date.now(),
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Register a message handler
   */
  on(eventName: MessageType | string, handler: MessageHandler): void {
    if (eventName === 'connected' || eventName === 'disconnected' || eventName === 'error') {
      super.on(eventName, handler);
    } else {
      const handlers = this.messageHandlers.get(eventName as MessageType) || [];
      handlers.push(handler);
      this.messageHandlers.set(eventName as MessageType, handlers);
    }
  }

  /**
   * Send a collaboration message
   */
  sendMessage(type: MessageType, data: any, clientId?: string): void {
    const message: CollaborationMessage = {
      type,
      projectId: this.projectId,
      userId: this.userId,
      timestamp: Date.now(),
      data,
      clientId: clientId || this.clientId,
    };

    this.send(message);
  }

  /**
   * Send presence update
   */
  updatePresence(update: PresenceUpdate): void {
    this.sendMessage('presence_update', update);
  }

  /**
   * Send track update
   */
  updateTrack(trackId: string, updates: Record<string, any>): void {
    this.sendMessage('track_update', {
      trackId,
      ...updates,
    });
  }

  /**
   * Send mixer update
   */
  updateMixer(updates: Record<string, any>): void {
    this.sendMessage('mixer_update', updates);
  }

  /**
   * Send gallery update
   */
  updateGallery(action: 'add' | 'remove', imageId: string, imageUrl?: string, imageName?: string): void {
    this.sendMessage('gallery_update', {
      action,
      imageId,
      imageUrl,
      imageName,
    });
  }

  /**
   * Request full state sync
   */
  requestStateSync(): void {
    this.send({
      type: 'state_sync_request',
      clientId: this.clientId,
      timestamp: Date.now(),
    });
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `${this.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and disconnect
   */
  disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.messageHandlers.clear();
    this.pendingMessages = [];
    this.removeAllListeners();
  }

  /**
   * Reset sync engine for new project
   */
  reset(projectId: string): void {
    this.disconnect();
    this.projectId = projectId;
    this.reconnectAttempts = 0;
    this.lastSyncTime = 0;

    const wsUrl = this.buildWebSocketUrl('');
    this.initializeWebSocket(wsUrl);
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  /**
   * Get pending messages count
   */
  getPendingMessageCount(): number {
    return this.pendingMessages.length;
  }
}

// Singleton instance
let syncInstance: CollaborationSync | null = null;

export function initializeSync(projectId: string, userId: string, apiUrl?: string): CollaborationSync {
  if (syncInstance) {
    syncInstance.reset(projectId);
  } else {
    syncInstance = new CollaborationSync(projectId, userId, apiUrl);
  }
  return syncInstance;
}

export function getSync(): CollaborationSync | null {
  return syncInstance;
}

export function disconnectSync(): void {
  if (syncInstance) {
    syncInstance.disconnect();
    syncInstance = null;
  }
}
