import { v4 as uuid } from 'uuid';
import * as Y from 'yjs';
import { VaultStateManager } from '../vault/VaultStateManager.js';
import { CRDTResolver } from './CRDTResolver.js';
import pino from 'pino';

const logger = pino();

export interface SyncUpdate {
  id: string;
  docId: string;
  clientId: string;
  timestamp: number;
  changes: any;
  version: number;
}

export interface ConflictResolutionResult {
  resolved: boolean;
  winner: 'local' | 'remote' | 'merged';
  data: any;
  conflicts: string[];
}

export class SyncManager {
  private ydocs: Map<string, Y.Doc> = new Map();
  private updateHistory: Map<string, SyncUpdate[]> = new Map();
  private crdt: CRDTResolver = new CRDTResolver();
  private vaultManager: VaultStateManager;

  constructor(vaultManager: VaultStateManager) {
    this.vaultManager = vaultManager;
  }

  /**
   * Initialize a new document for sync
   */
  initializeDocument(docId: string): Y.Doc {
    if (!this.ydocs.has(docId)) {
      const ydoc = new Y.Doc();
      this.ydocs.set(docId, ydoc);
      this.updateHistory.set(docId, []);
      logger.info(`Initialized document: ${docId}`);
    }
    return this.ydocs.get(docId)!;
  }

  /**
   * Apply remote update to document
   */
  applyUpdate(docId: string, update: Uint8Array, clientId: string): ConflictResolutionResult {
    const ydoc = this.initializeDocument(docId);

    try {
      Y.applyUpdate(ydoc, update, { local: false });

      const history = this.updateHistory.get(docId) || [];
      const syncUpdate: SyncUpdate = {
        id: uuid(),
        docId,
        clientId,
        timestamp: Date.now(),
        changes: update,
        version: history.length + 1,
      };

      history.push(syncUpdate);
      this.updateHistory.set(docId, history);

      logger.info(`Applied update to ${docId} from client ${clientId}`);

      return {
        resolved: true,
        winner: 'merged',
        data: this.getDocumentState(docId),
        conflicts: [],
      };
    } catch (error) {
      logger.error(`Failed to apply update: ${error}`);
      return {
        resolved: false,
        winner: 'local',
        data: this.getDocumentState(docId),
        conflicts: [String(error)],
      };
    }
  }

  /**
   * Detect and resolve conflicts between versions
   */
  resolveConflict(
    docId: string,
    localVersion: any,
    remoteVersion: any,
    clientId: string,
  ): ConflictResolutionResult {
    const strategy = this.crdt.detectConflictType(localVersion, remoteVersion);
    const resolved = this.crdt.resolveConflict(strategy, localVersion, remoteVersion, clientId);

    return {
      resolved: resolved.resolved,
      winner: resolved.winner,
      data: resolved.mergedData,
      conflicts: resolved.conflicts,
    };
  }

  /**
   * Get full document state
   */
  getDocumentState(docId: string): any {
    const ydoc = this.ydocs.get(docId);
    if (!ydoc) return null;

    const ymap = ydoc.getMap('root');
    return ymap.toJSON();
  }

  /**
   * Get document update since version
   */
  getUpdateSince(docId: string, version: number): Uint8Array | null {
    const ydoc = this.ydocs.get(docId);
    if (!ydoc) return null;

    // Get state vector of previous version
    const history = this.updateHistory.get(docId) || [];
    if (version === 0) {
      return Y.encodeStateAsUpdate(ydoc);
    }

    // Reconstruct state at version and get diff
    if (version < history.length) {
      // Return updates since that version
      const updates = history.slice(version).map(h => h.changes as Uint8Array);
      // Merge updates into single update
      const merged = Y.mergeUpdates(updates);
      return merged;
    }

    return null;
  }

  /**
   * Sync checkpoint for incremental sync
   */
  getSyncCheckpoint(docId: string): { version: number; hash: string } {
    const ydoc = this.ydocs.get(docId);
    if (!ydoc) return { version: 0, hash: '' };

    const history = this.updateHistory.get(docId) || [];
    const state = Y.encodeStateAsUpdate(ydoc);
    const hash = this.hashUpdate(state);

    return {
      version: history.length,
      hash,
    };
  }

  /**
   * Merge multiple documents
   */
  mergeDocuments(docId: string, otherDocId: string): ConflictResolutionResult {
    const doc1 = this.ydocs.get(docId);
    const doc2 = this.ydocs.get(otherDocId);

    if (!doc1 || !doc2) {
      return {
        resolved: false,
        winner: 'local',
        data: null,
        conflicts: ['One or both documents not found'],
      };
    }

    const update2 = Y.encodeStateAsUpdate(doc2);
    return this.applyUpdate(docId, update2, 'merge-op');
  }

  /**
   * Get sync history
   */
  getHistory(docId: string, limit: number = 50): SyncUpdate[] {
    const history = this.updateHistory.get(docId) || [];
    return history.slice(-limit);
  }

  /**
   * Garbage collect old history
   */
  pruneHistory(docId: string, keepVersions: number = 100): void {
    const history = this.updateHistory.get(docId) || [];
    if (history.length > keepVersions) {
      this.updateHistory.set(
        docId,
        history.slice(history.length - keepVersions),
      );
    }
  }

  private hashUpdate(update: Uint8Array): string {
    let hash = 0;
    for (let i = 0; i < update.length; i++) {
      hash = ((hash << 5) - hash) + update[i];
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}
