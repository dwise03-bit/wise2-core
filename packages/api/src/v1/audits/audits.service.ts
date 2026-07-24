import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { S3Service } from '@app/common/aws/s3.service';

@Injectable()
export class AuditsRecordingService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  /**
   * Get presigned S3 URL for recording upload
   */
  async getPresignedUploadUrl(
    userId: string,
    sessionId: string,
    filename: string,
    recordingType: 'audio' | 'video',
  ) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    // Generate S3 key
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const s3Key = `audit-evidence/${sessionId}/${timestamp}-${filename}`;

    // Get presigned URL from S3
    const presignedUrl = await this.s3Service.getPresignedPostUrl(
      'wise2-audit-evidence',
      s3Key,
      {
        type: recordingType,
        expiresIn: 3600, // 1 hour
      },
    );

    // Create recording record in database (PENDING status)
    const recording = await this.prisma.consultingRecording.create({
      data: {
        sessionId,
        filename,
        type: recordingType === 'audio' ? 'AUDIO' : 'VIDEO',
        s3Key,
        uploadStatus: 'PENDING',
      },
    });

    return {
      recordingId: recording.id,
      presignedUrl,
      s3Key,
      uploadEndpoint: presignedUrl,
    };
  }

  /**
   * Confirm recording upload and update database
   */
  async confirmRecordingUpload(
    userId: string,
    sessionId: string,
    recordingId: string,
    s3Key: string,
    duration?: number,
    fileSize?: number,
  ) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    // Verify recording belongs to this session
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Update recording with upload confirmation
    const updatedRecording = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        uploadStatus: 'COMPLETED',
        uploadProgress: 100,
        uploadedAt: new Date(),
        s3Url: `https://wise2-audit-evidence.s3.amazonaws.com/${s3Key}`,
        duration: duration || null,
        fileSize: fileSize || null,
      },
    });

    // Update session status if this is the first recording
    if (session.status === 'SCHEDULED') {
      await this.prisma.consultingAuditSession.update({
        where: { id: sessionId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    return updatedRecording;
  }

  /**
   * Get all recordings for an audit session
   */
  async getSessionRecordings(
    userId: string,
    sessionId: string,
    skip: number,
    take: number,
  ) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    const recordings = await this.prisma.consultingRecording.findMany({
      where: { sessionId },
      include: {
        moments: {
          orderBy: { timestampMs: 'asc' },
        },
      },
      orderBy: { recordedAt: 'desc' },
      skip,
      take,
    });

    const total = await this.prisma.consultingRecording.count({
      where: { sessionId },
    });

    return {
      recordings,
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific recording
   */
  async getRecording(userId: string, sessionId: string, recordingId: string) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
      include: {
        moments: {
          orderBy: { timestampMs: 'asc' },
        },
      },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    return recording;
  }

  /**
   * Add a marked moment to a recording
   */
  async addRecordingMoment(
    userId: string,
    sessionId: string,
    recordingId: string,
    label: string,
    description?: string,
    timestampMs?: number,
    category?: string,
    severity?: string,
  ) {
    // Verify recording exists and belongs to session
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const moment = await this.prisma.consultingAuditMoment.create({
      data: {
        recordingId,
        label,
        description: description || null,
        timestampMs: timestampMs || 0,
        category: category || null,
        severity: severity || null,
      },
    });

    return moment;
  }

  /**
   * Update a marked moment
   */
  async updateRecordingMoment(
    userId: string,
    sessionId: string,
    recordingId: string,
    momentId: string,
    updates: any,
  ) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Verify moment exists
    const moment = await this.prisma.consultingAuditMoment.findUnique({
      where: { id: momentId },
    });

    if (!moment || moment.recordingId !== recordingId) {
      throw new NotFoundException('Moment not found');
    }

    const updated = await this.prisma.consultingAuditMoment.update({
      where: { id: momentId },
      data: updates,
    });

    return updated;
  }

  /**
   * Delete a marked moment
   */
  async deleteRecordingMoment(
    userId: string,
    sessionId: string,
    recordingId: string,
    momentId: string,
  ) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Verify moment exists
    const moment = await this.prisma.consultingAuditMoment.findUnique({
      where: { id: momentId },
    });

    if (!moment || moment.recordingId !== recordingId) {
      throw new NotFoundException('Moment not found');
    }

    await this.prisma.consultingAuditMoment.delete({
      where: { id: momentId },
    });

    return { success: true };
  }

  /**
   * Delete/archive a recording
   */
  async deleteRecording(userId: string, sessionId: string, recordingId: string) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Archive recording instead of hard delete
    const archived = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        archivedAt: new Date(),
      },
    });

    return archived;
  }

  /**
   * Start transcription for a recording
   */
  async startTranscription(userId: string, sessionId: string, recordingId: string) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Update recording status to QUEUED
    const updated = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        transcriptionStatus: 'QUEUED',
        transcriptionJobId: `job-${Date.now()}`, // Placeholder for real transcription service
      },
    });

    // TODO: Queue transcription job with DeepGram, Rev, or mock service
    // This is stubbed for Phase 2

    return {
      success: true,
      transcriptionJobId: updated.transcriptionJobId,
      message: 'Transcription queued (Phase 2: integration pending)',
    };
  }

  /**
   * Update recording notes
   */
  async updateRecordingNotes(userId: string, sessionId: string, recordingId: string, notes: string) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const updated = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        userNotes: notes,
      },
    });

    return updated;
  }
}
