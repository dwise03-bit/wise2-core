import { Injectable, Logger } from '@nestjs/common';
import { BasePublisher, PublishResult } from './base-publisher';
import { ClipPlatform } from '@prisma/client';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class TikTokPublisher extends BasePublisher {
  readonly platform: ClipPlatform = ClipPlatform.TIKTOK;
  private readonly logger = new Logger(TikTokPublisher.name);

  private readonly tiktokAccessToken = process.env.TIKTOK_ACCESS_TOKEN;
  private readonly tiktokBusinessAccountId = process.env.TIKTOK_BUSINESS_ACCOUNT_ID;
  private readonly baseUrl = 'https://open.tiktok.com/v1';

  async publishClip(
    clipPath: string,
    metadata: { title: string; description: string; hashtags: string[] },
  ): Promise<PublishResult> {
    if (!this.tiktokAccessToken || !this.tiktokBusinessAccountId) {
      return {
        platform: this.platform,
        success: false,
        error: 'TikTok credentials not configured',
      };
    }

    try {
      // Initialize video upload
      const initResponse = await this.initializeUpload();

      // Upload video chunks
      await this.uploadVideoChunks(clipPath, initResponse.uploadId);

      // Complete upload and get video ID
      const completeResponse = await this.completeUpload(initResponse.uploadId);

      // Publish video
      const publishResponse = await this.publishVideo(completeResponse.videoId, metadata);

      return {
        platform: this.platform,
        success: true,
        platformUrl: `https://www.tiktok.com/@${publishResponse.author}/video/${publishResponse.videoId}`,
        platformPostId: publishResponse.videoId,
      };
    } catch (error) {
      this.logger.error(`TikTok publish failed: ${error.message}`);
      return {
        platform: this.platform,
        success: false,
        error: error.message,
      };
    }
  }

  private async initializeUpload(): Promise<{ uploadId: string }> {
    const response = await axios.post(
      `${this.baseUrl}/video/upload/init`,
      {
        source_info: {
          source: 'CLIENT_API',
          platform: 'TT_WEB',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.tiktokAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return { uploadId: response.data.data.upload_id };
  }

  private async uploadVideoChunks(clipPath: string, uploadId: string): Promise<void> {
    const fileSize = fs.statSync(clipPath).size;
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const fileStream = fs.createReadStream(clipPath);

    let chunkIndex = 0;
    let buffer = Buffer.alloc(0);

    for await (const chunk of fileStream) {
      buffer = Buffer.concat([buffer, chunk]);

      if (buffer.length >= chunkSize || fileStream.readableEnded) {
        const dataToUpload = buffer.slice(0, chunkSize);

        const form = new FormData();
        form.append('upload_id', uploadId);
        form.append('chunk_number', chunkIndex.toString());
        form.append('total_chunk_count', Math.ceil(fileSize / chunkSize).toString());
        form.append('chunk', dataToUpload);

        await axios.post(`${this.baseUrl}/video/upload/parts`, form, {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.tiktokAccessToken}`,
          },
        });

        buffer = buffer.slice(chunkSize);
        chunkIndex++;
      }
    }
  }

  private async completeUpload(uploadId: string): Promise<{ videoId: string }> {
    const response = await axios.post(
      `${this.baseUrl}/video/upload/finish`,
      {
        upload_id: uploadId,
        publish_type: 'PUBLISH_TO_FEED',
      },
      {
        headers: {
          Authorization: `Bearer ${this.tiktokAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return { videoId: response.data.data.video_id };
  }

  private async publishVideo(
    videoId: string,
    metadata: { title: string; description: string; hashtags: string[] },
  ): Promise<{ videoId: string; author: string }> {
    const caption = `${metadata.title}\n\n${metadata.description}\n\n${metadata.hashtags.join(' ')}`;

    const response = await axios.post(
      `${this.baseUrl}/video/publish`,
      {
        video_id: videoId,
        caption,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        allow_comment: true,
        allow_duet: true,
        allow_stitch: true,
      },
      {
        headers: {
          Authorization: `Bearer ${this.tiktokAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      videoId: response.data.data.video_id,
      author: response.data.data.creator_username,
    };
  }

  async checkStatus(postId: string): Promise<{ status: string; views?: number }> {
    if (!this.tiktokAccessToken) {
      return { status: 'error: not_configured' };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/video/query`,
        {
          params: {
            video_id: postId,
            fields: 'play_count,comment_count,like_count,share_count',
          },
          headers: {
            Authorization: `Bearer ${this.tiktokAccessToken}`,
          },
        },
      );

      return {
        status: 'published',
        views: response.data.data.play_count,
      };
    } catch (error) {
      return { status: 'error: status_check_failed' };
    }
  }
}
