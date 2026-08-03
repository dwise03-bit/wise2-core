/**
 * Discord Live Announcements Service
 * Handles "Going Live" notifications and stream status updates
 */

import axios from 'axios';
import integrationManager from './integration-manager';
import { DiscordAnnouncement, LiveStreamConfig } from '../types/integrations';

class DiscordLiveService {
  /**
   * Post "Going Live" announcement
   */
  async postLiveAnnouncement(
    userId: string,
    organizationId: string,
    announcement: DiscordAnnouncement,
    streamConfig: LiveStreamConfig
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'discord'
      );

      if (!integration) {
        return { success: false, error: 'Discord integration not connected' };
      }

      const accessToken = await integrationManager.getAccessToken(integration.id);
      if (!accessToken) {
        return { success: false, error: 'Failed to get Discord access token' };
      }

      // Build announcement message
      let message = announcement.template || '🔴 **WISE² Live Studio is now live!**';

      // Add stream title
      if (streamConfig.title) {
        message += `\n\n**${streamConfig.title}**`;
      }

      // Add description
      if (streamConfig.description) {
        message += `\n${streamConfig.description}`;
      }

      // Add mention roles
      if (announcement.mentionRoles && announcement.mentionRoles.length > 0) {
        const mentions = announcement.mentionRoles.map((roleId) => `<@&${roleId}>`).join(' ');
        message = `${mentions}\n\n${message}`;
      }

      // Add destination links
      const destinations = streamConfig.destinations.filter((d) => d.enabled);
      if (destinations.length > 0) {
        message += '\n\n**Stream on:**';
        for (const dest of destinations) {
          if (dest.providerId === 'youtube') {
            message += '\n• [YouTube](https://youtube.com/live)';
          } else if (dest.providerId === 'kick') {
            message += '\n• [Kick](https://kick.com/live)';
          }
        }
      }

      // Add thumbnail if provided
      const embeds: any[] = [];
      if (announcement.includeThumbnail && streamConfig.thumbnail) {
        embeds.push({
          title: streamConfig.title || 'Going Live',
          image: {
            url: streamConfig.thumbnail,
            height: 1350,
            width: 1080,
          },
          color: 0xff0000, // Red for live
        });
      }

      // Post to Discord
      const response = await axios.post(
        `https://discordapp.com/api/v10/channels/${announcement.channelId}/messages`,
        {
          content: message,
          embeds,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.id,
      };
    } catch (error) {
      console.error('Failed to post Discord announcement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update live announcement with stream link
   */
  async updateStreamLink(
    channelId: string,
    messageId: string,
    streamUrl: string,
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `**Stream Link:** ${streamUrl}`;

      await axios.patch(
        `https://discordapp.com/api/v10/channels/${channelId}/messages/${messageId}`,
        {
          content: message,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to update Discord message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Post stream ending notification
   */
  async postStreamEnded(
    userId: string,
    organizationId: string,
    channelId: string,
    streamTitle: string,
    viewerCount?: number,
    recordingUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await integrationManager.getIntegrationByProvider(
        userId,
        organizationId,
        'discord'
      );

      if (!integration) {
        return { success: false, error: 'Discord integration not connected' };
      }

      const accessToken = await integrationManager.getAccessToken(integration.id);
      if (!accessToken) {
        return { success: false, error: 'Failed to get Discord access token' };
      }

      let message = `✅ **Stream Ended**\n\n**${streamTitle}**`;

      if (viewerCount) {
        message += `\n👥 ${viewerCount.toLocaleString()} viewers`;
      }

      if (recordingUrl) {
        message += `\n\n[Watch Recording](${recordingUrl})`;
      }

      await axios.post(
        `https://discordapp.com/api/v10/channels/${channelId}/messages`,
        {
          content: message,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to post stream ended notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send stream status update
   */
  async sendStatusUpdate(
    channelId: string,
    status: 'online' | 'offline' | 'error',
    message: string,
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emoji = status === 'online' ? '🔴' : status === 'offline' ? '⚪' : '❌';
      const content = `${emoji} **Stream Status:** ${message}`;

      await axios.post(
        `https://discordapp.com/api/v10/channels/${channelId}/messages`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to send status update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check bot permissions in channel
   */
  async checkBotPermissions(
    channelId: string,
    accessToken: string
  ): Promise<{ canPost: boolean; canEmbed: boolean; error?: string }> {
    try {
      const response = await axios.get(
        `https://discordapp.com/api/v10/channels/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        canPost: true,
        canEmbed: true,
      };
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return {
        canPost: false,
        canEmbed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new DiscordLiveService();
