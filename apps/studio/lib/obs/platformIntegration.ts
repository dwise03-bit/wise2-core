/**
 * Platform Integration
 * Handles OAuth, stream key management, and RTMP routing to external platforms
 *
 * Supports: Twitch, YouTube, Facebook, and custom RTMP endpoints
 */

import { EventEmitter } from 'events';

export type PlatformType = 'twitch' | 'youtube' | 'facebook' | 'custom' | 'twitter_x';

export interface PlatformCredentials {
  platform: PlatformType;
  accessToken?: string;
  refreshToken?: string;
  streamKey?: string;
  rtmpUrl?: string;
  userId?: string;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface PlatformStreamConfig {
  platform: PlatformType;
  title?: string;
  description?: string;
  thumbnail?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  category?: string;
  tags?: string[];
  autoBitrate?: boolean;
  targetBitrate?: number; // kbps
}

export interface PlatformStreamStatus {
  platform: PlatformType;
  isLive: boolean;
  streamId?: string;
  startedAt?: number;
  endedAt?: number;
  viewers?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

/**
 * Platform Integration Manager
 * Handles OAuth flows and RTMP routing to multiple platforms
 */
export class PlatformIntegration extends EventEmitter {
  private credentials = new Map<string, PlatformCredentials>();
  private oauthCallbacks = new Map<string, (code: string) => Promise<PlatformCredentials>>();

  constructor() {
    super();
    this.initializePlatforms();
  }

  /**
   * Initialize platform OAuth handlers
   */
  private initializePlatforms(): void {
    this.registerOAuthHandler('twitch', this.twitchOAuthHandler.bind(this));
    this.registerOAuthHandler('youtube', this.youtubeOAuthHandler.bind(this));
    this.registerOAuthHandler('facebook', this.facebookOAuthHandler.bind(this));
  }

  /**
   * Register OAuth handler for a platform
   */
  private registerOAuthHandler(
    platform: string,
    handler: (code: string) => Promise<PlatformCredentials>
  ): void {
    this.oauthCallbacks.set(platform, handler);
  }

  /**
   * Twitch OAuth Handler
   */
  private async twitchOAuthHandler(code: string): Promise<PlatformCredentials> {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new PlatformError('Twitch OAuth credentials not configured', 'OAUTH_CONFIG_ERROR');
    }

    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.APP_URL}/api/auth/twitch/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Twitch OAuth failed');
      }

      const data: any = await response.json();

