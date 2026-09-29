import { EventEmitter } from 'events';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { OfflineDB } from './OfflineDB';
import { LocalAgent } from './LocalAgent';
import { HardwareInterface } from './HardwareInterface';
import { VoiceAssistant } from './VoiceAssistant';
import { AutomationEngine } from './AutomationEngine';
import { SyncManager } from './SyncManager';
import { HealthMonitor } from './HealthMonitor';

export interface EdgeRuntimeConfig {
  nodeId: string;
  cloudUrl: string;
  apiKey: string;
  localDbPath: string;
  modelPath: string;
  voiceModel: string;
  wireguardConfigPath: string;
  offlineMode: boolean;
  port: number;
  environment: 'production' | 'development' | 'testing';
}

export interface RuntimeStatus {
  nodeId: string;
  status: 'initializing' | 'ready' | 'degraded' | 'error' | 'offline';
  uptime: number;
  version: string;
  components: {
    database: 'ready' | 'error' | 'offline';
    agent: 'ready' | 'error' | 'offline';
    hardware: 'ready' | 'error' | 'offline';
    voice: 'ready' | 'error' | 'offline';
    automation: 'ready' | 'error' | 'offline';
    sync: 'ready' | 'error' | 'offline';
    health: 'ready' | 'error' | 'offline';
  };
  connectivity: {
    cloud: boolean;
    localNetwork: boolean;
    vpn: boolean;
  };
  lastSync: number;
  pendingSync: number;
}

export class EdgeRuntime extends EventEmitter {
  private config: EdgeRuntimeConfig;
  private logger: pino.Logger;
  private db: OfflineDB | null = null;
  private agent: LocalAgent | null = null;
  private hardware: HardwareInterface | null = null;
  private voice: VoiceAssistant | null = null;
  private automation: AutomationEngine | null = null;
  private sync: SyncManager | null = null;
  private health: HealthMonitor | null = null;
  private status: RuntimeStatus;
  private initialized: boolean = false;
  private startTime: number = 0;

  constructor(config: EdgeRuntimeConfig) {
    super();
    this.config = config;
    this.startTime = Date.now();
    this.status = {
      nodeId: config.nodeId,
      status: 'initializing',
      uptime: 0,
      version: '1.0.0',
      components: {
        database: 'offline',
        agent: 'offline',
        hardware: 'offline',
        voice: 'offline',
        automation: 'offline',
        sync: 'offline',
        health: 'offline',
      },
      connectivity: {
        cloud: false,
        localNetwork: false,
        vpn: false,
      },
      lastSync: 0,
      pendingSync: 0,
    };

    this.logger = pino(
      {
        level: config.environment === 'development' ? 'debug' : 'info',
        transport:
          config.environment === 'development'
            ? { target: 'pino-pretty' }
            : undefined,
      },
      pino.destination(`/var/log/wise2-edge-appliance/${config.nodeId}.log`)
    );
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('EdgeRuntime already initialized');
      return;
    }

    this.logger.info(
      { nodeId: this.config.nodeId },
      'Initializing WISE² Edge Appliance Runtime'
    );

    try {
      // Initialize database first - everything depends on it
      this.db = new OfflineDB(this.config.localDbPath, this.logger);
      await this.db.initialize();
      this.status.components.database = 'ready';
      this.logger.info('Database initialized');

      // Initialize hardware interface
      this.hardware = new HardwareInterface(this.logger);
      await this.hardware.initialize();
      this.status.components.hardware = 'ready';
      this.logger.info('Hardware interface initialized');

      // Initialize local AI agent
      this.agent = new LocalAgent(this.config.modelPath, this.logger);
      await this.agent.initialize();
      this.status.components.agent = 'ready';
      this.logger.info('Local AI agent initialized');

      // Initialize voice assistant
      this.voice = new VoiceAssistant(this.config.voiceModel, this.logger);
      await this.voice.initialize();
      this.status.components.voice = 'ready';
      this.logger.info('Voice assistant initialized');

      // Initialize automation engine
      this.automation = new AutomationEngine(this.db, this.logger);
      await this.automation.initialize();
      this.status.components.automation = 'ready';
      this.logger.info('Automation engine initialized');

      // Initialize sync manager
      this.sync = new SyncManager(
        this.config.cloudUrl,
        this.config.apiKey,
        this.config.wireguardConfigPath,
        this.db,
        this.logger
      );
      await this.sync.initialize();
      this.status.components.sync = 'ready';
      this.logger.info('Sync manager initialized');

      // Initialize health monitor
      this.health = new HealthMonitor(this, this.logger);
      await this.health.initialize();
      this.status.components.health = 'ready';
      this.logger.info('Health monitor initialized');

      // Set up event listeners
      this.setupEventListeners();

      this.initialized = true;
      this.status.status = 'ready';
      this.emit('ready');
      this.logger.info(
        { nodeId: this.config.nodeId },
        'WISE² Edge Appliance Runtime ready'
      );
    } catch (error) {
      this.status.status = 'error';
      this.logger.error(error, 'Fatal error during initialization');
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.sync) throw new Error('Sync manager not initialized');
    if (!this.automation) throw new Error('Automation engine not initialized');
    if (!this.voice) throw new Error('Voice assistant not initialized');

