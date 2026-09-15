import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as multer from 'multer';
import { MediaStorageService } from '../storage/media-storage.service';
import { MediaResponseDto, StreamStartResponseDto } from './job-media.controller';

export interface UploadMediaParams {
  jobId: string;
  technicianId: string;
  file: multer.File;
  mediaType: 'photo' | 'video';
  timestamp: Date;
  latitude?: number;
  longitude?: number;
  caption?: string;
  glassesDeviceId?: string;
}

interface StoredMediaRecord {
  id: string;
  jobId: string;
  technicianId: string;
  mediaType: 'photo' | 'video';
  fileUrl: string;
  thumbnailUrl?: string;
  fileSizeBytes: number;
  fileName: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  glassesDeviceId?: string;
  uploadedAt: Date;
  createdAt: Date;
}

@Injectable()
export class JobMediaService {
  private activeStreams: Map<string, StreamSession> = new Map();

  constructor(
    private readonly storageService: MediaStorageService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Upload media (photo or video) to job
   */
  async uploadMedia(params: UploadMediaParams): Promise<MediaResponseDto> {
    // Validate job exists (would query DB in real impl)
    if (!params.jobId) {
      throw new BadRequestException('Job ID is required');
    }

    // Validate file
    if (!params.file) {
      throw new BadRequestException('File is required');
    }

    // Upload to storage
    const uploadResult = await this.storageService.uploadMedia({
      file: params.file,
      jobId: params.jobId,
      mediaType: params.mediaType,
      isPublic: false,
    });

    // Generate thumbnail for videos
    let thumbnailUrl: string | undefined;
    if (params.mediaType === 'video') {
      thumbnailUrl = await this.storageService.generateThumbnail(uploadResult.fileUrl);
    }

    // Create database record (simulated)
    const mediaRecord: StoredMediaRecord = {
      id: uuidv4(),
      jobId: params.jobId,
      technicianId: params.technicianId,
      mediaType: params.mediaType,
      fileUrl: uploadResult.fileUrl,
      thumbnailUrl: thumbnailUrl,
      fileSizeBytes: params.file.size,
      fileName: params.file.originalname,
      caption: params.caption,
      latitude: params.latitude,
      longitude: params.longitude,
      glassesDeviceId: params.glassesDeviceId,
      uploadedAt: params.timestamp,
      createdAt: new Date(),
    };

    // Store in database (would call PrismaClient in real impl)
    // await this.db.jobMedia.create({ data: mediaRecord });

    // Trigger notifications
    await this.notifyMediaUpload(mediaRecord);

    return this.toResponseDto(mediaRecord);
  }

  /**
   * List all media for a job
   */
  async listJobMedia(jobId: string): Promise<{
    media: MediaResponseDto[];
    total: number;
  }> {
    // Query database (simulated)
    // const media = await this.db.jobMedia.findMany({
    //   where: { jobId, deletedAt: null },
    //   orderBy: { uploadedAt: 'desc' }
    // });

    const media: StoredMediaRecord[] = []; // Placeholder

    return {
      media: media.map((m) => this.toResponseDto(m)),
      total: media.length,
    };
  }

  /**
   * Get single media item
   */
  async getMediaItem(jobId: string, mediaId: string): Promise<MediaResponseDto> {
    // Query database (simulated)
    // const media = await this.db.jobMedia.findUnique({
    //   where: { id: mediaId }
    // });

    // if (!media || media.jobId !== jobId) {
    //   throw new NotFoundException('Media not found');
    // }

    const media: StoredMediaRecord = {
      id: mediaId,
      jobId: jobId,
      technicianId: 'tech_123',
      mediaType: 'photo',
      fileUrl: 's3://...',
      fileSizeBytes: 1024000,
      fileName: 'job-photo.jpg',
      uploadedAt: new Date(),
      createdAt: new Date(),
    };

    return this.toResponseDto(media);
  }

  /**
   * Update media caption
   */
  async updateCaption(
    jobId: string,
    mediaId: string,
    caption: string
  ): Promise<MediaResponseDto> {
    // Update in database (simulated)
    // const media = await this.db.jobMedia.update({
    //   where: { id: mediaId },
    //   data: { caption }
    // });

    const media: StoredMediaRecord = {
      id: mediaId,
      jobId: jobId,
      technicianId: 'tech_123',
      mediaType: 'photo',
      fileUrl: 's3://...',
      fileSizeBytes: 1024000,
      fileName: 'job-photo.jpg',
      caption: caption,
      uploadedAt: new Date(),
      createdAt: new Date(),
    };

    return this.toResponseDto(media);
  }

  /**
   * Delete media (soft delete)
   */
  async deleteMedia(jobId: string, mediaId: string): Promise<void> {
    // Soft delete in database (simulated)
    // await this.db.jobMedia.update({
    //   where: { id: mediaId },
    //   data: { deletedAt: new Date() }
    // });

    // Delete from storage
    await this.storageService.deleteMedia(mediaId);
  }

  /**
   * Start live video stream from glasses
   */
  async startLiveStream(
    jobId: string,
    technicianId: string
  ): Promise<StreamStartResponseDto> {
    if (this.activeStreams.has(jobId)) {
      throw new BadRequestException('Stream already active for this job');
    }

    // Generate stream session
    const streamId = `stream_${uuidv4()}`;
    const rtcServer = this.configService.get('RTC_SERVER_URL') || 'wss://rtc.wise2.net';
    const iceServers = [
      { urls: ['stun:stun.l.google.com:19302'] },
      { urls: ['stun:stun1.l.google.com:19302'] },
    ];

    // Store active stream
    this.activeStreams.set(jobId, {
      streamId,
      jobId,
      technicianId,
      startedAt: new Date(),
      isActive: true,
    });

    return {
      streamId,
      rtcServer,
      iceServers,
    };
  }

  /**
   * Stop live video stream
   */
  async stopLiveStream(jobId: string): Promise<void> {
    const stream = this.activeStreams.get(jobId);

    if (!stream) {
      throw new NotFoundException('No active stream for this job');
    }

    stream.isActive = false;
    this.activeStreams.delete(jobId);
  }

  /**
   * Get stream status
   */
  async getStreamStatus(jobId: string): Promise<{
    isStreaming: boolean;
    streamId?: string;
    duration?: number;
    viewers?: number;
  }> {
    const stream = this.activeStreams.get(jobId);

    if (!stream || !stream.isActive) {
      return { isStreaming: false };
    }

    const duration = Math.floor(
      (Date.now() - stream.startedAt.getTime()) / 1000
    );

    return {
      isStreaming: true,
      streamId: stream.streamId,
      duration,
      viewers: 1, // Placeholder - would query actual viewer count
    };
  }

  /**
   * Convert database record to response DTO
   */
  private toResponseDto(record: StoredMediaRecord): MediaResponseDto {
    return {
      id: record.id,
      jobId: record.jobId,
      type: record.mediaType,
      url: record.fileUrl,
      thumbnailUrl: record.thumbnailUrl,
      uploadedAt: record.uploadedAt.toISOString(),
      caption: record.caption,
      location: record.latitude
        ? { lat: record.latitude, lng: record.longitude! }
        : undefined,
      technicianId: record.technicianId,
      fileName: record.fileName,
      fileSizeBytes: record.fileSizeBytes,
      glassesDeviceId: record.glassesDeviceId,
    };
  }

  /**
   * Notify relevant services of media upload
   */
  private async notifyMediaUpload(media: StoredMediaRecord): Promise<void> {
    // Discord webhook notification
    // await this.discordService.notifyMediaUpload(media);

    // Dashboard real-time update (would use WebSocket)
    // await this.websocketGateway.notifyJobUpdate(media.jobId, { mediaAdded: media });

    // Trigger media processing job if video
    if (media.mediaType === 'video') {
      // await this.mediaProcessingQueue.enqueue({
      //   mediaId: media.id,
      //   fileUrl: media.fileUrl,
      //   jobType: 'transcode'
      // });
    }
  }
}

interface StreamSession {
  streamId: string;
  jobId: string;
  technicianId: string;
  startedAt: Date;
  isActive: boolean;
}
