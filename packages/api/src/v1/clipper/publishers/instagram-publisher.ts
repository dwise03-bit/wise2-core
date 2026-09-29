import { Injectable, Logger } from '@nestjs/common';
import { BasePublisher, PublishResult } from './base-publisher';
import { ClipPlatform } from '@prisma/client';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class InstagramPublisher extends BasePublisher {
  readonly platform: ClipPlatform = ClipPlatform.INSTAGRAM;
  private readonly logger = new Logger(InstagramPublisher.name);

  private readonly instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  private readonly instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  private readonly apiVersion = 'v18.0';
  private readonly baseUrl = 'https://graph.instagram.com';

  async publishClip(
    clipPath: string,
    metadata: { title: string; description: string; hashtags: string[] },
  ): Promise<PublishResult> {
    if (!this.instagramBusinessAccountId || !this.instagramAccessToken) {
      return {
        platform: this.platform,
        success: false,
        error: 'Instagram credentials not configured',
      };
    }

    try {
      // Upload video container (Instagram Reels)
      const containerResponse = await this.uploadVideoContainer(clipPath, metadata);

      // Publish the container
      const publishResponse = await this.publishContainer(containerResponse.containerId);

      return {
        platform: this.platform,
        success: true,
        platformUrl: `https://instagram.com/reel/${publishResponse.mediaId}`,
        platformPostId: publishResponse.mediaId,
      };
    } catch (error) {
      this.logger.error(`Instagram publish failed: ${error.message}`);
      return {
        platform: this.platform,
        success: false,
        error: error.message,
      };
    }
  }

  private async uploadVideoContainer(
    clipPath: string,
    metadata: { title: string; description: string; hashtags: string[] },
  ): Promise<{ containerId: string }> {
    const form = new FormData();
    form.append('media_type', 'REELS');
    form.append('upload_type', 'RESUMABLE');
    form.append('video_data', fs.createReadStream(clipPath));

    const caption = `${metadata.title}\n\n${metadata.description}\n\n${metadata.hashtags.join(' ')}`;
    form.append('caption', caption);

    const response = await axios.post(
      `${this.baseUrl}/${this.instagramBusinessAccountId}/media`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${this.instagramAccessToken}`,
        },
      },
    );

    return { containerId: response.data.id };
  }

  private async publishContainer(containerId: string): Promise<{ mediaId: string }> {
    const response = await axios.post(
      `${this.baseUrl}/${this.instagramBusinessAccountId}/media_publish`,
      { creation_id: containerId },
      {
        params: {
          access_token: this.instagramAccessToken,
        },
      },
    );

    return { mediaId: response.data.media_id };
  }

  async checkStatus(postId: string): Promise<{ status: string; views?: number }> {
    if (!this.instagramAccessToken) {
      return { status: 'error: not_configured' };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${postId}`,
        {
          params: {
            fields: 'like_count,comments_count,play_count',
            access_token: this.instagramAccessToken,
          },
        },
      );

      return {
        status: 'published',
        views: response.data.play_count,
      };
    } catch (error) {
      return { status: 'error: status_check_failed' };
    }
  }
}