    // Listen for cloud connectivity changes
    this.sync.on('connected', () => {
      this.status.connectivity.cloud = true;
      this.logger.info('Connected to cloud');
      this.emit('cloud:connected');
    });

    this.sync.on('disconnected', () => {
      this.status.connectivity.cloud = false;
      this.logger.warn('Disconnected from cloud, switching to offline mode');
      this.emit('cloud:disconnected');
    });

    // Listen for sync events
    this.sync.on('sync:start', () => {
      this.logger.debug('Starting sync with cloud');
    });

    this.sync.on('sync:complete', () => {
      this.status.lastSync = Date.now();
      this.logger.info('Sync complete');
      this.emit('sync:complete');
    });

    this.sync.on('sync:error', (error: Error) => {
      this.logger.error(error, 'Sync error');
      this.emit('sync:error', error);
    });

    // Listen for automation events
    this.automation.on('trigger:fired', (triggerId: string, data: unknown) => {
      this.logger.info({ triggerId, data }, 'Automation trigger fired');
      this.emit('automation:trigger', { triggerId, data });
    });

    this.automation.on('error', (error: Error) => {
      this.logger.error(error, 'Automation engine error');
    });

    // Listen for voice events
    this.voice.on('wake-word', () => {
      this.logger.info('Wake word detected');
      this.emit('voice:wake');
    });

    this.voice.on('command', (command: string) => {
      this.logger.info({ command }, 'Voice command received');
      this.handleVoiceCommand(command).catch((error) => {
        this.logger.error(error, 'Error handling voice command');
      });
    });

    this.voice.on('error', (error: Error) => {
      this.logger.error(error, 'Voice assistant error');
    });
  }

  private async handleVoiceCommand(command: string): Promise<void> {
    if (!this.agent || !this.db) {
      throw new Error('Agent or database not initialized');
    }

    try {
      const result = await this.agent.processCommand(command);
      this.logger.info({ command, result }, 'Voice command processed');
      await this.db.recordCommand({
        id: uuidv4(),
        timestamp: Date.now(),
        source: 'voice',
        command,
        result,
      });
    } catch (error) {
      this.logger.error(error, 'Failed to process voice command');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down WISE² Edge Appliance Runtime');

    try {
      // Graceful shutdown in reverse order of initialization
      if (this.health) {
        await this.health.shutdown();
        this.logger.info('Health monitor shut down');
      }

      if (this.sync) {
        await this.sync.shutdown();
        this.logger.info('Sync manager shut down');
      }

      if (this.automation) {
        await this.automation.shutdown();
        this.logger.info('Automation engine shut down');
      }

      if (this.voice) {
        await this.voice.shutdown();
        this.logger.info('Voice assistant shut down');
      }

      if (this.agent) {
        await this.agent.shutdown();
        this.logger.info('Local AI agent shut down');
      }

      if (this.hardware) {
        await this.hardware.shutdown();
        this.logger.info('Hardware interface shut down');
      }

      if (this.db) {
        await this.db.close();
        this.logger.info('Database closed');
      }

      this.initialized = false;
      this.status.status = 'offline';
      this.logger.info('WISE² Edge Appliance Runtime shut down complete');
    } catch (error) {
      this.logger.error(error, 'Error during shutdown');
      throw error;
    }
  }

  getStatus(): RuntimeStatus {
    return {
      ...this.status,
      uptime: Date.now() - this.startTime,
    };
  }

  getDatabase(): OfflineDB {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  getAgent(): LocalAgent {
    if (!this.agent) throw new Error('Agent not initialized');
    return this.agent;
  }

  getHardware(): HardwareInterface {
    if (!this.hardware) throw new Error('Hardware not initialized');
    return this.hardware;
  }

  getVoice(): VoiceAssistant {
    if (!this.voice) throw new Error('Voice not initialized');
    return this.voice;
  }

  getAutomation(): AutomationEngine {
    if (!this.automation) throw new Error('Automation engine not initialized');
    return this.automation;
  }

  getSync(): SyncManager {
    if (!this.sync) throw new Error('Sync manager not initialized');
    return this.sync;
  }

  getHealth(): HealthMonitor {
    if (!this.health) throw new Error('Health monitor not initialized');
    return this.health;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
