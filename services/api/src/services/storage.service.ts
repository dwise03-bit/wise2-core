/**
 * File Storage Service
 * Handles file uploads to S3 and metadata management
 */

import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { logger } from '../logger';

export interface FileMetadata {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  file_type?: string;
  mime_type?: string;
  s3_key: string;
  s3_bucket?: string;
  checksum?: string;
  metadata?: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseAsset {
  id: string;
  user_id: string;
  asset_type: string;
  title: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  duration_ms?: number;
  metadata?: any;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

class StorageService {
  /**
   * Create file metadata record
   */
  async createFileMetadata(
    userId: string,
    filename: string,
    fileSize: number,
    s3Key: string,
    options?: {
      fileType?: string;
      mimeType?: string;
      s3Bucket?: string;
      checksum?: string;
      isPublic?: boolean;
      metadata?: any;
    }
  ): Promise<FileMetadata> {
    try {
      const file = await database.queryOne<FileMetadata>(
        `
        INSERT INTO files (
          id, user_id, filename, file_size, file_type, mime_type,
          s3_key, s3_bucket, checksum, metadata, is_public
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, user_id, filename, file_size, file_type, mime_type,
                  s3_key, s3_bucket, checksum, metadata, is_public, created_at, updated_at
        `,
        [
          uuidv4(),
          userId,
          filename,
          fileSize,
          options?.fileType || null,
          options?.mimeType || null,
          s3Key,
          options?.s3Bucket || 'wise2-files',
          options?.checksum || null,
          options?.metadata || null,
          options?.isPublic || false,
        ]
      );

      if (!file) {
        throw new Error('Failed to create file metadata');
      }

      logger.info('File metadata created', { fileId: file.id, userId });

      return file;
    } catch (error) {
      logger.error('Failed to create file metadata', { error });
      throw error;
    }
  }

  /**
   * Get file metadata by ID
   */
  async getFile(fileId: string): Promise<FileMetadata | undefined> {
    try {
      return database.queryOne<FileMetadata>(
        `
        SELECT id, user_id, filename, file_size, file_type, mime_type,
               s3_key, s3_bucket, checksum, metadata, is_public, created_at, updated_at
        FROM files
        WHERE id = $1
        `,
        [fileId]
      );
    } catch (error) {
      logger.error('Failed to get file', { error });
      throw error;
    }
  }

  /**
   * List user files
   */
  async listUserFiles(userId: string, limit: number = 100): Promise<FileMetadata[]> {
    try {
      const result = await database.query<FileMetadata>(
        `
        SELECT id, user_id, filename, file_size, file_type, mime_type,
               s3_key, s3_bucket, checksum, metadata, is_public, created_at, updated_at
        FROM files
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        `,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to list user files', { error });
      throw error;
    }
  }

  /**
   * Delete file metadata
   */
  async deleteFile(fileId: string, userId: string): Promise<FileMetadata | undefined> {
    try {
      // Verify user owns file
      const file = await this.getFile(fileId);

      if (!file) {
        throw new Error('File not found');
      }

      if (file.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const deleted = await database.queryOne<FileMetadata>(
        `
        DELETE FROM files
        WHERE id = $1
        RETURNING id, user_id, filename, file_size, file_type, mime_type,
                  s3_key, s3_bucket, checksum, metadata, is_public, created_at, updated_at
        `,
        [fileId]
      );

      if (deleted) {
        logger.info('File deleted', { fileId, userId });
      }

      return deleted;
    } catch (error) {
      logger.error('Failed to delete file', { error });
      throw error;
    }
  }

  /**
   * Create showcase asset
   */
  async createShowcaseAsset(
    userId: string,
    assetType: string,
    title: string,
    fileUrl: string,
    options?: {
      description?: string;
      thumbnailUrl?: string;
      durationMs?: number;
      metadata?: any;
    }
  ): Promise<ShowcaseAsset> {
    try {
      const asset = await database.queryOne<ShowcaseAsset>(
        `
        INSERT INTO client_showcase_assets (
          id, user_id, asset_type, title, description,
          file_url, thumbnail_url, duration_ms, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, user_id, asset_type, title, description,
                  file_url, thumbnail_url, duration_ms, metadata,
                  view_count, is_featured, created_at, updated_at
        `,
        [
          uuidv4(),
          userId,
          assetType,
          title,
          options?.description || null,
          fileUrl,
          options?.thumbnailUrl || null,
          options?.durationMs || null,
          options?.metadata || null,
        ]
      );

      if (!asset) {
        throw new Error('Failed to create showcase asset');
      }

      logger.info('Showcase asset created', { assetId: asset.id, userId });

      return asset;
    } catch (error) {
      logger.error('Failed to create showcase asset', { error });
      throw error;
    }
  }

  /**
   * Get showcase asset by ID
   */
  async getShowcaseAsset(assetId: string): Promise<ShowcaseAsset | undefined> {
    try {
      const asset = await database.queryOne<ShowcaseAsset>(
        `
        SELECT id, user_id, asset_type, title, description,
               file_url, thumbnail_url, duration_ms, metadata,
               view_count, is_featured, created_at, updated_at
        FROM client_showcase_assets
        WHERE id = $1
        `,
        [assetId]
      );

      if (asset) {
        // Increment view count
        await database.query(
          'UPDATE client_showcase_assets SET view_count = view_count + 1 WHERE id = $1',
          [assetId]
        );
      }

      return asset;
    } catch (error) {
      logger.error('Failed to get showcase asset', { error });
      throw error;
    }
  }

  /**
   * List user showcase assets
   */
  async listUserShowcaseAssets(userId: string, limit: number = 50): Promise<ShowcaseAsset[]> {
    try {
      const result = await database.query<ShowcaseAsset>(
        `
        SELECT id, user_id, asset_type, title, description,
               file_url, thumbnail_url, duration_ms, metadata,
               view_count, is_featured, created_at, updated_at
        FROM client_showcase_assets
        WHERE user_id = $1
        ORDER BY is_featured DESC, created_at DESC
        LIMIT $2
        `,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to list showcase assets', { error });
      throw error;
    }
  }

  /**
   * List featured showcase assets (public)
   */
  async listFeaturedShowcaseAssets(limit: number = 50): Promise<ShowcaseAsset[]> {
    try {
      const result = await database.query<ShowcaseAsset>(
        `
        SELECT id, user_id, asset_type, title, description,
               file_url, thumbnail_url, duration_ms, metadata,
               view_count, is_featured, created_at, updated_at
        FROM client_showcase_assets
        WHERE is_featured = TRUE
        ORDER BY view_count DESC, created_at DESC
        LIMIT $1
        `,
        [limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to list featured showcase assets', { error });
      throw error;
    }
  }

  /**
   * Update showcase asset
   */
  async updateShowcaseAsset(
    assetId: string,
    userId: string,
    updates: Partial<ShowcaseAsset>
  ): Promise<ShowcaseAsset> {
    try {
      // Verify user owns asset
      const asset = await this.getShowcaseAsset(assetId);

      if (!asset) {
        throw new Error('Asset not found');
      }

      if (asset.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const updated = await database.queryOne<ShowcaseAsset>(
        `
        UPDATE client_showcase_assets
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            is_featured = COALESCE($3, is_featured),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, user_id, asset_type, title, description,
                  file_url, thumbnail_url, duration_ms, metadata,
                  view_count, is_featured, created_at, updated_at
        `,
        [updates.title || null, updates.description || null, updates.is_featured || null, assetId]
      );

      if (!updated) {
        throw new Error('Failed to update showcase asset');
      }

      logger.info('Showcase asset updated', { assetId, userId });

      return updated;
    } catch (error) {
      logger.error('Failed to update showcase asset', { error });
      throw error;
    }
  }

  /**
   * Delete showcase asset
   */
  async deleteShowcaseAsset(assetId: string, userId: string): Promise<ShowcaseAsset | undefined> {
    try {
      // Verify user owns asset
      const asset = await this.getShowcaseAsset(assetId);

      if (!asset) {
        throw new Error('Asset not found');
      }

      if (asset.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const deleted = await database.queryOne<ShowcaseAsset>(
        `
        DELETE FROM client_showcase_assets
        WHERE id = $1
        RETURNING id, user_id, asset_type, title, description,
                  file_url, thumbnail_url, duration_ms, metadata,
                  view_count, is_featured, created_at, updated_at
        `,
        [assetId]
      );

      if (deleted) {
        logger.info('Showcase asset deleted', { assetId, userId });
      }

      return deleted;
    } catch (error) {
      logger.error('Failed to delete showcase asset', { error });
      throw error;
    }
  }

  /**
   * Generate S3 signed upload URL
   * Note: In production, this would use AWS SDK to generate actual signed URLs
   * For now, this is a placeholder for the API structure
   */
  generateSignedUploadUrl(fileKey: string, _fileType: string): string {
    // TODO: Implement AWS SDK integration to generate actual signed URLs
    // This would return a URL like:
    // https://wise2-files.s3.amazonaws.com/...?X-Amz-Signature=...
    return `https://wise2-files.s3.amazonaws.com/${fileKey}?mock=true`;
  }
}

export const storageService = new StorageService();
