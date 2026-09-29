import { Injectable, BadRequestException } from '@nestjs/common';

// Dynamic import for agora-access-token (optional dependency)
let RtcTokenBuilder: any;
let RtcRole: any;

try {
  const agoraModule = require('agora-access-token');
  RtcTokenBuilder = agoraModule.RtcTokenBuilder;
  RtcRole = agoraModule.RtcRole;
} catch (error) {
  // agora-access-token not installed - feature will be unavailable
}

/**
 * Agora Video Streaming Service (Phase 2.2)
 * Manages video streaming via Agora RTC SDK
 * Generates tokens, manages channels, handles live video
 */

export interface VideoToken {
  token: string;
  channelName: string;
  uid: number;
  expiresIn: number;
}

export interface VideoChannel {
  channelName: string;
  viewers: number;
  maxViewers: number;
  startedAt: Date;
  endedAt?: Date;
}

@Injectable()
export class AgoraVideoService {
  private readonly AGORA_APP_ID = process.env.AGORA_APP_ID;
  private readonly AGORA_APP_CERT = process.env.AGORA_APP_CERT;
  private readonly TOKEN_EXPIRE_TIME_SECONDS = 3600; // 1 hour
  private readonly PRIVILEGE_EXPIRE_TIME_SECONDS = 432000; // 5 days

  constructor() {
    if (!this.AGORA_APP_ID || !this.AGORA_APP_CERT) {
      console.warn('[Live] Agora credentials not configured. Video streaming unavailable.');
    }
  }

  /**
   * Generate RTC token for video streaming
   * Used by both broadcaster and viewer clients
   */
  generateToken(
    channelName: string,
    uid: number,
    role: 'broadcaster' | 'viewer' = 'viewer'
  ): VideoToken {
    if (!this.AGORA_APP_ID || !this.AGORA_APP_CERT) {
      throw new BadRequestException('Agora video service not configured');
    }

    try {
      const agoraRole = role === 'broadcaster' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      const token = RtcTokenBuilder.buildTokenWithUid(
        this.AGORA_APP_ID,
        this.AGORA_APP_CERT,
        channelName,
        uid,
        agoraRole,
        this.TOKEN_EXPIRE_TIME_SECONDS,
        this.PRIVILEGE_EXPIRE_TIME_SECONDS
      );

      return {
        token,
        channelName,
        uid,
        expiresIn: this.TOKEN_EXPIRE_TIME_SECONDS,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to generate video token: ${msg}`);
    }
  }

  /**
   * Generate token for broadcaster
   */
  generateBroadcasterToken(channelName: string, userId: string): VideoToken {
    // Use userId hash as uid (Agora expects integer 0-2^32-1)
    const uid = this.hashStringToUid(userId);
    return this.generateToken(channelName, uid, 'broadcaster');
  }

  /**
   * Generate token for viewer
   */
  generateViewerToken(channelName: string, viewerId: string): VideoToken {
    const uid = this.hashStringToUid(viewerId);
    return this.generateToken(channelName, uid, 'viewer');
  }

  /**
   * Convert string to Agora UID (0-2^32-1)
   */
  private hashStringToUid(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Map to 0-2^32-1 range
    return Math.abs(hash) % (2 ** 32);
  }

  /**
   * Validate channel name format
   * Agora requires channel names: alphanumeric, underscore, dash (1-64 chars)
   */
  validateChannelName(channelName: string): boolean {
    return /^[a-zA-Z0-9_-]{1,64}$/.test(channelName);
  }

  /**
   * Get Agora configuration for frontend client
   */
  getClientConfig() {
    return {
      agoraAppId: this.AGORA_APP_ID || null,
      configured: !!this.AGORA_APP_ID,
      fallbackToAudio: true, // Use audio-only if video unavailable
    };
  }

  /**
   * Verify token is valid
   */
  isTokenValid(token: string): boolean {
    // Basic validation - Agora tokens are JWT-like
    // Real verification would decode and check signature
    return !!(token && token.length > 0 && token.includes('.'));
  }
}
