/**
 * WISE² Discord Ecosystem - Bot Orchestrator
 * Manages all Discord bots lifecycle and coordination
 */

import { GatewayIntentBits } from 'discord.js';
import { BotConfig } from './types';
import { BotFramework } from './BotFramework';
import { ExecutiveBot } from './bots/ExecutiveBot';
import { DeploymentBot } from './bots/DeploymentBot';
import { NotificationBot } from './bots/NotificationBot';
import { AutomationBot } from './bots/AutomationBot';
import { StatusBot } from './bots/StatusBot';
import { AnalyticsBot } from './bots/AnalyticsBot';
import { KnowledgeBot } from './bots/KnowledgeBot';
import { VoiceBot } from './bots/VoiceBot';
import { EmergencyBot } from './bots/EmergencyBot';
import Logger from './utils/Logger';

export class BotOrchestrator {
  private bots: Map<string, BotFramework> = new Map();
  private configs: Map<string, BotConfig> = new Map();
  private logger = Logger;
  private startTime: number = 0;

  constructor() {
    this.logger.info('Orchestrator', 'Init', 'Discord Bot Ecosystem initializing...');
  }

  public registerBotConfig(name: string, config: BotConfig): void {
    this.configs.set(name, config);
    this.logger.debug('Orchestrator', 'Config', `Registered config for: ${name}`);
  }

  public async initializeBot(
    name: string,
    BotClass: new (config: BotConfig) => BotFramework
  ): Promise<BotFramework> {
    const config = this.configs.get(name);
    if (!config) {
      throw new Error(`No config found for bot: ${name}`);
    }

    try {
      const bot = new BotClass(config);
      this.bots.set(name, bot);

      await bot.connect();
      await bot.registerCommands();

      this.logger.info('Orchestrator', 'Init', `Bot initialized: ${name}`, {
        clientId: config.clientId,
      });

      return bot;
    } catch (error) {
      this.logger.error('Orchestrator', 'Init', `Failed to initialize bot: ${name}`, error as Error);
      throw error;
    }
  }

  public async startAll(): Promise<void> {
    this.startTime = Date.now();

    const botClasses = [
      { name: 'executive-bot', class: ExecutiveBot },
      { name: 'deployment-bot', class: DeploymentBot },
      { name: 'notification-bot', class: NotificationBot },
      { name: 'automation-bot', class: AutomationBot },
      { name: 'status-bot', class: StatusBot },
      { name: 'analytics-bot', class: AnalyticsBot },
      { name: 'knowledge-bot', class: KnowledgeBot },
      { name: 'voice-bot', class: VoiceBot },
      { name: 'emergency-bot', class: EmergencyBot },
    ];

    for (const { name, class: BotClass } of botClasses) {
      try {
        await this.initializeBot(name, BotClass);
      } catch (error) {
        this.logger.error('Orchestrator', 'Start', `Failed to start ${name}`, error as Error);
        // Continue with other bots even if one fails
      }
    }

    this.logger.info('Orchestrator', 'Start', `All bots started. Active: ${this.bots.size}/${botClasses.length}`);
  }

  public async stopAll(): Promise<void> {
    for (const [name, bot] of this.bots.entries()) {
      try {
        await bot.disconnect();
        this.logger.info('Orchestrator', 'Stop', `Bot stopped: ${name}`);
      } catch (error) {
        this.logger.error('Orchestrator', 'Stop', `Error stopping ${name}`, error as Error);
      }
    }

    this.logger.info('Orchestrator', 'Stop', 'All bots stopped');
  }

  public getBot(name: string): BotFramework | undefined {
    return this.bots.get(name);
  }

  public getAllBots(): Map<string, BotFramework> {
    return new Map(this.bots);
  }

  public getStats(): {
    totalBots: number;
    activeBots: number;
    uptime: number;
    bots: Array<{
      name: string;
      status: 'online' | 'offline';
      uptime: number;
      servers: number;
      users: number;
      commands: number;
    }>;
  } {
    const botStats = Array.from(this.bots.entries()).map(([name, bot]) => {
      const stats = bot.getStats();
      return {
        name,
        status: 'online' as const,
        uptime: stats.uptime,
        servers: stats.servers,
        users: stats.users,
        commands: stats.commands,
      };
    });

    return {
      totalBots: this.bots.size,
      activeBots: this.bots.size,
      uptime: Date.now() - this.startTime,
      bots: botStats,
    };
  }

  public broadcastMessage(message: string): void {
    for (const [name, bot] of this.bots.entries()) {
      this.logger.debug('Orchestrator', 'Broadcast', `Broadcasting to ${name}: ${message}`);
    }
  }

  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    totalBots: number;
    healthyBots: number;
    degradedBots: number;
    details: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      uptime: number;
    }>;
  } {
    const details = Array.from(this.bots.entries()).map(([name, bot]) => {
      const stats = bot.getStats();
      const uptime = stats.uptime;

      // Consider healthy if uptime > 1 minute
      const status = uptime > 60000 ? 'healthy' : 'degraded';

      return {
        name,
        status,
        uptime,
      };
    });

    const healthyBots = details.filter(d => d.status === 'healthy').length;
    const degradedBots = details.filter(d => d.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (degradedBots > 0) overallStatus = 'degraded';
    if (healthyBots === 0) overallStatus = 'unhealthy';

    return {
      status: overallStatus,
      totalBots: this.bots.size,
      healthyBots,
      degradedBots,
      details,
    };
  }

  public async restart(): Promise<void> {
    this.logger.info('Orchestrator', 'Restart', 'Restarting all bots...');

    await this.stopAll();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.startAll();

    this.logger.info('Orchestrator', 'Restart', 'All bots restarted');
  }
}

export default BotOrchestrator;
