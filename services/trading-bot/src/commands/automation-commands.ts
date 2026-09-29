import { Message, EmbedBuilder } from 'discord.js';
import { TradingBotService } from '../services/trading-bot-service';
import { AlertService } from '../services/alert-service';
import { PortfolioService } from '../services/portfolio-service';
import { SchedulerService } from '../services/scheduler-service';
import { PriceDataService } from '../services/price-data-service';

/**
 * Automation commands: autotrack, portfolio, schedule, alerts
 */
export class AutomationCommands {
  constructor(
    private tradingBotService: TradingBotService,
    private alertService: AlertService,
    private portfolioService: PortfolioService,
    private schedulerService: SchedulerService,
    private priceDataService: PriceDataService
  ) {}

  /**
   * !autotrack <symbol> [timeframe] - Auto-track symbol + create Fibonacci alerts
   */
  async handleAutoTrack(message: Message, args: string[], accountId: string): Promise<void> {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!autotrack <symbol> [timeframe]`\nExample: `!autotrack BTC/USDT 4h`');
      return;
    }

    const symbol = args[0].toUpperCase();
    const timeframe = args[1] || '1h';

    try {
      // Start tracking
      await this.tradingBotService.trackSymbol(symbol, message.channelId, timeframe);

      // Get current price and create Fibonacci alerts
      const currentPrice = await this.priceDataService.getCurrentPrice(symbol);
      const candles = await this.priceDataService.fetchCandles(symbol, timeframe, 50);

      if (candles.length === 0) {
        await message.reply(`❌ No data available for ${symbol}`);
        return;
      }

      const prices = candles.map((c: any) => c.close);
      const supportLevel = Math.min(...prices);
      const resistanceLevel = Math.max(...prices);

      // Create Fib alerts
      const alerts = await this.alertService.createFibonacciAlerts(
        accountId,
        symbol,
        currentPrice,
        supportLevel,
        resistanceLevel
      );

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`✅ Auto-Tracking ${symbol}`)
        .setDescription(`Started tracking with automatic Fibonacci alerts`)
        .addFields(
          { name: 'Timeframe', value: timeframe, inline: true },
          { name: 'Current Price', value: `$${currentPrice.toFixed(2)}`, inline: true },
          { name: 'Alerts Created', value: `${alerts.length} Fib levels`, inline: true },
          {
            name: 'Range',
            value: `$${supportLevel.toFixed(2)} - $${resistanceLevel.toFixed(2)}`,
            inline: false,
          }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !portfolio - Show account positions and P&L
   */
  async handlePortfolio(message: Message, accountId: string): Promise<void> {
    try {
      const stats = await this.portfolioService.getPortfolioStats(accountId);

      const embed = new EmbedBuilder()
        .setColor(stats.totalPL > 0 ? 0x00ff7f : 0xff0000)
        .setTitle('💼 Portfolio Summary')
        .addFields(
          {
            name: 'Equity',
            value: `$${stats.totalEquity.toFixed(2)}`,
            inline: true,
          },
          {
            name: 'Total P&L',
            value: `${stats.totalPL > 0 ? '+' : ''}$${stats.totalPL.toFixed(2)}`,
            inline: true,
          },
          {
            name: 'P&L %',
            value: `${stats.plPercent.toFixed(2)}%`,
            inline: true,
          },
          {
            name: 'Open Positions',
            value: `${stats.openPositions}`,
            inline: true,
          },
          {
            name: 'Closed Trades',
            value: `${stats.closedTrades}`,
            inline: true,
          },
          {
            name: 'Win Rate',
            value: `${stats.winRate.toFixed(1)}%`,
            inline: true,
          },
          {
            name: 'Best Trade',
            value: `+$${stats.bestTrade.toFixed(2)}`,
            inline: true,
          },
          {
            name: 'Worst Trade',
            value: `-$${Math.abs(stats.worstTrade).toFixed(2)}`,
            inline: true,
          },
          {
            name: 'Sharpe Ratio',
            value: `${stats.sharpeRatio.toFixed(2)}`,
            inline: true,
          },
          {
            name: 'Max Drawdown',
            value: `${stats.maxDrawdown.toFixed(2)}%`,
            inline: true,
          },
          {
            name: 'Avg Win/Loss',
            value: `+$${stats.averageWin.toFixed(2)} / -$${stats.averageLoss.toFixed(2)}`,
            inline: false,
          },
          {
            name: 'Profit Factor',
            value: `${stats.profitFactor.toFixed(2)}x`,
            inline: true,
          }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !alerts - Show active alerts
   */
  async handleAlerts(message: Message, accountId: string): Promise<void> {
    try {
      const alerts = await this.alertService.getActiveAlerts(accountId);
      const stats = await this.alertService.getAlertStats(accountId);

      if (alerts.length === 0) {
        await message.reply('📊 No active alerts. Use `!alert add <symbol> <price> <above|below>`');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xffff00)
        .setTitle(`🔔 Active Alerts (${alerts.length})`)
        .setDescription(
          alerts
            .slice(0, 10)
            .map(
              (a: any) =>
                `**${a.symbol}** @ $${a.priceLevel.toFixed(2)} (${a.alertType}) - ${a.description || ''}`
            )
            .join('\n')
        )
        .addFields(
          { name: 'Active', value: `${stats.active}`, inline: true },
          { name: 'Triggered', value: `${stats.triggered}`, inline: true },
          { name: 'Dismissed', value: `${stats.dismissed}`, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !schedule <daily|weekly> - Enable daily or weekly reports
   */
  async handleSchedule(message: Message, args: string[], accountId: string): Promise<void> {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!schedule <enable|disable> <daily|weekly>`');
      return;
    }

