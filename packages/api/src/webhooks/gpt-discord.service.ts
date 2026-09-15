import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface DiscordEmbed {
  title: string;
  description: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

@Injectable()
export class GPTDiscordService {
  private readonly logger = new Logger(GPTDiscordService.name);
  private gptWebhookUrl: string;
  private notificationsWebhookUrl: string;

  constructor(private configService: ConfigService) {
    this.gptWebhookUrl = this.configService.get('DISCORD_GPT_WEBHOOK') || '';
    this.notificationsWebhookUrl = this.configService.get('DISCORD_NOTIFICATIONS_WEBHOOK') || '';
  }

  /**
   * Send GPT response to Discord
   */
  async sendGPTResponse(
    channelType: 'alerts' | 'general' | 'commands',
    data: {
      title: string;
      response: string;
      metrics?: Record<string, any>;
      userId?: string;
      timestamp?: Date;
    }
  ): Promise<void> {
    if (!this.gptWebhookUrl) {
      this.logger.warn('GPT Discord webhook URL not configured');
      return;
    }

    try {
      const embed = this.formatGPTEmbed(data);
      const payload: DiscordWebhookPayload = {
        username: 'WISE² Command Center',
        avatar_url: 'https://wise2.net/logo.png',
        embeds: [embed],
      };

      await axios.post(this.gptWebhookUrl, payload);
      this.logger.debug(`GPT response sent to Discord (${channelType})`);
    } catch (error) {
      this.logger.error(`Failed to send GPT response to Discord: ${error}`);
    }
  }

  /**
   * Send system notifications to Discord
   */
  async sendNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    source?: string;
  }): Promise<void> {
    if (!this.notificationsWebhookUrl) {
      this.logger.warn('Notifications Discord webhook URL not configured');
      return;
    }

    try {
      const colorMap = {
        info: 0x3498db,
        warning: 0xf39c12,
        error: 0xe74c3c,
        success: 0x2ecc71,
      };

      const embed: DiscordEmbed = {
        title: `[${data.type.toUpperCase()}] ${data.title}`,
        description: data.message,
        color: colorMap[data.type],
        footer: {
          text: data.source || 'WISE² System',
        },
        timestamp: new Date().toISOString(),
      };

      const payload: DiscordWebhookPayload = {
        embeds: [embed],
      };

      await axios.post(this.notificationsWebhookUrl, payload);
      this.logger.debug(`Notification sent to Discord`);
    } catch (error) {
      this.logger.error(`Failed to send notification to Discord: ${error}`);
    }
  }

  /**
   * Send business metrics update
   */
  async sendMetricsUpdate(metrics: {
    revenue?: number;
    jobsCompleted?: number;
    techUtilization?: number;
    openEstimates?: number;
    period: string;
  }): Promise<void> {
    if (!this.gptWebhookUrl) return;

    try {
      const embed: DiscordEmbed = {
        title: '📊 Business Metrics Update',
        description: `Metrics for ${metrics.period}`,
        color: 0x9b59b6,
        fields: [
          ...(metrics.revenue ? [{ name: '💰 Revenue', value: `$${metrics.revenue.toFixed(2)}`, inline: true }] : []),
          ...(metrics.jobsCompleted ? [{ name: '✅ Jobs Completed', value: metrics.jobsCompleted.toString(), inline: true }] : []),
          ...(metrics.techUtilization ? [{ name: '👥 Tech Utilization', value: `${metrics.techUtilization}%`, inline: true }] : []),
          ...(metrics.openEstimates ? [{ name: '📋 Open Estimates', value: metrics.openEstimates.toString(), inline: true }] : []),
        ],
        footer: { text: 'WISE² Command Center' },
        timestamp: new Date().toISOString(),
      };

      const payload: DiscordWebhookPayload = {
        username: 'WISE² Analytics',
        embeds: [embed],
      };

      await axios.post(this.gptWebhookUrl, payload);
      this.logger.debug('Metrics update sent to Discord');
    } catch (error) {
      this.logger.error(`Failed to send metrics update: ${error}`);
    }
  }

  /**
   * Format GPT response as Discord embed
   */
  private formatGPTEmbed(data: {
    title: string;
    response: string;
    metrics?: Record<string, any>;
    userId?: string;
    timestamp?: Date;
  }): DiscordEmbed {
    const fields = [];

    if (data.metrics) {
      Object.entries(data.metrics).forEach(([key, value]) => {
        fields.push({
          name: this.formatMetricName(key),
          value: this.formatMetricValue(value),
          inline: true,
        });
      });
    }

    return {
      title: `🤖 ${data.title}`,
      description: data.response,
      color: 0x3498db,
      fields: fields.length > 0 ? fields : undefined,
      footer: {
        text: data.userId ? `User: ${data.userId}` : 'WISE² Command Center',
      },
      timestamp: (data.timestamp || new Date()).toISOString(),
    };
  }

  private formatMetricName(key: string): string {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatMetricValue(value: any): string {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  }
}
