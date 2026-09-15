import { Injectable, Logger, Inject } from '@nestjs/common';
import { MediasoupService } from './mediasoup.service';
import { RecordingService, RecordingResult } from './recording.service';
import { AnnotationDto, ConsumerResponseDto, StreamSessionResponseDto } from './streaming.controller';

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);
  private activeSessions: Map<string, StreamSession> = new Map();
  private viewers: Map<string, ViewerInfo[]> = new Map();

  constructor(
    private readonly mediasoup: MediasoupService,
    private readonly recording: RecordingService,
    @Inject('DB_SERVICE') private readonly db?: any
  ) {}

  /**
   * Technician starts live stream
   */
  async startStream(
    jobId: string,
    technicianId: string,
    rtpParameters: any
  ): Promise<StreamSessionResponseDto> {
    try {
      const router = await this.mediasoup.createRouter(jobId);

      const transport = await this.mediasoup.createWebRtcTransport(jobId, technicianId);

      const producer = await this.mediasoup.createProducer(
        jobId,
        transport as any,
        'video'
      );

      const streamId = `stream-${jobId}-${Date.now()}`;

      const session: StreamSession = {
        streamId,
        jobId,
        technicianId,
        producer,
        recordingId: null,
        viewerCount: 0,
        startedAt: new Date(),
        isRecording: false,
      };

      this.activeSessions.set(jobId, session);
      this.viewers.set(jobId, []);

      try {
        await this.db.streamSessions.create({
          data: {
            id: streamId,
            jobId,
            technicianId,
            status: 'live',
            startedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to create stream session record: ${error}`);
      }

      this.logger.log(`Started stream ${streamId} for job ${jobId}`);

      return {
        sessionId: streamId,
        streamId,
        producerId: producer.id,
        rtcServer: process.env.RTC_ANNOUNCED_IP || 'localhost',
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
            ],
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to start stream: ${error}`);
      throw error;
    }
  }

  /**
   * Supervisor subscribes to stream (becomes viewer)
   */
  async subscribeToStream(
    jobId: string,
    supervisorId: string,
    dtlsParameters: any
  ): Promise<ConsumerResponseDto> {
    const session = this.activeSessions.get(jobId);
    if (!session) {
      throw new Error(`No active stream for job ${jobId}`);
    }

    try {
      const transport = await this.mediasoup.createWebRtcTransport(jobId, supervisorId);

      const consumer = await this.mediasoup.createConsumer(
        jobId,
        supervisorId,
        transport,
        session.producer.id
      );

      // Track viewer
      const viewers = this.viewers.get(jobId) || [];
      viewers.push({
        supervisorId,
        joinedAt: new Date(),
      });
      this.viewers.set(jobId, viewers);
      session.viewerCount = viewers.length;

      try {
        await this.db.streamViewers.create({
          data: {
            streamId: session.streamId,
            supervisorId,
            joinedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to create viewer record: ${error}`);
      }

      this.logger.log(`Supervisor ${supervisorId} joined stream ${session.streamId}`);

      return {
        consumerId: consumer.id,
        rtpParameters: consumer.rtpParameters,
      };
    } catch (error) {
      this.logger.error(`Failed to subscribe to stream: ${error}`);
      throw error;
    }
  }

  /**
   * Broadcast annotation to all viewers
   */
  async broadcastAnnotation(
    jobId: string,
    supervisorId: string,
    annotation: AnnotationDto
  ): Promise<string> {
    const session = this.activeSessions.get(jobId);
    if (!session) {
      throw new Error(`No active stream for job ${jobId}`);
    }

    const annotationId = `anno-${session.streamId}-${Date.now()}`;

    try {
      await this.db.streamAnnotations.create({
        data: {
          id: annotationId,
          streamId: session.streamId,
          supervisorId,
          type: annotation.type,
          x: annotation.x,
          y: annotation.y,
          x2: annotation.x2,
          y2: annotation.y2,
          color: annotation.color,
          text: annotation.text,
          createdAt: new Date(),
        },
      });

      this.logger.log(
        `Annotation ${annotationId} from supervisor ${supervisorId} broadcast`
      );
    } catch (error) {
      this.logger.error(`Failed to store annotation: ${error}`);
    }

    return annotationId;
  }

  /**
   * Send audio guidance from supervisor to technician
   */
  async sendAudioToTechnician(
    jobId: string,
    supervisorId: string,
    audioFile: any
  ): Promise<void> {
    const session = this.activeSessions.get(jobId);
    if (!session) {
      throw new Error(`No active stream for job ${jobId}`);
    }

    try {
      const audioId = `audio-${session.streamId}-${Date.now()}`;

      await this.db.streamAudio.create({
        data: {
          id: audioId,
          streamId: session.streamId,
          supervisorId,
          audioData: audioFile.buffer,
          duration: 0,
          createdAt: new Date(),
        },
      });

      this.logger.log(`Audio guidance sent from supervisor ${supervisorId}`);
    } catch (error) {
      this.logger.error(`Failed to store audio: ${error}`);
    }
  }

  /**
   * Start recording stream
   */
  async startRecording(jobId: string): Promise<string> {
    const session = this.activeSessions.get(jobId);
    if (!session) {
      throw new Error(`No active stream for job ${jobId}`);
    }

    const recordingId = await this.recording.startRecording(jobId);
    session.recordingId = recordingId;
    session.isRecording = true;

    return recordingId;
  }

  /**
   * Stop recording stream
   */
  async stopRecording(jobId: string): Promise<RecordingResult> {
    const session = this.activeSessions.get(jobId);
    if (!session || !session.recordingId) {
      throw new Error(`No active recording for job ${jobId}`);
    }

    const result = await this.recording.stopRecording(session.recordingId);
    session.recordingId = null;
    session.isRecording = false;

    return result;
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(jobId: string, candidate: any): Promise<void> {
    // ICE candidates are handled at transport level
    // This is a placeholder for future ICE trickle implementation
    this.logger.debug(`Received ICE candidate for job ${jobId}`);
  }

  /**
   * Remove viewer from stream
   */
  async removeViewer(jobId: string, supervisorId: string): Promise<void> {
    const viewers = this.viewers.get(jobId);
    if (viewers) {
      const idx = viewers.findIndex((v) => v.supervisorId === supervisorId);
      if (idx >= 0) {
        viewers.splice(idx, 1);
      }
    }

    const session = this.activeSessions.get(jobId);
    if (session) {
      session.viewerCount = (viewers || []).length;
    }

    this.logger.log(`Supervisor ${supervisorId} left stream`);
  }

  /**
   * Stop stream completely
   */
  async stopStream(jobId: string): Promise<void> {
    const session = this.activeSessions.get(jobId);
    if (!session) {
      return;
    }

    try {
      // Stop recording if active
      if (session.recordingId) {
        await this.recording.stopRecording(session.recordingId);
      }

      // Close mediasoup resources
      await this.mediasoup.closeStream(jobId);

      // Update database
      try {
        await this.db.streamSessions.update({
          where: { id: session.streamId },
          data: {
            status: 'ended',
            endedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to update stream session: ${error}`);
      }

      // Clean up
      this.activeSessions.delete(jobId);
      this.viewers.delete(jobId);

      this.logger.log(`Stopped stream ${session.streamId}`);
    } catch (error) {
      this.logger.error(`Failed to stop stream: ${error}`);
    }
  }

  /**
   * Get active stream session
   */
  async getStreamSession(jobId: string): Promise<StreamSession | null> {
    return this.activeSessions.get(jobId) || null;
  }

  /**
   * Get list of viewers for a stream
   */
  async getStreamViewers(jobId: string): Promise<Array<{ supervisorId: string; name: string; joinedAt: string }>> {
    const viewers = this.viewers.get(jobId) || [];
    return viewers.map((v) => ({
      supervisorId: v.supervisorId,
      name: v.supervisorId, // TODO: lookup actual name from user table
      joinedAt: v.joinedAt.toISOString(),
    }));
  }

  /**
   * Get annotations for stream
   */
  async getStreamAnnotations(streamId: string) {
    try {
      const annotations = await this.db.streamAnnotations.findMany({
        where: { streamId },
        orderBy: { createdAt: 'asc' },
      });

      return annotations;
    } catch (error) {
      this.logger.error(`Failed to get annotations: ${error}`);
      return [];
    }
  }
}

interface StreamSession {
  streamId: string;
  jobId: string;
  technicianId: string;
  producer: any;
  recordingId: string | null;
  viewerCount: number;
  startedAt: Date;
  isRecording: boolean;
}

interface ViewerInfo {
  supervisorId: string;
  joinedAt: Date;
}
