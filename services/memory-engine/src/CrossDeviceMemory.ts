import { SyncManager, createSyncManager } from '@wise2/sync-engine';
import { Change, ChangeType, DeviceId, EntityId } from '@wise2/sync-engine';

export interface MemoryEntry {
  key: string;
  value: unknown;
  deviceId: DeviceId;
  timestamp: Date;
  ttl?: number; // Time to live in seconds
}

export interface MemoryPartition {
  name: string;
  capacity: number; // In bytes
  ttl?: number;
  entries: Map<string, MemoryEntry>;
}

/**
 * Unified memory across all devices
 */
export class CrossDeviceMemory {
  private syncManager: SyncManager;
  private partitions: Map<string, MemoryPartition>;
  private localCache: Map<string, MemoryEntry>;
  private remoteCache: Map<string, MemoryEntry>;
  private expirationTimers: Map<string, NodeJS.Timeout>;

  constructor(deviceId: DeviceId) {
    this.syncManager = createSyncManager(deviceId);
    this.partitions = new Map();
    this.localCache = new Map();
    this.remoteCache = new Map();
    this.expirationTimers = new Map();

    // Setup change callbacks
    this.syncManager.onchange((change: Change) => {
      this.handleMemoryChange(change);
    });
  }

  /**
   * Get sync manager
   */
  getSyncManager(): SyncManager {
    return this.syncManager;
  }

  /**
   * Create memory partition
   */
  createPartition(name: string, capacity: number, ttl?: number): void {
    this.partitions.set(name, {
      name,
      capacity,
      ttl,
      entries: new Map()
    });
  }

  /**
   * Store value in memory
   */
  async set(key: string, value: unknown, partition: string = 'default', ttl?: number): Promise<void> {
    if (!this.partitions.has(partition)) {
      this.createPartition(partition, 1024 * 1024); // 1MB default
    }

    const entry: MemoryEntry = {
      key,
      value,
      deviceId: this.syncManager['state'].deviceId,
      timestamp: new Date(),
      ttl: ttl || this.partitions.get(partition)?.ttl
    };

    // Store locally
    this.localCache.set(key, entry);

    // Create change for sync
    const change = this.syncManager.createChange(
      key as EntityId,
      ChangeType.Update,
      entry
    );

    // Set expiration if TTL
    if (entry.ttl) {
      this.setExpiration(key, entry.ttl);
    }
  }

  /**
   * Retrieve value from memory
   */
  async get(key: string): Promise<unknown | undefined> {
    // Check local cache first
    const local = this.localCache.get(key);
    if (local && !this.isExpired(local)) {
      return local.value;
    }

    // Check remote cache
    const remote = this.remoteCache.get(key);
    if (remote && !this.isExpired(remote)) {
      return remote.value;
    }

    // Get from sync state
    const state = this.syncManager.getEntityState(key as EntityId);
    if (state instanceof Object && 'value' in state) {
      return (state as MemoryEntry).value;
    }

    return undefined;
  }

  /**
   * Get all values in partition
   */
  async getAll(partition: string = 'default'): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    const partitionData = this.partitions.get(partition);
    if (partitionData) {
      for (const [key, entry] of partitionData.entries) {
        if (!this.isExpired(entry)) {
          result[key] = entry.value;
        }
      }
    }

    return result;
  }

  /**
   * Delete value from memory
   */
  async delete(key: string): Promise<void> {
    this.localCache.delete(key);
    this.remoteCache.delete(key);

    // Create delete change
    this.syncManager.createChange(key as EntityId, ChangeType.Delete, undefined);

    // Clear expiration
    if (this.expirationTimers.has(key)) {
      clearTimeout(this.expirationTimers.get(key)!);
      this.expirationTimers.delete(key);
    }
  }

  /**
   * Clear partition
   */
  async clearPartition(partition: string): Promise<void> {
    const partitionData = this.partitions.get(partition);
    if (partitionData) {
      for (const key of partitionData.entries.keys()) {
        await this.delete(key);
      }
    }
  }

  /**
   * Set expiration for key
   */
  private setExpiration(key: string, ttlSeconds: number): void {
    // Clear existing timer
    if (this.expirationTimers.has(key)) {
      clearTimeout(this.expirationTimers.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.delete(key).catch(() => {}); // Ignore errors
    }, ttlSeconds * 1000);

    this.expirationTimers.set(key, timer);
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: MemoryEntry): boolean {
    if (!entry.ttl) return false;

    const ageSeconds = (Date.now() - entry.timestamp.getTime()) / 1000;
    return ageSeconds > entry.ttl;
  }

  /**
   * Handle memory change from sync
   */
  private handleMemoryChange(change: Change): void {
    if (change.type === ChangeType.Delete) {
      this.remoteCache.delete(change.entityId as string);
    } else if (change.data instanceof Object && 'key' in change.data) {
      const entry = change.data as MemoryEntry;
      this.remoteCache.set(entry.key, entry);

      // Set expiration if needed
      if (entry.ttl) {
        this.setExpiration(entry.key, entry.ttl);
      }
    }
  }

  /**
   * Get memory usage stats
   */
  getStats(): {
    localEntries: number;
    remoteEntries: number;
    partitions: number;
    pendingChanges: number;
    offlineChanges: number;
  } {
    const syncState = this.syncManager.getSyncState();

    return {
      localEntries: this.localCache.size,
      remoteEntries: this.remoteCache.size,
      partitions: this.partitions.size,
      pendingChanges: syncState.queuedChanges,
      offlineChanges: syncState.offlineChanges
    };
  }

  /**
   * Clear all memory
   */
  async clear(): Promise<void> {
    for (const partition of this.partitions.keys()) {
      await this.clearPartition(partition);
    }

    this.localCache.clear();
    this.remoteCache.clear();

    // Clear all expiration timers
    for (const timer of this.expirationTimers.values()) {
      clearTimeout(timer);
    }
    this.expirationTimers.clear();
  }
}

export const createCrossDeviceMemory = (deviceId: DeviceId): CrossDeviceMemory => {
  return new CrossDeviceMemory(deviceId);
};
