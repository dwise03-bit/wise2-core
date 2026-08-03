/**
 * Shared types for sync engine
 */

export type DeviceId = string & { readonly __brand: 'DeviceId' };
export type EntityId = string & { readonly __brand: 'EntityId' };
export type ChangeId = string & { readonly __brand: 'ChangeId' };

export enum SyncStatus {
  Offline = 'offline',
  Online = 'online',
  Syncing = 'syncing',
  Error = 'error'
}

export enum ChangeType {
  Create = 'create',
  Update = 'update',
  Delete = 'delete'
}

export interface VectorClock {
  [deviceId: string]: number;
}

export interface Change<T = unknown> {
  id: ChangeId;
  deviceId: DeviceId;
  entityId: EntityId;
  type: ChangeType;
  timestamp: Date;
  data: T;
  vectorClock: VectorClock;
  hash: string;
  tombstone?: boolean;
}

export interface SyncMessage<T = unknown> {
  id: string;
  fromDevice: DeviceId;
  toDevice: DeviceId;
  changes: Change<T>[];
  vectorClock: VectorClock;
  timestamp: Date;
}

export interface ConflictInfo {
  conflictingChanges: Change[];
  resolution: 'merge' | 'take_local' | 'take_remote' | 'manual';
  resolvedValue?: unknown;
  timestamp: Date;
}

export interface DeviceInfo {
  id: DeviceId;
  name: string;
  type: 'cloud' | 'vps' | 'raspberry-pi' | 'desktop' | 'mobile' | 'web';
  lastSeen: Date;
  status: SyncStatus;
  vectorClock: VectorClock;
}

export interface SyncState {
  deviceId: DeviceId;
  devices: Map<DeviceId, DeviceInfo>;
  changes: Map<ChangeId, Change>;
  offlineBuffer: Change[];
  conflictLog: Map<EntityId, ConflictInfo[]>;
}
