import { BotBase } from '../BotBase.js';
import { EmbedBuilder } from 'discord.js';
import pino from 'pino';

const logger = pino();

interface Deployment {
  id: string;
  service: string;
  status: 'pending' | 'in-progress' | 'success' | 'failed';
  startTime: number;
  endTime?: number;
  logs: string[];
}

export class DeploymentBot extends BotBase {
  private deployments: Map<string, Deployment> = new Map();

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'DeploymentBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'deploy',
      description: 'Start deployment',
      usage: '!deploy <service>',
      execute: async (args, context) => {
        const service = args.join('-');
        if (!service) {
          await context.message.reply('❌ Usage: `!deploy <service>`');
          return;
        }
        await this.startDeployment(service, context.message);
      },
    });

    this.registerCommand({
      name: 'status',
      description: 'Deployment status',
      usage: '!status',
      execute: async (args, context) => {
        await this.showStatus(context.message);
      },
    });

    this.registerCommand({
      name: 'rollback',
      description: 'Rollback deployment',
      usage: '!rollback <deployment-id>',
      execute: async (args, context) => {
        const id = args[0];
        if (!id) {
          await context.message.reply('❌ Usage: `!rollback <deployment-id>`');
          return;
        }
        await this.rollback(id, context.message);
      },
    });

    this.registerCommand({
      name: 'logs',
      description: 'Deployment logs',
      usage: '!logs <deployment-id>',
      execute: async (args, context) => {
        const id = args[0];
        if (!id) {
          await context.message.reply('❌ Usage: `!logs <deployment-id>`');
          return;
        }
        await this.showLogs(id, context.message);
      },
    });
  }

  private async startDeployment(service: string, message: any): Promise<void> {
    const deploymentId = `deploy-${Date.now()}`;
    const deployment: Deployment = {
      id: deploymentId,
      service,
      status: 'pending',
      startTime: Date.now(),
      logs: [`[${new Date().toISOString()}] Deployment initiated for ${service}`],
    };

    this.deployments.set(deploymentId, deployment);

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle(`🚀 Deployment Starting`)
      .addFields(
        {
          name: 'Service',
          value: service,
          inline: true,
        },
        {
          name: 'Deployment ID',
          value: deploymentId,
          inline: true,
        },
        {
          name: 'Status',
          value: '⏳ Pending',
          inline: true,
        },
      );

    const reply = await message.reply({ embeds: [embed] });

    // Simulate deployment progress
    setTimeout(() => {
      this.updateDeploymentStatus(deploymentId, 'in-progress');
    }, 2000);

    setTimeout(() => {
      this.updateDeploymentStatus(deploymentId, 'success', reply);
    }, 10000);

    logger.info(`Started deployment: ${deploymentId} for ${service}`);
  }

  private updateDeploymentStatus(
    deploymentId: string,
    status: 'in-progress' | 'success' | 'failed',
    discordMessage?: any,
  ): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return;

    deployment.status = status;
    deployment.logs.push(
      `[${new Date().toISOString()}] Status: ${status}`,
    );

    if (status === 'success' || status === 'failed') {
      deployment.endTime = Date.now();
    }

    logger.info(`Deployment ${deploymentId}: ${status}`);
  }

  private async showStatus(message: any): Promise<void> {
    const activeDeployments = Array.from(this.deployments.values()).filter(
      (d) => d.status !== 'success' && d.status !== 'failed',
    );

    if (activeDeployments.length === 0) {
      await message.reply('✅ No active deployments');
      return;
    }

    const fields = activeDeployments.map((d) => ({
      name: `${d.service} (${d.id})`,
      value: `Status: ${d.status}\nStarted: <t:${Math.floor(d.startTime / 1000)}:R>`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle('🚀 Deployment Status')
      .addFields(...fields);

    await message.reply({ embeds: [embed] });
  }

  private async rollback(deploymentId: string, message: any): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      await message.reply(`❌ Deployment not found: ${deploymentId}`);
      return;
    }

    deployment.logs.push(`[${new Date().toISOString()}] Rollback initiated`);

    const embed = new EmbedBuilder()
      .setColor(0xff3333)
      .setTitle(`⏮️ Rollback: ${deployment.service}`)
      .addFields({
        name: 'Deployment ID',
        value: deploymentId,
        inline: true,
      })
      .setDescription('⏳ Rolling back to previous version...');

    await message.reply({ embeds: [embed] });

    setTimeout(() => {
      deployment.logs.push(`[${new Date().toISOString()}] Rollback completed`);
      logger.info(`Rolled back deployment: ${deploymentId}`);
    }, 5000);
  }

  private async showLogs(deploymentId: string, message: any): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      await message.reply(`❌ Deployment not found: ${deploymentId}`);
      return;
    }

    const logs = deployment.logs.slice(-10).join('\n');
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`📋 Logs: ${deployment.service}`)
      .setDescription(`\`\`\`\n${logs}\n\`\`\``)
      .setFooter({ text: `Showing last 10 entries` });

    await message.reply({ embeds: [embed] });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new DeploymentBot();
  bot.connect();
}

export default DeploymentBot;