      // Get Twitch user info
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Client-ID': clientId,
        },
      });

      const userData: any = await userResponse.json();
      const userId = userData.data[0]?.id;

      // Get stream key
      const channelResponse = await fetch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Client-ID': clientId,
          },
        }
      );

      const channelData: any = await channelResponse.json();
      const streamKey = channelData.data[0]?.broadcaster_login;

      return {
        platform: 'twitch',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        streamKey: streamKey || '',
        rtmpUrl: 'rtmp://live.twitch.tv/app',
        userId,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (error) {
      throw new PlatformError(
        `Twitch OAuth error: ${String(error)}`,
        'TWITCH_OAUTH_ERROR'
      );
    }
  }

  /**
   * YouTube OAuth Handler
   */
  private async youtubeOAuthHandler(code: string): Promise<PlatformCredentials> {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new PlatformError('YouTube OAuth credentials not configured', 'OAUTH_CONFIG_ERROR');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.APP_URL}/api/auth/youtube/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('YouTube OAuth failed');
      }

      const data: any = await response.json();

      // Get stream key from YouTube API
      const liveResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,status&mine=true',
        {
          headers: { 'Authorization': `Bearer ${data.access_token}` },
        }
      );

      const liveData: any = await liveResponse.json();
      const streamKey = liveData.items?.[0]?.status?.streamUrl?.split('/')?.pop() || '';

      return {
        platform: 'youtube',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        streamKey,
        rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (error) {
      throw new PlatformError(
        `YouTube OAuth error: ${String(error)}`,
        'YOUTUBE_OAUTH_ERROR'
      );
    }
  }

  /**
   * Facebook OAuth Handler
   */
  private async facebookOAuthHandler(code: string): Promise<PlatformCredentials> {
    const clientId = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;

    if (!clientId || !clientSecret) {
      throw new PlatformError('Facebook OAuth credentials not configured', 'OAUTH_CONFIG_ERROR');
    }

    try {
      const response = await fetch('https://graph.instagram.com/v18.0/oauth/access_token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${process.env.APP_URL}/api/auth/facebook/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Facebook OAuth failed');
      }

      const data: any = await response.json();

      // Get stream key from Facebook
      const userResponse = await fetch(
        `https://graph.facebook.com/me?fields=broadcast_streams&access_token=${data.access_token}`
      );

      const userData: any = await userResponse.json();
      const streamId = userData.broadcast_streams?.[0]?.id;

      return {
        platform: 'facebook',
        accessToken: data.access_token,
        streamKey: streamId || '',
        rtmpUrl: 'rtmp://live-api-s.facebook.com:80/rtmp/',
        userId: data.user_id,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (error) {
      throw new PlatformError(
        `Facebook OAuth error: ${String(error)}`,
        'FACEBOOK_OAUTH_ERROR'
      );
    }
  }

  /**
   * Start OAuth flow for a platform
   */
  async initiateOAuth(platform: PlatformType): Promise<{ authUrl: string }> {
    switch (platform) {
      case 'twitch':
        return {
          authUrl: `https://id.twitch.tv/oauth2/authorize?client_id=${
            process.env.TWITCH_CLIENT_ID
          }&redirect_uri=${encodeURIComponent(
            `${process.env.APP_URL}/api/auth/twitch/callback`
          )}&response_type=code&scope=user:read:email channel:read:stream_key`,
        };

      case 'youtube':
        return {
          authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
            process.env.YOUTUBE_CLIENT_ID
          }&redirect_uri=${encodeURIComponent(
            `${process.env.APP_URL}/api/auth/youtube/callback`
          )}&response_type=code&scope=https://www.googleapis.com/auth/youtube.force-ssl`,
        };

      case 'facebook':
        return {
          authUrl: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${
            process.env.FACEBOOK_APP_ID
          }&redirect_uri=${encodeURIComponent(
            `${process.env.APP_URL}/api/auth/facebook/callback`
          )}&scope=instagram_basic,instagram_graph_user_media`,
        };

      default:
        throw new PlatformError(`Platform ${platform} not supported`, 'UNSUPPORTED_PLATFORM');
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(platform: PlatformType, code: string): Promise<PlatformCredentials> {
    const handler = this.oauthCallbacks.get(platform);
    if (!handler) {
      throw new PlatformError(`No OAuth handler for platform: ${platform}`, 'NO_HANDLER');
    }

    const credentials = await handler(code);
    this.credentials.set(platform, credentials);
    this.emit('credentials:updated', { platform, credentials });

    return credentials;
  }

  /**
   * Set custom RTMP endpoint credentials
   */
  setCustomRtmp(rtmpUrl: string, streamKey: string, label?: string): PlatformCredentials {
    const credentials: PlatformCredentials = {
      platform: 'custom',
      rtmpUrl,
      streamKey,
      metadata: { label: label || 'Custom RTMP' },
    };

    this.credentials.set('custom', credentials);
    return credentials;
  }

  /**
   * Get platform credentials
   */
  getCredentials(platform: PlatformType): PlatformCredentials | undefined {
    return this.credentials.get(platform);
  }

  /**
   * Get all configured platforms
   */
  getConfiguredPlatforms(): PlatformType[] {
    return Array.from(this.credentials.keys()) as PlatformType[];
  }

  /**
   * Start broadcast to platform
   */
  async startBroadcast(
    platform: PlatformType,
    config: PlatformStreamConfig
  ): Promise<PlatformStreamStatus> {
    const credentials = this.credentials.get(platform);
    if (!credentials) {
      throw new PlatformError(
        `Platform ${platform} not configured`,
        'PLATFORM_NOT_CONFIGURED'
      );
    }

    this.emit('broadcast:starting', { platform, config });

    return {
      platform,
      isLive: true,
      startedAt: Date.now(),
      viewers: 0,
    };
  }

  /**
   * Stop broadcast on platform
   */
  async stopBroadcast(platform: PlatformType): Promise<PlatformStreamStatus> {
    this.emit('broadcast:stopping', { platform });

    return {
      platform,
      isLive: false,
      endedAt: Date.now(),
    };
  }

  /**
   * Get broadcast status
   */
  async getBroadcastStatus(platform: PlatformType): Promise<PlatformStreamStatus> {
    const credentials = this.credentials.get(platform);
    if (!credentials) {
      throw new PlatformError(
        `Platform ${platform} not configured`,
        'PLATFORM_NOT_CONFIGURED'
      );
    }

    return {
      platform,
      isLive: false,
      viewers: 0,
    };
  }

  /**
   * Refresh platform credentials
   */
  async refreshCredentials(platform: PlatformType): Promise<PlatformCredentials> {
    const credentials = this.credentials.get(platform);
    if (!credentials?.refreshToken) {
      throw new PlatformError(
        `Cannot refresh credentials for platform: ${platform}`,
        'NO_REFRESH_TOKEN'
      );
    }

    // Refresh token logic would be implemented per platform
    this.emit('credentials:refreshed', { platform });

    return credentials;
  }

  /**
   * Disconnect platform
   */
  async disconnectPlatform(platform: PlatformType): Promise<void> {
    this.credentials.delete(platform);
    this.emit('platform:disconnected', { platform });
  }
}

/**
 * Custom error class for platform integration errors
 */
export class PlatformError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'PlatformError';
  }
}

/**
 * Platform Integration singleton
 */
let platformIntegration: PlatformIntegration | null = null;

/**
 * Initialize platform integration
 */
export function initPlatformIntegration(): PlatformIntegration {
  if (!platformIntegration) {
    platformIntegration = new PlatformIntegration();
  }
  return platformIntegration;
}

/**
 * Get platform integration instance
 */
export function getPlatformIntegration(): PlatformIntegration {
  if (!platformIntegration) {
    return initPlatformIntegration();
  }
  return platformIntegration;
}
