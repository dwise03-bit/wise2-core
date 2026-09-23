import { Message, EmbedBuilder } from 'discord.js';
import { TradingBotService } from '../services/trading-bot-service';
import { ChartService } from '../services/chart-service';
import { PriceDataService } from '../services/price-data-service';

/**
 * DiscordCommandHandler: Process trading bot commands
 */
export class DiscordCommandHandler {
  private tradingBotService: TradingBotService;
  private chartService: ChartService;
  private priceDataService: PriceDataService;

  constructor(
    tradingBotService: TradingBotService,
    chartService: ChartService
  ) {
    this.tradingBotService = tradingBotService;
    this.chartService = chartService;
    this.priceDataService = new PriceDataService();
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
      .setDescription('Automated technical analysis & trade alerts')
      .addFields(
        {
          name: '!track <symbol> [timeframe]',
          value: 'Start tracking a symbol for trade setups\n`!track BTC/USDT 1h`',
          inline: false,
        },
        {
          name: '!untrack <symbol>',
          value: 'Stop tracking a symbol\n`!untrack BTC/USDT`',
          inline: false,
        },
        {
          name: '!price <symbol>',
          value: 'Get current price\n`!price BTC/USDT`',
          inline: false,
        },
        {
          name: '!setups [symbol]',
          value: 'Show active trade setups\n`!setups` or `!setups BTC/USDT`',
          inline: false,
        },
        {
          name: '!chart <symbol> [type]',
          value: 'Generate price chart\n`!chart BTC/USDT price` `!chart BTC/USDT volume`',
          inline: false,
        },
        {
          name: '!tracked',
          value: 'Show all tracked symbols',
          inline: false,
        },
        {
          name: '📚 Analysis',
          value: 'Uses ÆTHER-Trader engine:\n• Swing detection\n• Fibonacci retracements\n• RSI momentum\n• Liquidity sweeps\n• Market regime analysis',
          inline: false,
        }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}
