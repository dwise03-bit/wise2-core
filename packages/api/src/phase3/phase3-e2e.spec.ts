import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Phase3Controller } from './phase3.controller';
import { DamageDetectionService } from '../ml/damage-detection.service';
import { AREngineService } from '../ar/ar-engine.service';
import { VoiceCommandService } from '../voice/voice-command.service';
import { ModelTrainingService } from '../ml/model-training.service';

describe('Phase 3: End-to-End Integration', () => {
  let app: INestApplication;
  let damageDetection: DamageDetectionService;
  let arEngine: AREngineService;
  let voiceCommand: VoiceCommandService;
  let modelTraining: ModelTrainingService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [Phase3Controller],
      providers: [DamageDetectionService, AREngineService, VoiceCommandService, ModelTrainingService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    damageDetection = moduleFixture.get<DamageDetectionService>(DamageDetectionService);
    arEngine = moduleFixture.get<AREngineService>(AREngineService);
    voiceCommand = moduleFixture.get<VoiceCommandService>(VoiceCommandService);
    modelTraining = moduleFixture.get<ModelTrainingService>(ModelTrainingService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Workflow: Detection → AR → Voice', () => {
    const jobId = 'job-e2e-complete-001';

    it('should initialize AR scene for job', async () => {
      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/ar/init`)
        .send({ cameraFeedUrl: 'wss://stream.example.com/video' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('jobId', jobId);
      expect(response.body.isActive).toBe(true);
    });

    it('should detect damage from image', async () => {
      const imageData = Buffer.from('hvac-damage-sample').toString('base64');

      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/detect`)
        .send({ image: imageData });

      expect(response.status).toBe(200);
      expect(['working', 'broken', 'needs_maintenance']).toContain(response.body.classification);
      expect(response.body.confidence).toBeGreaterThan(0);
      expect(response.body.location).toBeDefined();
    });

    it('should auto-render detection box in AR', async () => {
      // After detection, AR should have detection box
      const arState = await request(app.getHttpServer())
        .get(`/jobs/${jobId}/phase3/ar/state`);

      expect(arState.status).toBe(200);
      expect(arState.body.annotations.length).toBeGreaterThan(0);
      expect(arState.body.annotations[0].type).toBe('detection_box');
    });

    it('should process voice command to add annotation', async () => {
      const audioData = Buffer.from('add red circle annotation').toString('base64');

      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/voice/command`)
        .send({ audioData, speaker: 'supervisor' });

      expect(response.status).toBe(200);
      expect(response.body.intent).toBe('add_annotation');
      expect(response.body.parameters).toBeDefined();
    });

    it('should execute voice command', async () => {
      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/voice/execute`)
        .send({ commandId: 'cmd-test-001' });

      expect(response.status).toBe(200);
      expect(['action', 'text', 'audio']).toContain(response.body.type);
    });

    it('should generate guidance audio (TTS)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/voice/guidance`)
        .send({ text: 'Replace the compressor immediately' });

      expect(response.status).toBe(200);
      expect(response.body.audioUrl).toBeDefined();
    });

    it('should retrieve voice command history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/jobs/${jobId}/phase3/voice/history`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Recording Analysis Pipeline', () => {
    it('should analyze entire recording for damage', async () => {
      const jobId = 'job-recording-analysis-001';
      const recordingPath = 's3://wise2-streams/job-123/recording.webm';

      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/analyze-recording`)
        .send({ recordingPath });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Should return multiple detections from frames
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('classification');
        expect(response.body[0]).toHaveProperty('confidence');
        expect(response.body[0]).toHaveProperty('timestamp');
      }
    });
  });

  describe('Model Training & Switching', () => {
    it('should list available models', async () => {
      const response = await request(app.getHttpServer())
        .get('/phase3/models');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toContain('yolov8-hvac-edge');
      expect(response.body).toContain('yolov8-hvac-cloud');
    });

    it('should switch to edge model', async () => {
      const response = await request(app.getHttpServer())
        .post('/phase3/models/switch')
        .send({ modelName: 'yolov8-hvac-edge', edge: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should start model training', async () => {
      const response = await request(app.getHttpServer())
        .post('/phase3/models/train')
        .send({ dataset: 'hvac-damage-5k', epochs: 50 });

      expect(response.status).toBe(200);
      expect(response.body.jobId).toBeDefined();
      expect(response.body.status).toBe('training');
    });

    it('should track training progress', async () => {
      const trainingResponse = await request(app.getHttpServer())
        .post('/phase3/models/train')
        .send({ dataset: 'hvac-damage-5k', epochs: 10 });

      const jobId = trainingResponse.body.jobId;

      const statusResponse = await request(app.getHttpServer())
        .get(`/phase3/models/train/${jobId}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body).toHaveProperty('progress');
      expect(statusResponse.body).toHaveProperty('status');
    });
  });

  describe('Performance & Scalability', () => {
    it('should handle concurrent AR scenes', async () => {
      const jobIds = Array.from({ length: 5 }, (_, i) => `job-concurrent-${i}`);

      const createPromises = jobIds.map((jobId) =>
        request(app.getHttpServer())
          .post(`/jobs/${jobId}/phase3/ar/init`)
          .send({ cameraFeedUrl: `wss://stream.example.com/${jobId}` })
      );

      const responses = await Promise.all(createPromises);
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });
    });

    it('should process rapid detections', async () => {
      const jobId = 'job-rapid-detections';
      const detectionPromises = Array.from({ length: 20 }, (_, i) =>
        request(app.getHttpServer())
          .post(`/jobs/${jobId}/phase3/detect`)
          .send({ image: Buffer.from(`image-${i}`).toString('base64') })
      );

      const start = Date.now();
      const responses = await Promise.all(detectionPromises);
      const elapsed = Date.now() - start;

      expect(responses.every((r) => r.status === 200)).toBe(true);
      expect(elapsed).toBeLessThan(5000); // Should complete in <5 seconds
    });

    it('should maintain annotation history', async () => {
      const jobId = 'job-history-001';

      // Initialize AR
      await request(app.getHttpServer())
        .post(`/jobs/${jobId}/phase3/ar/init`)
        .send({ cameraFeedUrl: 'wss://stream.example.com/video' });

      // Add 10 annotations
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post(`/jobs/${jobId}/phase3/ar/add-annotation`)
          .send({
            type: 'circle',
            points: [{ x: 100 + i * 10, y: 100 + i * 10 }],
            color: '#FF0000',
          });
      }

      // Verify history
      const historyResponse = await request(app.getHttpServer())
        .get(`/jobs/${jobId}/phase3/ar/history`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Error Handling & Recovery', () => {
    it('should handle invalid image data gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/jobs/job-invalid-001/phase3/detect')
        .send({ image: 'invalid-base64!' });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle non-existent AR scene', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs/job-nonexistent/phase3/ar/state');

      expect([404, 200]).toContain(response.status); // Either not found or empty
    });

    it('should handle failed model training', async () => {
      const response = await request(app.getHttpServer())
        .post('/phase3/models/train')
        .send({ dataset: 'nonexistent-dataset', epochs: 50 });

      // Should reject invalid dataset
      expect([400, 422]).toContain(response.status);
    });
  });
});
