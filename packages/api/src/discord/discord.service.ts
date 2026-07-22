import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordClient } from './discord.client';
import { commands } from './commands';
import { handleReady, handleInteraction, handleMessage, handleGuildCreate, handleError } from './events';

@Injectable()
export class DiscordService implements OnModuleInit {
  private discordClient: DiscordClient;
  private token = process.env.DISCORD_BOT_TOKEN;
  private guildId = process.env.DISCORD_GUILD_ID;
  private webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  private initialized = false;

  async onModuleInit() {
    if (!this.token || !this.guildId) {
      console.log('⚠️  Discord bot not configured (DISCORD_BOT_TOKEN or DISCORD_GUILD_ID missing)');
      return;
    }

    try {
      await this.initializeBot();
    } catch (err) {
      console.error('Failed to initialize Discord bot:', err);
    }
  }

  private async initializeBot() {
    this.discordClient = new DiscordClient(this.token, this.guildId);

    // Register event handlers
    this.discordClient.onReady(() => handleReady(this.discordClient.getClient()));
    this.discordClient.onInteraction((interaction: any) => handleInteraction(interaction, null));
    this.discordClient.onMessage((message: any) => handleMessage(message, null));

    // Error handling
    const client = this.discordClient.getClient();
    client.on('error', (err: any) => handleError(err));
    client.on('warn', (warn: any) => console.warn('[Discord]', warn));

    // Connect and register commands
    const connected = await this.discordClient.connect();
    if (connected) {
      await this.discordClient.registerCommands(commands.map((cmd) => cmd.toJSON()));
      this.initialized = true;
      console.log('✅ Discord bot fully initialized');
    }
  }

  async sendWelcomeMessage(user: any) {
    try {
      if (this.webhookUrl) {
        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `Welcome to WISE² ${user.name || user.email}! 🎉\nJoin our community: https://discord.gg/wise2`,
          }),
        });
      }
    } catch (err) {
      console.error('Discord notification failed:', err);
    }
  }

  async notifyProjectUpdate(projectId: string, status: string) {
    try {
      if (this.webhookUrl) {
        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `Project ${projectId} status: ${status} ✅`,
          }),
        });
      }
    } catch (err) {
      console.error('Discord notification failed:', err);
    }
  }

  async sendDeploymentNotification(status: string, details: any) {
    if (!this.webhookUrl) return;

    const embed = {
      title: '🚀 Deployment Notification',
      description: status,
      fields: [
        { name: 'Environment', value: details.environment || 'production', inline: true },
        { name: 'Duration', value: details.duration || 'N/A', inline: true },
        { name: 'Commit', value: details.commit?.substring(0, 7) || 'N/A', inline: true },
      ],
      color: status.includes('Success') ? 32768 : 16711680,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch (err) {
      console.error('Failed to send deployment notification:', err);
    }
  }

  async broadcastAlert(title: string, message: string, severity: 'info' | 'warning' | 'critical' = 'info') {
    if (!this.webhookUrl) return;

    const colors = { info: 3447003, warning: 15105570, critical: 16711680 };

    const embed = {
      title: `🔔 ${title}`,
      description: message,
      color: colors[severity],
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch (err) {
      console.error('Failed to broadcast alert:', err);
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      connected: this.discordClient?.isReady() || false,
      guildId: this.guildId,
      commandsCount: commands.length,
    };
  }

  getInviteLink() {
    return {
      inviteUrl: 'https://discord.gg/wise2',
      message: 'Join our Discord community',
    };
  }
}
