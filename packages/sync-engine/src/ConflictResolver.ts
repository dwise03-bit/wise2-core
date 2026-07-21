import { Change, ChangeType, ConflictInfo, EntityId, VectorClock } from './types';
import { VectorClockManager } from './VectorClock';

export enum ConflictResolutionStrategy {
  LastWrite = 'last_write',
  FirstWrite = 'first_write',
  Merge = 'merge',
  HigherPriority = 'higher_priority',
  Manual = 'manual'
}

/**
 * Conflict resolver for concurrent changes
 */
export class ConflictResolver {
  constructor(private strategy: ConflictResolutionStrategy = ConflictResolutionStrategy.LastWrite) {}

  /**
   * Check if two changes conflict
   */
  conflicts(change1: Change, change2: Change): boolean {
    // Same entity, different devices, different timestamps
    if (change1.entityId !== change2.entityId) {
      return false;
    }

    // Both operations on same entity but concurrent (neither happened before the other)
    if (VectorClockManager.concurrent(change1.vectorClock, change2.vectorClock)) {
      return true;
    }

    // If one happened before the other, no conflict
    return false;
  }

  /**
   * Resolve conflicts between changes
   */
  resolve(changes: Change[], entityId: EntityId): ConflictInfo {
    const timestamp = new Date();

    // Filter changes for this entity
    const relevantChanges = changes.filter((c) => c.entityId === entityId);

    if (relevantChanges.length <= 1) {
      return {
        conflictingChanges: relevantChanges,
        resolution: 'merge',
        resolvedValue: relevantChanges[0]?.data,
        timestamp
      };
    }

    let resolution: ConflictInfo;

    switch (this.strategy) {
      case ConflictResolutionStrategy.LastWrite:
        resolution = this.resolveByLastWrite(relevantChanges, timestamp);
        break;

      case ConflictResolutionStrategy.FirstWrite:
        resolution = this.resolveByFirstWrite(relevantChanges, timestamp);
        break;

      case ConflictResolutionStrategy.Merge:
        resolution = this.resolveByMerge(relevantChanges, timestamp);
        break;

      case ConflictResolutionStrategy.HigherPriority:
        resolution = this.resolveByPriority(relevantChanges, timestamp);
        break;

      case ConflictResolutionStrategy.Manual:
        resolution = {
          conflictingChanges: relevantChanges,
          resolution: 'manual',
          timestamp
        };
        break;

      default:
        resolution = this.resolveByLastWrite(relevantChanges, timestamp);
    }

    return resolution;
  }

  /**
   * Last Write Wins (LWW) - most recent write takes precedence
   */
  private resolveByLastWrite(changes: Change[], timestamp: Date): ConflictInfo {
    const sorted = [...changes].sort((a, b) => {
      // First by timestamp
      if (a.timestamp.getTime() !== b.timestamp.getTime()) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }

      // Then by device ID (for determinism)
      return b.deviceId.localeCompare(a.deviceId);
    });

    const winner = sorted[0];

    return {
      conflictingChanges: changes,
      resolution: 'take_remote',
      resolvedValue: winner.data,
      timestamp
    };
  }

  /**
   * First Write Wins (FWW) - earliest write takes precedence
   */
  private resolveByFirstWrite(changes: Change[], timestamp: Date): ConflictInfo {
    const sorted = [...changes].sort((a, b) => {
      if (a.timestamp.getTime() !== b.timestamp.getTime()) {
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
      return a.deviceId.localeCompare(b.deviceId);
    });

    const winner = sorted[0];

    return {
      conflictingChanges: changes,
      resolution: 'take_local',
      resolvedValue: winner.data,
      timestamp
    };
  }

  /**
   * Merge - combine values (for arrays/objects)
   */
  private resolveByMerge(changes: Change[], timestamp: Date): ConflictInfo {
    const resolvedValue = this.mergeValues(changes.map((c) => c.data));

    return {
      conflictingChanges: changes,
      resolution: 'merge',
      resolvedValue,
      timestamp
    };
  }

  /**
   * Priority-based resolution - higher priority source wins
   */
  private resolveByPriority(changes: Change[], timestamp: Date): ConflictInfo {
    // Device priority mapping
    const priorityMap: Record<string, number> = {
      cloud: 100,
      vps: 80,
      'raspberry-pi': 50,
      desktop: 60,
      mobile: 40,
      web: 30
    };

    const sorted = [...changes].sort((a, b) => {
      const aPriority = priorityMap[a.deviceId] || 0;
      const bPriority = priorityMap[b.deviceId] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    const winner = sorted[0];

    return {
      conflictingChanges: changes,
      resolution: 'take_remote',
      resolvedValue: winner.data,
      timestamp
    };
  }

  /**
   * Merge multiple values
   */
  private mergeValues(values: unknown[]): unknown {
    // For objects, do a shallow merge
    if (values.every((v) => typeof v === 'object' && v !== null && !Array.isArray(v))) {
      const merged: Record<string, unknown> = {};
      for (const val of values) {
        Object.assign(merged, val);
      }
      return merged;
    }

    // For arrays, combine and deduplicate
    if (values.every((v) => Array.isArray(v))) {
      return Array.from(new Set(([] as unknown[]).concat(...values)));
    }

    // For primitives, take the last one
    return values[values.length - 1];
  }

  /**
   * Apply tombstone deletion
   */
  static applyTombstone(change: Change): Change {
    return {
      ...change,
      type: ChangeType.Delete,
      tombstone: true,
      data: undefined
    };
  }

  /**
   * Check if change is a tombstone (deletion marker)
   */
  static isTombstone(change: Change): boolean {
    return change.tombstone === true || change.type === ChangeType.Delete;
  }

  /**
   * Compact changes by removing obsolete ones
   */
  static compact(changes: Change[]): Change[] {
    const latest = new Map<EntityId, Change>();

    // For each entity, keep only the latest change
    for (const change of changes) {
      const current = latest.get(change.entityId);

      if (!current) {
        latest.set(change.entityId, change);
      } else {
        // Keep if this change is newer
        if (VectorClockManager.happenedBefore(current.vectorClock, change.vectorClock)) {
          latest.set(change.entityId, change);
        }
      }
    }

    // Filter out tombstones unless they're the latest
    return Array.from(latest.values()).filter((change) => {
      if (this.isTombstone(change)) {
        // Keep tombstones that are needed for deletion marker
        return true;
      }
      return true;
    });
  }
}

export const createConflictResolver = (strategy?: ConflictResolutionStrategy): ConflictResolver => {
  return new ConflictResolver(strategy);
};
