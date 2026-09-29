import { Message, EmbedBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { TradingBotService } from '../services/trading-bot-service';
import { ChartService } from '../services/chart-service';
import { PriceDataService } from '../services/price-data-service';
import { PortfolioService } from '../services/portfolio-service';
import { AlertService } from '../services/alert-service';
import { SchedulerService } from '../services/scheduler-service';
import { FollowingService } from '../services/following-service';
import { SocialCommands } from '../commands/social-commands';
import { AutomationCommands } from '../commands/automation-commands';

/**
 * DiscordCommandHandler: Process trading bot commands
 */
export class DiscordCommandHandler {
  private tradingBotService: TradingBotService;
  private chartService: ChartService;
  private priceDataService: PriceDataService;
  private socialCommands?: SocialCommands;
  private automationCommands?: AutomationCommands;

  constructor(
    tradingBotService: TradingBotService,
    chartService: ChartService,
    prisma?: PrismaClient,
    discordClient?: any,
    portfolioService?: PortfolioService,
    alertService?: AlertService,
    schedulerService?: SchedulerService
  ) {
    this.tradingBotService = tradingBotService;
    this.chartService = chartService;
    this.priceDataService = new PriceDataService();

    // Initialize social commands if prisma is provided
    if (prisma && discordClient) {
      const followingService = new FollowingService(prisma, discordClient);
      this.socialCommands = new SocialCommands(followingService);
    }

    // Initialize automation commands if services are provided
    if (tradingBotService && alertService && portfolioService && schedulerService) {
      this.automationCommands = new AutomationCommands(
        tradingBotService,
        alertService,
        portfolioService,
        schedulerService,
        this.priceDataService
      );
    }
  }

  /**
   * Handle incoming commands
   */
  async handle(message: Message) {
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    switch (command) {
      case 'track':
        await this.handleTrack(message, args);
        break;
      case 'untrack':
        await this.handleUntrack(message, args);
        break;
      case 'price':
        await this.handlePrice(message, args);
        break;
      case 'setups':
        await this.handleSetups(message, args);
        break;
      case 'chart':
        await this.handleChart(message, args);
        break;
      case 'tracked':
        await this.handleTracked(message);
        break;
      case 'follow':
        if (this.socialCommands) await this.socialCommands.handleFollow(message, args);
        else await message.reply('Social features not enabled');
        break;
      case 'unfollow':
        if (this.socialCommands) await this.socialCommands.handleUnfollow(message, args);
        else await message.reply('Social features not enabled');
        break;
      case 'followers':
        if (this.socialCommands) await this.socialCommands.handleFollowers(message);
        else await message.reply('Social features not enabled');
        break;
      case 'following':
        if (this.socialCommands) await this.socialCommands.handleFollowing(message);
        else await message.reply('Social features not enabled');
        break;
      case 'community-feed':
        if (this.socialCommands) await this.socialCommands.handleCommunityFeed(message);
        else await message.reply('Social features not enabled');
        break;
      case 'autocopy':
        if (this.socialCommands) await this.socialCommands.handleAutoCopy(message, args);
        else await message.reply('Social features not enabled');
        break;
      case 'help':
        await this.handleHelp(message);
        break;
      default:
        if (command) {
          await message.reply('❓ Unknown command. Use `!help` for available commands.');
        }
    }
  }

  /**
   * !track <symbol> - Start tracking a symbol
   * Example: !track BTC/USDT
   */
  private async handleTrack(message: Message, args: string[]) {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!track <symbol> [timeframe]`\nExample: `!track BTC/USDT 1h`');
      return;
    }

    const symbol = args[0].toUpperCase();
    const timeframe = args[1] || '1h';

    await message.reply(`⏳ Starting to track **${symbol}** on **${timeframe}** timeframe...`);

    const success = await this.tradingBotService.trackSymbol(symbol, message.channelId, timeframe);

    if (success) {
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`✅ Now Tracking ${symbol}`)
        .setDescription(`Timeframe: **${timeframe}**\nChannel: <#${message.channelId}>`)
        .addFields({
          name: 'Updates',
          value: 'You will receive alerts for new trade setups.',
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      await message.reply(`❌ Failed to start tracking **${symbol}**. Check symbol format.`);
    }
  }

  /**
   * !untrack <symbol> - Stop tracking a symbol
   */
  private async handleUntrack(message: Message, args: string[]) {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!untrack <symbol>`');
      return;
    }

    const symbol = args[0].toUpperCase();
    const success = this.tradingBotService.stopTracking(symbol);

    if (success) {
      await message.reply(`✅ Stopped tracking **${symbol}**`);
    } else {
      await message.reply(`❌ **${symbol}** is not being tracked.`);
    }
  }

  /**
   * !price <symbol> - Get current price
   */
  private async handlePrice(message: Message, args: string[]) {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!price <symbol>`\nExample: `!price BTC/USDT`');
      return;
    }

    const symbol = args[0].toUpperCase();

    try {
      const price = await this.priceDataService.getCurrentPrice(symbol);

      if (price > 0) {
        const embed = new EmbedBuilder()
          .setColor(0x00D9FF)
          .setTitle(`💰 ${symbol} Price`)
          .setDescription(`**$${price.toFixed(2)}**`)
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        await message.reply(`❌ Could not fetch price for **${symbol}**`);
      }
    } catch (error) {
      await message.reply(`❌ Error fetching price: ${(error as Error).message}`);
    }
  }

  /**
   * !setups [symbol] - Show active trade setups
   */
  private async handleSetups(message: Message, args: string[]) {
    const symbol = args[0]?.toUpperCase();

    try {
      let setups = [];

      if (symbol) {
        setups = this.tradingBotService.getSetups(symbol);
      } else {
        // Get setups for all tracked symbols
        const tracked = this.tradingBotService.getTrackedSymbols();
        for (const sym of tracked) {
          setups.push(...this.tradingBotService.getSetups(sym));
        }
      }

      if (setups.length === 0) {
        await message.reply('📭 No active setups found.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00D9FF)
        .setTitle(`🎯 Active Trade Setups${symbol ? ` - ${symbol}` : ''}`)
        .setDescription(`Found **${setups.length}** active setup(s)`)
        .addFields(
          setups.slice(0, 5).map((setup) => ({
            name: `${setup.symbol} - ${setup.direction}`,
            value: `**Type:** ${setup.type}\n**Confidence:** ${(setup.confidence * 100).toFixed(1)}%\n**R/R:** ${setup.riskReward.toFixed(2)}:1\n**Entry:** $${setup.entryZone.start.toFixed(2)} - $${setup.entryZone.end.toFixed(2)}`,
            inline: true,
          }))
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Error retrieving setups: ${(error as Error).message}`);
    }
  }

  /**
   * !chart <symbol> - Generate price chart
   */
  private async handleChart(message: Message, args: string[]) {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!chart <symbol> [type]`\nTypes: price, volume, setup');
      return;
    }

    const symbol = args[0].toUpperCase();
    const type = args[1]?.toLowerCase() || 'price';

    await message.reply('⏳ Generating chart...');

    try {
      const candles = await this.priceDataService.fetchCandles(symbol, '1h', 24);

      let chartBuffer: Buffer | null = null;

      if (type === 'volume') {
        chartBuffer = await this.chartService.generateVolumeChart(symbol, candles);
      } else {
        chartBuffer = await this.chartService.generatePriceChart(symbol, candles);
      }

      if (chartBuffer) {
        await message.reply({
          files: [{ attachment: chartBuffer, name: `${symbol}-${type}.png` }],
        });
      } else {
        await message.reply('❌ Failed to generate chart.');
      }
    } catch (error) {
      await message.reply(`❌ Error: ${(error as Error).message}`);
    }
  }

  /**
   * !tracked - Show all tracked symbols
   */
  private async handleTracked(message: Message) {
    const tracked = this.tradingBotService.getTrackedSymbols();

    if (tracked.length === 0) {
      await message.reply('📭 No symbols currently tracked.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00D9FF)
      .setTitle('📊 Tracked Symbols')
      .setDescription(tracked.join(', '))
      .addFields({
        name: 'Count',
        value: `${tracked.length} symbol(s)`,
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  /**
   * !help - Show command help
   */
  private async handleHelp(message: Message) {
    const embed = new EmbedBuilder()
      .setColor(0x00D9FF)
      .setTitle('🤖 WISE² Trading Bot Commands')
      .setDescription('Automated technical analysis & social trading')
      .addFields(
        {
          name: '📊 Market Analysis',
          value: '`!track`, `!untrack`, `!price`, `!setups`, `!chart`, `!tracked`',
          inline: false,
        },
        {
          name: '!track <symbol> [timeframe]',
          value: 'Start tracking a symbol for trade setups\n`!track BTC/USDT 1h`',
          inline: false,
        },
        {
          name: '!price <symbol>',
          value: 'Get current price\n`!price BTC/USDT`',
          inline: false,
        },
        {
          name: '!setups [symbol]',
          value: 'Show active trade setups\n`!setups BTC/USDT`',
          inline: false,
        },
        {
          name: '👥 Social Trading',
          value: '`!follow`, `!unfollow`, `!followers`, `!following`, `!community-feed`, `!autocopy`',
          inline: false,
        },
        {
          name: '!follow <username>',
          value: 'Follow a trader to see their trades\n`!follow john_trader`',
          inline: false,
        },
        {
          name: '!followers',
          value: 'Show who\'s following you',
          inline: false,
        },
        {
          name: '!following',
          value: 'Show traders you\'re following',
          inline: false,
        },
        {
          name: '!community-feed',
          value: 'View trade feed from followed traders',
          inline: false,
        },
        {
          name: '!autocopy <enable|disable> <username> [riskScale]',
          value: 'Auto-copy trades from a trader\n`!autocopy enable john_trader 0.5`',
          inline: false,
        },
        {
          name: '📚 Engine: ÆTHER-Trader',
          value: '• Swing detection • Fibonacci retracements • RSI momentum\n• Liquidity sweeps • Market regime analysis',
          inline: false,
        }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}
