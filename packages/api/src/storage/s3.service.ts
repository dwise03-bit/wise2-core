import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';

interface UploadOptions {
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: AWS.S3;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION') || 'us-east-1';
    this.bucket = this.configService.get('AWS_S3_BUCKET') || 'soundlabs-recordings';

    // Initialize S3 client
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('AWS credentials not found. S3 uploads will fail.');
    }

    this.s3Client = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region: this.region,
    });
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    options: UploadOptions = {}
  ): Promise<{ url: string; key: string; size: number }> {
    const bucket = options.bucket || this.bucket;

    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: options.contentType || 'application/octet-stream',
        ServerSideEncryption: 'AES256',
        Metadata: options.metadata || {},
      };

      const result: ManagedUpload.SendData = await this.s3Client.upload(params).promise();

      const url = `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.debug(`File uploaded successfully: ${key}`);

      return {
        url,
        key,
        size: fileBuffer.length,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error}`);
      throw error;
    }
  }

  /**
   * Upload a file stream to S3 with progress tracking
   */
  async uploadStream(
    key: string,
    stream: NodeJS.ReadableStream,
    contentType: string = 'application/octet-stream',
    onProgress?: (progress: number, total: number) => void
  ): Promise<{ url: string; key: string }> {
    const bucket = this.bucket;

    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      };

      const managedUpload = this.s3Client.upload(params);

      if (onProgress) {
        managedUpload.on('httpUploadProgress', (progress) => {
          onProgress(progress.loaded, progress.total);
        });
      }

      const result = await managedUpload.promise();
      const url = `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.debug(`Stream uploaded successfully: ${key}`);

      return {
        url,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to upload stream to S3: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      await this.s3Client
        .deleteObject({
          Bucket: bucket || this.bucket,
          Key: key,
        })
        .promise();

      this.logger.debug(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error}`);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for downloading a file
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const url = this.s3Client.getSignedUrl('getObject', {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn,
      });

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error}`);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for uploading a file
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'application/octet-stream',
    expiresIn: number = 3600
  ): Promise<{ url: string; fields: Record<string, string> }> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn,
      };

      const url = await new Promise<string>((resolve, reject) => {
        this.s3Client.getSignedUrl('putObject', params, (err, url) => {
          if (err) reject(err);
          else resolve(url);
        });
      });

      return {
        url,
        fields: {},
      };
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL: ${error}`);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string, bucket?: string): Promise<boolean> {
    try {
      await this.s3Client
        .headObject({
          Bucket: bucket || this.bucket,
          Key: key,
        })
        .promise();

      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      this.logger.error(`Failed to check if file exists: ${error}`);
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(key: string, bucket?: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      const metadata = await this.s3Client
        .headObject({
          Bucket: bucket || this.bucket,
          Key: key,
        })
        .promise();

      return metadata;
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${error}`);
      throw error;
    }
  }
}
