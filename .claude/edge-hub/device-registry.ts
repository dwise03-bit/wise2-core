/**
 * WISE² United Edge Hub - Device Registry
 *
 * Tracks connected devices (BYTE Mini CYD, XIAO ESP32-S3, ESP32-C5, Bluetooth speaker)
 * via MQTT heartbeat messages. Maintains online/offline state, health metrics, and
 * coordinates voice/OTA operations.
 */

import mqtt from 'mqtt';
import { EventEmitter } from 'events';

export interface DeviceHeartbeat {
  deviceId: string;
  deviceType: 'byte-mini-cyd' | 'xiao-esp32s3' | 'esp32-c5' | 'bluetooth-speaker' | 'unknown';
  timestamp: number;
  uptime: number;
  freeMemory: number;
  heap: number;
  wifiSignal?: number;
  temperature?: number;
  batteryLevel?: number;
  features: string[]; // 'audio', 'display', 'bluetooth', 'wifi', 'mqtt'
  version: string;
}

export interface RegisteredDevice {
  deviceId: string;
  deviceType: string;
  lastSeen: number;
  isOnline: boolean;
  heartbeatCount: number;
  lastHeartbeat: DeviceHeartbeat | null;
  registeredAt: number;
  metadata?: Record<string, any>;
}

export class DeviceRegistry extends EventEmitter {
  private devices = new Map<string, RegisteredDevice>();
  private client: mqtt.MqttClient | null = null;
  private offlineTimeout: number = 30000; // 30 seconds
  private timeouts = new Map<string, NodeJS.Timeout>();

  constructor(private brokerUrl: string = 'mqtt://127.0.0.1:1883') {
    super();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId: 'wise2-edge-registry',
        reconnectPeriod: 5000,
      });

      this.client.on('connect', () => {
        console.log('[Registry] Connected to MQTT broker');
        // Subscribe to all device heartbeats
        this.client!.subscribe('wise2/device/+/heartbeat', { qos: 1 }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.client.on('message', (topic, message) => {
        this.handleHeartbeat(topic, message);
      });

      this.client.on('error', (err) => {
        console.error('[Registry] MQTT Error:', err);
        reject(err);
      });
    });
  }

  private handleHeartbeat(topic: string, payload: Buffer): void {
    try {
      const heartbeat: DeviceHeartbeat = JSON.parse(payload.toString());
      const deviceId = heartbeat.deviceId;

      // Get or create device record
      let device = this.devices.get(deviceId);
      const wasOnline = device?.isOnline ?? false;

      if (!device) {
        device = {
          deviceId,
          deviceType: heartbeat.deviceType,
          lastSeen: Date.now(),
          isOnline: true,
          heartbeatCount: 1,
          lastHeartbeat: heartbeat,
          registeredAt: Date.now(),
        };
        this.devices.set(deviceId, device);
        console.log(`[Registry] New device registered: ${deviceId} (${heartbeat.deviceType})`);
        this.emit('device-registered', device);
      } else {
        device.lastSeen = Date.now();
        device.heartbeatCount++;
        device.lastHeartbeat = heartbeat;
        device.isOnline = true;

        if (!wasOnline) {
          console.log(`[Registry] Device came online: ${deviceId}`);
          this.emit('device-online', device);
        }
      }

      // Clear existing timeout and set new one
      if (this.timeouts.has(deviceId)) {
        clearTimeout(this.timeouts.get(deviceId)!);
      }

      const timeout = setTimeout(() => {
        this.markDeviceOffline(deviceId);
      }, this.offlineTimeout);

      this.timeouts.set(deviceId, timeout);

      this.emit('heartbeat', { device, heartbeat });
    } catch (err) {
      console.error('[Registry] Failed to parse heartbeat:', err);
    }
  }

  private markDeviceOffline(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device && device.isOnline) {
      device.isOnline = false;
      console.log(`[Registry] Device went offline: ${deviceId}`);
      this.emit('device-offline', device);
    }
  }

  getDevice(deviceId: string): RegisteredDevice | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): RegisteredDevice[] {
    return Array.from(this.devices.values());
  }

  getOnlineDevices(): RegisteredDevice[] {
    return Array.from(this.devices.values()).filter(d => d.isOnline);
  }

  getDevicesByType(type: string): RegisteredDevice[] {
    return Array.from(this.devices.values()).filter(d => d.deviceType === type);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(() => {
          console.log('[Registry] Disconnected from MQTT broker');
          resolve();
        });
      });
    }
  }
}

// Export for use in health API and other services
export async function createRegistry(): Promise<DeviceRegistry> {
  const registry = new DeviceRegistry(process.env.MQTT_URL || 'mqtt://127.0.0.1:1883');
  await registry.connect();
  return registry;
}
