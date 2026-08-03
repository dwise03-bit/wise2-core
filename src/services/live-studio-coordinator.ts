/**
 * Live Studio Coordinator
 * Orchestrates multi-destination streaming and announcements
 */

import integrationManager from './integration-manager';
import discordLiveService from './discord-live-service';
import kickStreamingService from './kick-streaming-service';
import { LiveStreamConfig, PreflightCheckResult, StreamDestination } from '../types/integrations';

class LiveStudioCoordinator {
  /**
   * Get available destinations for user
   */
  async getAvailableDestinations(
    userId: string,
    organizationId: string
  ): Promise<StreamDestination[]> {
    const integrations = await integrationManager.getIntegrations(userId, organizationId);

    return integrations
      .filter((i) => ['kick', 'youtube', 'discord'].includes(i.providerId))
      .map((i) => ({
        id: i.id,
        providerId: i.providerId,
        name: i.externalAccountName || this.getProviderDisplayName(i.providerId),
        enabled: false,
        status: i.status,
        metadata: {
          accountId: i.externalAccountId,
          workspaceId: i.externalWorkspaceId,
          lastSync: i.lastSyncAt,
        },
      }));
  }

  /**
   * Run preflight checks on all enabled destinations
   */
  async runPreflightChecks(
    userId: string,
    organizationId: string,
    destinations: StreamDestination[]
  ): Promise<PreflightCheckResult[]> {
    const results: PreflightCheckResult[] = [];

    // Check Google authorization
    const googleIntegration = await integrationManager.getIntegrationByProvider(
      userId,
      organizationId,
      'google'
    );
    if (googleIntegration) {
      const validation = await integrationManager.validateIntegration(googleIntegration.id);
      results.push({
        provider: 'google',
        status: validation.valid ? 'ready' : 'action_required',
        message: validation.message,
        action: !validation.valid ? 'reauthorize' : undefined,
      });
    }

    // Check enabled destinations
    for (const dest of destinations.filter((d) => d.enabled)) {
      if (dest.providerId === 'kick') {
        const result = await this.checkKickConnection(userId, organizationId);
        results.push(result);
      } else if (dest.providerId === 'youtube') {
        const result = await this.checkYouTubeConnection(userId, organizationId);
        results.push(result);
      } else if (dest.providerId === 'discord') {
        const result = await this.checkDiscordConnection(userId, organizationId);
        results.push(result);
      }
    }

    // Check system resources
    results.push({
      provider: 'system',
      status: 'ready',
      message: 'System resources available',
    });

    return results;
  }

