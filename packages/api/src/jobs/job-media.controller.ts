import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import * as multer from 'multer';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { JobMediaService } from './job-media.service';

export interface UploadMediaDto {
  mediaType: 'photo' | 'video';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  caption?: string;
  glasses_device_id?: string;
}

export interface MediaResponseDto {
  id: string;
  jobId: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  caption?: string;
  location?: { lat: number; lng: number };
  technicianId: string;
  fileName: string;
  fileSizeBytes: number;
  glassesDeviceId?: string;
}

export interface StreamStartDto {
  jobId: string;
  technicianId: string;
}

export interface StreamStartResponseDto {
  streamId: string;
  rtcServer: string;
  iceServers: Array<{ urls: string[] }>;
}

@Controller('jobs/:jobId/media')
@UseGuards(JwtAuthGuard)
export class JobMediaController {
  constructor(private readonly jobMediaService: JobMediaService) {}

  /**
   * Upload photo or video to job
   * POST /api/jobs/:jobId/media
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Param('jobId') jobId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500 * 1024 * 1024 }), // 500MB max
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)/,
          }),
        ],
      })
    )
    file: multer.File,
    @Body() dto: UploadMediaDto,
    @Req() req: Request
  ): Promise<MediaResponseDto> {
    const technicianId = this.getTechnicianId(req);

    return this.jobMediaService.uploadMedia({
      jobId,
      technicianId,
      file,
      mediaType: dto.mediaType,
      timestamp: new Date(dto.timestamp),
      latitude: dto.latitude,
      longitude: dto.longitude,
      caption: dto.caption,
      glassesDeviceId: dto.glasses_device_id,
    });
  }

  /**
   * List all media for a job
   * GET /api/jobs/:jobId/media
   */
  @Get()
  async listJobMedia(@Param('jobId') jobId: string): Promise<{
    media: MediaResponseDto[];
    total: number;
  }> {
    return this.jobMediaService.listJobMedia(jobId);
  }

  /**
   * Get single media item
   * GET /api/jobs/:jobId/media/:mediaId
   */
  @Get(':mediaId')
  async getMediaItem(
    @Param('jobId') jobId: string,
    @Param('mediaId') mediaId: string
  ): Promise<MediaResponseDto> {
    return this.jobMediaService.getMediaItem(jobId, mediaId);
  }

  /**
   * Update media caption
   * PATCH /api/jobs/:jobId/media/:mediaId
   */
  @Post(':mediaId/caption')
  async updateCaption(
    @Param('jobId') jobId: string,
    @Param('mediaId') mediaId: string,
    @Body('caption') caption: string
  ): Promise<MediaResponseDto> {
    return this.jobMediaService.updateCaption(jobId, mediaId, caption);
  }

  /**
   * Delete media from job
   * DELETE /api/jobs/:jobId/media/:mediaId
   */
  @Delete(':mediaId')
  async deleteMedia(
    @Param('jobId') jobId: string,
    @Param('mediaId') mediaId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.jobMediaService.deleteMedia(jobId, mediaId);
    return { success: true, message: 'Media deleted successfully' };
  }

  /**
   * Start live video stream
   * POST /api/jobs/:jobId/stream/start
   */
  @Post('stream/start')
  async startStream(
    @Param('jobId') jobId: string,
    @Body() dto: StreamStartDto,
    @Req() req: Request
  ): Promise<StreamStartResponseDto> {
    const technicianId = this.getTechnicianId(req);
    return this.jobMediaService.startLiveStream(jobId, technicianId);
  }

  /**
   * Stop live video stream
   * POST /api/jobs/:jobId/stream/stop
   */
  @Post('stream/stop')
  async stopStream(@Param('jobId') jobId: string): Promise<{ success: boolean }> {
    await this.jobMediaService.stopLiveStream(jobId);
    return { success: true };
  }

  /**
   * Get stream status
   * GET /api/jobs/:jobId/stream/status
   */
  @Get('stream/status')
  async getStreamStatus(@Param('jobId') jobId: string): Promise<{
    isStreaming: boolean;
    streamId?: string;
    duration?: number;
    viewers?: number;
  }> {
    return this.jobMediaService.getStreamStatus(jobId);
  }

  private getTechnicianId(req: Request): string {
    const technicianId = (req as any).user?.sub || (req as any).user?.id;
    if (!technicianId) {
      throw new Error('Technician ID not found in request');
    }
    return technicianId;
  }
}
