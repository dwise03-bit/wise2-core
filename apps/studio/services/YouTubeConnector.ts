'use client';

import { ChatConnectorBase } from './ChatConnectorBase';
import { ChatMessage, ChatAlert, UserType } from '../components/LiveStudio/types/chat';
import { generateId } from '../utils/chatUtils';

interface YouTubeConfig {
  channelId: string;
  accessToken: string;
  liveChatId?: string;
}

/**
 * YouTube chat connector using YouTube API v3
 */
export class YouTubeConnector extends ChatConnectorBase {
  private config: YouTubeConfig | null = null;
  private liveChatId: string | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastMessageTime: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(config: YouTubeConfig) {
    super('youtube');
    this.config = config;
    this.liveChatId = config.liveChatId || null;
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.connectionStatus === 'connecting') {
      return;
    }

    this.setStatus('connecting');

    try {
      if (!this.config) {
        throw new Error('YouTube config not set');
      }

      // Get active live chat ID
      if (!this.liveChatId) {
        await this.getActiveLiveChat();
      }

      if (!this.liveChatId) {
        throw new Error('No active live stream found');
      }

      this.reconnectAttempts = 0;
      this.setStatus('connected');

      // Start polling for new messages
      this.startPolling();
    } catch (error) {
      console.error('YouTube connection error:', error);
      this.setStatus('error');
      this.attemptReconnect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.setStatus('disconnected');
    this.isConnected = false;
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected || !this.liveChatId || !this.config) {
      throw new Error('Not connected to YouTube');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              liveChatId: this.liveChatId,
              textMessageDetails: {
                messageText: text,
              },
              type: 'textMessageEvent',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending YouTube message:', error);
      throw error;
    }
  }

  private async getActiveLiveChat(): Promise<void> {
    if (!this.config) return;

    try {
      // Get current user's broadcasts
      const broadcastResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,liveStreamingDetails&broadcastStatus=active&maxResults=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          },
        }
      );

      if (!broadcastResponse.ok) {
        throw new Error('Failed to fetch broadcasts');
      }

      const broadcasts = await broadcastResponse.json();

      if (broadcasts.items && broadcasts.items.length > 0) {
        this.liveChatId = broadcasts.items[0].liveStreamingDetails.activeLiveChatId;
      }
    } catch (error) {
      console.error('Error getting active live chat:', error);
      throw error;
    }
  }

  private startPolling(): void {
    if (!this.liveChatId || !this.config) {
      return;
    }

    // Poll for new messages every 3 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        await this.fetchNewMessages();
      } catch (error) {
        console.error('Error polling YouTube chat:', error);
      }
    }, 3000);
  }

  private async fetchNewMessages(): Promise<void> {
    if (!this.liveChatId || !this.config) {
      return;
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet,authorDetails',
        liveChatId: this.liveChatId,
        maxResults: '50',
        ...(this.lastMessageTime && { searchAfterTime: this.lastMessageTime }),
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      if (data.items) {
        for (const item of data.items) {
          this.processMessage(item);
        }

        // Update last message time for next poll
        if (data.items.length > 0) {
          const lastItem = data.items[data.items.length - 1];
          this.lastMessageTime = lastItem.snippet.publishedAt;
        }
      }

      // Check for superchats/superstickers
      if (data.items) {
        for (const item of data.items) {
          if (item.snippet.type === 'superChatEvent') {
            this.handleSuperChat(item);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube messages:', error);
    }
  }

  private processMessage(item: any): void {
    const snippet = item.snippet;

    if (snippet.type !== 'textMessageEvent') {
      return;
    }

    const authorDetails = item.authorDetails;

    const message: ChatMessage = {
      id: item.id,
      userName: authorDetails.displayName,
      message: snippet.textMessageDetails.messageText,
      timestamp: new Date(snippet.publishedAt),
      platform: 'youtube',
      userType: this.getUserType(authorDetails),
      isModerator: authorDetails.isChatModerator,
      isBroadcaster: authorDetails.isChatOwner,
      isSubscriber: authorDetails.isVerified,
      userAvatar: authorDetails.profileImageUrl,
    };

    this.emitMessage(message);
  }

  private handleSuperChat(item: any): void {
    const snippet = item.snippet;
    const authorDetails = item.authorDetails;

    const alert: ChatAlert = {
      id: item.id,
      type: 'tip',
      userName: authorDetails.displayName,
      message: snippet.superChatDetails.userComment,
      amount: snippet.superChatDetails.amountMicros / 1000000,
      currency: snippet.superChatDetails.currency,
      userAvatar: authorDetails.profileImageUrl,
      timestamp: new Date(snippet.publishedAt),
      platform: 'youtube',
      duration: 6000,
    };

    this.emitAlert(alert);
  }

  private getUserType(authorDetails: any): UserType {
    if (authorDetails.isChatOwner) return 'broadcaster';
    if (authorDetails.isChatModerator) return 'moderator';
    return 'regular';
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
}