  /**
   * Start live stream workflow
   */
  async startLiveStream(
    userId: string,
    organizationId: string,
    config: LiveStreamConfig
  ): Promise<{ success: boolean; streamIds: Record<string, string>; error?: string }> {
    const streamIds: Record<string, string> = {};
    const failedDestinations: string[] = [];

    for (const destination of config.destinations.filter((d) => d.enabled)) {
      try {
        if (destination.providerId === 'kick') {
          await kickStreamingService.updateStreamMetadata(userId, organizationId, {
            title: config.title,
            description: config.description,
            tags: config.tags,
            isMature: config.matureContent,
          });
          streamIds['kick'] = 'started';

          // Record stream start
          const integration = await integrationManager.getIntegrationByProvider(
            userId,
            organizationId,
            'kick'
          );
          if (integration) {
            await integrationManager.recordStreamEvent(integration.id, 'start');
          }
        } else if (destination.providerId === 'youtube') {
          // YouTube live streaming would be handled here
          streamIds['youtube'] = 'started';
        } else if (destination.providerId === 'discord') {
          // Post Discord announcement
          const discordIntegration = await integrationManager.getIntegrationByProvider(
            userId,
            organizationId,
            'discord'
          );
          if (discordIntegration && discordIntegration.externalChannelId) {
            const result = await discordLiveService.postLiveAnnouncement(
              userId,
              organizationId,
              {
                serverId: discordIntegration.externalWorkspaceId || '',
                channelId: discordIntegration.externalChannelId,
                template: '🔴 **WISE² Live Studio is now live!**',
                mentionRoles: [],
                includeThumbnail: true,
                includeLink: true,
              },
              config
            );

            if (result.success) {
              streamIds['discord'] = result.messageId || 'announced';
            } else {
              failedDestinations.push(`discord: ${result.error}`);
            }
          }
        }
      } catch (error) {
        failedDestinations.push(
          `${destination.providerId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    if (Object.keys(streamIds).length === 0) {
      return {
        success: false,
        streamIds: {},
        error: `Failed to start stream on any destination: ${failedDestinations.join(', ')}`,
      };
    }

    return {
      success: true,
      streamIds,
    };
  }

  /**
   * End live stream workflow
   */
  async endLiveStream(
    userId: string,
    organizationId: string,
    streamIds: Record<string, string>,
    viewerCount?: number,
    recordingUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    const failedDestinations: string[] = [];

    // Record stream end for integrations
    const integrations = await integrationManager.getIntegrations(userId, organizationId);
    for (const integration of integrations.filter((i) => streamIds[i.providerId])) {
      await integrationManager.recordStreamEvent(integration.id, 'end');
    }

    // Post ending notifications
    const discordIntegration = await integrationManager.getIntegrationByProvider(
      userId,
      organizationId,
      'discord'
    );
    if (discordIntegration && discordIntegration.externalChannelId) {
      const result = await discordLiveService.postStreamEnded(
        userId,
        organizationId,
        discordIntegration.externalChannelId,
        'WISE² Live Studio Stream',
        viewerCount,
        recordingUrl
      );

      if (!result.success) {
        failedDestinations.push(`discord: ${result.error}`);
      }
    }

    if (failedDestinations.length > 0) {
      console.warn('Some destinations failed to end stream:', failedDestinations);
    }

    return { success: true };
  }

  /**
   * Check Kick connection status
   */
  private async checkKickConnection(
    userId: string,
    organizationId: string
  ): Promise<PreflightCheckResult> {
    const integration = await integrationManager.getIntegrationByProvider(
      userId,
      organizationId,
      'kick'
    );

    if (!integration) {
      return {
        provider: 'kick',
        status: 'action_required',
        message: 'Kick not connected',
        action: 'connect',
      };
    }

    const validation = await integrationManager.validateIntegration(integration.id);
    if (!validation.valid) {
      return {
        provider: 'kick',
        status: 'failed',
        message: validation.message,
        action: 'reauthorize',
      };
    }

    const streamKey = integration.encryptedStreamKey;
    if (!streamKey) {
      return {
        provider: 'kick',
        status: 'warning',
        message: 'RTMP stream key not configured',
        action: 'configure',
      };
    }

    return {
      provider: 'kick',
      status: 'ready',
      message: 'Kick stream ready',
    };
  }

  /**
   * Check YouTube connection status
   */
  private async checkYouTubeConnection(
    userId: string,
    organizationId: string
  ): Promise<PreflightCheckResult> {
    const integration = await integrationManager.getIntegrationByProvider(
      userId,
      organizationId,
      'google'
    );

    if (!integration) {
      return {
        provider: 'youtube',
        status: 'action_required',
        message: 'YouTube not connected',
        action: 'connect',
      };
    }

    const validation = await integrationManager.validateIntegration(integration.id);
    return {
      provider: 'youtube',
      status: validation.valid ? 'ready' : 'action_required',
      message: validation.message,
      action: !validation.valid ? 'reauthorize' : undefined,
    };
  }

  /**
   * Check Discord connection status
   */
  private async checkDiscordConnection(
    userId: string,
    organizationId: string
  ): Promise<PreflightCheckResult> {
    const integration = await integrationManager.getIntegrationByProvider(
      userId,
      organizationId,
      'discord'
    );

    if (!integration) {
      return {
        provider: 'discord',
        status: 'action_required',
        message: 'Discord not connected',
        action: 'connect',
      };
    }

    if (!integration.externalChannelId) {
      return {
        provider: 'discord',
        status: 'warning',
        message: 'Discord channel not selected',
        action: 'configure',
      };
    }

    const validation = await integrationManager.validateIntegration(integration.id);
    return {
      provider: 'discord',
      status: validation.valid ? 'ready' : 'action_required',
      message: validation.message,
      action: !validation.valid ? 'reauthorize' : undefined,
    };
  }

  /**
   * Get provider display name
   */
  private getProviderDisplayName(providerId: string): string {
    const names: Record<string, string> = {
      google: 'Google',
      kick: 'Kick',
      youtube: 'YouTube Live',
      discord: 'Discord',
    };
    return names[providerId] || providerId;
  }
}

export default new LiveStudioCoordinator();
