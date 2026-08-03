/**
 * WISE² Edge Hub - Dashboard Backend
 *
 * Real-time data for dashboard widgets:
 * - Device status (online/offline, signal, battery)
 * - Voice pipeline status (Bluetooth, STT, TTS)
 * - System metrics (CPU, memory, disk, network)
 * - OTA status (firmware updates in progress)
 * - Support bundles (recent diagnostics)
 */

import express from 'express';
import { DeviceRegistry } from './device-registry';
import { BluetoothManager } from './bluetooth-manager';
import { VoiceCoordinator } from './voice-coordinator';

export interface DashboardData {
  timestamp: number;
  status: 'healthy' | 'degraded' | 'offline';
  devices: {
    total: number;
    online: number;
    list: Array<{
      id: string;
      type: string;
      isOnline: boolean;
      signal?: number;
      battery?: number;
      lastHeartbeat: number;
    }>;
  };
  voice: {
    e09Connected: boolean;
    microphoneAvailable: boolean;
    speakerAvailable: boolean;
    lastRequest?: {
      timestamp: number;
      latency: number;
      success: boolean;
    };
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
  services: {
    registry: 'online' | 'offline';
    health: 'online' | 'offline';
    voice: 'online' | 'offline';
    support: 'online' | 'offline';
  };
}

export class DashboardAPI {
  private app = express();
  private lastVoiceRequest?: { timestamp: number; latency: number; success: boolean };

  constructor(
    private registry: DeviceRegistry,
    private btManager: BluetoothManager,
    private voiceCoordinator: VoiceCoordinator,
    private port: number = 4903
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Parse JSON
    this.app.use(express.json());

    // CORS for dashboard frontend
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // Get full dashboard data
    this.app.get('/dashboard', async (req, res) => {
      try {
        const data = await this.getDashboardData();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Get device list
    this.app.get('/devices', async (req, res) => {
      try {
        const devices = this.registry.getAllDevices();
        res.json({ devices, timestamp: Date.now() });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Get voice status
    this.app.get('/voice-status', async (req, res) => {
      try {
        const btStatus = await this.btManager.getDeviceInfo();
        res.json({
          connected: btStatus?.connected || false,
          device: btStatus?.name || null,
          lastRequest: this.lastVoiceRequest,
          timestamp: Date.now(),
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Get system metrics
    this.app.get('/system-metrics', async (req, res) => {
      try {
        const metrics = await this.getSystemMetrics();
        res.json({ ...metrics, timestamp: Date.now() });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // WebSocket support for real-time updates (optional)
    this.app.get('/stream', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const interval = setInterval(async () => {
        try {
          const data = await this.getDashboardData();
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
          console.error('[Dashboard] Stream error:', err);
          clearInterval(interval);
          res.end();
        }
      }, 2000); // Update every 2 seconds

      req.on('close', () => {
        clearInterval(interval);
        res.end();
      });
    });
  }

  private async getDashboardData(): Promise<DashboardData> {
    const devices = this.registry.getAllDevices();
    const btStatus = await this.btManager.getDeviceInfo();
    const metrics = await this.getSystemMetrics();

    return {
      timestamp: Date.now(),
      status: this.getOverallStatus(devices, btStatus),
      devices: {
        total: devices.length,
        online: devices.filter((d) => d.isOnline).length,
        list: devices.map((d) => ({
          id: d.deviceId,
          type: d.deviceType,
          isOnline: d.isOnline,
          signal: d.lastHeartbeat?.wifiSignal,
          battery: d.lastHeartbeat?.batteryLevel,
          lastHeartbeat: d.lastHeartbeat?.timestamp || 0,
        })),
      },
      voice: {
        e09Connected: btStatus?.connected || false,
        microphoneAvailable: btStatus?.connected ? true : false,
        speakerAvailable: btStatus?.connected ? true : false,
        lastRequest: this.lastVoiceRequest,
      },
      system: metrics,
      services: {
        registry: 'online',
        health: 'online',
        voice: 'online',
        support: 'online',
      },
    };
  }

  private async getSystemMetrics(): Promise<{ cpuUsage: number; memoryUsage: number; diskUsage: number; uptime: number }> {
    // Would fetch from /system endpoint or pm2 API
    // For now, return placeholder
    return {
      cpuUsage: 5,
      memoryUsage: 50,
      diskUsage: 40,
      uptime: process.uptime(),
    };
  }

  private getOverallStatus(
    devices: any[],
    btStatus: any
  ): 'healthy' | 'degraded' | 'offline' {
    if (devices.length === 0) return 'degraded'; // No devices
    if (devices.filter((d) => d.isOnline).length === 0) return 'offline'; // All offline
    if (!btStatus?.connected) return 'degraded'; // E09 not connected
    return 'healthy';
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, '127.0.0.1', () => {
        console.log(`[Dashboard API] Listening on http://127.0.0.1:${this.port}`);
        resolve();
      });
    });
  }
}

// Standalone server
if (require.main === module) {
  import('./device-registry')
    .then(async (registryMod) => {
      import('./bluetooth-manager').then(async (btMod) => {
        import('./voice-coordinator').then(async (voiceMod) => {
          const registry = await registryMod.createRegistry();
          const btManager = await btMod.createBluetoothManager();
          const voiceCoordinator = await voiceMod.createVoiceCoordinator(btManager);

          const api = new DashboardAPI(registry, btManager, voiceCoordinator);
          await api.start();

          process.on('SIGTERM', async () => {
            console.log('[Dashboard API] Shutting down...');
            await registry.disconnect();
            process.exit(0);
          });
        });
      });
    })
    .catch((err) => {
      console.error('[Dashboard API] Failed to start:', err);
      process.exit(1);
    });
}
