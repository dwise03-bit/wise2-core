'use client';

import { ChatConnectorBase } from './ChatConnectorBase';
import { ChatMessage, ChatAlert, UserType } from '../components/LiveStudio/types/chat';
import { generateId } from '../utils/chatUtils';

interface FacebookConfig {
  pageId: string;
  liveVideoId: string;
  accessToken: string;
}

/**
 * Facebook chat connector using Facebook Graph API
 */
export class FacebookConnector extends ChatConnectorBase {
  private config: FacebookConfig | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastMessageTime: number = Date.now() / 1000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(config: FacebookConfig) {
    super('facebook');
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.connectionStatus === 'connecting') {
      return;
    }

    this.setStatus('connecting');

    try {
      if (!this.config) {
        throw new Error('Facebook config not set');
      }

      // Verify access token and permissions
      await this.verifyToken();

      this.reconnectAttempts = 0;
      this.setStatus('connected');

      // Start polling for new messages and comments
      this.startPolling();
    } catch (error) {
      console.error('Facebook connection error:', error);
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
    if (!this.isConnected || !this.config) {
      throw new Error('Not connected to Facebook');
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.liveVideoId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            message: text,
            access_token: this.config.accessToken,
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending Facebook message:', error);
      throw error;
    }
  }

  private async verifyToken(): Promise<void> {
    if (!this.config) return;

    try {
      const response = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${this.config.accessToken}&access_token=${this.config.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Invalid access token');
      }

      const data = await response.json();

      if (!data.data.is_valid) {
        throw new Error('Token is not valid');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  private startPolling(): void {
    if (!this.config) {
      return;
    }

    // Poll for new messages every 2 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        await this.fetchComments();
      } catch (error) {
        console.error('Error polling Facebook chat:', error);
      }
    }, 2000);
  }

  private async fetchComments(): Promise<void> {
    if (!this.config) {
      return;
    }

    try {
      const params = new URLSearchParams({
        fields: 'id,message,story,type,created_time,user_likes,from{name,picture},comments{id,message,from{name,picture},created_time}',
        filter: 'toplevel',
        access_token: this.config.accessToken,
        limit: '25',
      });

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.liveVideoId}/comments?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();

      if (data.data) {
        for (const comment of data.data) {
          const createdTime = new Date(comment.created_time).getTime() / 1000;

          // Only process new comments
          if (createdTime > this.lastMessageTime) {
            this.processComment(comment);
            this.lastMessageTime = Math.max(this.lastMessageTime, createdTime);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Facebook comments:', error);
    }
  }

  private processComment(comment: any): void {
    if (!comment.message) {
      return;
    }

    const message: ChatMessage = {
      id: comment.id,
      userName: comment.from.name,
      message: comment.message,
      timestamp: new Date(comment.created_time),
      platform: 'facebook',
      userType: 'regular',
      userAvatar: comment.from.picture?.data?.url,
    };

    this.emitMessage(message);

    // Process replies
    if (comment.comments?.data) {
      for (const reply of comment.comments.data) {
        this.processComment({
          ...reply,
          replyToId: comment.id,
        });
      }
    }
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
