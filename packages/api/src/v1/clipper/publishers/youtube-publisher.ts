import { Injectable, Logger } from '@nestjs/common';
import { BasePublisher, PublishResult } from './base-publisher';
import { ClipPlatform } from '@prisma/client';
import { google } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class YouTubePublisher extends BasePublisher {
  readonly platform: ClipPlatform = ClipPlatform.YOUTUBE;
  private readonly logger = new Logger(YouTubePublisher.name);

  private youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  async publishClip(
    clipPath: string,
    metadata: { title: string; description: string; hashtags: string[] },
  ): Promise<PublishResult> {
    if (!process.env.YOUTUBE_API_KEY) {
      return {
        platform: this.platform,
        success: false,
        error: 'YouTube API key not configured',
      };
    }

    try {
      const description = `${metadata.description}\n\n${metadata.hashtags.join(' ')}`;

      const response = await this.youtube.videos.insert(
        {
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: metadata.title,
              description,
              tags: metadata.hashtags,
              categoryId: '24', // Entertainment category
            },
            status: {
              privacyStatus: 'public',
              madeForKids: false,
            },
          },
          media: {
            body: fs.createReadStream(clipPath),
          },
        },
        {
          onUploadProgress: (evt: any) => {
            const progress = (evt.bytesProcessed / evt.totalBytes) * 100;
            this.logger.log(`YouTube upload progress: ${progress.toFixed(2)}%`);
          },
        },
      );

      const videoId = response.data.id;
      return {
        platform: this.platform,
        success: true,
        platformUrl: `https://youtu.be/${videoId}`,
        platformPostId: videoId,
      };
    } catch (error) {
      this.logger.error(`YouTube publish failed: ${error.message}`);
      return {
        platform: this.platform,
        success: false,
        error: error.message,
      };
    }
  }

  async checkStatus(postId: string): Promise<{ status: string; views?: number }> {
    if (!process.env.YOUTUBE_API_KEY) {
      return { status: 'error: not_configured' };
    }

    try {
      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: [postId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        return { status: 'not_found' };
      }

      const stats = response.data.items[0].statistics;
      return {
        status: 'published',
        views: parseInt(stats?.viewCount || '0'),
      };
    } catch (error) {
      return { status: 'error: status_check_failed' };
    }
  }
}
