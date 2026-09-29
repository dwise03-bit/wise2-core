import { v4 as uuidv4 } from 'uuid';
import {
  Change,
  ChangeId,
  ChangeType,
  ConflictInfo,
  DeviceId,
  DeviceInfo,
  EntityId,
  SyncMessage,
  SyncState,
  SyncStatus,
  VectorClock
} from './types';
import { VectorClockManager } from './VectorClock';
import { ConflictResolver, ConflictResolutionStrategy } from './ConflictResolver';

/**
 * Main synchronization manager
 */
export class SyncManager {
  private state: SyncState;
  private conflictResolver: ConflictResolver;
  private syncQueue: Change[] = [];
  private onChangeCallback?: (change: Change) => void;
  private compressionEnabled = true;

  constructor(
    deviceId: DeviceId,
    conflictStrategy: ConflictResolutionStrategy = ConflictResolutionStrategy.LastWrite
  ) {
    this.state = {
      deviceId,
      devices: new Map(),
      changes: new Map(),
      offlineBuffer: [],
      conflictLog: new Map()
    };

    this.conflictResolver = new ConflictResolver(conflictStrategy);

    // Register this device
    this.registerDevice({
      id: deviceId,
      name: 'Current Device',
      type: 'desktop',
      lastSeen: new Date(),
      status: SyncStatus.Online,
      vectorClock: { [deviceId as string]: 0 }
    });
  }

  /**
   * Register a device in the sync network
   */
  registerDevice(device: DeviceInfo): void {
    this.state.devices.set(device.id, device);
  }

  /**
   * Create a change
   */
  createChange<T>(entityId: EntityId, type: ChangeType, data: T): Change<T> {
    const vectorClock = this.getVectorClockManager().increment();
    const change: Change<T> = {
      id: uuidv4() as ChangeId,
      deviceId: this.state.deviceId,
      entityId,
      type,
      timestamp: new Date(),
      data,
      vectorClock,
      hash: this.hashChange(entityId, type, data)
    };

    this.state.changes.set(change.id, change as unknown as Change);
    this.addToQueue(change as unknown as Change);

    if (this.onChangeCallback) {
      this.onChangeCallback(change as unknown as Change);
    }

    return change;
  }

  /**
   * Add change to sync queue
   */
  private addToQueue(change: Change): void {
    this.syncQueue.push(change);
  }

  /**
   * Get pending changes
   */
  getPendingChanges(): Change[] {
    return [...this.syncQueue];
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.syncQueue = [];
  }

  /**
   * Create sync message for another device
   */
  createSyncMessage(toDevice: DeviceId, changesOnly: boolean = false): SyncMessage {
    let changes: Change[];

    if (changesOnly) {
      changes = this.syncQueue;
    } else {
      changes = Array.from(this.state.changes.values());

      // Compress if enabled
      if (this.compressionEnabled) {
        changes = ConflictResolver.compact(changes);
      }
    }

    return {
      id: uuidv4(),
      fromDevice: this.state.deviceId,
      toDevice,
      changes,
      vectorClock: this.getVectorClock(),
      timestamp: new Date()
    };
  }

  /**
   * Apply sync message from another device
   */
  async applySyncMessage(message: SyncMessage): Promise<{ applied: number; conflicts: number }> {
    let applied = 0;
    let conflicts = 0;

    // Update device last seen
    const device = this.state.devices.get(message.fromDevice);
    if (device) {
      device.lastSeen = new Date();
      device.vectorClock = message.vectorClock;
    }

    // Update our vector clock
    this.getVectorClockManager().update(message.vectorClock);

    // Process each change
    for (const change of message.changes) {
      const existing = this.state.changes.get(change.id);

      if (!existing) {
        // New change - check for conflicts
        const conflicting = this.findConflictingChanges(change);

        if (conflicting.length > 0) {
          // Conflict detected
          conflicts++;
          const resolution = this.conflictResolver.resolve([change, ...conflicting], change.entityId);
          this.recordConflict(change.entityId, resolution);

          // Apply resolution
          if (resolution.resolvedValue !== undefined) {
            change.data = resolution.resolvedValue;
          }
        }

        this.state.changes.set(change.id, change);
        applied++;
      } else if (!this.changesEqual(existing, change)) {
        // Change exists but differs - likely a conflict or concurrent edit
        conflicts++;
      }
    }

    return { applied, conflicts };
  }

