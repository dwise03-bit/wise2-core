/**
 * Kick Streaming Service
 * Handles Kick live streaming integration and RTMP/metadata management
 */

import axios from 'axios';
import integrationManager from './integration-manager';
import oauthService from './oauth-service';
import { KickStreamMetadata } from '../types/integrations';

class KickStreamingService {
  /**
   * Get Kick channel info
   */
  async getChannelInfo(userId: string, organizationId: string) {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'kick'
      );

      if (!integration) {
        return { success: false, error: 'Kick integration not connected' };
      }

      const accessToken = await integrationManager.getAccessToken(integration.id);
      if (!accessToken) {
        return { success: false, error: 'Failed to get Kick access token' };
      }

      // Get channel info from Kick API
      const response = await axios.get('https://kick.com/api/v2/channels/current', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        channel: {
          id: response.data.id,
          username: response.data.username,
          displayName: response.data.display_name,
          isLive: response.data.is_live,
          followerCount: response.data.followers,
          description: response.data.bio,
        },
      };
    } catch (error) {
      console.error('Failed to get Kick channel info:', error);
      return { success: false, error: 'Failed to retrieve channel info' };
    }
  }

  /**
   * Get RTMP connection details
   */
  async getRTMPDetails(userId: string, organizationId: string): Promise<{
    success: boolean;
    server?: string;
    streamKey?: string;
    error?: string;
  }> {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'kick'
      );

      if (!integration) {
        return { success: false, error: 'Kick integration not connected' };
      }

      // Return RTMP server
      const server = integration.rtmpServer || 'rtmp://live.kick.com/live';

      // Decrypt stream key (never show in logs)
      let streamKey = '';
      if (integration.encryptedStreamKey) {
        streamKey = oauthService.decryptToken(integration.encryptedStreamKey) || '';
      }

      return {
        success: true,
        server,
        streamKey: streamKey ? oauthService.maskToken(streamKey) : 'Not configured',
      };
    } catch (error) {
      console.error('Failed to get RTMP details:', error);
      return { success: false, error: 'Failed to retrieve RTMP details' };
    }
  }

  /**
   * Update stream metadata
   */
  async updateStreamMetadata(
    userId: string,
    organizationId: string,
    metadata: KickStreamMetadata
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'kick'
      );

      if (!integration) {
        return { success: false, error: 'Kick integration not connected' };
      }

      const accessToken = await integrationManager.getAccessToken(integration.id);
      if (!accessToken) {
        return { success: false, error: 'Failed to get Kick access token' };
      }

      // Update stream metadata via Kick API
      await axios.patch(
        'https://kick.com/api/v2/channels/current/stream',
        {
          title: metadata.title,
          description: metadata.description,
          category_id: metadata.categoryId,
          tags: metadata.tags,
          is_mature: metadata.isMature,
          language: metadata.language,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to update stream metadata:', error);
      return { success: false, error: 'Failed to update metadata' };
    }
  }

  /**
   * Get live stream status
   */
  async getLiveStatus(userId: string, organizationId: string): Promise<{
    success: boolean;
    isLive: boolean;
    viewers?: number;
    uptime?: string;
    error?: string;
  }> {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'kick'
      );

      if (!integration) {
        return { success: false, error: 'Kick integration not connected' };
      }

      const accessToken = await integrationManager.getAccessToken(integration.id);
      if (!accessToken) {
        return { success: false, error: 'Failed to get Kick access token' };
      }

      const response = await axios.get('https://kick.com/api/v2/channels/current', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        isLive: response.data.is_live,
        viewers: response.data.live_viewers || 0,
        uptime: response.data.stream_started_at
          ? this.calculateUptime(new Date(response.data.stream_started_at))
          : undefined,
      };
    } catch (error) {
      console.error('Failed to get Kick stream status:', error);
      return { success: false, error: 'Failed to retrieve stream status' };
    }
  }

  /**
   * Store RTMP credentials
   */
  async storeRTMPCredentials(
    userId: string,
    organizationId: string,
    server: string,
    streamKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'kick'
      );

      if (!integration) {
        return { success: false, error: 'Kick integration not found' };
      }

      integration.rtmpServer = server;
      integration.encryptedStreamKey = oauthService.encryptToken(streamKey);

      await integrationManager.saveIntegration(integration);

      return { success: true };
    } catch (error) {
      console.error('Failed to store RTMP credentials:', error);
      return { success: false, error: 'Failed to store credentials' };
    }
  }

  /**
   * Test RTMP connection
   */
  async testRTMPConnection(server: string, streamKey: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // In production, this would attempt an actual RTMP connection
      // For now, we'll just validate the format
      if (!server || !streamKey) {
        return { success: false, error: 'Missing server or stream key' };
      }

      if (!server.startsWith('rtmp://') && !server.startsWith('rtmps://')) {
        return { success: false, error: 'Invalid RTMP server URL' };
      }

      return { success: true };
    } catch (error) {
      console.error('RTMP test failed:', error);
      return { success: false, error: 'Connection test failed' };
    }
  }

  /**
   * Calculate stream uptime
   */
  private calculateUptime(startTime: Date): string {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

export default new KickStreamingService();
