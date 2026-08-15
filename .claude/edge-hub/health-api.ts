/**
 * WISE² Edge Hub - Health API
 *
 * Provides real-time health metrics, device status, audio state, and diagnostic
 * information. Accessible via HTTP on localhost:4900 (Tailscale only).
 */

import express from 'express';
import { execSync } from 'child_process';
import { DeviceRegistry } from './device-registry';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  system: SystemHealth;
  services: ServiceHealth;
  devices: DeviceHealth;
  audio: AudioHealth;
}

export interface SystemHealth {
  hostname: string;
  platform: string;
  memory: { total: number; used: number; free: number };
  disk: { total: number; used: number; free: number };
  temperature?: number;
}

export interface ServiceHealth {
  mqtt: { running: boolean; port: number; authenticated: boolean };
  nginx: { running: boolean; port: number };
  ollama: { running: boolean; port: number };
  bluetooth: { powered: boolean; adapter?: string };
}

export interface DeviceHealth {
  registered: number;
  online: number;
  byteMinCyd: boolean;
  xiaoEsp32s3: boolean;
  esp32C5: boolean;
  bluetoothSpeaker: boolean;
}

export interface AudioHealth {
  bluetoothConnected: boolean;
  bluetoothAddress?: string;
  bluetoothName?: string;
  outputDevice?: string;
  inputDevice?: string;
  capabilities: string[];
}

export class HealthAPI {
  private app = express();
  private startTime = Date.now();

  constructor(private registry: DeviceRegistry, private port: number = 4900) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health endpoint (full status)
    this.app.get('/health', async (req, res) => {
      try {
        const status = await this.getHealthStatus();
        res.json(status);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Quick heartbeat (minimal)
    this.app.get('/ping', (req, res) => {
      res.json({ alive: true, timestamp: Date.now() });
    });

    // Device registry
    this.app.get('/devices', (req, res) => {
      res.json({
        total: this.registry.getAllDevices().length,
        online: this.registry.getOnlineDevices().length,
        devices: this.registry.getAllDevices(),
      });
    });

    // Device detail
    this.app.get('/devices/:deviceId', (req, res) => {
      const device = this.registry.getDevice(req.params.deviceId);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.json(device);
    });

    // Audio diagnostics
    this.app.get('/audio', async (req, res) => {
      try {
        const audio = await this.getAudioHealth();
        res.json(audio);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // System diagnostics
    this.app.get('/system', async (req, res) => {
      try {
        const system = await this.getSystemHealth();
        res.json(system);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });
  }

  private async getHealthStatus(): Promise<HealthStatus> {
    const [system, services, devices, audio] = await Promise.all([
      this.getSystemHealth(),
      this.getServiceHealth(),
      this.getDeviceHealth(),
      this.getAudioHealth(),
    ]);

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!services.mqtt.running || !services.bluetooth.powered || devices.online === 0) {
      status = 'degraded';
    }
    if (!services.mqtt.running || !services.bluetooth.powered) {
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      system,
      services,
      devices,
      audio,
    };
  }

  private async getSystemHealth(): Promise<SystemHealth> {
    try {
      const memInfo = execSync('free -b').toString();
      const diskInfo = execSync('df -B1 /').toString();

      const memLines = memInfo.split('\n');
      const memMatch = memLines[1]?.split(/\s+/);
      const diskLines = diskInfo.split('\n');
      const diskMatch = diskLines[1]?.split(/\s+/);

      return {
        hostname: process.env.HOSTNAME || 'unknown',
        platform: process.platform,
        memory: {
          total: memMatch ? parseInt(memMatch[1], 10) : 0,
          used: memMatch ? parseInt(memMatch[2], 10) : 0,
          free: memMatch ? parseInt(memMatch[3], 10) : 0,
        },
        disk: {
          total: diskMatch ? parseInt(diskMatch[1], 10) : 0,
          used: diskMatch ? parseInt(diskMatch[2], 10) : 0,
          free: diskMatch ? parseInt(diskMatch[3], 10) : 0,
        },
      };
    } catch (err) {
      console.error('[Health] System health check failed:', err);
      throw err;
    }
  }

  private async getServiceHealth(): Promise<ServiceHealth> {
    const checkService = (serviceName: string): boolean => {
      try {
        execSync(`systemctl is-active --quiet ${serviceName}`);
        return true;
      } catch {
        return false;
      }
    };

    const checkBluetooth = (): boolean => {
      try {
        const info = execSync('bluetoothctl show').toString();
        return info.includes('Powered: yes');
      } catch {
        return false;
      }
    };

    return {
      mqtt: {
        running: checkService('mosquitto'),
        port: 1883,
        authenticated: true,
      },
      nginx: {
        running: checkService('nginx'),
        port: 80,
      },
      ollama: {
        running: checkService('ollama'),
        port: 11434,
      },
      bluetooth: {
        powered: checkBluetooth(),
        adapter: 'B8:27:EB:9B:19:66',
      },
    };
  }

  private async getDeviceHealth(): Promise<DeviceHealth> {
    const devices = this.registry.getAllDevices();
    const byType = (type: string) => devices.some(d => d.deviceType === type && d.isOnline);

    return {
      registered: devices.length,
      online: devices.filter(d => d.isOnline).length,
      byteMinCyd: byType('byte-mini-cyd'),
      xiaoEsp32s3: byType('xiao-esp32s3'),
      esp32C5: byType('esp32-c5'),
      bluetoothSpeaker: byType('bluetooth-speaker'),
    };
  }

  private async getAudioHealth(): Promise<AudioHealth> {
    try {
      // Check Bluetooth connection
      let btConnected = false;
      let btAddress = '';
      let btName = '';

      try {
        const info = execSync('bluetoothctl info 34:17:23:01:A5:34').toString();
        btConnected = info.includes('Connected: yes');
        const nameMatch = info.match(/Name: (.+)/);
        btName = nameMatch ? nameMatch[1].trim() : '';
      } catch {
        // Device not found
      }

      // Check audio devices
      const sources = execSync('pactl list sources short').toString();
      const sinks = execSync('pactl list sinks short').toString();

      return {
        bluetoothConnected: btConnected,
        bluetoothAddress: btConnected ? '34:17:23:01:A5:34' : undefined,
        bluetoothName: btConnected ? btName : undefined,
        outputDevice: sinks.includes('bluetooth') ? 'bluetooth_a2dp' : 'built_in_audio',
        inputDevice: sources.includes('bluetooth') ? 'bluetooth_hsp' : 'built_in_mic',
        capabilities: [
          btConnected ? 'bluetooth_a2dp_output' : 'built_in_audio_output',
          btConnected ? 'bluetooth_hsp_input' : 'built_in_mic_input',
          'mqtt_messaging',
          'ollama_inference',
        ],
      };
    } catch (err) {
      console.error('[Health] Audio health check failed:', err);
      throw err;
    }
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, '127.0.0.1', () => {
        console.log(`[Health API] Listening on http://127.0.0.1:${this.port}`);
        resolve();
      });
    });
  }
}

// Standalone health server
if (require.main === module) {
  import('./device-registry')
    .then(async (mod) => {
      const registry = await mod.createRegistry();
      const health = new HealthAPI(registry);
      await health.start();

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        console.log('[Health API] Shutting down...');
        await registry.disconnect();
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error('[Health API] Failed to start:', err);
      process.exit(1);
    });
}
