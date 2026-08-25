import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DashboardStatsService } from '../revenue-os/dashboard/dashboard-stats.service';
import { HermesService } from '../hermes/hermes.service';
import { DiscordClient } from './discord.client';
import { commands } from './commands';
import {
  handleError,
  handleGuildCreate,
  handleInteraction,
  handleMessage,
  handleReady,
} from './events';
import type { HermesImageResult } from '../hermes/image/image.types';

type DiscordChannel = 'alerts' | 'builds' | 'deployments' | 'decisions' | 'images';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly logger = new Logger('DiscordService');
  private readonly token = process.env.DISCORD_BOT_TOKEN;
  private readonly guildId = process.env.DISCORD_GUILD_ID;
  private readonly clientId = process.env.DISCORD_CLIENT_ID || '';
  private readonly clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
  private readonly redirectUri =
    process.env.DISCORD_REDIRECT_URI || 'https://wise2.net/api/auth/discord/callback';
  private readonly defaultTenantId = process.env.DISCORD_DEFAULT_TENANT_ID || '';
  private readonly defaultHermesUserId =
    process.env.DISCORD_DEFAULT_HERMES_USER_ID || process.env.DEFAULT_HERMES_USER_ID || '';
  private readonly webhookUrls: Record<DiscordChannel, string | undefined> = {
    alerts: process.env.DISCORD_WEBHOOK_ALERTS || process.env.DISCORD_WEBHOOK_URL,
    builds: process.env.DISCORD_WEBHOOK_BUILDS || process.env.DISCORD_WEBHOOK_URL,
    deployments:
      process.env.DISCORD_WEBHOOK_DEPLOYMENTS || process.env.DISCORD_WEBHOOK_URL,
    decisions: process.env.DISCORD_WEBHOOK_DECISIONS || process.env.DISCORD_WEBHOOK_URL,
    images: process.env.DISCORD_WEBHOOK_IMAGES || process.env.DISCORD_WEBHOOK_URL,
  };

  private discordClient!: DiscordClient;
  private initialized = false;

  constructor(
    private readonly dashboardStatsService: DashboardStatsService,
    private readonly hermesService: HermesService,
  ) {}

  async onModuleInit() {
    if (!this.token || !this.guildId) {
      this.logger.warn(
        'Discord bot not configured (DISCORD_BOT_TOKEN or DISCORD_GUILD_ID missing)',
      );
      return;
    }

    try {
      await this.initializeBot();
    } catch (err) {
      this.logger.error('Failed to initialize Discord bot', err as Error);
    }
  }

  private async initializeBot() {
    if (!this.token || !this.guildId) {
      return;
    }

    this.discordClient = new DiscordClient(this.token, this.guildId);
    this.discordClient.onReady(() => handleReady(this.discordClient.getClient()));
    this.discordClient.onInteraction((interaction: any) =>
      handleInteraction(interaction, null, this),
    );
    this.discordClient.onMessage((message: any) => handleMessage(message, null));

    const client = this.discordClient.getClient();
    client.on('guildCreate', (guild: any) => handleGuildCreate(guild));
    client.on('error', (err: any) => handleError(err));
    client.on('warn', (warn: any) => console.warn('[Discord]', warn));

    const connected = await this.discordClient.connect();
    if (connected) {
      await this.discordClient.registerCommands(commands.map((cmd) => cmd.toJSON()));
      this.initialized = true;
      this.logger.log('Discord bot fully initialized');
    }
  }

  async askHermes(query: string) {
    if (!this.defaultHermesUserId) {
      return {
        ok: false,
        reason: 'Set DISCORD_DEFAULT_HERMES_USER_ID to enable Discord Hermes chat.',
      };
    }

    try {
      const result = await this.hermesService.chat(this.defaultHermesUserId, {
        message: query,
        mode: 'systems',
        profile: 'fast',
      });

      return {
        ok: true,
        response: result.response,
      };
    } catch (error) {
      return {
        ok: false,
        reason:
          error instanceof Error ? error.message : 'Hermes request failed',
      };
    }
  }

  async sendWelcomeMessage(user: any) {
    return this.sendSimpleContent(
      'alerts',
      `Welcome to WISE2 ${user.name || user.email}.\nJoin our community: https://discord.gg/wise2`,
    );
  }

  async notifyProjectUpdate(projectId: string, status: string) {
    return this.sendSimpleContent(
      'alerts',
      `Project ${projectId} status: ${status}`,
    );
  }

  async sendDeploymentNotification(status: string, details: any) {
    return this.sendChannelEmbed('deployments', {
      title: 'Deployment Notification',
      description: status,
      fields: [
        { name: 'Environment', value: details.environment || 'production', inline: true },
        { name: 'Duration', value: details.duration || 'N/A', inline: true },
        {
          name: 'Commit',
          value: details.commit ? String(details.commit).slice(0, 12) : 'N/A',
          inline: true,
        },
      ],
      color: String(status).toLowerCase().includes('success') ? 0x22c55e : 0xff4d4f,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastAlert(
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'critical' = 'info',
  ) {
    const colors = { info: 0x0094ff, warning: 0xffb020, critical: 0xff4d4f };

    return this.sendChannelEmbed('alerts', {
      title,
      description: message,
      color: colors[severity],
      timestamp: new Date().toISOString(),
    });
  }

  async sendImageResult(
    result: HermesImageResult,
    channel: DiscordChannel = 'images',
  ) {
    const statusColors = {
      completed: 0x22c55e,
      failed: 0xff4d4f,
      pending: 0xffb020,
    };

    const fields: Array<{name: string; value: string; inline: boolean}> = [
      { name: 'Job ID', value: result.jobId, inline: true },
      { name: 'Status', value: result.status.toUpperCase(), inline: true },
      { name: 'Provider', value: result.provider || 'Unknown', inline: true },
    ];

    if (result.instruction) {
      fields.push({ name: 'Instruction', value: result.instruction, inline: false });
    }

    if (result.lockedAssetIds && result.lockedAssetIds.length > 0) {
      fields.push({
        name: 'Locked Assets',
        value: result.lockedAssetIds.join(', '),
        inline: false,
      });
    }

    if (result.error) {
      fields.push({ name: 'Error', value: result.error, inline: false });
    }

    const embed: Record<string, unknown> = {
      title: 'Image Generation Result',
      color: statusColors[result.status as keyof typeof statusColors] || 0x0094ff,
      fields,
      timestamp: new Date().toISOString(),
    };

    if (result.imageUrl && result.status === 'completed') {
      embed.image = { url: result.imageUrl };
    }

    return this.sendChannelEmbed(channel, embed);
  }

  async sendTestNotification(
    channel: DiscordChannel = 'alerts',
    message?: string,
  ) {
    const summary = await this.getSummary();

    await this.sendChannelEmbed(channel, {
      title: 'WISE2 Discord Integration Test',
      description:
        message || 'This test was triggered from the Wise2 command center/API.',
      color: 0x0094ff,
      fields: [
        {
          name: 'Channel',
          value: channel,
          inline: true,
        },
        {
          name: 'Hermes',
          value: summary.hermes.status,
          inline: true,
        },
        {
          name: 'Revenue Context',
          value: summary.revenue.available ? 'Configured' : 'Missing',
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    });

    return {
      ok: true,
      channel,
      status: this.getStatus(),
    };
  }

  getStatus() {
    const channels = this.getChannelStatus();

    return {
      initialized: this.initialized,
      connected: this.discordClient?.isReady() || false,
      guildId: this.guildId,
      commandsCount: commands.length,
      webhookConfigured: Object.values(channels).some(Boolean),
      webhookChannelsConfigured: Object.values(channels).filter(Boolean).length,
      channels,
      oauthConfigured: Boolean(this.clientId && this.clientSecret && this.redirectUri),
      redirectUri: this.redirectUri,
      defaultTenantId: this.defaultTenantId || null,
      defaultHermesUserId: this.defaultHermesUserId || null,
    };
  }

  getSetupStatus() {
    const channels = this.getChannelStatus();
    const requiredEnv = [
      { key: 'DISCORD_CLIENT_ID', configured: Boolean(this.clientId), purpose: 'Discord OAuth authorize flow' },
      { key: 'DISCORD_CLIENT_SECRET', configured: Boolean(this.clientSecret), purpose: 'Discord OAuth callback token exchange' },
      { key: 'DISCORD_REDIRECT_URI', configured: Boolean(this.redirectUri), purpose: 'Discord OAuth callback URL' },
      { key: 'DISCORD_BOT_TOKEN', configured: Boolean(this.token), purpose: 'Discord bot login' },
      { key: 'DISCORD_GUILD_ID', configured: Boolean(this.guildId), purpose: 'Target Discord server' },
      { key: 'DISCORD_WEBHOOK_ALERTS', configured: Boolean(this.webhookUrls.alerts), purpose: 'Alerts channel notifications' },
      { key: 'DISCORD_WEBHOOK_BUILDS', configured: Boolean(this.webhookUrls.builds), purpose: 'Build notifications' },
      { key: 'DISCORD_WEBHOOK_DEPLOYMENTS', configured: Boolean(this.webhookUrls.deployments), purpose: 'Deployment notifications' },
      { key: 'DISCORD_WEBHOOK_DECISIONS', configured: Boolean(this.webhookUrls.decisions), purpose: 'Decision notifications' },
      { key: 'DISCORD_WEBHOOK_IMAGES', configured: Boolean(this.webhookUrls.images), purpose: 'Image generation result notifications' },
      { key: 'DISCORD_DEFAULT_TENANT_ID', configured: Boolean(this.defaultTenantId), purpose: 'Revenue OS context for Discord commands' },
      { key: 'DISCORD_DEFAULT_HERMES_USER_ID', configured: Boolean(this.defaultHermesUserId), purpose: 'Hermes context for Discord /ask' },
    ];

    return {
      ready:
        Boolean(this.clientId && this.clientSecret && this.redirectUri) &&
        Boolean(this.token && this.guildId) &&
        Boolean(this.webhookUrls.alerts) &&
        Boolean(this.defaultTenantId) &&
        Boolean(this.defaultHermesUserId),
      oauth: {
        configured: Boolean(this.clientId && this.clientSecret && this.redirectUri),
        clientIdConfigured: Boolean(this.clientId),
        clientSecretConfigured: Boolean(this.clientSecret),
        redirectUri: this.redirectUri,
      },
      bot: {
        configured: Boolean(this.token && this.guildId),
        connected: this.discordClient?.isReady() || false,
        guildId: this.guildId || null,
      },
      webhooks: {
        configured: Object.values(channels).some(Boolean),
        channels,
      },
      commandContext: {
        tenantConfigured: Boolean(this.defaultTenantId),
        tenantId: this.defaultTenantId || null,
        hermesUserConfigured: Boolean(this.defaultHermesUserId),
        hermesUserId: this.defaultHermesUserId || null,
      },
      missing: requiredEnv.filter((item) => !item.configured).map((item) => item.key),
      env: requiredEnv,
      invite: this.getInviteLink(),
    };
  }

  async getSummary() {
    const [hermes, revenue] = await Promise.all([
      this.probeHermesHealth(),
      this.getRevenueSummary(),
    ]);

    return {
      discord: this.getStatus(),
      hermes,
      revenue,
      process: {
        uptimeSeconds: Math.floor(process.uptime()),
        uptimeHuman: this.formatUptime(process.uptime()),
        node: process.version,
        pid: process.pid,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  getInviteLink() {
    return {
      inviteUrl: 'https://discord.gg/wise2',
      message: 'Join our Discord community',
    };
  }

  private getChannelStatus() {
    return {
      alerts: Boolean(this.webhookUrls.alerts),
      builds: Boolean(this.webhookUrls.builds),
      deployments: Boolean(this.webhookUrls.deployments),
      decisions: Boolean(this.webhookUrls.decisions),
    };
  }

  private async getRevenueSummary() {
    if (!this.defaultTenantId) {
      return {
        available: false,
        reason: 'DISCORD_DEFAULT_TENANT_ID missing',
      };
    }

    try {
      const [kpis, pipeline, dispatch, alerts] = await Promise.all([
        this.dashboardStatsService.getExecutiveKpis(this.defaultTenantId),
        this.dashboardStatsService.getPipelineMetrics(this.defaultTenantId),
        this.dashboardStatsService.getDispatchMetrics(this.defaultTenantId),
        this.dashboardStatsService.getAlertsPanel(this.defaultTenantId),
      ]);

      return {
        available: true,
        tenantId: this.defaultTenantId,
        kpis,
        pipeline,
        dispatch,
        alerts,
      };
    } catch (error) {
      return {
        available: false,
        reason: error instanceof Error ? error.message : 'Revenue summary failed',
      };
    }
  }

  private async probeHermesHealth() {
    const configuredEndpoint =
      process.env.HERMES_ENDPOINT || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const endpoint = configuredEndpoint.includes('/v1/chat/completions')
      ? configuredEndpoint.replace('/v1/chat/completions', '/v1/models')
      : `${configuredEndpoint.replace(/\/+$/, '')}/api/tags`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      return {
        status: response.ok ? 'online' : 'degraded',
        endpoint: configuredEndpoint,
        model: process.env.OLLAMA_CHAT_MODEL || 'unknown',
      };
    } catch (error) {
      return {
        status: 'offline',
        endpoint: configuredEndpoint,
        model: process.env.OLLAMA_CHAT_MODEL || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendSimpleContent(channel: DiscordChannel, content: string) {
    const webhookUrl = this.webhookUrls[channel];
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    } catch (err) {
      this.logger.error('Discord notification failed', err as Error);
    }
  }

  async sendChannelEmbed(channel: DiscordChannel, embed: Record<string, unknown>) {
    const webhookUrl = this.webhookUrls[channel];
    if (!webhookUrl) {
      throw new Error(`Discord webhook for channel "${channel}" is not configured`);
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Discord webhook failed (${response.status}): ${body || 'no body'}`);
    }
  }

  private formatUptime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
