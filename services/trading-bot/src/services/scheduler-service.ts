import schedule from 'node-schedule';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { PortfolioService } from './portfolio-service';
import { PriceDataService } from './price-data-service';

/**
 * SchedulerService: Automated scheduled tasks (daily/weekly reports, alerts)
 */
export class SchedulerService {
  private prisma: PrismaClient;
  private discordClient: Client;
  private portfolioService: PortfolioService;
  private priceDataService: PriceDataService;
  private scheduledJobs: Map<string, schedule.Job> = new Map();

  constructor(
    prisma: PrismaClient,
    discordClient: Client,
    portfolioService: PortfolioService,
    priceDataService: PriceDataService
  ) {
    this.prisma = prisma;
    this.discordClient = discordClient;
    this.portfolioService = portfolioService;
    this.priceDataService = priceDataService;
  }

  /**
   * Start all scheduled jobs
   */
  startScheduler() {
    console.log('📅 Starting scheduler...');

    // Daily market summary at 9 AM UTC
    this.scheduleDailyMarketSummary();

    // Weekly P&L report (Sundays at 8 PM UTC)
    this.scheduleWeeklyReport();

    // Price alert monitoring every 5 minutes
    this.schedulePriceMonitoring();

    console.log('✅ Scheduler started');
  }

  /**
   * Daily market summary job
   */
  private scheduleDailyMarketSummary() {
    const job = schedule.scheduleJob('0 9 * * *', async () => {
      console.log('📊 Running daily market summary...');
      try {
        const guild = this.discordClient.guilds.cache.first();
        if (!guild) return;

        const generalChannel = guild.channels.cache.find(
          (c: any) => c.isTextBased?.() && c.name === 'general'
        ) as TextChannel | undefined;

        if (!generalChannel) return;

        // Get top performers
        const accounts = await this.prisma.tradingAccount.findMany({
          include: { trades: { where: { status: 'CLOSED' }, take: 10 } },
          take: 10,
        });

        const performers = await Promise.all(
          accounts.map(async (acc: any) => {
            const stats = await this.portfolioService.getPortfolioStats(acc.id);
            return { accountName: acc.accountName || 'Unknown', ...stats };
          })
        );

        performers.sort((a: any, b: any) => b.totalPL - a.totalPL);

        const embed = new EmbedBuilder()
          .setColor(0x00d9ff)
          .setTitle('📊 Daily Market Summary')
          .setDescription('Top performing traders today')
          .addFields(
            ...performers.slice(0, 5).map((p: any, i: number) => ({
              name: `${i + 1}. ${p.accountName}`,
              value: `P&L: ${p.totalPL > 0 ? '+' : ''}$${p.totalPL.toFixed(2)} | Win Rate: ${p.winRate.toFixed(1)}%`,
              inline: true,
            }))
          )
          .setFooter({ text: 'Generated at ' + new Date().toISOString() })
          .setTimestamp();

        await generalChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Error in daily summary:', error);
      }
    });

    this.scheduledJobs.set('daily-summary', job);
  }

  /**
   * Weekly P&L report job
   */
  private scheduleWeeklyReport() {
    const job = schedule.scheduleJob('0 20 * * 0', async () => {
      console.log('📈 Running weekly P&L report...');
      try {
        const accounts = await this.prisma.tradingAccount.findMany({
          include: { trades: { where: { status: 'CLOSED' } } },
        });

        const guild = this.discordClient.guilds.cache.first();
        if (!guild) return;

        const generalChannel = guild.channels.cache.find(
          (c: any) => c.isTextBased?.() && c.name === 'general'
        ) as TextChannel | undefined;

        if (!generalChannel) return;

        for (const account of accounts.slice(0, 5)) {
          const stats = await this.portfolioService.getPortfolioStats(account.id);

          const embed = new EmbedBuilder()
            .setColor(stats.totalPL > 0 ? 0x00ff7f : 0xff0000)
            .setTitle(`📈 Weekly Report: ${account.accountName || 'Account'}`)
            .addFields(
              { name: 'Total P&L', value: `${stats.totalPL > 0 ? '+' : ''}$${stats.totalPL.toFixed(2)}`, inline: true },
              { name: 'P&L %', value: `${stats.plPercent.toFixed(2)}%`, inline: true },
              { name: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, inline: true },
              { name: 'Trades', value: `${stats.closedTrades} closed`, inline: true },
              { name: 'Best Trade', value: `+$${stats.bestTrade.toFixed(2)}`, inline: true },
              { name: 'Worst Trade', value: `-$${Math.abs(stats.worstTrade).toFixed(2)}`, inline: true },
              { name: 'Sharpe Ratio', value: `${stats.sharpeRatio.toFixed(2)}`, inline: true },
              { name: 'Max Drawdown', value: `${stats.maxDrawdown.toFixed(2)}%`, inline: true }
            )
            .setFooter({ text: 'Week ending ' + new Date().toISOString() })
            .setTimestamp();

          await generalChannel.send({ embeds: [embed] });
        }
      } catch (error) {
        console.error('Error in weekly report:', error);
      }
    });

    this.scheduledJobs.set('weekly-report', job);
  }

