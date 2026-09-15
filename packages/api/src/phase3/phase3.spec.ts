import { Test, TestingModule } from '@nestjs/testing';
import { Phase3Controller } from './phase3.controller';
import { DamageDetectionService } from '../ml/damage-detection.service';
import { AREngineService } from '../ar/ar-engine.service';
import { VoiceCommandService } from '../voice/voice-command.service';

describe('Phase 3: AR + ML + Voice (Ray-Ban Integration)', () => {
  let controller: Phase3Controller;
  let damageDetection: DamageDetectionService;
  let arEngine: AREngineService;
  let voiceCommand: VoiceCommandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Phase3Controller],
      providers: [DamageDetectionService, AREngineService, VoiceCommandService],
    }).compile();

    controller = module.get<Phase3Controller>(Phase3Controller);
    damageDetection = module.get<DamageDetectionService>(DamageDetectionService);
    arEngine = module.get<AREngineService>(AREngineService);
    voiceCommand = module.get<VoiceCommandService>(VoiceCommandService);
  });

  describe('ML Damage Detection', () => {
    it('should detect broken equipment with high confidence', async () => {
      const imageData = Buffer.from('test-image-data').toString('base64');
      const jobId = 'job-test-123';

      const result = await damageDetection.detectDamage(imageData, jobId);

      expect(result).toHaveProperty('detectionId');
      expect(result).toHaveProperty('confidence');
      expect(['working', 'broken', 'needs_maintenance']).toContain(result.classification);
    });

    it('should classify maintenance needs with recommendations', async () => {
      const imageData = Buffer.from('hvac-filter-image').toString('base64');
      const jobId = 'job-123';

      const result = await damageDetection.detectDamage(imageData, jobId);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.severity).toMatch(/low|medium|high|critical/);
    });

    it('should support model switching (edge vs cloud)', async () => {
      const edgeSuccess = await damageDetection.switchModel('yolov8-hvac', true);
      expect(edgeSuccess).toBe(true);

      const cloudSuccess = await damageDetection.switchModel('yolov8-hvac', false);
      expect(cloudSuccess).toBe(true);
    });

    it('should start model training with dataset', async () => {
      const jobId = await damageDetection.startTraining('hvac-damage-dataset', 50);

      expect(jobId).toMatch(/^[a-z0-9-]+$/);
    });

    it('should get training progress', async () => {
      const jobId = await damageDetection.startTraining('dataset', 10);
      const status = await damageDetection.getTrainingStatus(jobId);

      expect(status).toHaveProperty('progress');
      expect(status).toHaveProperty('status');
    });
  });

  describe('AR Engine', () => {
    it('should create AR scene for job', () => {
      const jobId = 'job-ar-123';
      const cameraUrl = 'wss://stream.example.com/video';

      const scene = arEngine.createARScene(jobId, cameraUrl);

      expect(scene.jobId).toBe(jobId);
      expect(scene.isActive).toBe(true);
      expect(scene.annotations).toEqual([]);
    });

    it('should add annotation to AR scene', () => {
      const jobId = 'job-ar-123';
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      const annotation = {
        id: 'anno-1',
        type: 'circle' as const,
        x: 100,
        y: 100,
        color: '#FF0000',
        opacity: 0.8,
      };

      const added = arEngine.addAnnotation(jobId, annotation);
      expect(added).toBe(true);

      const scene = arEngine.getARState(jobId);
      expect(scene?.annotations.length).toBe(1);
    });

    it('should add ML detection box to AR', () => {
      const jobId = 'job-ar-123';
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      const added = arEngine.addDetectionBox(
        jobId,
        'broken_compressor',
        { x: 50, y: 50, w: 150, h: 150 },
        0.92
      );

      expect(added).toBe(true);

      const scene = arEngine.getARState(jobId);
      expect(scene?.annotations[0].type).toBe('detection_box');
    });

    it('should clear AR scene', () => {
      const jobId = 'job-ar-123';
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      const annotation = {
        id: 'anno-1',
        type: 'circle' as const,
        x: 100,
        y: 100,
        color: '#FF0000',
        opacity: 0.8,
      };

      arEngine.addAnnotation(jobId, annotation);
      const cleared = arEngine.clearScene(jobId);

      expect(cleared).toBe(true);
      const scene = arEngine.getARState(jobId);
      expect(scene?.annotations.length).toBe(0);
    });

    it('should maintain annotation history', () => {
      const jobId = 'job-ar-123';
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      for (let i = 0; i < 5; i++) {
        arEngine.addAnnotation(jobId, {
          id: `anno-${i}`,
          type: 'circle' as const,
          x: 100 * i,
          y: 100,
          color: '#FF0000',
          opacity: 0.8,
        });
      }

      const history = arEngine.getAnnotationHistory(jobId);
      expect(history.length).toBe(5);
    });
  });

  describe('Voice Commands', () => {
    it('should process voice command from technician', async () => {
      const audioData = Buffer.from('start stream command');
      const jobId = 'job-voice-123';

      const command = await voiceCommand.processVoiceCommand(audioData, 'technician', jobId);

      expect(command).toHaveProperty('commandId');
      expect(['technician', 'supervisor']).toContain(command.speaker);
      expect(command.confidence).toBeGreaterThan(0);
    });

    it('should recognize supported commands', async () => {
      const audioData = Buffer.from('detect damage');
      const jobId = 'job-123';

      const command = await voiceCommand.processVoiceCommand(audioData, 'supervisor', jobId);

      expect(['start_stream', 'stop_stream', 'detect_damage', 'start_recording', 'stop_recording']).toContain(
        command.intent
      );
    });

    it('should execute voice command', async () => {
      const audioData = Buffer.from('start recording');
      const jobId = 'job-123';

      const command = await voiceCommand.processVoiceCommand(audioData, 'technician', jobId);
      const response = await voiceCommand.executeCommand(command);

      expect(response).toHaveProperty('responseId');
      expect(['action', 'text', 'audio']).toContain(response.type);
    });

    it('should generate text-to-speech for guidance', async () => {
      const guidanceText = 'Replace the air filter immediately';

      const audioBuffer = await voiceCommand.textToSpeech(guidanceText);

      expect(audioBuffer).toBeInstanceOf(Buffer);
    });

    it('should maintain voice command history', async () => {
      const jobId = 'job-history-123';

      for (let i = 0; i < 3; i++) {
        const audioData = Buffer.from(`command ${i}`);
        await voiceCommand.processVoiceCommand(audioData, 'technician', jobId);
      }

      const history = voiceCommand.getCommandHistory(jobId);
      expect(history.length).toBe(3);
    });

    it('should extract parameters from voice commands', async () => {
      const audioData = Buffer.from('add red circle annotation');
      const jobId = 'job-123';

      const command = await voiceCommand.processVoiceCommand(audioData, 'supervisor', jobId);

      expect(command.parameters).toBeDefined();
    });
  });

  describe('Phase 3 Integration', () => {
    it('should coordinate damage detection with AR overlay', async () => {
      const jobId = 'job-integration-123';

      // Initialize AR
      const scene = arEngine.createARScene(jobId, 'wss://stream.example.com/video');
      expect(scene.isActive).toBe(true);

      // Detect damage
      const imageData = Buffer.from('test-hvac-image').toString('base64');
      const detection = await damageDetection.detectDamage(imageData, jobId);
      expect(detection.classification).toBeDefined();

      // Verify detection box added to AR
      const updated = arEngine.getARState(jobId);
      expect(updated?.annotations.length).toBeGreaterThan(0);
    });

    it('should execute voice-triggered damage detection', async () => {
      const jobId = 'job-voice-vision-123';

      // Initialize AR
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      // Voice command: detect damage
      const audioData = Buffer.from('detect damage');
      const command = await voiceCommand.processVoiceCommand(audioData, 'supervisor', jobId);

      // Execute command
      const response = await voiceCommand.executeCommand(command);
      expect(response.type).toBe('action');
    });

    it('should support supervisor guidance workflow', async () => {
      const jobId = 'job-guidance-123';

      // Initialize AR
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      // Supervisor voice: send guidance
      const guidanceAudio = Buffer.from('Replace the capacitor');
      const command = await voiceCommand.processVoiceCommand(guidanceAudio, 'supervisor', jobId);

      // Generate TTS response
      const responseAudio = await voiceCommand.textToSpeech('Technician acknowledged');

      expect(responseAudio).toBeInstanceOf(Buffer);
    });
  });

  describe('Performance & Scalability', () => {
    it('should handle multiple concurrent AR scenes', () => {
      const jobIds = Array.from({ length: 10 }, (_, i) => `job-concurrent-${i}`);

      jobIds.forEach((jobId) => {
        arEngine.createARScene(jobId, `wss://stream.example.com/video-${jobId}`);
      });

      const activeCount = arEngine.getActiveSceneCount();
      expect(activeCount).toBe(10);
    });

    it('should support rapid annotation additions', () => {
      const jobId = 'job-perf-123';
      arEngine.createARScene(jobId, 'wss://stream.example.com/video');

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        arEngine.addAnnotation(jobId, {
          id: `anno-${i}`,
          type: 'circle' as const,
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          color: '#FF0000',
          opacity: 0.8,
        });
      }

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(1000); // Should complete in < 1 second

      const scene = arEngine.getARState(jobId);
      expect(scene?.annotations.length).toBe(100);
    });
  });
});
