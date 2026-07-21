/**
 * WISE² Discord Ecosystem - Main Entry Point
 * Initialize and manage all Discord bots
 */

import dotenv from 'dotenv';
import { GatewayIntentBits } from 'discord.js';
import { BotConfig } from './types';
import { BotOrchestrator } from './BotOrchestrator';
import Logger from './utils/Logger';

dotenv.config();

const logger = Logger;

/**
 * Main function to start the Discord bot ecosystem
 */
async function main(): Promise<void> {
  try {
    logger.info('Main', 'Start', 'WISE² Discord Bot Ecosystem starting...');

    // Initialize orchestrator
    const orchestrator = new BotOrchestrator();

    // Register bot configurations
    const botConfigs: { name: string; config: BotConfig }[] = [
      {
        name: 'executive-bot',
        config: {
          name: 'Executive Bot',
          token: process.env.EXECUTIVE_BOT_TOKEN || '',
          clientId: process.env.EXECUTIVE_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
          ],
          description: 'Route WISE² requests, get updates, manage tasks',
          color: '#3498db',
        },
      },
      {
        name: 'deployment-bot',
        config: {
          name: 'Deployment Bot',
          token: process.env.DEPLOYMENT_BOT_TOKEN || '',
          clientId: process.env.DEPLOYMENT_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Track releases, trigger deployments, manage rollbacks',
          color: '#f39c12',
        },
      },
      {
        name: 'notification-bot',
        config: {
          name: 'Notification Bot',
          token: process.env.NOTIFICATION_BOT_TOKEN || '',
          clientId: process.env.NOTIFICATION_CLIENT_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Broadcast WISE² events and notifications',
          color: '#9b59b6',
        },
      },
      {
        name: 'automation-bot',
        config: {
          name: 'Automation Bot',
          token: process.env.AUTOMATION_BOT_TOKEN || '',
          clientId: process.env.AUTOMATION_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Trigger workflows, schedule jobs, manage webhooks',
          color: '#1abc9c',
        },
      },
      {
        name: 'status-bot',
        config: {
          name: 'Status Bot',
          token: process.env.STATUS_BOT_TOKEN || '',
          clientId: process.env.STATUS_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Real-time system health and monitoring',
          color: '#2ecc71',
        },
      },
      {
        name: 'analytics-bot',
        config: {
          name: 'Analytics Bot',
          token: process.env.ANALYTICS_BOT_TOKEN || '',
          clientId: process.env.ANALYTICS_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Performance metrics, charts, and reports',
          color: '#e74c3c',
        },
      },
      {
        name: 'knowledge-bot',
        config: {
          name: 'Knowledge Bot',
          token: process.env.KNOWLEDGE_BOT_TOKEN || '',
          clientId: process.env.KNOWLEDGE_CLIENT_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Search knowledge base and documentation',
          color: '#34495e',
        },
      },
      {
        name: 'voice-bot',
        config: {
          name: 'Voice Bot',
          token: process.env.VOICE_BOT_TOKEN || '',
          clientId: process.env.VOICE_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
          description: 'Voice assistant integration and commands',
          color: '#e67e22',
        },
      },
      {
        name: 'emergency-bot',
        config: {
          name: 'Emergency Bot',
          token: process.env.EMERGENCY_BOT_TOKEN || '',
          clientId: process.env.EMERGENCY_CLIENT_ID || '',
          guildId: process.env.GUILD_ID || '',
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
          ],
          description: 'Critical alerts and incident management',
          color: '#c0392b',
        },
      },
    ];

    // Validate configurations
    for (const { name, config } of botConfigs) {
      if (!config.token) {
        logger.warn('Main', 'Config', `Skipping ${name}: missing token`);
        continue;
      }

      orchestrator.registerBotConfig(name, config);
    }

    // Start all bots
    await orchestrator.startAll();

    // Log health status
    const health = orchestrator.getHealthStatus();
    logger.info('Main', 'Health', `Ecosystem health: ${health.status}`, {
      totalBots: health.totalBots,
      healthyBots: health.healthyBots,
    });

    // Setup graceful shutdown
    setupGracefulShutdown(orchestrator);
  } catch (error) {
    logger.fatal('Main', 'Error', 'Failed to start ecosystem', error as Error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown on signals
 */
function setupGracefulShutdown(orchestrator: BotOrchestrator): void {
  const signals = ['SIGTERM', 'SIGINT'];

  for (const signal of signals) {
    process.on(signal, async () => {
      logger.info('Main', 'Shutdown', `Received ${signal}, shutting down gracefully...`);

      try {
        await orchestrator.stopAll();
        logger.info('Main', 'Shutdown', 'Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Main', 'Shutdown', 'Error during shutdown', error as Error);
        process.exit(1);
      }
    });
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.fatal('Main', 'Uncaught', 'Uncaught exception', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.fatal('Main', 'Unhandled', `Unhandled promise rejection: ${reason}`);
  });
}

// Start the ecosystem
main();

export { BotOrchestrator };
