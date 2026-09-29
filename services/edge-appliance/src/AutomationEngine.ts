import { EventEmitter } from 'events';
import pino from 'pino';
import * as cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { OfflineDB, TriggerRecord } from './OfflineDB';
import express, { Express, Request, Response } from 'express';

export interface Trigger {
  id: string;
  name: string;
  type: 'cron' | 'webhook' | 'gpio' | 'event';
  config: Record<string, unknown>;
  actions: Action[];
  enabled: boolean;
}

export interface Action {
  type: 'gpio' | 'api' | 'agent' | 'voice' | 'notification';
  config: Record<string, unknown>;
}

export class AutomationEngine extends EventEmitter {
  private db: OfflineDB;
  private logger: pino.Logger;
  private initialized: boolean = false;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private webhookServer: Express | null = null;
  private webhookPort: number = 3002;
  private triggerExecutor: Map<string, () => Promise<void>> = new Map();

  constructor(db: OfflineDB, logger: pino.Logger) {
    super();
    this.db = db;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('AutomationEngine already initialized');
      return;
    }

    try {
      // Initialize webhook server
      this.setupWebhookServer();

      // Load and register existing triggers
      await this.loadTriggersFromDB();

      this.initialized = true;
      this.logger.info(
        { webhookPort: this.webhookPort },
        'AutomationEngine initialized'
      );
    } catch (error) {
      this.logger.error(error, 'Failed to initialize AutomationEngine');
      throw error;
    }
  }

  private setupWebhookServer(): void {
    this.webhookServer = express();
    this.webhookServer.use(express.json());

    // Webhook endpoint
    this.webhookServer.post('/webhook/:triggerId', async (req: Request, res: Response) => {
      const { triggerId } = req.params;
      this.logger.info({ triggerId, body: req.body }, 'Webhook received');

      try {
        await this.fireTrigger(triggerId, req.body);
        res.json({ success: true, triggerId });
      } catch (error) {
        this.logger.error(error, 'Failed to fire trigger');
        res.status(500).json({ error: 'Failed to fire trigger' });
      }
    });

    // Health check endpoint
    this.webhookServer.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', triggers: this.cronJobs.size });
    });

    // Start server
    this.webhookServer.listen(this.webhookPort, () => {
      this.logger.info(
        { port: this.webhookPort },
        'Webhook server listening'
      );
    });
  }

  private async loadTriggersFromDB(): Promise<void> {
    try {
      const triggers = this.db.getTriggers();

      for (const trigger of triggers) {
        await this.registerTrigger(trigger);
      }

      this.logger.info(
        { count: triggers.length },
        'Loaded triggers from database'
      );
    } catch (error) {
      this.logger.error(error, 'Failed to load triggers from database');
      throw error;
    }
  }

  async createTrigger(trigger: Trigger): Promise<string> {
    if (!this.initialized) {
      throw new Error('AutomationEngine not initialized');
    }

    try {
      const triggerId = trigger.id || uuidv4();
      const triggerRecord: TriggerRecord = {
        id: triggerId,
        name: trigger.name,
        type: trigger.type,
        config: trigger.config,
        lastFired: 0,
        enabled: trigger.enabled !== false,
      };

      // Save to database
      this.db.saveTrigger(triggerRecord);

      // Register the trigger
      await this.registerTrigger(triggerRecord);

      this.logger.info({ triggerId, name: trigger.name }, 'Trigger created');
      this.emit('trigger:created', triggerRecord);

      return triggerId;
    } catch (error) {
      this.logger.error(error, 'Failed to create trigger');
      throw error;
    }
  }

  private async registerTrigger(trigger: TriggerRecord): Promise<void> {
    switch (trigger.type) {
      case 'cron': {
        const cronExpression = trigger.config.expression as string;
        if (!cron.validate(cronExpression)) {
          throw new Error(`Invalid cron expression: ${cronExpression}`);
        }

        const task = cron.schedule(cronExpression, async () => {
          await this.fireTrigger(trigger.id);
        });

        this.cronJobs.set(trigger.id, task);
        this.logger.info(
          { triggerId: trigger.id, expression: cronExpression },
          'Cron trigger registered'
        );
        break;
      }

      case 'webhook': {
        // Webhook triggers are handled by the webhook server
        this.logger.info(
          { triggerId: trigger.id, path: `/webhook/${trigger.id}` },
          'Webhook trigger registered'
        );
        break;
      }

      case 'gpio': {
        // GPIO triggers require hardware interface
        this.logger.info(
          { triggerId: trigger.id, pin: trigger.config.pin },
          'GPIO trigger registered'
        );
        break;
      }

      case 'event': {
        // Event triggers are registered as listeners
        const eventName = trigger.config.eventName as string;
        this.on(eventName, async () => {
          await this.fireTrigger(trigger.id);
        });
        this.logger.info(
          { triggerId: trigger.id, eventName },
          'Event trigger registered'
        );
        break;
      }

      default: {
        throw new Error(`Unknown trigger type: ${trigger.type}`);
      }
    }
  }

  async fireTrigger(
    triggerId: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Update last fired time
      this.db.updateTriggerFired(triggerId);

      // Execute trigger actions
      const executor = this.triggerExecutor.get(triggerId);
      if (executor) {
        await executor();
      }

      this.logger.info({ triggerId, context }, 'Trigger fired');
      this.emit('trigger:fired', triggerId, context);
    } catch (error) {
      this.logger.error(error, 'Failed to fire trigger');
      this.emit('error', error);
    }
  }

  async disableTrigger(triggerId: string): Promise<void> {
    try {
      const cronTask = this.cronJobs.get(triggerId);
      if (cronTask) {
        cronTask.stop();
        this.cronJobs.delete(triggerId);
      }

      this.logger.info({ triggerId }, 'Trigger disabled');
    } catch (error) {
      this.logger.error(error, 'Failed to disable trigger');
      throw error;
    }
  }

  async enableTrigger(triggerId: string): Promise<void> {
    try {
      // Re-load trigger from database and register
      const triggers = this.db.getTriggers();
      const trigger = triggers.find((t) => t.id === triggerId);

      if (trigger) {
        await this.registerTrigger(trigger);
        this.logger.info({ triggerId }, 'Trigger enabled');
      }
    } catch (error) {
      this.logger.error(error, 'Failed to enable trigger');
      throw error;
    }
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    try {
      await this.disableTrigger(triggerId);
      this.triggerExecutor.delete(triggerId);
      this.logger.info({ triggerId }, 'Trigger deleted');
    } catch (error) {
      this.logger.error(error, 'Failed to delete trigger');
      throw error;
    }
  }

  registerActionExecutor(
    triggerId: string,
    executor: () => Promise<void>
  ): void {
    this.triggerExecutor.set(triggerId, executor);
    this.logger.debug({ triggerId }, 'Action executor registered');
  }

  getTriggers(): TriggerRecord[] {
    return this.db.getTriggers();
  }

  async shutdown(): Promise<void> {
    try {
      // Stop all cron jobs
      for (const task of this.cronJobs.values()) {
        task.stop();
      }
      this.cronJobs.clear();

      // Stop webhook server
      if (this.webhookServer) {
        (this.webhookServer as any).close?.();
      }

      this.initialized = false;
      this.logger.info('AutomationEngine shut down');
    } catch (error) {
      this.logger.error(error, 'Error during AutomationEngine shutdown');
      throw error;
    }
  }
}
