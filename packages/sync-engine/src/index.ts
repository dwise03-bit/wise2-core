/**
 * Wise² Sync Engine
 * Cross-device synchronization with CRDT conflict resolution
 */

export * from './types';
export * from './VectorClock';
export * from './ConflictResolver';
export * from './SyncManager';
export * from './SyncProtocol';

import { SyncManager } from './SyncManager';
import { ConflictResolver } from './ConflictResolver';
import { SyncProtocol } from './SyncProtocol';
import { VectorClockManager } from './VectorClock';

/**
 * Create complete sync system
 */
export function createSyncSystem(deviceId: string) {
  return {
    manager: new SyncManager(deviceId as any),
    resolver: new ConflictResolver(),
    protocol: new SyncProtocol(),
    vectorClock: new VectorClockManager(deviceId as any)
  };
}
