/**
 * Wise² Memory Engine - Cross-Device Memory Synchronization
 * Unified memory management across cloud, VPS, Raspberry Pi, and personal devices
 */

export * from './CrossDeviceMemory';
export * from './MemorySync';
export { logger } from './logger';

import { CrossDeviceMemory, createCrossDeviceMemory } from './CrossDeviceMemory';
import { MemorySync, createMemorySync } from './MemorySync';
import { createSyncManager, DeviceId } from '@wise2/sync-engine';

/**
 * Create complete memory engine with sync
 */
export function createMemoryEngine(deviceId: string) {
  const deviceIdTyped = deviceId as DeviceId;
  const syncManager = createSyncManager(deviceIdTyped);
  const memory = new CrossDeviceMemory(deviceIdTyped);
  const sync = new MemorySync(memory, syncManager, deviceIdTyped);

  return {
    memory,
    sync,
    syncManager
  };
}

export type { SyncSchedule } from './MemorySync';
export type { MemoryEntry, MemoryPartition } from './CrossDeviceMemory';
