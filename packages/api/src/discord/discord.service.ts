import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordService {
  private discordBotToken = process.env.DISCORD_BOT_TOKEN || 'mock-token';
  private discordGuildId = process.env.DISCORD_GUILD_ID || 'mock-guild';
  private discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/mock';

  async sendWelcomeMessage(user: any) {
    try {
      await fetch(this.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Welcome to WISE² ${user.name || user.email}! 🎉\nJoin our community: https://discord.gg/wise2`,
        }),
      });
    } catch (err) {
      console.error('Discord notification failed:', err);
    }
  }

  async notifyProjectUpdate(projectId: string, status: string) {
    try {
      await fetch(this.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Project ${projectId} status: ${status} ✅`,
        }),
      });
    } catch (err) {
      console.error('Discord notification failed:', err);
    }
  }

  getInviteLink() {
    return {
      inviteUrl: 'https://discord.gg/wise2',
      message: 'Join our Discord community',
    };
  }
}
