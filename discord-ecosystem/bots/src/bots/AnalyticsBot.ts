import { BotBase } from '../BotBase.js';
import { EmbedBuilder } from 'discord.js';
import pino from 'pino';

const logger = pino();

interface ServerMetrics {
  messageCount: number;
  userActivity: Map<string, number>;
  channelActivity: Map<string, number>;
  timestamp: number;
}

export class AnalyticsBot extends BotBase {
  private metrics: ServerMetrics = {
    messageCount: 0,
    userActivity: new Map(),
    channelActivity: new Map(),
    timestamp: Date.now(),
  };

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
    this.startTracking();
  }

  getBotName(): string {
    return 'AnalyticsBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'stats',
      description: 'Show server statistics',
      usage: '!stats',
      execute: async (args, context) => {
        await this.sendStats(context.message);
      },
    });

    this.registerCommand({
      name: 'activity',
      description: 'Display activity levels',
      usage: '!activity',
      execute: async (args, context) => {
        await this.sendActivity(context.message);
      },
    });

    this.registerCommand({
      name: 'engagement',
      description: 'Engagement metrics',
      usage: '!engagement',
      execute: async (args, context) => {
        await this.sendEngagement(context.message);
      },
    });

    this.registerCommand({
      name: 'report',
      description: 'Generate metrics report',
      usage: '!report',
      execute: async (args, context) => {
        await this.sendReport(context.message);
      },
    });

    this.setupMetricsTracking();
  }

  private setupMetricsTracking(): void {
    this.client.on('messageCreate', (message) => {
      if (message.author.bot) return;

      this.metrics.messageCount++;
      this.metrics.userActivity.set(
        message.author.id,
        (this.metrics.userActivity.get(message.author.id) || 0) + 1,
      );
      this.metrics.channelActivity.set(
        message.channelId,
        (this.metrics.channelActivity.get(message.channelId) || 0) + 1,
      );
    });
  }

  private startTracking(): void {
    // Update metrics hourly
    setInterval(() => {
      logger.info(
        `Server metrics: ${this.metrics.messageCount} messages, ${this.metrics.userActivity.size} active users`,
      );
    }, 60 * 60 * 1000);
  }

  private async sendStats(message: any): Promise<void> {
    const guild = message.guild;

    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('📊 Server Statistics')
      .addFields(
        {
          name: 'Members',
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: 'Channels',
          value: `${guild.channels.cache.size}`,
          inline: true,
        },
        {
          name: 'Roles',
          value: `${guild.roles.cache.size}`,
          inline: true,
        },
        {
          name: 'Total Messages',
          value: `${this.metrics.messageCount}`,
          inline: true,
        },
        {
          name: 'Active Users',
          value: `${this.metrics.userActivity.size}`,
          inline: true,
        },
        {
          name: 'Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private async sendActivity(message: any): Promise<void> {
    const topUsers = Array.from(this.metrics.userActivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topChannels = Array.from(this.metrics.channelActivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const userList = topUsers
      .map(([id, count]) => `<@${id}>: ${count} messages`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('📈 Activity Levels')
      .addFields(
        {
          name: 'Top Active Users',
          value: userList || 'No activity yet',
        },
        {
          name: 'Top Channels',
          value: topChannels
            .map(([id, count]) => `<#${id}>: ${count} messages`)
            .join('\n') || 'No activity yet',
        },
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private async sendEngagement(message: any): Promise<void> {
    const guild = message.guild;
    const totalMembers = guild.memberCount;
    const engagementRate = (
      ((this.metrics.userActivity.size / totalMembers) * 100).toFixed(1)
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('💬 Engagement Metrics')
      .addFields(
        {
          name: 'Engagement Rate',
          value: `${engagementRate}%`,
          inline: true,
        },
        {
          name: 'Avg Messages/User',
          value: `${(this.metrics.messageCount / this.metrics.userActivity.size).toFixed(1)}`,
          inline: true,
        },
        {
          name: 'Total Interactions',
          value: `${this.metrics.messageCount}`,
          inline: true,
        },
      )
      .setFooter({ text: 'Higher engagement indicates active community' });

    await message.reply({ embeds: [embed] });
  }

  private async sendReport(message: any): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('📋 Metrics Report')
      .setDescription(
        `Generated at <t:${Math.floor(Date.now() / 1000)}:f>`,
      )
      .addFields(
        {
          name: 'Total Messages',
          value: `${this.metrics.messageCount}`,
          inline: true,
        },
        {
          name: 'Active Users',
          value: `${this.metrics.userActivity.size}`,
          inline: true,
        },
        {
          name: 'Active Channels',
          value: `${this.metrics.channelActivity.size}`,
          inline: true,
        },
        {
          name: 'Tracking Since',
          value: `<t:${Math.floor(this.metrics.timestamp / 1000)}:R>`,
          inline: false,
        },
      );

    await message.reply({ embeds: [embed] });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new AnalyticsBot();
  bot.connect();
}

export default AnalyticsBot;
