/**
 * WISE² Edge Hub - OTA Firmware Coordinator
 *
 * Manages firmware updates for connected devices:
 * - Check firmware versions
 * - Download updates
 * - Coordinate staged rollout
 * - Verify checksums
 * - Rollback on failure
 */

import mqtt from 'mqtt';
import { DeviceRegistry } from './device-registry';

export interface FirmwareUpdate {
  version: string;
  url: string;
  checksum: string;
  releaseNotes?: string;
  rollout?: number; // Percentage (0-100)
}

export interface OTAStatus {
  deviceId: string;
  currentVersion: string;
  updateVersion?: string;
  status: 'idle' | 'downloading' | 'updating' | 'verifying' | 'success' | 'failed';
  progress?: number;
  error?: string;
  timestamp: number;
}

export class OTACoordinator {
  private updates = new Map<string, FirmwareUpdate>();
  private status = new Map<string, OTAStatus>();
  private client: mqtt.MqttClient | null = null;

  constructor(
    private registry: DeviceRegistry,
    private brokerUrl: string = 'mqtt://127.0.0.1:1883'
  ) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId: 'wise2-edge-ota',
        reconnectPeriod: 5000,
      });

      this.client.on('connect', () => {
        console.log('[OTA] Connected to MQTT broker');
        // Subscribe to OTA status updates
        this.client!.subscribe('wise2/ota/+/status', { qos: 1 }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.client.on('message', (topic, message) => {
        this.handleOTAStatus(topic, message);
      });

      this.client.on('error', (err) => {
        console.error('[OTA] MQTT Error:', err);
        reject(err);
      });
    });
  }

  /**
   * Register firmware update
   */
  registerUpdate(deviceType: string, update: FirmwareUpdate): void {
    this.updates.set(deviceType, update);
    console.log(`[OTA] Registered update for ${deviceType}: v${update.version}`);
  }

  /**
   * Initiate OTA for device
   */
  async initiateUpdate(deviceId: string, deviceType: string, forceUpdate: boolean = false): Promise<void> {
    const update = this.updates.get(deviceType);

    if (!update) {
      console.warn(`[OTA] No update registered for ${deviceType}`);
      return;
    }

    const device = this.registry.getDevice(deviceId);
    if (!device || !device.isOnline) {
      console.warn(`[OTA] Device ${deviceId} not online`);
      return;
    }

    // Check rollout percentage
    if (update.rollout && !forceUpdate) {
      const random = Math.random() * 100;
      if (random > update.rollout) {
        console.log(`[OTA] Device ${deviceId} not selected for rollout (${random.toFixed(1)}% > ${update.rollout}%)`);
        return;
      }
    }

    // Send OTA command
    const payload = {
      action: 'ota_start',
      version: update.version,
      url: update.url,
      checksum: update.checksum,
      timestamp: Date.now(),
    };

    this.client?.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });

    console.log(`[OTA] Initiated update for ${deviceId}: v${update.version}`);

    // Track status
    this.status.set(deviceId, {
      deviceId,
      currentVersion: device.lastHeartbeat?.version || 'unknown',
      updateVersion: update.version,
      status: 'downloading',
      timestamp: Date.now(),
    });
  }

  /**
   * Initiate OTA for all devices of type
   */
  async initiateUpdateForType(deviceType: string, forceUpdate: boolean = false): Promise<number> {
    const devices = this.registry.getDevicesByType(deviceType).filter(d => d.isOnline);
    const count = devices.length;

    console.log(`[OTA] Initiating update for ${count} ${deviceType} devices`);

    for (const device of devices) {
      await this.initiateUpdate(device.deviceId, deviceType, forceUpdate);
      // Stagger updates to prevent network flood
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return count;
  }

  /**
   * Handle OTA status updates from devices
   */
  private handleOTAStatus(topic: string, payload: Buffer): void {
    try {
      const status: OTAStatus = JSON.parse(payload.toString());
      this.status.set(status.deviceId, status);

      if (status.status === 'success') {
        console.log(`[OTA] ${status.deviceId} successfully updated to v${status.updateVersion}`);
      } else if (status.status === 'failed') {
        console.error(`[OTA] ${status.deviceId} update failed: ${status.error}`);
      }
    } catch (err) {
      console.error('[OTA] Failed to parse OTA status:', err);
    }
  }

  /**
   * Get OTA status for device
   */
  getStatus(deviceId: string): OTAStatus | undefined {
    return this.status.get(deviceId);
  }

  /**
   * Get OTA status for all devices
   */
  getAllStatus(): OTAStatus[] {
    return Array.from(this.status.values());
  }

  /**
   * Cancel OTA for device
   */
  async cancelUpdate(deviceId: string): Promise<void> {
    const payload = {
      action: 'ota_cancel',
      timestamp: Date.now(),
    };

    this.client?.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });

    console.log(`[OTA] Cancelled update for ${deviceId}`);
  }

  /**
   * Rollback to previous version
   */
  async rollback(deviceId: string, previousVersion: string): Promise<void> {
    const payload = {
      action: 'ota_rollback',
      version: previousVersion,
      timestamp: Date.now(),
    };

    this.client?.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });

    console.log(`[OTA] Initiated rollback for ${deviceId} to v${previousVersion}`);
  }

  /**
   * Get update for device type
   */
  getUpdate(deviceType: string): FirmwareUpdate | undefined {
    return this.updates.get(deviceType);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(() => {
          console.log('[OTA] Disconnected from MQTT broker');
          resolve();
        });
      });
    }
  }
}

export async function createOTACoordinator(registry: DeviceRegistry): Promise<OTACoordinator> {
  const coordinator = new OTACoordinator(registry);
  await coordinator.connect();
  console.log('[OTA] Coordinator initialized');
  return coordinator;
}
