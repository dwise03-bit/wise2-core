import { Injectable } from '@nestjs/common';

/**
 * Version Stack Service
 * Tracks versions of mutable state (presence, chat, suggestions)
 * Detects and resolves client/server synchronization conflicts
 */

interface VersionedState {
  version: number;
  timestamp: number;
  data: any;
}

interface VersionedStateStore {
  [key: string]: VersionedState;
}

@Injectable()
export class VersionStackService {
  // In-memory store for versioned state (would use Redis in production)
  private stateStore: VersionedStateStore = {};

  /**
   * Get current versioned state
   * Returns both data and version number for client sync
   */
  get(key: string): VersionedState | null {
    return this.stateStore[key] || null;
  }

  /**
   * Set state with optimistic version checking
   * Returns true if updated, false if conflict
   */
  set(key: string, value: any, clientVersion?: number): { success: boolean; version: number; data: any } {
    const current = this.stateStore[key];
    const now = Date.now();

    // If client provides version, check it matches server
    if (clientVersion !== undefined) {
      if (!current) {
        // New key, client version should be 0
        if (clientVersion !== 0) {
          return {
            success: false,
            version: 0,
            data: null,
          };
        }
      } else if (clientVersion !== current.version) {
        // Version mismatch = conflict
        return {
          success: false,
          version: current.version,
          data: current.data,
        };
      }
    }

    // Update state
    const newVersion = (current?.version || 0) + 1;
    this.stateStore[key] = {
      version: newVersion,
      timestamp: now,
      data: value,
    };

    return {
      success: true,
      version: newVersion,
      data: value,
    };
  }

  /**
   * Increment version number (for batch updates)
   */
  increment(key: string): number {
    const current = this.stateStore[key];
    const newVersion = (current?.version || 0) + 1;

    if (!current) {
      this.stateStore[key] = {
        version: newVersion,
        timestamp: Date.now(),
        data: null,
      };
    } else {
      current.version = newVersion;
      current.timestamp = Date.now();
    }

    return newVersion;
  }

  /**
   * Merge two states with conflict resolution
   * Prefers newer timestamp if versions differ
   */
  merge(key: string, remoteState: VersionedState): VersionedState {
    const local = this.stateStore[key];

    if (!local) {
      this.stateStore[key] = remoteState;
      return remoteState;
    }

    // If remote is newer, use remote
    if (remoteState.timestamp > local.timestamp) {
      this.stateStore[key] = remoteState;
      return remoteState;
    }

    // Local is newer, keep local but bump version
    local.version = Math.max(local.version, remoteState.version) + 1;
    local.timestamp = Date.now();

    return local;
  }

  /**
   * Clear state for a key (e.g., on room end)
   */
  clear(key: string): void {
    delete this.stateStore[key];
  }

  /**
   * Get all state (for debugging)
   */
  getAll(): VersionedStateStore {
    return { ...this.stateStore };
  }

  /**
   * Prune old state (older than TTL)
   */
  prune(ttlMs: number = 3600000): void {
    const now = Date.now();
    for (const [key, state] of Object.entries(this.stateStore)) {
      if (now - state.timestamp > ttlMs) {
        delete this.stateStore[key];
      }
    }
  }
}
