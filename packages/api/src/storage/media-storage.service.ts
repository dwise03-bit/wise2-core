import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
import * as child_process from 'child_process';

const exec = promisify(child_process.exec);

export interface MediaUploadParams {
  file: Express.Multer.File;
  jobId: string;
  mediaType: 'photo' | 'video';
  isPublic: boolean;
}

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

@Injectable()
export class MediaStorageService {
  private s3Client: AWS.S3;
  private localStoragePath: string;
  private storageProvider: 's3' | 'local';
  private s3Bucket: string;

  constructor(private configService: ConfigService) {
    this.storageProvider =
      (this.configService.get('STORAGE_PROVIDER') as 's3' | 'local') || 'local';
    this.s3Bucket = this.configService.get('S3_BUCKET') || 'wise2-job-media';
    this.localStoragePath =
      this.configService.get('LOCAL_STORAGE_PATH') || './uploads/jobs';

    // Initialize S3 if configured
    if (this.storageProvider === 's3') {
      this.s3Client = new AWS.S3({
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get('AWS_REGION') || 'us-east-1',
      });
    }

    // Ensure local storage directory exists
    if (this.storageProvider === 'local') {
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    }
  }

  /**
   * Upload media file to configured storage provider
   */
  async uploadMedia(params: MediaUploadParams): Promise<UploadResult> {
    const fileName = this.generateFileName(params.file, params.jobId);

    if (this.storageProvider === 's3') {
      return this.uploadToS3(params.file, fileName, params.isPublic);
    } else {
      return this.uploadToLocal(params.file, fileName);
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    fileName: string,
    isPublic: boolean
  ): Promise<UploadResult> {
    const key = `job-media/${fileName}`;
    const params = {
      Bucket: this.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: isPublic ? 'public-read' : 'private',
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    };

    try {
      const result = await this.s3Client.upload(params).promise();

      return {
        fileUrl: result.Location,
        fileName: fileName,
        fileSize: file.size,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload to S3: ${error.message}`);
    }
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    fileName: string
  ): Promise<UploadResult> {
    const filePath = path.join(this.localStoragePath, fileName);
    const fileDir = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    return {
      fileUrl: `/uploads/jobs/${fileName}`,
      fileName: fileName,
      fileSize: file.size,
    };
  }

  /**
   * Get media URL with optional signature (S3) or direct access (local)
   */
  async getMediaUrl(mediaId: string, expiresIn: number = 3600): Promise<string> {
    if (this.storageProvider === 's3') {
      return this.getSignedS3Url(mediaId, expiresIn);
    } else {
      // Local files are directly accessible
      return `/uploads/jobs/${mediaId}`;
    }
  }

  /**
   * Generate signed S3 URL with expiration
   */
  private async getSignedS3Url(key: string, expiresIn: number): Promise<string> {
    const params = {
      Bucket: this.s3Bucket,
      Key: `job-media/${key}`,
      Expires: expiresIn,
    };

    return this.s3Client.getSignedUrl('getObject', params);
  }

  /**
   * Generate thumbnail for video
   */
  async generateThumbnail(videoPath: string): Promise<string> {
    if (this.storageProvider === 's3') {
      return this.generateS3VideoThumbnail(videoPath);
    } else {
      return this.generateLocalVideoThumbnail(videoPath);
    }
  }

  /**
   * Generate thumbnail from S3 video using ffmpeg
   */
  private async generateS3VideoThumbnail(videoUrl: string): Promise<string> {
    const thumbnailFileName = `${Date.now()}-thumbnail.jpg`;
    const thumbnailPath = path.join(this.localStoragePath, thumbnailFileName);

    try {
      // Use ffmpeg to extract frame at 1 second mark
      await exec(
        `ffmpeg -i "${videoUrl}" -ss 00:00:01 -vframes 1 -vf scale=320:-1 "${thumbnailPath}" -y`
      );

      // Upload thumbnail to S3
      const thumbnailBuffer = fs.readFileSync(thumbnailPath);
      const s3Result = await this.s3Client
        .upload({
          Bucket: this.s3Bucket,
          Key: `job-media/thumbnails/${thumbnailFileName}`,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
        })
        .promise();

      // Clean up local temp file
      fs.unlinkSync(thumbnailPath);

      return s3Result.Location;
    } catch (error) {
      console.error('Failed to generate S3 thumbnail:', error);
      // Return placeholder if thumbnail generation fails
      return '/images/video-placeholder.jpg';
    }
  }

  /**
   * Generate thumbnail from local video using ffmpeg
   */
  private async generateLocalVideoThumbnail(videoPath: string): Promise<string> {
    const thumbnailFileName = `${Date.now()}-thumbnail.jpg`;
    const thumbnailPath = path.join(this.localStoragePath, 'thumbnails', thumbnailFileName);

    try {
      // Ensure thumbnails directory exists
      const thumbnailDir = path.dirname(thumbnailPath);
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      // Use ffmpeg to extract frame at 1 second mark
      await exec(
        `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf scale=320:-1 "${thumbnailPath}" -y 2>/dev/null`
      );

      return `/uploads/jobs/thumbnails/${thumbnailFileName}`;
    } catch (error) {
      console.error('Failed to generate local thumbnail:', error);
      // Return placeholder if thumbnail generation fails
      return '/images/video-placeholder.jpg';
    }
  }

  /**
   * Delete media file
   */
  async deleteMedia(mediaId: string): Promise<void> {
    if (this.storageProvider === 's3') {
      await this.deleteFromS3(mediaId);
    } else {
      await this.deleteFromLocal(mediaId);
    }
  }

  /**
   * Delete from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    try {
      await this.s3Client
        .deleteObject({
          Bucket: this.s3Bucket,
          Key: `job-media/${key}`,
        })
        .promise();
    } catch (error) {
      console.error('Failed to delete from S3:', error);
      // Don't throw - continue even if deletion fails
    }
  }

  /**
   * Delete from local filesystem
   */
  private async deleteFromLocal(fileName: string): Promise<void> {
    const filePath = path.join(this.localStoragePath, fileName);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to delete local file:', error);
      // Don't throw - continue even if deletion fails
    }
  }

  /**
   * Generate safe filename with timestamp and hash
   */
  private generateFileName(
    file: Express.Multer.File,
    jobId: string
  ): string {
    const timestamp = Date.now();
    const hash = crypto
      .createHash('md5')
      .update(`${jobId}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);

    // Extract extension from original filename
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);

    // Create safe filename: jobId/timestamp-hash-basename.ext
    return `${jobId}/${timestamp}-${hash}-${baseName.substring(0, 20)}${ext}`;
  }

  /**
   * Check storage health
   */
  async healthCheck(): Promise<{ healthy: boolean; provider: string; details: string }> {
    if (this.storageProvider === 's3') {
      try {
        await this.s3Client.headBucket({ Bucket: this.s3Bucket }).promise();
        return {
          healthy: true,
          provider: 's3',
          details: `S3 bucket "${this.s3Bucket}" is accessible`,
        };
      } catch (error) {
        return {
          healthy: false,
          provider: 's3',
          details: `S3 connection failed: ${error.message}`,
        };
      }
    } else {
      const healthy = fs.existsSync(this.localStoragePath);
      return {
        healthy,
        provider: 'local',
        details: healthy
          ? `Local storage directory exists: ${this.localStoragePath}`
          : `Local storage directory not found: ${this.localStoragePath}`,
      };
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalBytes: number;
    fileCount: number;
    provider: string;
  }> {
    if (this.storageProvider === 's3') {
      return this.getS3StorageStats();
    } else {
      return this.getLocalStorageStats();
    }
  }

  private async getS3StorageStats(): Promise<{
    totalBytes: number;
    fileCount: number;
    provider: string;
  }> {
    try {
      const objects = await this.s3Client
        .listObjectsV2({ Bucket: this.s3Bucket, Prefix: 'job-media/' })
        .promise();

      const totalBytes = (objects.Contents || []).reduce(
        (sum, obj) => sum + (obj.Size || 0),
        0
      );

      return {
        totalBytes,
        fileCount: objects.Contents?.length || 0,
        provider: 's3',
      };
    } catch (error) {
      return {
        totalBytes: 0,
        fileCount: 0,
        provider: 's3',
      };
    }
  }

  private async getLocalStorageStats(): Promise<{
    totalBytes: number;
    fileCount: number;
    provider: string;
  }> {
    let totalBytes = 0;
    let fileCount = 0;

    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          totalBytes += stat.size;
          fileCount++;
        }
      }
    };

    if (fs.existsSync(this.localStoragePath)) {
      walkDir(this.localStoragePath);
    }

    return {
      totalBytes,
      fileCount,
      provider: 'local',
    };
  }
}
