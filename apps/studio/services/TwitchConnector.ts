'use client';

import { ChatConnectorBase } from './ChatConnectorBase';
import { ChatMessage, ChatAlert, UserType, AlertType } from '../components/LiveStudio/types/chat';
import { generateId } from '../utils/chatUtils';

interface TwitchConfig {
  channelId: string;
  channelName: string;
  accessToken: string;
}

/**
 * Twitch chat connector using EventSub webhooks and API
 */
export class TwitchConnector extends ChatConnectorBase {
  private config: TwitchConfig | null = null;
  private eventSource: EventSource | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(config: TwitchConfig) {
    super('twitch');
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.connectionStatus === 'connecting') {
      return;
    }

    this.setStatus('connecting');

    try {
      if (!this.config) {
        throw new Error('Twitch config not set');
      }

      // Validate token with Twitch API
      const validateResponse = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
          'Authorization': `OAuth ${this.config.accessToken}`,
        },
      });

      if (!validateResponse.ok) {
        throw new Error('Invalid Twitch token');
      }

      // Subscribe to EventSub events
      await this.subscribeToEvents();

      this.reconnectAttempts = 0;
      this.setStatus('connected');
    } catch (error) {
      console.error('Twitch connection error:', error);
      this.setStatus('error');
      this.attemptReconnect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.setStatus('disconnected');
    this.isConnected = false;
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected || !this.config) {
      throw new Error('Not connected to Twitch');
    }

    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            broadcaster_id: this.config.channelId,
            sender_id: this.config.channelId, // Using broadcaster as sender for now
            message: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending Twitch message:', error);
      throw error;
    }
  }

  private async subscribeToEvents(): Promise<void> {
    if (!this.config) {
      throw new Error('Twitch config not set');
    }

    // Subscribe to channel.update, channel.follow, channel.subscribe, channel.cheer, stream.online events
    const eventTypes = [
      'channel.follow',
      'channel.subscribe',
      'channel.cheer',
      'channel.raid',
      'channel.update',
      'stream.online',
    ];

    for (const eventType of eventTypes) {
      try {
        await this.createEventSubSubscription(eventType);
      } catch (error) {
        console.warn(`Failed to subscribe to ${eventType}:`, error);
      }
    }

    // Connect to chat via PubSub or EventSub
    this.connectToChatAPI();
  }

  private async createEventSubSubscription(eventType: string): Promise<void> {
    if (!this.config) return;

    const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: eventType,
        version: '1',
        condition: {
          broadcaster_user_id: this.config.channelId,
          ...(eventType === 'channel.follow' && { moderator_user_id: this.config.channelId }),
        },
        transport: {
          method: 'webhook',
          callback: `${process.env.NEXT_PUBLIC_API_URL || ''}/api/twitch/eventsub`,
          secret: process.env.TWITCH_EVENTSUB_SECRET || '',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`EventSub subscription failed: ${error.error}`);
    }
  }

  private connectToChatAPI(): void {
    if (!this.config) return;

    // Connect to Twitch Chat using a polling mechanism or WebSocket
    // For now, we'll use a simple fetch-based polling approach
    this.pollChatMessages();
  }

  private pollChatMessages(): void {
    if (!this.isConnected || !this.config) return;

    // This is a simplified version - in production, you'd use Twitch's Chat APIs or WebSockets
    // For now, we'll simulate message reception via EventSub webhooks

    // Continue polling
    setTimeout(() => this.pollChatMessages(), 5000);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      this.setStatus('reconnecting');
      setTimeout(() => {
        this.connect().catch(() => {
          this.attemptReconnect();
        });
      }, delay);
    } else {
      this.setStatus('error');
    }
  }

  /**
   * Handle incoming EventSub event
   * Called from API endpoint when Twitch sends webhook data
   */
  handleEventSubEvent(event: any): void {
    const eventType = event.type;

    switch (eventType) {
      case 'channel.follow':
        this.handleFollowEvent(event.data);
        break;
      case 'channel.subscribe':
        this.handleSubscribeEvent(event.data);
        break;
      case 'channel.cheer':
        this.handleCheerEvent(event.data);
        break;
      case 'channel.raid':
        this.handleRaidEvent(event.data);
        break;
      case 'channel.update':
        // Stream title/category updated
        break;
      case 'stream.online':
        // Stream went online
        break;
    }
  }

  /**
   * Handle chat message
   * Called when a message is received via chat API
   */
  handleChatMessage(data: any): void {
    const message: ChatMessage = {
      id: generateId(),
      userName: data.chatter_user_name,
      message: data.message?.text || '',
      timestamp: new Date(),
      platform: 'twitch',
      userType: this.getUserType(data),
      isModerator: data.chatter_user_id === process.env.NEXT_PUBLIC_TWITCH_MOD_ID,
      isBroadcaster: data.chatter_user_id === this.config?.channelId,
      isSubscriber: data.message_type === 'user_intro' || data.badges?.subscriber,
      userColor: data.color,
      userAvatar: `https://static-cdn.jtvnw.net/user-default-pictures/c246e97c-f49e-41f3-ba4b-5bab32d9eef9/34x34.png`,
    };

    this.emitMessage(message);
  }

  private handleFollowEvent(data: any): void {
    const alert: ChatAlert = {
      id: generateId(),
      type: 'follow',
      userName: data.user_name,
      timestamp: new Date(),
      platform: 'twitch',
      duration: 5000,
    };

    this.emitAlert(alert);
  }

  private handleSubscribeEvent(data: any): void {
    const alert: ChatAlert = {
      id: generateId(),
      type: 'subscribe',
      userName: data.user_name,
      message: data.custom_message,
      timestamp: new Date(),
      platform: 'twitch',
      subscriberTier: this.parseTier(data.tier),
      duration: 6000,
    };

    this.emitAlert(alert);
  }

  private handleCheerEvent(data: any): void {
    const alert: ChatAlert = {
      id: generateId(),
      type: 'tip',
      userName: data.user_name,
      message: data.message,
      amount: data.bits,
      currency: 'Bits',
      timestamp: new Date(),
      platform: 'twitch',
      duration: 5000,
    };

    this.emitAlert(alert);
  }

  private handleRaidEvent(data: any): void {
    const alert: ChatAlert = {
      id: generateId(),
      type: 'raid',
      userName: data.from_broadcaster_user_name,
      viewerCount: data.viewers,
      timestamp: new Date(),
      platform: 'twitch',
      duration: 7000,
    };

    this.emitAlert(alert);
  }

  private getUserType(data: any): UserType {
    if (data.chatter_user_id === this.config?.channelId) return 'broadcaster';
    if (data.badges?.moderator) return 'moderator';
    if (data.badges?.vip) return 'vip';
    if (data.badges?.subscriber) return 'subscriber';
    return 'regular';
  }

  private parseTier(tier: string): number {
    const tierMap: Record<string, number> = {
      '1000': 1,
      '2000': 2,
      '3000': 3,
    };
    return tierMap[tier] || 1;
  }
}
