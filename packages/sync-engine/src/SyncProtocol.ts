import { DeviceId, SyncMessage, SyncStatus } from './types';

export interface SyncTransport {
  send(message: SyncMessage): Promise<void>;
  receive(): Promise<SyncMessage>;
  disconnect(): Promise<void>;
  getStatus(): SyncStatus;
}

/**
 * Sync protocol handler for network communication
 */
export class SyncProtocol {
  private transports: Map<DeviceId, SyncTransport> = new Map();
  private messageQueue: Map<DeviceId, SyncMessage[]> = new Map();
  private retryPolicy = {
    maxRetries: 3,
    initialDelay: 1000, // ms
    maxDelay: 30000, // ms
    backoffMultiplier: 2
  };

  /**
   * Register transport for a device
   */
  registerTransport(deviceId: DeviceId, transport: SyncTransport): void {
    this.transports.set(deviceId, transport);
    this.messageQueue.set(deviceId, []);
  }

  /**
   * Send message to device with retry logic
   */
  async sendWithRetry(deviceId: DeviceId, message: SyncMessage): Promise<boolean> {
    const transport = this.transports.get(deviceId);
    if (!transport) {
      throw new Error(`No transport for device ${deviceId}`);
    }

    let delay = this.retryPolicy.initialDelay;

    for (let attempt = 0; attempt <= this.retryPolicy.maxRetries; attempt++) {
      try {
        if (transport.getStatus() !== SyncStatus.Online) {
          throw new Error('Transport not online');
        }

        await transport.send(message);
        return true;
      } catch (error) {
        if (attempt < this.retryPolicy.maxRetries) {
          await this.sleep(delay);
          delay = Math.min(delay * this.retryPolicy.backoffMultiplier, this.retryPolicy.maxDelay);
        } else {
          // Queue message for later delivery
          this.queueMessage(deviceId, message);
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Queue message for later delivery
   */
  private queueMessage(deviceId: DeviceId, message: SyncMessage): void {
    const queue = this.messageQueue.get(deviceId) || [];
    queue.push(message);
    this.messageQueue.set(deviceId, queue);
  }

  /**
   * Get queued messages for device
   */
  getQueuedMessages(deviceId: DeviceId): SyncMessage[] {
    return this.messageQueue.get(deviceId) || [];
  }

  /**
   * Clear message queue for device
   */
  clearQueuedMessages(deviceId: DeviceId): void {
    this.messageQueue.set(deviceId, []);
  }

  /**
   * Broadcast message to all devices
   */
  async broadcast(message: SyncMessage): Promise<{ successful: DeviceId[]; failed: DeviceId[] }> {
    const successful: DeviceId[] = [];
    const failed: DeviceId[] = [];

    for (const deviceId of this.transports.keys()) {
      if (deviceId === message.fromDevice) continue; // Don't send to self

      const success = await this.sendWithRetry(deviceId, message);
      if (success) {
        successful.push(deviceId);
      } else {
        failed.push(deviceId);
      }
    }

    return { successful, failed };
  }

  /**
   * Selective sync to specific devices
   */
  async syncTo(targetDevices: DeviceId[], message: SyncMessage): Promise<Map<DeviceId, boolean>> {
    const results = new Map<DeviceId, boolean>();

    for (const deviceId of targetDevices) {
      const success = await this.sendWithRetry(deviceId, message);
      results.set(deviceId, success);
    }

    return results;
  }

  /**
   * Get transport status
   */
  getTransportStatus(deviceId: DeviceId): SyncStatus | undefined {
    return this.transports.get(deviceId)?.getStatus();
  }

  /**
   * Get all transports status
   */
  getAllTransportStatus(): Record<string, SyncStatus> {
    const status: Record<string, SyncStatus> = {};

    for (const [deviceId, transport] of this.transports) {
      status[deviceId as string] = transport.getStatus();
    }

    return status;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Compress message for network transfer
   */
  static compressMessage(message: SyncMessage): Buffer {
    // Simple JSON compression
    // In production, use gzip or other compression
    return Buffer.from(JSON.stringify(message));
  }

  /**
   * Decompress message
   */
  static decompressMessage(data: Buffer): SyncMessage {
    return JSON.parse(data.toString());
  }

  /**
   * Calculate message size
   */
  static getMessageSize(message: SyncMessage): number {
    return SyncProtocol.compressMessage(message).length;
  }

  /**
   * Estimate bandwidth for sync
   */
  static estimateBandwidth(messages: SyncMessage[], timeWindowMs: number): number {
    const totalSize = messages.reduce((sum, msg) => sum + this.getMessageSize(msg), 0);
    return (totalSize / timeWindowMs) * 1000; // bytes per second
  }
}

export const createSyncProtocol = (): SyncProtocol => {
  return new SyncProtocol();
};
