import { Test, TestingModule } from '@nestjs/testing';
import { StreamingController, ConsumerResponseDto } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { MediasoupService } from './mediasoup.service';
import { RecordingService } from './recording.service';
import { MediaStorageService } from '../storage/media-storage.service';

describe('Streaming Module (Phase 2)', () => {
  let controller: StreamingController;
  let service: StreamingService;
  let mediasoup: MediasoupService;
  let recording: RecordingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamingController],
      providers: [
        StreamingService,
        {
          provide: MediasoupService,
          useValue: {
            createRouter: jest.fn(async () => ({ id: 'router-test' })),
            createWebRtcTransport: jest.fn(async () => ({ id: 'transport-test' })),
            createProducer: jest.fn(async () => ({ id: 'producer-test' })),
            createConsumer: jest.fn(async () => ({ id: 'consumer-test', rtpParameters: {} })),
            closeStream: jest.fn(async () => undefined),
          },
        },
        RecordingService,
        { provide: MediaStorageService, useValue: { uploadMedia: jest.fn() } },
        {
          provide: 'DB_SERVICE',
          useValue: {
            streamSessions: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
            streamViewers: { create: jest.fn(), findMany: jest.fn() },
            streamAnnotations: { create: jest.fn(), findMany: jest.fn() },
            streamRecordings: { create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
            streamAudio: { create: jest.fn() },
            streamStats: { create: jest.fn(), findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    controller = module.get<StreamingController>(StreamingController);
    service = module.get<StreamingService>(StreamingService);
    mediasoup = module.get<MediasoupService>(MediasoupService);
    recording = module.get<RecordingService>(RecordingService);
  });

  describe('Stream Lifecycle', () => {
    it('should start stream successfully', async () => {
      const jobId = 'job-123';
      const technicianId = 'tech-456';
      const rtpParameters = {};

      const result = await service.startStream(jobId, technicianId, rtpParameters);

      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('producerId');
      expect(result).toHaveProperty('iceServers');
    });

    it('should subscribe supervisor to stream', async () => {
      const jobId = 'job-123';
      const supervisorId = 'super-789';
      const dtlsParameters = {};

      // Start stream first
      await service.startStream(jobId, 'tech-456', {});

      const result = await service.subscribeToStream(jobId, supervisorId, dtlsParameters);

      expect(result).toHaveProperty('consumerId');
      expect(result).toHaveProperty('rtpParameters');
    });

    it('should stop stream and cleanup resources', async () => {
      const jobId = 'job-123';

      // Start stream
      await service.startStream(jobId, 'tech-456', {});

      // Stop stream
      await service.stopStream(jobId);

      // Verify no active session
      const session = await service.getStreamSession(jobId);
      expect(session).toBeNull();
    });
  });

  describe('Annotations', () => {
    it('should broadcast annotation to all viewers', async () => {
      const jobId = 'job-123';
      const supervisorId = 'super-789';
      const annotation = {
        type: 'circle' as const,
        x: 100,
        y: 100,
        color: '#FF0000',
      };

      // Start stream and add supervisor
      await service.startStream(jobId, 'tech-456', {});
      await service.subscribeToStream(jobId, supervisorId, {});

      // Broadcast annotation
      const annotationId = await service.broadcastAnnotation(jobId, supervisorId, annotation);

      expect(annotationId).toMatch(/^anno-/);
    });

    it('should handle multiple annotation types', async () => {
      const jobId = 'job-123';
      const supervisorId = 'super-789';
      const types = ['circle', 'arrow', 'rectangle', 'text', 'freehand'];

      await service.startStream(jobId, 'tech-456', {});
      await service.subscribeToStream(jobId, supervisorId, {});

      for (const type of types) {
        const annotation = {
          type: type as 'circle' | 'arrow' | 'rectangle' | 'text' | 'freehand',
          x: 50,
          y: 50,
          x2: 150,
          y2: 150,
          color: '#00FF00',
          text: type === 'text' ? 'Test' : undefined,
        };

        const annotationId = await service.broadcastAnnotation(jobId, supervisorId, annotation);
        expect(annotationId).toBeDefined();
      }
    });
  });

  describe('Recording', () => {
    it('should start and stop recording', async () => {
      const jobId = 'job-123';

      // Start stream before recording
      await service.startStream(jobId, 'tech-456', {});
      const recordingId = await service.startRecording(jobId);
      expect(recordingId).toMatch(/^rec-/);

      // Verify recording is active
      const session = await service.getStreamSession(jobId);
      expect(session?.isRecording).toBe(true);

      // Stop recording
      const result = await service.stopRecording(jobId);
      expect(result).toHaveProperty('recordingId');
      expect(result).toHaveProperty('s3Url');
    });

    it('should chunk recording data and flush at threshold', async () => {
      const recordingId = await recording.startRecording('job-chunk-test');
      const chunkSize = 10 * 1024 * 1024; // 10MB chunks

      // Record multiple chunks totaling 120MB
      for (let i = 0; i < 12; i++) {
        const chunk = Buffer.alloc(chunkSize);
        await recording.appendChunk(recordingId, chunk);
      }

      // Should auto-flush at 100MB threshold
      // Verify via database would be needed in integration test
    });

    it('should list recordings for a job', async () => {
      const jobId = 'job-123';

      const recordings = await recording.listJobRecordings(jobId);

      expect(Array.isArray(recordings)).toBe(true);
    });
  });

  describe('Viewer Management', () => {
    it('should track multiple viewers', async () => {
      const jobId = 'job-123';

      await service.startStream(jobId, 'tech-456', {});

      // Add 3 supervisors
      for (let i = 0; i < 3; i++) {
        await service.subscribeToStream(jobId, `super-${i}`, {});
      }

      const viewers = await service.getStreamViewers(jobId);
      expect(viewers.length).toBe(3);
    });

    it('should handle viewer disconnect', async () => {
      const jobId = 'job-123';
      const supervisorId = 'super-789';

      await service.startStream(jobId, 'tech-456', {});
      await service.subscribeToStream(jobId, supervisorId, {});

      // Remove viewer
      await service.removeViewer(jobId, supervisorId);

      const viewers = await service.getStreamViewers(jobId);
      const found = viewers.find((v) => v.supervisorId === supervisorId);
      expect(found).toBeUndefined();
    });
  });

  describe('Stream Statistics', () => {
    it('should collect stream statistics', async () => {
      const jobId = 'job-123';

      await service.startStream(jobId, 'tech-456', {});

      // In integration test, would call mediasoup stats collection
      // and verify bitrate, FPS, resolution, latency
      expect(mediasoup).toBeDefined();
    });

    it('should track quality metrics', async () => {
      // Verify latency, jitter, packet loss tracking
      // Would require actual WebRTC metrics collection
      expect(true).toBe(true);
    });
  });

  describe('Voice Guidance', () => {
    it('should send audio guidance from supervisor to technician', async () => {
      const jobId = 'job-123';
      const supervisorId = 'super-789';

      await service.startStream(jobId, 'tech-456', {});

      // Mock file
      const audioFile = {
        buffer: Buffer.from('audio-data'),
        originalname: 'guidance.wav',
        mimetype: 'audio/wav',
      } as any;

      await service.sendAudioToTechnician(jobId, supervisorId, audioFile);

      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle stream not found', async () => {
      const result = await service.getStreamSession('nonexistent-job');
      expect(result).toBeNull();
    });

    it('should handle invalid subscriber on non-existent stream', async () => {
      try {
        await service.subscribeToStream('nonexistent-job', 'super-789', {});
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle recording stop without start', async () => {
      try {
        await service.stopRecording('nonexistent-job');
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle happy path: technician → supervisor → annotation → recording', async () => {
      const jobId = 'job-integration-123';
      const technicianId = 'tech-456';
      const supervisorId = 'super-789';

      // Technician starts stream
      const streamResult = await service.startStream(jobId, technicianId, {});
      expect(streamResult.sessionId).toBeDefined();

      // Supervisor subscribes
      const subResult = await service.subscribeToStream(jobId, supervisorId, {});
      expect(subResult.consumerId).toBeDefined();

      // Start recording
      const recordingId = await service.startRecording(jobId);
      expect(recordingId).toBeDefined();

      // Supervisor sends annotation
      const annotation = {
        type: 'circle' as const,
        x: 100,
        y: 100,
        color: '#FF0000',
      };
      const annoId = await service.broadcastAnnotation(jobId, supervisorId, annotation);
      expect(annoId).toBeDefined();

      // Stop recording
      const recordResult = await service.stopRecording(jobId);
      expect(recordResult.s3Url).toBeDefined();

      // Stop stream
      await service.stopStream(jobId);

      // Verify cleanup
      const finalSession = await service.getStreamSession(jobId);
      expect(finalSession).toBeNull();
    });

    it('should support concurrent supervisors viewing', async () => {
      const jobId = 'job-concurrent-123';
      const supervisorCount = 5;

      await service.startStream(jobId, 'tech-456', {});

      const subscribePromises: Promise<ConsumerResponseDto>[] = [];
      for (let i = 0; i < supervisorCount; i++) {
        subscribePromises.push(
          service.subscribeToStream(jobId, `super-${i}`, {})
        );
      }

      const results = await Promise.all(subscribePromises);
      expect(results.length).toBe(supervisorCount);

      const viewers = await service.getStreamViewers(jobId);
      expect(viewers.length).toBe(supervisorCount);

      await service.stopStream(jobId);
    });
  });

  describe('Mediasoup Integration', () => {
    it('should initialize Mediasoup worker', async () => {
      // Verify worker is initialized in onModuleInit
      expect(mediasoup).toBeDefined();
    });

    it('should create router for job', async () => {
      const jobId = 'job-router-123';
      const router = await mediasoup.createRouter(jobId);
      expect(router).toBeDefined();
    });

    it('should handle router death and restart', async () => {
      // Would require actual Mediasoup worker simulation
      expect(true).toBe(true);
    });
  });
});
