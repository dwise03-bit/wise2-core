import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { MediaStorageService } from '../storage/media-storage.service';
import { CaptureDto, JobStatusUpdateDto, TechnicianPresenceDto } from './job-captures.controller';

interface UploadCaptureParams {
  jobId: string;
  technicianId: string;
  file: Express.Multer.File;
  mediaType: 'photo' | 'video';
  glassesDeviceId: string;
  latitude?: number;
  longitude?: number;
  caption?: string;
  timestamp: Date;
}

interface StoredCapture {
  id: string;
  jobId: string;
  technicianId: string;
  glassesDeviceId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'photo' | 'video';
  fileSizeBytes: number;
  fileName: string;
  capturedAt: Date;
  uploadedAt: Date;
  location?: { lat: number; lng: number };
  caption?: string;
  confidence?: number;
}

interface JobStatus {
  jobId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  technicianId?: string;
  location?: { lat: number; lng: number };
  notes?: string;
  lastUpdate: Date;
  captureCount: number;
}

interface TechnicianPresence {
  technicianId: string;
  jobId: string;
  status: 'arriving' | 'on-site' | 'diagnosing' | 'working' | 'leaving';
  location: { lat: number; lng: number };
  timestamp: Date;
  deviceId?: string;
}

@Injectable()
export class JobCapturesService {
  // In-memory storage for demo (would use database in production)
  private captures: Map<string, StoredCapture[]> = new Map();
  private jobStatuses: Map<string, JobStatus> = new Map();
  private presenceHistory: Map<string, TechnicianPresence[]> = new Map();
  private glassesJobLinks: Map<string, { jobId: string; technicianId: string }> = new Map();

  constructor(
    private readonly storageService: MediaStorageService,
    private readonly configService: ConfigService
  ) {
    this.initializeJobStatuses();
  }

  private initializeJobStatuses(): void {
    // Initialize with default statuses (would load from DB in production)
    this.jobStatuses.set('default', {
      jobId: 'default',
      status: 'pending',
      lastUpdate: new Date(),
      captureCount: 0,
    });
  }

  /**
   * Upload capture from Ray-Ban glasses
   */
  async uploadCapture(params: UploadCaptureParams): Promise<CaptureDto> {
    if (!params.jobId || !params.glassesDeviceId) {
      throw new BadRequestException('Job ID and glasses device ID are required');
    }

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

    // Create capture record
    const capture: StoredCapture = {
      id: uuidv4(),
      jobId: params.jobId,
      technicianId: params.technicianId,
      glassesDeviceId: params.glassesDeviceId,
      mediaUrl: uploadResult.fileUrl,
      thumbnailUrl,
      mediaType: params.mediaType,
      fileSizeBytes: params.file.size,
      fileName: params.file.originalname,
      capturedAt: params.timestamp,
      uploadedAt: new Date(),
      location: params.latitude && params.longitude ? { lat: params.latitude, lng: params.longitude } : undefined,
      caption: params.caption,
    };

    // Store in local cache
    if (!this.captures.has(params.jobId)) {
      this.captures.set(params.jobId, []);
    }
    this.captures.get(params.jobId)!.push(capture);

    // Update job status - increment capture count and set to in-progress
    await this.updateJobStatus(params.jobId, {
      status: 'in-progress',
      technicianId: params.technicianId,
      location: capture.location,
    });

    // Trigger real-time notification (would emit WebSocket event in production)
    this.notifyCapture(capture);

    return this.toResponseDto(capture);
  }

  /**
   * Link Ray-Ban glasses device to job
   */
  async linkGlassesToJob(jobId: string, technicianId: string, glassesDeviceId: string): Promise<string> {
    const linkId = uuidv4();
    this.glassesJobLinks.set(glassesDeviceId, { jobId, technicianId });

    // Emit real-time notification
    this.notifyDeviceLink(jobId, glassesDeviceId, technicianId);

    return linkId;
  }

