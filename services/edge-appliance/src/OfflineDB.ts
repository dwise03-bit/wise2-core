import Database from 'better-sqlite3';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

export interface CommandRecord {
  id: string;
  timestamp: number;
  source: 'voice' | 'api' | 'automation' | 'sync';
  command: string;
  result: unknown;
}

export interface TriggerRecord {
  id: string;
  name: string;
  type: 'cron' | 'webhook' | 'gpio' | 'event';
  config: Record<string, unknown>;
  lastFired: number;
  enabled: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'record' | 'update' | 'delete';
  tableName: string;
  data: unknown;
  timestamp: number;
  synced: boolean;
}

export interface LocalState {
  key: string;
  value: unknown;
  timestamp: number;
}

export class OfflineDB {
  private dbPath: string;
  private db: Database.Database | null = null;
  private logger: pino.Logger;
  private initialized: boolean = false;

  constructor(dbPath: string, logger: pino.Logger) {
    this.dbPath = dbPath;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('OfflineDB already initialized');
      return;
    }

    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');

      await this.createTables();
      this.initialized = true;
      this.logger.info({ path: this.dbPath }, 'OfflineDB initialized');
    } catch (error) {
      this.logger.error(error, 'Failed to initialize OfflineDB');
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Commands table - history of all commands executed
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commands (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        source TEXT NOT NULL,
        command TEXT NOT NULL,
        result TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_commands_timestamp ON commands(timestamp);
      CREATE INDEX IF NOT EXISTS idx_commands_source ON commands(source);
    `);

    // Triggers table - automation triggers configuration
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS triggers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL,
        last_fired INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_triggers_name ON triggers(name);
      CREATE INDEX IF NOT EXISTS idx_triggers_type ON triggers(type);
      CREATE INDEX IF NOT EXISTS idx_triggers_enabled ON triggers(enabled);
    `);

    // Sync queue table - items waiting to sync with cloud
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_timestamp ON sync_queue(timestamp);
    `);

    // Local state table - key-value store for runtime state
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS local_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Errors table - error logging for diagnostics
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS errors (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        service TEXT NOT NULL,
        error TEXT NOT NULL,
        stack_trace TEXT,
        context TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON errors(timestamp);
      CREATE INDEX IF NOT EXISTS idx_errors_service ON errors(service);
    `);

    // Metrics table - performance and health metrics
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        tags TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
      CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
    `);

    this.logger.info('Database tables created');
  }

  recordCommand(command: CommandRecord): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT INTO commands (id, timestamp, source, command, result)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        command.id,
        command.timestamp,
        command.source,
        command.command,
        JSON.stringify(command.result)
      );

      // Also add to sync queue if connected
      this.addToSyncQueue('record', 'commands', command);
    } catch (error) {
      this.logger.error(error, 'Failed to record command');
      throw error;
    }
  }

  saveTrigger(trigger: TriggerRecord): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT INTO triggers (id, name, type, config, enabled)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          type=excluded.type,
          config=excluded.config,
          enabled=excluded.enabled,
          updated_at=CURRENT_TIMESTAMP
      `);

      stmt.run(
        trigger.id,
        trigger.name,
        trigger.type,
        JSON.stringify(trigger.config),
        trigger.enabled ? 1 : 0
      );

      this.addToSyncQueue('update', 'triggers', trigger);
    } catch (error) {
      this.logger.error(error, 'Failed to save trigger');
      throw error;
    }
  }

  getTriggers(): TriggerRecord[] {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare('SELECT * FROM triggers WHERE enabled = 1');
      const rows = stmt.all() as Array<{
        id: string;
        name: string;
        type: string;
        config: string;
        last_fired: number;
        enabled: number;
      }>;

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type as 'cron' | 'webhook' | 'gpio' | 'event',
        config: JSON.parse(row.config),
        lastFired: row.last_fired,
        enabled: row.enabled === 1,
      }));
    } catch (error) {
      this.logger.error(error, 'Failed to get triggers');
      throw error;
    }
  }

  updateTriggerFired(triggerId: string): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(
        'UPDATE triggers SET last_fired = ? WHERE id = ?'
      );
      stmt.run(Date.now(), triggerId);
    } catch (error) {
      this.logger.error(error, 'Failed to update trigger fired time');
      throw error;
    }
  }

  addToSyncQueue(
    type: 'record' | 'update' | 'delete',
    tableName: string,
    data: unknown
  ): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT INTO sync_queue (id, type, table_name, data, timestamp, synced)
        VALUES (?, ?, ?, ?, ?, 0)
      `);

      stmt.run(
        uuidv4(),
        type,
        tableName,
        JSON.stringify(data),
        Date.now()
      );
    } catch (error) {
      this.logger.error(error, 'Failed to add to sync queue');
      throw error;
    }
  }

  getSyncQueue(): SyncQueueItem[] {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(
        'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC'
      );
      const rows = stmt.all() as Array<{
        id: string;
        type: string;
        table_name: string;
        data: string;
        timestamp: number;
        synced: number;
      }>;

      return rows.map((row) => ({
        id: row.id,
        type: row.type as 'record' | 'update' | 'delete',
        tableName: row.table_name,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        synced: row.synced === 1,
      }));
    } catch (error) {
      this.logger.error(error, 'Failed to get sync queue');
      throw error;
    }
  }

  markSynced(id: string): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare('UPDATE sync_queue SET synced = 1 WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      this.logger.error(error, 'Failed to mark item as synced');
      throw error;
    }
  }

  getState(key: string): unknown | null {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare('SELECT value FROM local_state WHERE key = ?');
      const row = stmt.get(key) as { value: string } | undefined;
      return row ? JSON.parse(row.value) : null;
    } catch (error) {
      this.logger.error(error, 'Failed to get state');
      throw error;
    }
  }

  setState(key: string, value: unknown): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT INTO local_state (key, value, timestamp)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value=excluded.value,
          timestamp=excluded.timestamp,
          updated_at=CURRENT_TIMESTAMP
      `);

      stmt.run(key, JSON.stringify(value), Date.now());
    } catch (error) {
      this.logger.error(error, 'Failed to set state');
      throw error;
    }
  }

  recordError(service: string, error: Error, context?: unknown): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT INTO errors (id, timestamp, service, error, stack_trace, context)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        uuidv4(),
        Date.now(),
        service,
        error.message,
        error.stack,
        context ? JSON.stringify(context) : null
      );
    } catch (dbError) {
      this.logger.error(dbError, 'Failed to record error');
    }
  }

  recordMetric(
    metricName: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT INTO metrics (id, timestamp, metric_name, metric_value, tags)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        uuidv4(),
        Date.now(),
        metricName,
        value,
        tags ? JSON.stringify(tags) : null
      );
    } catch (error) {
      this.logger.error(error, 'Failed to record metric');
    }
  }

  getMetrics(
    metricName: string,
    limit: number = 1000
  ): Array<{ value: number; timestamp: number }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        SELECT metric_value, timestamp FROM metrics
        WHERE metric_name = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);

      const rows = stmt.all(metricName, limit) as Array<{
        metric_value: number;
        timestamp: number;
      }>;
      return rows;
    } catch (error) {
      this.logger.error(error, 'Failed to get metrics');
      throw error;
    }
  }

  async close(): Promise<void> {
    if (!this.db) return;

    try {
      this.db.close();
      this.db = null;
      this.initialized = false;
      this.logger.info('OfflineDB closed');
    } catch (error) {
      this.logger.error(error, 'Error closing database');
      throw error;
    }
  }
}
