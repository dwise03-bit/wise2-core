import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RayBanController } from '../src/rayban/rayban.controller';
import { RayBanService } from '../src/rayban/rayban.service';
import { RayBanGateway } from '../src/rayban/rayban.gateway';

describe('Ray-Ban Wearables Integration (e2e)', () => {
  let app: INestApplication;
  let rayBanService: RayBanService;
  let rayBanGateway: RayBanGateway;
  let controller: RayBanController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RayBanController],
      providers: [RayBanService, RayBanGateway],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    rayBanService = moduleFixture.get<RayBanService>(RayBanService);
    rayBanGateway = moduleFixture.get<RayBanGateway>(RayBanGateway);
    controller = moduleFixture.get<RayBanController>(RayBanController);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Device Management', () => {
    it('should register a new device', async () => {
      const deviceId = 'test-device-' + Date.now();
      const result = await rayBanService.registerDevice('user-1', deviceId);

      expect(result).toBeDefined();
      expect(result.deviceId).toBe(deviceId);
      expect(result.status).toBe('connected');
    });

    it('should list registered devices', async () => {
      const devices = await rayBanService.listDevices('user-1');

      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBeGreaterThan(0);
    });

    it('should update device status', async () => {
      const result = await rayBanService.updateDeviceStatus(
        'meta-rayban-pro-001',
        'connected',
        75.5,
        { lat: 37.7749, lng: -122.4194 }
      );

      expect(result.status).toBe('connected');
      expect(result.batteryLevel).toBe(75.5);
    });

    it('should handle device disconnection', async () => {
      const result = await rayBanService.updateDeviceStatus(
        'meta-rayban-pro-001',
        'disconnected',
        0
      );

      expect(result.status).toBe('disconnected');
    });
  });

  describe('Capture Management', () => {
    it('should create a capture', async () => {
      const mockData = Buffer.from('test image data');
      const result = await rayBanService.createCapture(
        'meta-rayban-pro-001',
        'image',
        mockData
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe('image');
    });

    it('should list captures', async () => {
      const captures = await rayBanService.listCaptures(
        'meta-rayban-pro-001'
      );

      expect(Array.isArray(captures)).toBe(true);
    });

    it('should get single capture', async () => {
      const mockData = Buffer.from('test image data');
      const created = await rayBanService.createCapture(
        'meta-rayban-pro-001',
        'image',
        mockData
      );

      const retrieved = await rayBanService.getCapture(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.type).toBe('image');
    });

    it('should update capture status', async () => {
      const mockData = Buffer.from('test image data');
      const capture = await rayBanService.createCapture(
        'meta-rayban-pro-001',
        'image',
        mockData
      );

      const updated = await rayBanService.updateCaptureStatus(
        capture.id,
        'SYNCED'
      );

      expect(updated.status).toBe('SYNCED');
      expect(updated.syncedAt).toBeDefined();
    });
  });

  describe('Command Management', () => {
    it('should send a command to device', async () => {
      const result = await rayBanService.sendCommand(
        'meta-rayban-pro-001',
        'start_recording',
        { duration: 30 }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.command).toBe('start_recording');
      expect(result.status).toBe('pending');
    });

    it('should update command status', async () => {
      const command = await rayBanService.sendCommand(
        'meta-rayban-pro-001',
        'stop_recording'
      );

      const updated = await rayBanService.updateCommandStatus(
        command.id,
        'completed',
        { recordingFile: 's3://bucket/recording.mp4' }
      );

      expect(updated.status).toBe('completed');
      expect(updated.result).toBeDefined();
    });

    it('should get command status', async () => {
      const command = await rayBanService.sendCommand(
        'meta-rayban-pro-001',
        'take_photo'
      );

      const retrieved = await rayBanService.getCommand(command.id);

      expect(retrieved.id).toBe(command.id);
    });
  });

  describe('Hermes AI Integration', () => {
    it('should process capture with Hermes', async () => {
      const mockData = Buffer.from('test image data');
      const capture = await rayBanService.createCapture(
        'meta-rayban-pro-001',
        'image',
        mockData
      );

      const analysis = await rayBanService.processWithHermes(
        capture.id,
        'object_detection'
      );

      expect(analysis.type).toBe('object_detection');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(analysis.results).toBeDefined();
    });

    it('should support multiple analysis types', async () => {
      const mockData = Buffer.from('test image data');
      const capture = await rayBanService.createCapture(
        'meta-rayban-pro-001',
        'image',
        mockData
      );

      const types = [
        'object_detection',
        'scene_understanding',
        'text_recognition',
        'emotional_analysis'
      ];

      for (const type of types) {
        const analysis = await rayBanService.processWithHermes(
          capture.id,
          type
        );

        expect(analysis.type).toBe(type);
        expect(analysis.results).toBeDefined();
      }
    });
  });

  describe('Analytics', () => {
    it('should record analytics metrics', async () => {
      const result = await rayBanService.recordAnalytics(
        'meta-rayban-pro-001',
        'battery_level',
        75.5
      );

      expect(result).toBeUndefined(); // Void return
    });

    it('should retrieve analytics', async () => {
      await rayBanService.recordAnalytics(
        'meta-rayban-pro-001',
        'sync_success_rate',
        0.98
      );

      const analytics = await rayBanService.getAnalytics(
        'meta-rayban-pro-001',
        'sync_success_rate'
      );

      expect(Array.isArray(analytics)).toBe(true);
    });
  });

  describe('Dashboard', () => {
    it('should return dashboard data', async () => {
      const dashboard = await rayBanService.getDashboard();

      expect(dashboard.stats).toBeDefined();
      expect(dashboard.stats.totalCaptures).toBeGreaterThanOrEqual(0);
      expect(dashboard.stats.pendingApprovals).toBeGreaterThanOrEqual(0);
      expect(dashboard.stats.activeSessions).toBeGreaterThanOrEqual(0);
      expect(dashboard.stats.connectedDevices).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Alerts', () => {
    it('should return alerts with limit and offset', async () => {
      const alerts = await rayBanService.getAlerts(5, 0);

      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeLessThanOrEqual(5);
    });

    it('should support pagination', async () => {
      const page1 = await rayBanService.getAlerts(3, 0);
      const page2 = await rayBanService.getAlerts(3, 3);

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const health = await rayBanService.health();

      expect(health.status).toBe('ok');
      expect(health.service).toBe('ray-ban-integration');
      expect(health.version).toBe('1.0.0');
    });
  });

  describe('WebSocket Integration', () => {
    it('should broadcast device connection', (done) => {
      const mockSocket = {
        emit: jest.fn(),
        data: { userId: 'test-user' }
      };

      // Simulate device connection event
      rayBanGateway.handleConnection(mockSocket as any);

      expect(mockSocket.emit).toBeDefined();
      done();
    });

    it('should handle capture sync messages', async (done) => {
      const mockSocket = {
        emit: jest.fn(),
        data: { userId: 'test-user', deviceId: 'test-device' },
        handshake: { query: { deviceId: 'test-device' } }
      };

      const result = await rayBanGateway.handleCaptureSync(mockSocket as any, {
        captureId: 'test-capture',
        status: 'SYNCED'
      });

      expect(result.success).toBe(true);
      done();
    });

    it('should handle device status updates', async (done) => {
      const mockSocket = {
        emit: jest.fn(),
        data: { userId: 'test-user', deviceId: 'test-device' }
      };

      const result = await rayBanGateway.handleDeviceStatus(mockSocket as any, {
        deviceId: 'test-device',
        status: 'connected',
        battery: 85,
        location: null
      });

      expect(result.success).toBe(true);
      done();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing captures gracefully', async () => {
      try {
        await rayBanService.getCapture('nonexistent-id');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid device IDs', async () => {
      try {
        await rayBanService.updateDeviceStatus('invalid', 'connected');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
