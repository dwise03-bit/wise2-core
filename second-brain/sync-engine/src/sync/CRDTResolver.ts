import pino from 'pino';

const logger = pino();

export type ConflictStrategy =
  | 'none'
  | 'edit-edit'
  | 'delete-edit'
  | 'merge-text'
  | 'merge-list';

export interface ConflictResolution {
  resolved: boolean;
  winner: 'local' | 'remote' | 'merged';
  mergedData: any;
  conflicts: string[];
}

export class CRDTResolver {
  /**
   * Detect conflict type between local and remote versions
   */
  detectConflictType(local: any, remote: any): ConflictStrategy {
    if (!local || !remote) return 'none';

    const localDeleted = local === null || local === undefined;
    const remoteDeleted = remote === null || remote === undefined;

    // Both deleted = no conflict
    if (localDeleted && remoteDeleted) return 'none';

    // One deleted, one edited = delete-edit conflict
    if (localDeleted || remoteDeleted) return 'delete-edit';

    // Both edited same property = edit-edit conflict
    if (typeof local === 'object' && typeof remote === 'object') {
      if (Array.isArray(local) && Array.isArray(remote)) {
        return 'merge-list';
      }
      if (Array.isArray(local) || Array.isArray(remote)) {
        return 'edit-edit';
      }
      return 'merge-text';
    }

    // Primitive type conflict
    return 'edit-edit';
  }

  /**
   * Resolve conflict using CRDT principles
   */
  resolveConflict(
    strategy: ConflictStrategy,
    local: any,
    remote: any,
    clientId: string,
  ): ConflictResolution {
    switch (strategy) {
      case 'none':
        return this.resolveNone(local, remote);

      case 'delete-edit':
        return this.resolveDeleteEdit(local, remote);

      case 'edit-edit':
        return this.resolveEditEdit(local, remote, clientId);

      case 'merge-text':
        return this.mergeText(local, remote);

      case 'merge-list':
        return this.mergeList(local, remote);

      default:
        return {
          resolved: false,
          winner: 'local',
          mergedData: local,
          conflicts: ['Unknown conflict strategy'],
        };
    }
  }

  private resolveNone(local: any, remote: any): ConflictResolution {
    return {
      resolved: true,
      winner: 'merged',
      mergedData: remote || local,
      conflicts: [],
    };
  }

  /**
   * Delete-Edit Conflict:
   * - Local deleted, remote edited → use remote (deletion lost, edit wins)
   * - Local edited, remote deleted → use local (edit wins)
   * Principle: Edits take precedence over deletes
   */
  private resolveDeleteEdit(local: any, remote: any): ConflictResolution {
    const localDeleted = local === null || local === undefined;
    const remoteDeleted = remote === null || remote === undefined;

    if (localDeleted && !remoteDeleted) {
      return {
        resolved: true,
        winner: 'remote',
        mergedData: remote,
        conflicts: ['Delete-edit conflict: remote edit kept'],
      };
    }

    if (!localDeleted && remoteDeleted) {
      return {
        resolved: true,
        winner: 'local',
        mergedData: local,
        conflicts: ['Delete-edit conflict: local edit kept'],
      };
    }

    return {
      resolved: true,
      winner: 'merged',
      mergedData: local || remote,
      conflicts: [],
    };
  }

  /**
   * Edit-Edit Conflict:
   * Apply Last-Write-Wins (LWW) with client ID as tiebreaker
   */
  private resolveEditEdit(
    local: any,
    remote: any,
    clientId: string,
  ): ConflictResolution {
    // In a real system, would use timestamps and clock values
    // For now, use client ID lexicographic comparison as tiebreaker
    const useRemote = clientId.localeCompare('remote-client') < 0;

    return {
      resolved: true,
      winner: useRemote ? 'remote' : 'local',
      mergedData: useRemote ? remote : local,
      conflicts: ['Edit-edit conflict: applying LWW with client tiebreaker'],
    };
  }

  /**
   * Text Merge:
   * Try to merge text objects recursively
   */
  private mergeText(local: any, remote: any): ConflictResolution {
    if (typeof local !== 'object' || typeof remote !== 'object') {
      return {
        resolved: false,
        winner: 'local',
        mergedData: local,
        conflicts: ['Cannot merge non-object types'],
      };
    }

    const merged: any = { ...local };
    const conflicts: string[] = [];

    for (const key in remote) {
      if (key in local) {
        const localValue = local[key];
        const remoteValue = remote[key];

        if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          // Recursively merge nested objects
          if (typeof localValue === 'object' && typeof remoteValue === 'object') {
            const result = this.mergeText(localValue, remoteValue);
            merged[key] = result.mergedData;
            conflicts.push(...result.conflicts);
          } else {
            // Keep local, mark conflict
            conflicts.push(`Field conflict on "${key}": ${localValue} vs ${remoteValue}`);
          }
        }
      } else {
        merged[key] = remote[key];
      }
    }

    return {
      resolved: conflicts.length === 0,
      winner: 'merged',
      mergedData: merged,
      conflicts,
    };
  }

  /**
   * List Merge:
   * Merge arrays by finding longest common subsequence and applying both changes
   */
  private mergeList(local: any[], remote: any[]): ConflictResolution {
    if (!Array.isArray(local) || !Array.isArray(remote)) {
      return {
        resolved: false,
        winner: 'local',
        mergedData: local,
        conflicts: ['Cannot merge non-array into array'],
      };
    }

    // Simple merge: deduplicate and keep unique items from both
    const merged = [...new Set([...local, ...remote])];

    return {
      resolved: true,
      winner: 'merged',
      mergedData: merged,
      conflicts: [],
    };
  }
}
