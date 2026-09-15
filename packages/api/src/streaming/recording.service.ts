import { Injectable, Logger } from '@nestjs/common';
import { MediaStorageService } from '../storage/media-storage.service';
import { PrismaService } from '@wise2/db';
import * as fs from 'fs/promises';
import * as path from 'path';

interface RecordingChunk {
  recordingId: string;
  data: Buffer;
  timestamp: number;
}

@Injectable()
export class RecordingService {
  private readonly logger = new Logger(RecordingService.name);
  private recordings: Map<string, RecordingSession> = new Map();
  private readonly CHUNK_SIZE_THRESHOLD = 100 * 1024 * 1024; // 100MB
  private readonly TEMP_DIR = '/tmp/wise2-recordings';

  constructor(
    private readonly storage: MediaStorageService,
    private readonly db: PrismaService
  ) {
    this.initializeTempDir();
  }

  private async initializeTempDir() {
    try {
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create temp directory: ${error}`);
    }
  }

  /**
   * Start recording a stream session
   */
  async startRecording(jobId: string): Promise<string> {
    const recordingId = `rec-${jobId}-${Date.now()}`;
    const tempPath = path.join(this.TEMP_DIR, `${recordingId}.webm`);

    const session: RecordingSession = {
      recordingId,
      jobId,
      tempPath,
      chunks: [],
      totalSize: 0,
      startedAt: new Date(),
      isActive: true,
    };

    this.recordings.set(recordingId, session);

    try {
      await this.db.streamRecordings.create({
        data: {
          id: recordingId,
          jobId,
          format: 'webm',
          codec: 'vp9/opus',
          startedAt: new Date(),
          status: 'recording',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create recording record: ${error}`);
    }

    this.logger.log(`Started recording ${recordingId} for job ${jobId}`);
    return recordingId;
  }

  /**
   * Append chunk to recording buffer
   * Auto-flushes to S3 when threshold reached
   */
  async appendChunk(recordingId: string, chunk: Buffer): Promise<void> {
    const session = this.recordings.get(recordingId);
    if (!session || !session.isActive) {
      throw new Error(`Recording ${recordingId} not found or inactive`);
    }

    session.chunks.push(chunk);
    session.totalSize += chunk.length;

    if (session.totalSize >= this.CHUNK_SIZE_THRESHOLD) {
      await this.flushToS3(recordingId);
    }
  }

  /**
   * Flush buffered chunks to S3
   */
  private async flushToS3(recordingId: string): Promise<void> {
    const session = this.recordings.get(recordingId);
    if (!session) {
      throw new Error(`Recording ${recordingId} not found`);
    }

    if (session.chunks.length === 0) {
      return;
    }

    try {
      const buffer = Buffer.concat(session.chunks);
      const fileName = `recording-${recordingId}-chunk-${Date.now()}.webm`;

      // Store locally instead of S3
      const filePath = path.join(this.TEMP_DIR, session.jobId, fileName);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);

      this.logger.log(
        `Flushed ${session.chunks.length} chunks (${session.totalSize} bytes) to local storage`
      );

      // Reset chunks after successful flush
      session.chunks = [];
      session.totalSize = 0;
    } catch (error) {
      this.logger.error(`Failed to flush chunks to S3: ${error}`);
      throw error;
    }
  }

  /**
   * Stop recording and upload final chunks
   */
  async stopRecording(recordingId: string): Promise<RecordingResult> {
    const session = this.recordings.get(recordingId);
    if (!session) {
      throw new Error(`Recording ${recordingId} not found`);
    }

    session.isActive = false;

    try {
      // Flush any remaining chunks
      if (session.chunks.length > 0) {
        await this.flushToS3(recordingId);
      }

      const endedAt = new Date();
      const duration = (endedAt.getTime() - session.startedAt.getTime()) / 1000;

      // Finalize recording in database
      await this.db.streamRecordings.update({
        where: { id: recordingId },
        data: {
          endedAt,
          duration: Math.round(duration),
          status: 'completed',
        },
      });

      // Generate S3 URL
      const s3Url = await this.storage.getSignedS3Url(
        `recordings/${session.jobId}/${recordingId}.webm`,
        3600 // 1 hour expiry
      );

      this.logger.log(
        `Stopped recording ${recordingId} (duration: ${duration.toFixed(2)}s)`
      );

      // Clean up from memory
      this.recordings.delete(recordingId);

      return {
        recordingId,
        duration: Math.round(duration),
        s3Url,
        format: 'webm',
      };
    } catch (error) {
      this.logger.error(`Failed to stop recording: ${error}`);
      throw error;
    }
  }

  /**
   * Get recording metadata
   */
  async getRecordingMetadata(recordingId: string) {
    try {
      const recording = await this.db.streamRecordings.findUnique({
        where: { id: recordingId },
      });

      if (!recording) {
        throw new Error(`Recording ${recordingId} not found`);
      }

      return recording;
    } catch (error) {
      this.logger.error(`Failed to get recording metadata: ${error}`);
      throw error;
    }
  }

  /**
   * List recordings for a job
   */
  async listJobRecordings(jobId: string) {
    try {
      const recordings = await this.db.streamRecordings.findMany({
        where: { jobId },
        orderBy: { startedAt: 'desc' },
      });

      return recordings;
    } catch (error) {
      this.logger.error(`Failed to list recordings: ${error}`);
      return [];
    }
  }

  /**
   * Cleanup old recordings (24-hour retention)
   */
  async cleanupOldRecordings(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const oldRecordings = await this.db.streamRecordings.findMany({
        where: {
          status: 'completed',
          endedAt: {
            lt: cutoffTime,
          },
        },
      });

      for (const recording of oldRecordings) {
        try {
          const s3Key = `recordings/${recording.jobId}/${recording.id}.webm`;
          await this.storage.deleteMedia(s3Key);

          await this.db.streamRecordings.delete({
            where: { id: recording.id },
          });

          this.logger.log(`Cleaned up recording ${recording.id}`);
        } catch (error) {
          this.logger.warn(`Failed to cleanup recording ${recording.id}: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error}`);
    }
  }
}

interface RecordingSession {
  recordingId: string;
  jobId: string;
  tempPath: string;
  chunks: Buffer[];
  totalSize: number;
  startedAt: Date;
  isActive: boolean;
}

export interface RecordingResult {
  recordingId: string;
  duration: number;
  s3Url: string;
  format: string;
}
