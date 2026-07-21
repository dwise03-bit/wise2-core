import { BotBase } from '../BotBase.js';
import { EmbedBuilder, ChannelType } from 'discord.js';
import pino from 'pino';

const logger = pino();

export class DailyReportBot extends BotBase {
  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
    this.scheduleDaily();
  }

  getBotName(): string {
    return 'DailyReportBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'report',
      description: 'Generate report',
      usage: '!report [today|week|month]',
      execute: async (args, context) => {
        const period = args[0] || 'today';
        await this.generateReport(period, context.message);
      },
    });
  }

  private scheduleDaily(): void {
    // Run at 9 AM daily
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        this.sendDailyReport();
      }
    }, 60000); // Check every minute
  }

  private async sendDailyReport(): Promise<void> {
    try {
      const guild = this.client.guilds.cache.first();
      if (!guild) return;

      const announcementsChannel = guild.channels.cache.find(
        (ch) => ch.name === 'announcements' && ch.type === ChannelType.GuildText,
      );

      if (!announcementsChannel) return;

      const embed = await this.buildDailyReport();
      await (announcementsChannel as any).send({ embeds: [embed] });

      logger.info('Daily report sent');
    } catch (error) {
      logger.error(`Failed to send daily report: ${error}`);
    }
  }

  private async generateReport(period: string, message: any): Promise<void> {
    const embed = await this.buildDailyReport(period);
    await message.reply({ embeds: [embed] });
  }

  private async buildDailyReport(period: string = 'today'): Promise<EmbedBuilder> {
    const guild = this.client.guilds.cache.first();
    const timestamp = Math.floor(Date.now() / 1000);

    // Mock data for demonstration
    const stats = {
      messages: Math.floor(Math.random() * 500) + 100,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      deployments: Math.floor(Math.random() * 5),
      issues: Math.floor(Math.random() * 20),
      prsMerged: Math.floor(Math.random() * 10),
    };

    let title = '';
    let description = '';

    if (period === 'today') {
      title = '📊 Daily Report';
      description = `Generated at <t:${timestamp}:t>`;
    } else if (period === 'week') {
      title = '📈 Weekly Report';
      description = 'Last 7 days';
    } else if (period === 'month') {
      title = '📉 Monthly Report';
      description = 'Last 30 days';
    }

    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle(title)
      .setDescription(description)
      .addFields(
        {
          name: '💬 Messages',
          value: `${stats.messages}`,
          inline: true,
        },
        {
          name: '👥 Active Users',
          value: `${stats.activeUsers}`,
          inline: true,
        },
        {
          name: '🚀 Deployments',
          value: `${stats.deployments}`,
          inline: true,
        },
        {
          name: '🐛 Issues',
          value: `${stats.issues}`,
          inline: true,
        },
        {
          name: '✅ PRs Merged',
          value: `${stats.prsMerged}`,
          inline: true,
        },
        {
          name: 'Team',
          value: `${guild?.memberCount || 0} members`,
          inline: true,
        },
      )
      .setFooter({ text: 'WISE² Analytics' });

    return embed;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new DailyReportBot();
  bot.connect();
}

export default DailyReportBot;