  /**
   * Get all captures for job
   */
  async getJobCaptures(
    jobId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ captures: CaptureDto[]; total: number; hasMore: boolean }> {
    const allCaptures = this.captures.get(jobId) || [];
    const total = allCaptures.length;
    const captures = allCaptures
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(offset, offset + limit)
      .map((c) => this.toResponseDto(c));

    return {
      captures,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get single capture
   */
  async getCapture(jobId: string, captureId: string): Promise<CaptureDto> {
    const captures = this.captures.get(jobId) || [];
    const capture = captures.find((c) => c.id === captureId);

    if (!capture) {
      throw new NotFoundException(`Capture ${captureId} not found for job ${jobId}`);
    }

    return this.toResponseDto(capture);
  }

  /**
   * Update capture metadata
   */
  async updateCapture(
    jobId: string,
    captureId: string,
    update: { caption?: string; confidence?: number }
  ): Promise<CaptureDto> {
    const captures = this.captures.get(jobId) || [];
    const capture = captures.find((c) => c.id === captureId);

    if (!capture) {
      throw new NotFoundException(`Capture ${captureId} not found`);
    }

    if (update.caption !== undefined) {
      capture.caption = update.caption;
    }
    if (update.confidence !== undefined) {
      capture.confidence = update.confidence;
    }

    return this.toResponseDto(capture);
  }

  /**
   * Delete capture
   */
  async deleteCapture(jobId: string, captureId: string): Promise<void> {
    const captures = this.captures.get(jobId);
    if (!captures) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    const index = captures.findIndex((c) => c.id === captureId);
    if (index === -1) {
      throw new NotFoundException(`Capture ${captureId} not found`);
    }

    captures.splice(index, 1);
  }

  /**
   * Update job status in real-time
   */
  async updateJobStatus(jobId: string, dto: JobStatusUpdateDto): Promise<{ success: boolean; status: string; timestamp: Date }> {
    const jobStatus = this.jobStatuses.get(jobId) || {
      jobId,
      status: 'pending',
      lastUpdate: new Date(),
      captureCount: 0,
    };

    jobStatus.status = dto.status;
    jobStatus.technicianId = dto.technicianId;
    jobStatus.location = dto.location;
    jobStatus.notes = dto.notes;
    jobStatus.lastUpdate = new Date();
    jobStatus.captureCount = (this.captures.get(jobId) || []).length;

    this.jobStatuses.set(jobId, jobStatus);

    // Emit real-time notification (WebSocket)
    this.notifyJobStatusUpdate(jobId, jobStatus);

    return {
      success: true,
      status: dto.status,
      timestamp: jobStatus.lastUpdate,
    };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    technicianId?: string;
    location?: { lat: number; lng: number };
    lastUpdate: Date;
    captureCount: number;
  }> {
    const jobStatus = this.jobStatuses.get(jobId);

    if (!jobStatus) {
      return {
        status: 'pending',
        lastUpdate: new Date(),
        captureCount: 0,
      };
    }

    return {
      status: jobStatus.status,
      technicianId: jobStatus.technicianId,
      location: jobStatus.location,
      lastUpdate: jobStatus.lastUpdate,
      captureCount: jobStatus.captureCount,
    };
  }

  /**
   * Track technician presence
   */
  async trackTechnicianPresence(
    jobId: string,
    dto: TechnicianPresenceDto
  ): Promise<{ success: boolean; message: string }> {
    const presence: TechnicianPresence = {
      ...dto,
      timestamp: new Date(),
    };

    if (!this.presenceHistory.has(jobId)) {
      this.presenceHistory.set(jobId, []);
    }

    this.presenceHistory.get(jobId)!.push(presence);

    // Emit real-time notification
    this.notifyPresenceUpdate(jobId, presence);

    return {
      success: true,
      message: `Technician presence updated: ${dto.status}`,
    };
  }

  /**
   * Get technician presence history
   */
  async getPresenceHistory(jobId: string): Promise<TechnicianPresenceDto[]> {
    const history = this.presenceHistory.get(jobId) || [];
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Private notification methods (would emit WebSocket events in production)

  private notifyCapture(capture: StoredCapture): void {
    // TODO: Emit WebSocket event to supervisors watching job
    console.log(`[CAPTURE] New capture on job ${capture.jobId}: ${capture.mediaType}`);
  }

  private notifyDeviceLink(jobId: string, glassesDeviceId: string, technicianId: string): void {
    // TODO: Emit WebSocket event
    console.log(`[DEVICE] Ray-Ban ${glassesDeviceId} linked to job ${jobId} by technician ${technicianId}`);
  }

  private notifyJobStatusUpdate(jobId: string, status: JobStatus): void {
    // TODO: Emit WebSocket event to supervisors
    console.log(`[STATUS] Job ${jobId} status updated to ${status.status}`);
  }

  private notifyPresenceUpdate(jobId: string, presence: TechnicianPresence): void {
    // TODO: Emit WebSocket event
    console.log(`[PRESENCE] Technician ${presence.technicianId} on job ${jobId}: ${presence.status}`);
  }

  private toResponseDto(capture: StoredCapture): CaptureDto {
    return {
      id: capture.id,
      jobId: capture.jobId,
      technicianId: capture.technicianId,
      glassesDeviceId: capture.glassesDeviceId,
      mediaUrl: capture.mediaUrl,
      thumbnailUrl: capture.thumbnailUrl,
      mediaType: capture.mediaType,
      capturedAt: capture.capturedAt,
      uploadedAt: capture.uploadedAt,
      location: capture.location,
      caption: capture.caption,
      confidence: capture.confidence,
    };
  }
}
