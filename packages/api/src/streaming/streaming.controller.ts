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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { StreamingService } from './streaming.service';
import { MediasoupService, StreamStats } from './mediasoup.service';

export interface StreamStartDto {
  rtpParameters: any;
}

export interface StreamSubscribeDto {
  dtlsParameters: any;
}

export interface AnnotationDto {
  type: 'circle' | 'arrow' | 'rectangle' | 'text' | 'freehand';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  color: string;
  text?: string;
}

export interface StreamSessionResponseDto {
  sessionId: string;
  streamId: string;
  producerId: string;
  rtcServer: string;
  iceServers: Array<{ urls: string[] }>;
  recordingUrl?: string;
}

export interface ConsumerResponseDto {
  consumerId: string;
  rtpParameters: any;
}

export interface StreamStatsDto {
  videoBitrate: number;
  fps: number;
  resolution: string;
  latency: number;
  viewers: number;
  isRecording: boolean;
}

@Controller('jobs/:jobId/stream')
@UseGuards(JwtAuthGuard)
export class StreamingController {
  constructor(
    private readonly streamingService: StreamingService,
    private readonly mediasoup: MediasoupService
  ) {}

  /**
   * Technician initiates stream
   * POST /api/jobs/:jobId/stream/start
   */
  @Post('start')
  async startStream(
    @Param('jobId') jobId: string,
    @Body() dto: StreamStartDto,
    @Req() req: Request
  ): Promise<StreamSessionResponseDto> {
    const technicianId = this.getTechnicianId(req);

    if (!jobId || !dto.rtpParameters) {
      throw new BadRequestException('jobId and rtpParameters are required');
    }

    return this.streamingService.startStream(jobId, technicianId, dto.rtpParameters);
  }

  /**
   * Supervisor subscribes to stream
   * POST /api/jobs/:jobId/stream/subscribe
   */
  @Post('subscribe')
  async subscribeToStream(
    @Param('jobId') jobId: string,
    @Body() dto: StreamSubscribeDto,
    @Req() req: Request
  ): Promise<ConsumerResponseDto> {
    const supervisorId = this.getSupervisorId(req);

    if (!jobId || !dto.dtlsParameters) {
      throw new BadRequestException('jobId and dtlsParameters are required');
    }

    return this.streamingService.subscribeToStream(
      jobId,
      supervisorId,
      dto.dtlsParameters
    );
  }

  /**
   * Supervisor sends annotation (drawing)
   * POST /api/jobs/:jobId/stream/annotate
   */
  @Post('annotate')
  async addAnnotation(
    @Param('jobId') jobId: string,
    @Body() annotation: AnnotationDto,
    @Req() req: Request
  ): Promise<{ success: boolean; annotationId: string }> {
    const supervisorId = this.getSupervisorId(req);

    if (!jobId || !annotation.type) {
      throw new BadRequestException('jobId and annotation type are required');
    }

    const annotationId = await this.streamingService.broadcastAnnotation(
      jobId,
      supervisorId,
      annotation
    );

    return { success: true, annotationId };
  }

  /**
   * Send voice audio from supervisor to technician
   * POST /api/jobs/:jobId/stream/audio/send
   */
  @Post('audio/send')
  @UseInterceptors(FileInterceptor('audio'))
  async sendAudio(
    @Param('jobId') jobId: string,
    @UploadedFile() audioFile: Express.Multer.File,
    @Req() req: Request
  ): Promise<{ success: boolean; message: string }> {
    const supervisorId = this.getSupervisorId(req);

    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    await this.streamingService.sendAudioToTechnician(
      jobId,
      supervisorId,
      audioFile
    );

    return { success: true, message: 'Audio sent to technician' };
  }

  /**
   * Get current stream stats
   * GET /api/jobs/:jobId/stream/stats
   */
  @Get('stats')
  async getStreamStats(@Param('jobId') jobId: string): Promise<StreamStatsDto> {
    const session = await this.streamingService.getStreamSession(jobId);

    if (!session) {
      throw new NotFoundException(`No active stream for job ${jobId}`);
    }

    try {
      const mediasoupStats = await this.mediasoup.getStreamStats(jobId);
      return {
        videoBitrate: mediasoupStats.videoBitrate,
        fps: mediasoupStats.framesPerSecond,
        resolution: mediasoupStats.resolution,
        latency: Math.round(mediasoupStats.roundTripTime * 1000),
        viewers: session.viewerCount,
        isRecording: session.isRecording,
      };
    } catch (error) {
      return {
        videoBitrate: 0,
        fps: 0,
        resolution: '0x0',
        latency: 0,
        viewers: session.viewerCount,
        isRecording: session.isRecording,
      };
    }
  }

  /**
   * Start recording stream
   * POST /api/jobs/:jobId/stream/record/start
   */
  @Post('record/start')
  async startRecording(@Param('jobId') jobId: string): Promise<{ recordingId: string; url: string }> {
    const recordingId = await this.streamingService.startRecording(jobId);

    return {
      recordingId,
      url: `/api/jobs/${jobId}/stream/recordings/${recordingId}`,
    };
  }

  /**
   * Stop recording stream
   * POST /api/jobs/:jobId/stream/record/stop
   */
  @Post('record/stop')
  async stopRecording(@Param('jobId') jobId: string): Promise<{ recordingId: string; url: string }> {
    const result = await this.streamingService.stopRecording(jobId);

    return {
      recordingId: result.recordingId,
      url: result.s3Url,
    };
  }

  /**
   * Get list of viewers
   * GET /api/jobs/:jobId/stream/viewers
   */
  @Get('viewers')
  async getViewers(
    @Param('jobId') jobId: string
  ): Promise<Array<{ supervisorId: string; name: string; joinedAt: string }>> {
    return this.streamingService.getStreamViewers(jobId);
  }

  /**
   * Supervisor leaves stream
   * POST /api/jobs/:jobId/stream/leave
   */
  @Post('leave')
  async leaveStream(
    @Param('jobId') jobId: string,
    @Req() req: Request
  ): Promise<{ success: boolean }> {
    const supervisorId = this.getSupervisorId(req);

    await this.streamingService.removeViewer(jobId, supervisorId);

    return { success: true };
  }

  /**
   * Stop stream completely
   * POST /api/jobs/:jobId/stream/stop
   */
  @Post('stop')
  async stopStream(@Param('jobId') jobId: string): Promise<{ success: boolean }> {
    await this.streamingService.stopStream(jobId);

    return { success: true };
  }

  /**
   * WebRTC ICE candidate handling
   * POST /api/jobs/:jobId/stream/ice-candidate
   */
  @Post('ice-candidate')
  async handleIceCandidate(
    @Param('jobId') jobId: string,
    @Body('candidate') candidate: any
  ): Promise<{ success: boolean }> {
    if (!candidate) {
      throw new BadRequestException('ICE candidate is required');
    }

    await this.streamingService.handleIceCandidate(jobId, candidate);

    return { success: true };
  }

  private getTechnicianId(req: Request): string {
    const id = (req as any).user?.sub || (req as any).user?.id;
    if (!id) {
      throw new BadRequestException('Technician ID not found in request');
    }
    return id;
  }

  private getSupervisorId(req: Request): string {
    const id = (req as any).user?.sub || (req as any).user?.id;
    if (!id) {
      throw new BadRequestException('Supervisor ID not found in request');
    }
    return id;
  }
}