  /**
   * Find changes conflicting with a given change
   */
  private findConflictingChanges(change: Change): Change[] {
    return Array.from(this.state.changes.values()).filter((existing) => {
      return this.conflictResolver.conflicts(change, existing);
    });
  }

  /**
   * Record conflict in log
   */
  private recordConflict(entityId: EntityId, conflict: ConflictInfo): void {
    if (!this.state.conflictLog.has(entityId)) {
      this.state.conflictLog.set(entityId, []);
    }

    this.state.conflictLog.get(entityId)!.push(conflict);
  }

  /**
   * Get conflict log for entity
   */
  getConflictLog(entityId: EntityId): ConflictInfo[] {
    return this.state.conflictLog.get(entityId) || [];
  }

  /**
   * Buffer changes when offline
   */
  bufferOffline(change: Change): void {
    this.state.offlineBuffer.push(change);
  }

  /**
   * Get offline buffer
   */
  getOfflineBuffer(): Change[] {
    return [...this.state.offlineBuffer];
  }

  /**
   * Clear offline buffer and merge changes
   */
  async flushOfflineBuffer(): Promise<number> {
    const count = this.state.offlineBuffer.length;

    for (const change of this.state.offlineBuffer) {
      await this.applySyncMessage({
        id: uuidv4(),
        fromDevice: this.state.deviceId,
        toDevice: this.state.deviceId,
        changes: [change],
        vectorClock: change.vectorClock,
        timestamp: change.timestamp
      });
    }

    this.state.offlineBuffer = [];
    return count;
  }

  /**
   * Get all changes for entity
   */
  getEntityChanges(entityId: EntityId): Change[] {
    return Array.from(this.state.changes.values()).filter((c) => c.entityId === entityId);
  }

  /**
   * Get latest state of entity
   */
  getEntityState(entityId: EntityId): unknown | undefined {
    const changes = this.getEntityChanges(entityId);

    if (changes.length === 0) {
      return undefined;
    }

    // Find the latest change(s)
    const latest: Change[] = [];
    for (const change of changes) {
      if (latest.length === 0) {
        latest.push(change);
      } else if (VectorClockManager.happenedBefore(latest[0].vectorClock, change.vectorClock)) {
        latest.length = 0;
        latest.push(change);
      } else if (!VectorClockManager.happenedBefore(change.vectorClock, latest[0].vectorClock)) {
        // Concurrent
        latest.push(change);
      }
    }

    if (latest.length === 1) {
      return latest[0].data;
    }

    // Multiple concurrent changes - merge
    return this.conflictResolver['mergeValues'](latest.map((c) => c.data));
  }

  /**
   * Register change callback
   */
  onchange(callback: (change: Change) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Get current vector clock
   */
  private getVectorClock(): VectorClock {
    return this.getVectorClockManager().getClock();
  }

  /**
   * Get vector clock manager
   */
  private getVectorClockManager(): VectorClockManager {
    const clock = this.state.devices.get(this.state.deviceId)?.vectorClock || { [this.state.deviceId as string]: 0 };
    return new VectorClockManager(this.state.deviceId, clock);
  }

  /**
   * Hash change for deduplication
   */
  private hashChange(entityId: EntityId, type: ChangeType, data: unknown): string {
    const content = `${entityId}:${type}:${JSON.stringify(data)}`;
    return require('crypto').createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Check if two changes are equal
   */
  private changesEqual(a: Change, b: Change): boolean {
    return a.id === b.id && a.hash === b.hash && VectorClockManager.identical(a.vectorClock, b.vectorClock);
  }

  /**
   * Get sync state
   */
  getSyncState(): {
    devices: number;
    totalChanges: number;
    queuedChanges: number;
    offlineChanges: number;
    conflicts: number;
  } {
    let conflictCount = 0;
    this.state.conflictLog.forEach((conflicts) => {
      conflictCount += conflicts.length;
    });

    return {
      devices: this.state.devices.size,
      totalChanges: this.state.changes.size,
      queuedChanges: this.syncQueue.length,
      offlineChanges: this.state.offlineBuffer.length,
      conflicts: conflictCount
    };
  }

  /**
   * Set compression
   */
  setCompression(enabled: boolean): void {
    this.compressionEnabled = enabled;
  }
}

export const createSyncManager = (deviceId: DeviceId, strategy?: ConflictResolutionStrategy): SyncManager => {
  return new SyncManager(deviceId, strategy);
};
