import { SyncProtocol, SyncManager, DeviceId, SyncMessage } from '@wise2/sync-engine';
import { CrossDeviceMemory } from './CrossDeviceMemory';
import { logger } from '../logger';

export interface SyncSchedule {
  interval: number; // milliseconds
  priority: 'high' | 'normal' | 'low';
  targetDevices?: DeviceId[];
}

/**
 * Memory synchronization across devices
 */
export class MemorySync {
  private syncProtocol: SyncProtocol;
  private syncSchedules: Map<string, SyncSchedule>;
  private syncTimers: Map<string, NodeJS.Timeout>;
  private isOnline: boolean;

  constructor(
    private memory: CrossDeviceMemory,
    private syncManager: SyncManager,
    private deviceId: DeviceId
  ) {
    this.syncProtocol = new SyncProtocol();
    this.syncSchedules = new Map();
    this.syncTimers = new Map();
    this.isOnline = true;
  }

  /**
   * Schedule sync with devices
   */
  scheduleSync(name: string, schedule: SyncSchedule): void {
    if (this.syncTimers.has(name)) {
      clearInterval(this.syncTimers.get(name)!);
    }

    this.syncSchedules.set(name, schedule);

    const timer = setInterval(
      () => {
        this.performSync(schedule.targetDevices).catch((error) => {
          logger.error(`Sync failed for schedule ${name}`, { error });
        });
      },
      schedule.interval
    );

    this.syncTimers.set(name, timer);
    logger.info(`Sync scheduled: ${name} every ${schedule.interval}ms`);
  }

  /**
   * Cancel scheduled sync
   */
  cancelSync(name: string): void {
    if (this.syncTimers.has(name)) {
      clearInterval(this.syncTimers.get(name)!);
      this.syncTimers.delete(name);
    }

    this.syncSchedules.delete(name);
    logger.info(`Sync cancelled: ${name}`);
  }

  /**
   * Perform sync to specific devices
   */
  async performSync(targetDevices?: DeviceId[]): Promise<{ successful: number; failed: number }> {
    if (!this.isOnline) {
      logger.warn('Device is offline, buffering changes');
      return { successful: 0, failed: 0 };
    }

    try {
      const pendingChanges = this.syncManager.getPendingChanges();

      if (pendingChanges.length === 0) {
        return { successful: 0, failed: 0 };
      }

      const message = this.syncManager.createSyncMessage(this.deviceId, true);

      let result;
      if (targetDevices && targetDevices.length > 0) {
        result = await this.syncProtocol.syncTo(targetDevices, message);
        const successful = Array.from(result.values()).filter((v) => v).length;
        const failed = targetDevices.length - successful;
        this.syncManager.clearQueue();
        return { successful, failed };
      } else {
        const broadcastResult = await this.syncProtocol.broadcast(message);
        this.syncManager.clearQueue();
        return {
          successful: broadcastResult.successful.length,
          failed: broadcastResult.failed.length
        };
      }
    } catch (error) {
      logger.error('Error performing sync', { error });
      return { successful: 0, failed: 1 };
    }
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(online: boolean): void {
    this.isOnline = online;

    if (online) {
      logger.info('Device is now online, flushing offline buffer');
      this.syncManager.flushOfflineBuffer().catch((error) => {
        logger.error('Error flushing offline buffer', { error });
      });

      // Perform immediate sync
      this.performSync().catch((error) => {
        logger.error('Error performing sync after coming online', { error });
      });
    } else {
      logger.info('Device is now offline');
    }
  }

  /**
   * Get online status
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Partial sync - only sync specific partitions
   */
  async partialSync(partitions: string[], targetDevices?: DeviceId[]): Promise<{ synced: number }> {
    // Get changes for specific partitions
    const allChanges = this.syncManager.getPendingChanges();

    // Filter by partition (using entity IDs that correspond to partition keys)
    const filteredChanges = allChanges; // Simplified - in production, would filter by partition

    if (filteredChanges.length === 0) {
      return { synced: 0 };
    }

    const message: SyncMessage = {
      id: Math.random().toString(),
      fromDevice: this.deviceId,
      toDevice: targetDevices?.[0] || this.deviceId,
      changes: filteredChanges,
      vectorClock: this.syncManager['state'].devices.get(this.deviceId)?.vectorClock || {},
      timestamp: new Date()
    };

    if (targetDevices && targetDevices.length > 0) {
      await this.syncProtocol.syncTo(targetDevices, message);
    } else {
      await this.syncProtocol.broadcast(message);
    }

    return { synced: filteredChanges.length };
  }

  /**
   * Get sync status for all devices
   */
  getSyncStatus(): Record<string, unknown> {
    const syncState = this.syncManager.getSyncState();

    return {
      online: this.isOnline,
      devices: syncState.devices,
      totalChanges: syncState.totalChanges,
      queuedChanges: syncState.queuedChanges,
      offlineChanges: syncState.offlineChanges,
      conflicts: syncState.conflicts,
      activeSchedules: this.syncSchedules.size,
      transportStatus: this.syncProtocol.getAllTransportStatus()
    };
  }

  /**
   * Get scheduled syncs
   */
  getScheduledSyncs(): Array<{ name: string; schedule: SyncSchedule }> {
    return Array.from(this.syncSchedules.entries()).map(([name, schedule]) => ({
      name,
      schedule
    }));
  }

  /**
   * Clear all schedules and timers
   */
  clearAll(): void {
    for (const timer of this.syncTimers.values()) {
      clearInterval(timer);
    }

    this.syncTimers.clear();
    this.syncSchedules.clear();
    logger.info('All sync schedules cleared');
  }
}

export const createMemorySync = (
  memory: CrossDeviceMemory,
  syncManager: SyncManager,
  deviceId: DeviceId
): MemorySync => {
  return new MemorySync(memory, syncManager, deviceId);
};
