import { EventEmitter } from 'events';
import pino from 'pino';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { OfflineDB } from './OfflineDB';

export interface SyncConfig {
  cloudUrl: string;
  apiKey: string;
  wireguardConfigPath: string;
  syncInterval: number; // milliseconds
  retryAttempts: number;
  retryBackoff: number;
}

export class SyncManager extends EventEmitter {
  private cloudUrl: string;
  private apiKey: string;
  private wireguardConfigPath: string;
  private db: OfflineDB;
  private logger: pino.Logger;
  private initialized: boolean = false;
  private client: AxiosInstance | null = null;
  private connected: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  private config: SyncConfig;

  constructor(
    cloudUrl: string,
    apiKey: string,
    wireguardConfigPath: string,
    db: OfflineDB,
    logger: pino.Logger
  ) {
    super();
    this.cloudUrl = cloudUrl;
    this.apiKey = apiKey;
    this.wireguardConfigPath = wireguardConfigPath;
    this.db = db;
    this.logger = logger;
    this.config = {
      cloudUrl,
      apiKey,
      wireguardConfigPath,
      syncInterval: 30000, // 30 seconds
      retryAttempts: 3,
      retryBackoff: 2,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('SyncManager already initialized');
      return;
    }

    try {
      // Initialize HTTP client with cloud
      this.initializeClient();

      // Test connectivity
      await this.testConnectivity();

      // Start sync loop
      this.startSyncLoop();

      this.initialized = true;
      this.logger.info('SyncManager initialized');
    } catch (error) {
      this.logger.warn(
        error,
        'SyncManager initialized in offline mode (cloud unavailable)'
      );
      this.connected = false;
      this.initialized = true;
    }
  }

  private initializeClient(): void {
    this.client = axios.create({
      baseURL: this.cloudUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WISE2-Edge-Appliance/1.0.0',
      },
      timeout: 10000,
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.debug({ error: error.message }, 'Cloud API error');
        return Promise.reject(error);
      }
    );
  }

  private async testConnectivity(): Promise<void> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      await this.client.get('/health');
      this.connected = true;
      this.logger.info('Connected to cloud');
      this.emit('connected');
    } catch (error) {
      this.connected = false;
      this.logger.warn('Cloud connection unavailable');
      this.emit('disconnected');
      throw error;
    }
  }

  private startSyncLoop(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);

    this.syncInterval = setInterval(async () => {
      try {
        await this.sync();
      } catch (error) {
        this.logger.error(error, 'Sync error in loop');
      }
    }, this.config.syncInterval);

    this.logger.info(
      { interval: this.config.syncInterval },
      'Sync loop started'
    );
  }

  async sync(): Promise<void> {
    if (this.isSyncing) return;
    if (!this.initialized) return;

    this.isSyncing = true;

    try {
      this.emit('sync:start');

      // Test connectivity
      if (!this.connected) {
        await this.testConnectivity().catch(() => {
          // Intentionally swallow error - already logged
        });
      }

      if (!this.connected) {
        this.logger.debug('Skipping sync - no cloud connectivity');
        this.isSyncing = false;
        return;
      }

      // Get pending sync items
      const syncQueue = this.db.getSyncQueue();

      if (syncQueue.length === 0) {
        this.logger.debug('No items in sync queue');
        this.isSyncing = false;
        return;
      }

      this.logger.info(
        { queueLength: syncQueue.length },
        'Starting sync with cloud'
      );

      // Sync items in batches
      const batchSize = 100;
      for (let i = 0; i < syncQueue.length; i += batchSize) {
        const batch = syncQueue.slice(i, i + batchSize);
        await this.syncBatch(batch);
      }

      this.logger.info(
        { itemCount: syncQueue.length },
        'Sync with cloud complete'
      );
      this.emit('sync:complete');
    } catch (error) {
      this.logger.error(error, 'Fatal sync error');
      this.emit('sync:error', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncBatch(
    batch: Array<{ id: string; type: string; tableName: string; data: unknown }>
  ): Promise<void> {
    if (!this.client || !this.connected) return;

    try {
      const payload = {
        nodeId: this.db.getState('nodeId') || uuidv4(),
        timestamp: Date.now(),
        items: batch,
      };

      const response = await this.client.post('/sync/push', payload);

      if (response.status === 200) {
        // Mark items as synced
        for (const item of batch) {
          this.db.markSynced(item.id);
        }

        this.logger.debug({ count: batch.length }, 'Batch synced');
      }
    } catch (error) {
      this.logger.error(error, 'Failed to sync batch');
      throw error;
    }
  }

  async pull(): Promise<unknown[]> {
    if (!this.client || !this.connected) {
      this.logger.debug('Cannot pull - no cloud connectivity');
      return [];
    }

    try {
      const lastSync = this.db.getState('lastPull') || 0;

      const response = await this.client.get('/sync/pull', {
        params: { since: lastSync },
      });

      const updates = response.data?.items || [];

      if (updates.length > 0) {
        // Store updates for processing
        for (const update of updates) {
          this.db.addToSyncQueue('update', update.tableName, update.data);
        }

        this.db.setState('lastPull', Date.now());
        this.logger.info({ count: updates.length }, 'Pulled updates from cloud');
      }

      return updates;
    } catch (error) {
      this.logger.error(error, 'Failed to pull from cloud');
      throw error;
    }
  }

  async uploadFile(filename: string, fileBuffer: Buffer): Promise<string> {
    if (!this.client || !this.connected) {
      throw new Error('Cannot upload file - no cloud connectivity');
    }

    try {
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), filename);

      const response = await this.client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileId = response.data?.fileId;
      this.logger.info({ filename, fileId }, 'File uploaded');

      return fileId;
    } catch (error) {
      this.logger.error(error, 'Failed to upload file');
      throw error;
    }
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    if (!this.client || !this.connected) {
      throw new Error('Cannot download file - no cloud connectivity');
    }

    try {
      const response = await this.client.get(`/files/${fileId}`, {
        responseType: 'arraybuffer',
      });

      this.logger.info({ fileId }, 'File downloaded');
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(error, 'Failed to download file');
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getSyncConfig(): SyncConfig {
    return { ...this.config };
  }

  updateSyncConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info(this.config, 'Sync config updated');
  }

  async shutdown(): Promise<void> {
    try {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      // Force final sync if connected
      if (this.connected && !this.isSyncing) {
        await this.sync();
      }

      this.initialized = false;
      this.logger.info('SyncManager shut down');
    } catch (error) {
      this.logger.error(error, 'Error during SyncManager shutdown');
      throw error;
    }
  }
}