  /**
   * Price alert monitoring job (every 5 minutes)
   */
  private schedulePriceMonitoring() {
    const job = schedule.scheduleJob('*/5 * * * *', async () => {
      console.log('🔔 Monitoring price alerts...');
      try {
        const alerts = await this.prisma.alert.findMany({
          where: { status: 'ACTIVE' },
          include: { account: true },
        });

        for (const alert of alerts) {
          try {
            const currentPrice = await this.priceDataService.getCurrentPrice(alert.symbol);

            let triggered = false;
            if (alert.alertType === 'ABOVE' && currentPrice >= alert.priceLevel) {
              triggered = true;
            } else if (alert.alertType === 'BELOW' && currentPrice <= alert.priceLevel) {
              triggered = true;
            }

            if (triggered) {
              await this.prisma.alert.update({
                where: { id: alert.id },
                data: { status: 'TRIGGERED', triggeredAt: new Date() },
              });

              // Send notification
              await this.notifyAlertTriggered(alert, currentPrice);
            }
          } catch (error) {
            console.error(`Error checking alert ${alert.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error monitoring alerts:', error);
      }
    });

    this.scheduledJobs.set('price-monitoring', job);
  }

  /**
   * Notify when alert is triggered
   */
  private async notifyAlertTriggered(alert: any, currentPrice: number) {
    try {
      const guild = this.discordClient.guilds.cache.first();
      if (!guild) return;

      const alertChannel = guild.channels.cache.find(
        (c: any) => c.isTextBased?.() && c.name === 'alerts'
      ) as TextChannel | undefined;

      if (!alertChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0xffff00)
        .setTitle(`🚨 Alert Triggered: ${alert.symbol}`)
        .addFields(
          { name: 'Price Level', value: `$${alert.priceLevel.toFixed(2)}`, inline: true },
          { name: 'Current Price', value: `$${currentPrice.toFixed(2)}`, inline: true },
          { name: 'Condition', value: alert.alertType === 'ABOVE' ? '↑ Above' : '↓ Below', inline: true }
        )
        .setFooter({ text: alert.account?.accountName || 'Account' })
        .setTimestamp();

      await alertChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error notifying alert:', error);
    }
  }

  /**
   * Schedule custom report for a user
   */
  async scheduleUserReport(
    userId: string,
    frequency: 'daily' | 'weekly',
    channelId: string
  ): Promise<boolean> {
    try {
      const jobId = `user-report-${userId}-${frequency}`;

      // Cancel existing job if any
      const existingJob = this.scheduledJobs.get(jobId);
      if (existingJob) {
        existingJob.cancel();
      }

      const account = await this.prisma.tradingAccount.findFirst({
        where: { user: { id: userId } },
      });

      if (!account) return false;

      const schedule_rule = frequency === 'daily' ? '0 16 * * *' : '0 18 * * 1'; // 4 PM daily or Monday 6 PM

      const job = schedule.scheduleJob(schedule_rule, async () => {
        const stats = await this.portfolioService.getPortfolioStats(account.id);
        const channel = (await this.discordClient.channels.fetch(channelId)) as TextChannel;

        const embed = new EmbedBuilder()
          .setColor(stats.totalPL > 0 ? 0x00ff7f : 0xff0000)
          .setTitle(`${frequency === 'daily' ? '📊' : '📈'} ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Report`)
          .addFields(
            { name: 'P&L', value: `${stats.totalPL > 0 ? '+' : ''}$${stats.totalPL.toFixed(2)}`, inline: true },
            { name: 'Equity', value: `$${stats.totalEquity.toFixed(2)}`, inline: true },
            { name: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, inline: true }
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
      });

      this.scheduledJobs.set(jobId, job);
      return true;
    } catch (error) {
      console.error('Error scheduling user report:', error);
      return false;
    }
  }

  /**
   * Cancel scheduled job
   */
  cancelJob(jobId: string): boolean {
    const job = this.scheduledJobs.get(jobId);
    if (job) {
      job.cancel();
      this.scheduledJobs.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Cleanup all jobs
   */
  destroy() {
    console.log('🛑 Stopping scheduler...');
    for (const job of this.scheduledJobs.values()) {
      job.cancel();
    }
    this.scheduledJobs.clear();
  }
}
