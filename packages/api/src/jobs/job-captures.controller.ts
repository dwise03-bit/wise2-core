import {
  Controller,
  Post,
  Get,
  Patch,
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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { JobCapturesService } from './job-captures.service';

export interface CaptureLinkDto {
  jobId: string;
  glassesDeviceId: string;
  technicianId?: string;
}

export interface CaptureDto {
  id: string;
  jobId: string;
  technicianId: string;
  glassesDeviceId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'photo' | 'video';
  capturedAt: Date;
  uploadedAt: Date;
  location?: { lat: number; lng: number };
  caption?: string;
  confidence?: number;
}

export interface JobStatusUpdateDto {
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  technicianId: string;
  notes?: string;
  location?: { lat: number; lng: number };
}

export interface TechnicianPresenceDto {
  technicianId: string;
  jobId: string;
  status: 'arriving' | 'on-site' | 'diagnosing' | 'working' | 'leaving';
  location: { lat: number; lng: number };
  timestamp: Date;
  deviceId?: string;
}

@Controller('jobs/:jobId/captures')
@UseGuards(JwtAuthGuard)
export class JobCapturesController {
  constructor(private readonly capturesService: JobCapturesService) {}

  /**
   * Upload capture from Ray-Ban glasses to job
   * POST /api/jobs/:jobId/captures
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadCapture(
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
    file: Express.Multer.File,
    @Body() dto: any,
    @Req() req: Request
  ): Promise<CaptureDto> {
    const technicianId = this.getTechnicianId(req);

    return this.capturesService.uploadCapture({
      jobId,
      technicianId,
      file,
      mediaType: dto.mediaType || 'photo',
      glassesDeviceId: dto.glassesDeviceId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      caption: dto.caption,
      timestamp: new Date(dto.timestamp || Date.now()),
    });
  }

  /**
   * Link Ray-Ban device to technician job
   * POST /api/jobs/:jobId/captures/link-device
   */
  @Post('link-device')
  async linkDevice(
    @Param('jobId') jobId: string,
    @Body() dto: CaptureLinkDto,
    @Req() req: Request
  ): Promise<{ success: boolean; message: string; linkId: string }> {
    const technicianId = dto.technicianId || this.getTechnicianId(req);
    const linkId = await this.capturesService.linkGlassesToJob(jobId, technicianId, dto.glassesDeviceId);

    return {
      success: true,
      message: `Ray-Ban device ${dto.glassesDeviceId} linked to job ${jobId}`,
      linkId,
    };
  }

  /**
   * Get all captures for job
   * GET /api/jobs/:jobId/captures
   */
  @Get()
  async getJobCaptures(
    @Param('jobId') jobId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ): Promise<{ captures: CaptureDto[]; total: number; hasMore: boolean }> {
    return this.capturesService.getJobCaptures(jobId, parseInt(limit), parseInt(offset));
  }

  /**
   * Get single capture
   * GET /api/jobs/:jobId/captures/:captureId
   */
  @Get(':captureId')
  async getCapture(
    @Param('jobId') jobId: string,
    @Param('captureId') captureId: string
  ): Promise<CaptureDto> {
    return this.capturesService.getCapture(jobId, captureId);
  }

  /**
   * Update capture metadata
   * PATCH /api/jobs/:jobId/captures/:captureId
   */
  @Patch(':captureId')
  async updateCapture(
    @Param('jobId') jobId: string,
    @Param('captureId') captureId: string,
    @Body() update: { caption?: string; confidence?: number }
  ): Promise<CaptureDto> {
    return this.capturesService.updateCapture(jobId, captureId, update);
  }

  /**
   * Delete capture
   * DELETE /api/jobs/:jobId/captures/:captureId
   */
  @Delete(':captureId')
  async deleteCapture(
    @Param('jobId') jobId: string,
    @Param('captureId') captureId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.capturesService.deleteCapture(jobId, captureId);
    return { success: true, message: 'Capture deleted' };
  }

  /**
   * Update job status in real-time
   * PATCH /api/jobs/:jobId/status
   */
  @Patch('status')
  async updateJobStatus(
    @Param('jobId') jobId: string,
    @Body() dto: JobStatusUpdateDto,
    @Req() req: Request
  ): Promise<{ success: boolean; status: string; timestamp: Date }> {
    return this.capturesService.updateJobStatus(jobId, dto);
  }

  /**
   * Get real-time job status
   * GET /api/jobs/:jobId/status
   */
  @Get('status')
  async getJobStatus(
    @Param('jobId') jobId: string
  ): Promise<{
    status: string;
    technicianId?: string;
    location?: { lat: number; lng: number };
    lastUpdate: Date;
    captureCount: number;
  }> {
    return this.capturesService.getJobStatus(jobId);
  }

  /**
   * Track technician presence
   * POST /api/jobs/:jobId/technician/presence
   */
  @Post('technician/presence')
  async updatePresence(
    @Param('jobId') jobId: string,
    @Body() dto: TechnicianPresenceDto,
    @Req() req: Request
  ): Promise<{ success: boolean; message: string }> {
    const technicianId = dto.technicianId || this.getTechnicianId(req);
    return this.capturesService.trackTechnicianPresence(jobId, {
      ...dto,
      technicianId,
    });
  }

  /**
   * Get technician presence history
   * GET /api/jobs/:jobId/technician/presence
   */
  @Get('technician/presence')
  async getPresenceHistory(
    @Param('jobId') jobId: string
  ): Promise<TechnicianPresenceDto[]> {
    return this.capturesService.getPresenceHistory(jobId);
  }

  private getTechnicianId(req: Request): string {
    const technicianId = (req as any).user?.sub || (req as any).user?.id;
    if (!technicianId) {
      throw new Error('Technician ID not found in request');
    }
    return technicianId;
  }
}
