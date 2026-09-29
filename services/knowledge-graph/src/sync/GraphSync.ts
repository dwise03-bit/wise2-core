import { GraphDB } from '../GraphDB';
import { Entity, EntityType } from '../entities/Entity';
import { logger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

export interface SyncCheckpoint {
  lastSyncTime: Date;
  lastSyncId: string;
  entityCount: number;
  relationshipCount: number;
}

/**
 * Synchronization module for syncing knowledge graph with Second Brain vault
 */
export class GraphSync {
  private lastCheckpoint: SyncCheckpoint | null = null;
  private syncQueue: Array<{ type: 'entity' | 'relationship'; action: 'add' | 'update' | 'delete'; data: unknown }> = [];
  private isSyncing = false;

  constructor(
    private graph: GraphDB,
    private vaultPath: string = '~/.second_brain'
  ) {
    this.loadCheckpoint();
  }

  /**
   * Load last sync checkpoint
   */
  private loadCheckpoint(): void {
    // In production, load from persistent storage
    this.lastCheckpoint = null;
  }

  /**
   * Save sync checkpoint
   */
  private saveCheckpoint(): void {
    const stats = this.graph.getStats() as Record<string, unknown>;
    this.lastCheckpoint = {
      lastSyncTime: new Date(),
      lastSyncId: uuidv4(),
      entityCount: (stats.entityCount as number) || 0,
      relationshipCount: (stats.relationshipCount as number) || 0
    };
    logger.info(`Checkpoint saved: ${this.lastCheckpoint.lastSyncId}`);
  }

  /**
   * Queue an entity for sync
   */
  queueEntity(entity: Entity, action: 'add' | 'update' | 'delete'): void {
    this.syncQueue.push({
      type: 'entity',
      action,
      data: entity.toJSON()
    });
  }

  /**
   * Queue a relationship for sync
   */
  queueRelationship(relationship: unknown, action: 'add' | 'update' | 'delete'): void {
    this.syncQueue.push({
      type: 'relationship',
      action,
      data: relationship
    });
  }

  /**
   * Perform sync with vault
   */
  async syncWithVault(): Promise<{ success: boolean; synced: number; errors: number }> {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return { success: false, synced: 0, errors: 0 };
    }

    this.isSyncing = true;
    const start = Date.now();
    let synced = 0;
    let errors = 0;

    try {
      logger.info(`Starting sync with vault: ${this.vaultPath}`);

      // Process queue items
      for (const item of this.syncQueue) {
        try {
          await this.syncItem(item);
          synced++;
        } catch (error) {
          logger.error('Error syncing item', { error, item });
          errors++;
        }
      }

      // Clear queue
      this.syncQueue = [];

      // Save checkpoint
      this.saveCheckpoint();

      logger.info(`Sync completed: ${synced} synced, ${errors} errors (${Date.now() - start}ms)`);
      return { success: true, synced, errors };
    } catch (error) {
      logger.error('Fatal sync error', { error });
      return { success: false, synced, errors: errors + 1 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: {
    type: 'entity' | 'relationship';
    action: 'add' | 'update' | 'delete';
    data: unknown;
  }): Promise<void> {
    // In production, this would write to the vault
    logger.debug(`Syncing ${item.type}: ${item.action}`, { data: item.data });

    // Simulated write delay
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  /**
   * Pull changes from vault
   */
  async pullFromVault(): Promise<{ success: boolean; pulled: number; errors: number }> {
    const start = Date.now();
    let pulled = 0;
    let errors = 0;

    try {
      logger.info(`Pulling from vault: ${this.vaultPath}`);

      // In production, read from vault files
      // For now, simulate pull
      const changeSet = await this.readVaultChangeSet();

      for (const change of changeSet) {
        try {
          await this.applyVaultChange(change);
          pulled++;
        } catch (error) {
          logger.error('Error applying vault change', { error });
          errors++;
        }
      }

      logger.info(`Pull completed: ${pulled} pulled, ${errors} errors (${Date.now() - start}ms)`);
      return { success: true, pulled, errors };
    } catch (error) {
      logger.error('Fatal pull error', { error });
      return { success: false, pulled, errors: errors + 1 };
    }
  }

  /**
   * Read change set from vault
   */
  private async readVaultChangeSet(): Promise<Array<{ type: string; action: string; data: unknown }>> {
    // In production, read actual vault files
    return [];
  }

  /**
   * Apply vault change to graph
   */
  private async applyVaultChange(change: { type: string; action: string; data: unknown }): Promise<void> {
    // In production, parse and apply vault changes
    logger.debug(`Applying vault change: ${change.action}`, { change });
  }

  /**
   * Full sync (push then pull)
   */
  async fullSync(): Promise<{ push: { success: boolean; synced: number; errors: number }; pull: { success: boolean; pulled: number; errors: number } }> {
    logger.info('Starting full sync');

    const pushResult = await this.syncWithVault();
    const pullResult = await this.pullFromVault();

    logger.info('Full sync completed', { pushResult, pullResult });

    return { push: pushResult, pull: pullResult };
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    lastSync: Date | null;
    queuedItems: number;
    isSyncing: boolean;
    lastCheckpoint: SyncCheckpoint | null;
  } {
    return {
      lastSync: this.lastCheckpoint?.lastSyncTime || null,
      queuedItems: this.syncQueue.length,
      isSyncing: this.isSyncing,
      lastCheckpoint: this.lastCheckpoint
    };
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.syncQueue = [];
    logger.info('Sync queue cleared');
  }
}

export const createGraphSync = (graph: GraphDB, vaultPath?: string): GraphSync => {
  return new GraphSync(graph, vaultPath);
};
