import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UploadOptions {
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION') || 'us-east-1';
    this.bucket = this.configService.get('AWS_S3_BUCKET') || 'soundlabs-recordings';
    this.logger.warn('S3Service: AWS SDK disabled - stub implementation only');
  }

  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    options: UploadOptions = {}
  ): Promise<{ url: string; key: string; size: number }> {
    this.logger.debug(`[STUB] Would upload to S3: ${key}`);
    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      key,
      size: fileBuffer.length,
    };
  }

  async uploadStream(
    key: string,
    stream: NodeJS.ReadableStream,
    contentType: string = 'application/octet-stream',
    onProgress?: (progress: number, total: number) => void
  ): Promise<{ url: string; key: string }> {
    this.logger.debug(`[STUB] Would upload stream to S3: ${key}`);
    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      key,
    };
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    this.logger.debug(`[STUB] Would delete from S3: ${key}`);
  }

  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    this.logger.debug(`[STUB] Would generate presigned download URL for: ${key}`);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'application/octet-stream',
    expiresIn: number = 3600
  ): Promise<{ url: string; fields: Record<string, string> }> {
    this.logger.debug(`[STUB] Would generate presigned upload URL for: ${key}`);
    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      fields: {},
    };
  }

  async fileExists(key: string, bucket?: string): Promise<boolean> {
    this.logger.debug(`[STUB] Would check if file exists: ${key}`);
    return false;
  }

  async getFileMetadata(key: string, bucket?: string): Promise<any> {
    this.logger.debug(`[STUB] Would get file metadata for: ${key}`);
    return {};
  }
}
