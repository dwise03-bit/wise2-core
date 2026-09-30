import { Injectable, Logger } from '@nestjs/common';
import { BasePublisher, PublishResult } from './base-publisher';
import { ClipPlatform } from '@prisma/client';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class TwitterPublisher extends BasePublisher {
  readonly platform: ClipPlatform = ClipPlatform.TWITTER;
  private readonly logger = new Logger(TwitterPublisher.name);

  private readonly twitterApiKey = process.env.TWITTER_API_KEY;
  private readonly twitterApiSecret = process.env.TWITTER_API_SECRET;
  private readonly twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
  private readonly twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  private readonly baseUrl = 'https://api.twitter.com/2';

  async publishClip(
    clipPath: string,
    metadata: { title: string; description: string; hashtags: string[] },
  ): Promise<PublishResult> {
    if (!this.twitterAccessToken) {
      return {
        platform: this.platform,
        success: false,
        error: 'Twitter credentials not configured',
      };
    }

    try {
      // Upload video to Twitter
      const mediaId = await this.uploadVideo(clipPath);

      // Create tweet with video
      const text = `${metadata.title}\n\n${metadata.description}\n\n${metadata.hashtags.join(' ')}`;
      const tweetResponse = await this.createTweet(text, mediaId);

      return {
        platform: this.platform,
        success: true,
        platformUrl: `https://twitter.com/user/status/${tweetResponse.tweetId}`,
        platformPostId: tweetResponse.tweetId,
      };
    } catch (error: any) {
      this.logger.error(`Twitter publish failed: ${error.message}`);
      return {
        platform: this.platform,
        success: false,
        error: error.message,
      };
    }
  }

  private async uploadVideo(clipPath: string): Promise<string> {
    const fileSize = fs.statSync(clipPath).size;
    const form = new FormData();

    form.append('media_data', fs.createReadStream(clipPath));
    form.append('media_category', 'tweet_video');

    const response = await axios.post(
      'https://upload.twitter.com/1.1/media/upload.json',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${this.twitterAccessToken}`,
        },
      },
    );

    return response.data.media_id_string;
  }

  private async createTweet(text: string, mediaId: string): Promise<{ tweetId: string }> {
    const response = await axios.post(
      `${this.baseUrl}/tweets`,
      {
        text: text.slice(0, 280), // Twitter character limit
        media: {
          media_ids: [mediaId],
        },
        reply_settings: 'everyone',
      },
      {
        headers: {
          Authorization: `Bearer ${this.twitterAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return { tweetId: response.data.data.id };
  }

  async checkStatus(postId: string): Promise<{ status: string; views?: number }> {
    if (!this.twitterAccessToken) {
      return { status: 'error: not_configured' };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/tweets/${postId}`,
        {
          params: {
            'tweet.fields': 'public_metrics',
          },
          headers: {
            Authorization: `Bearer ${this.twitterAccessToken}`,
          },
        },
      );

      const metrics = response.data.data.public_metrics;
      return {
        status: 'published',
        views: metrics.impression_count,
      };
    } catch (error) {
      return { status: 'error: status_check_failed' };
    }
  }
}
