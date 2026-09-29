'use client';

import { ChatMessage, ChatAlert, ChatPlatform, ChatConnectionStatus } from '../components/LiveStudio/types/chat';

/**
 * Base class for platform-specific chat connectors
 * Subclass this to implement Twitch, YouTube, Facebook, etc.
 */
export abstract class ChatConnectorBase {
  protected platform: ChatPlatform;
  protected isConnected: boolean = false;
  protected connectionStatus: ChatConnectionStatus = 'idle';
  protected messageHandlers: ((message: ChatMessage) => void)[] = [];
  protected alertHandlers: ((alert: ChatAlert) => void)[] = [];
  protected statusHandlers: ((status: ChatConnectionStatus) => void)[] = [];

  constructor(platform: ChatPlatform) {
    this.platform = platform;
  }

  /**
   * Connect to the chat service
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnect from the chat service
   */
  abstract disconnect(): Promise<void>;

  /**
   * Send a message (if supported)
   */
  abstract sendMessage(text: string): Promise<void>;

  /**
   * Register callback for new messages
   */
  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(callback);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== callback);
    };
  }

  /**
   * Register callback for alerts
   */
  onAlert(callback: (alert: ChatAlert) => void): () => void {
    this.alertHandlers.push(callback);
    return () => {
      this.alertHandlers = this.alertHandlers.filter((h) => h !== callback);
    };
  }

  /**
   * Register callback for status changes
   */
  onStatusChange(callback: (status: ChatConnectionStatus) => void): () => void {
    this.statusHandlers.push(callback);
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== callback);
    };
  }

  /**
   * Emit message to handlers
   */
  protected emitMessage(message: ChatMessage): void {
    this.messageHandlers.forEach((handler) => handler(message));
  }

  /**
   * Emit alert to handlers
   */
  protected emitAlert(alert: ChatAlert): void {
    this.alertHandlers.forEach((handler) => handler(alert));
  }

  /**
   * Update connection status
   */
  protected setStatus(status: ChatConnectionStatus): void {
    this.connectionStatus = status;
    this.isConnected = status === 'connected';
    this.statusHandlers.forEach((handler) => handler(status));
  }

  /**
   * Get current connection status
   */
  getStatus(): ChatConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.isConnected;
  }
}
