import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class DiscordPublisherService {
  private readonly logger = new Logger(DiscordPublisherService.name);
  private readonly discordWebhookUrl = process.env.DISCORD_CLIPPER_WEBHOOK_URL;

  async publishClip(clip: any): Promise<void> {
    if (!this.discordWebhookUrl) {
      this.logger.warn('Discord webhook URL not configured, skipping publish');
      return;
    }

    try {
      const message = {
        content: `🎬 **${clip.title}**\n${clip.description || ''}\n\n🔗 **Hashtags**: ${clip.hashtags.join(' ') || 'N/A'}`,
        embeds: [
          {
            title: clip.title,
            description: clip.description,
            color: 0x00d9ff, // WISE² cyan
            fields: [
              {
                name: 'Duration',
                value: `${clip.durationSeconds}s`,
                inline: true,
              },
              {
                name: 'Engagement Score',
                value: `${clip.engagementScore || 'N/A'}`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // TODO: Upload clip file to Discord separately (requires file payload)
      // For now, just send metadata

      await axios.post(this.discordWebhookUrl, message);
      this.logger.log(`Clip published to Discord: ${clip.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish clip to Discord: ${error.message}`);
      throw error;
    }
  }

  async uploadClipFile(clipPath: string, webhookUrl?: string): Promise<void> {
    const url = webhookUrl || this.discordWebhookUrl;
    if (!url) return;

    try {
      const fileStats = fs.statSync(clipPath);
      if (fileStats.size > 8 * 1024 * 1024) {
        this.logger.warn('Clip file exceeds Discord 8MB limit, skipping file upload');
        return;
      }

      const formData = new FormData();
      const fileStream = fs.createReadStream(clipPath);
      formData.append('file', fileStream as any);

      await axios.post(url, formData, {
        headers: formData.getHeaders(),
      });

      this.logger.log(`Clip file uploaded to Discord: ${clipPath}`);
    } catch (error: any) {
      this.logger.error(`Failed to upload clip file to Discord: ${error.message}`);
      throw error;
    }
  }
}