    const action = args[0].toLowerCase();
    const frequency = args[1]?.toLowerCase() as 'daily' | 'weekly' | undefined;

    if (!['enable', 'disable'].includes(action) || !frequency) {
      await message.reply('❌ Usage: `!schedule <enable|disable> <daily|weekly>`');
      return;
    }

    try {
      if (action === 'enable') {
        const success = await this.schedulerService.scheduleUserReport(
          message.author.id,
          frequency,
          message.channelId
        );

        if (success) {
          const embed = new EmbedBuilder()
            .setColor(0x00d9ff)
            .setTitle(`✅ ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Report Enabled`)
            .setDescription(`You'll receive ${frequency} reports in this channel`)
            .addFields(
              {
                name: 'Schedule',
                value: frequency === 'daily' ? '4:00 PM UTC' : 'Mondays 6:00 PM UTC',
                inline: true,
              },
              {
                name: 'Content',
                value: 'P&L, Win Rate, Equity, Trades',
                inline: true,
              }
            )
            .setTimestamp();

          await message.reply({ embeds: [embed] });
        } else {
          await message.reply('❌ Could not enable reports');
        }
      } else {
        const success = this.schedulerService.cancelJob(`user-report-${message.author.id}-${frequency}`);

        if (success) {
          await message.reply(`✅ ${frequency} reports disabled`);
        } else {
          await message.reply(`❌ No ${frequency} reports were scheduled`);
        }
      }
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !alert add <symbol> <price> <above|below> - Add a price alert
   */
  async handleAlertAdd(message: Message, args: string[], accountId: string): Promise<void> {
    if (args.length < 3) {
      await message.reply(
        '❌ Usage: `!alert add <symbol> <price> <above|below>`\nExample: `!alert add BTC/USDT 45000 above`'
      );
      return;
    }

    const symbol = args[0].toUpperCase();
    const price = parseFloat(args[1]);
    const type = args[2].toUpperCase() as 'ABOVE' | 'BELOW';

    if (isNaN(price) || !['ABOVE', 'BELOW'].includes(type)) {
      await message.reply('❌ Invalid price or alert type');
      return;
    }

    try {
      const alert = await this.alertService.createAlert(accountId, symbol, price, type);

      const embed = new EmbedBuilder()
        .setColor(0x00ff7f)
        .setTitle(`✅ Alert Created`)
        .addFields(
          { name: 'Symbol', value: symbol, inline: true },
          { name: 'Price', value: `$${price.toFixed(2)}`, inline: true },
          { name: 'Type', value: type, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }
}
