import { ClipPlatform } from '@prisma/client';

export interface PublishResult {
  platform: ClipPlatform;
  success: boolean;
  platformUrl?: string;
  platformPostId?: string;
  error?: string;
}

export abstract class BasePublisher {
  abstract platform: ClipPlatform;

  abstract publishClip(clipPath: string, metadata: {
    title: string;
    description: string;
    hashtags: string[];
  }): Promise<PublishResult>;

  abstract checkStatus(postId: string): Promise<{ status: string; views?: number }>;
}
