import { Message, EmbedBuilder } from 'discord.js';
import { TradingBotService } from '../services/trading-bot-service';
import { PriceDataService } from '../services/price-data-service';
import { AnalysisService } from '../services/analysis-service';

/**
 * Advanced analysis commands: patterns, volume profile, order flow
 */
export class AnalysisCommands {
  constructor(
    private tradingBotService: TradingBotService,
    private priceDataService: PriceDataService
  ) {}

  /**
   * !patterns [symbol] - Scan for chart patterns
   */
  async handlePatterns(message: Message, args: string[]): Promise<void> {
    const symbol = args[0]?.toUpperCase() || 'BTC/USDT';
    const timeframe = args[1] || '4h';

    try {
      const candles = await this.priceDataService.fetchCandles(symbol, timeframe, 50);

      if (candles.length === 0) {
        await message.reply(`❌ No data for ${symbol}`);
        return;
      }

      const patterns = AnalysisService.detectPatterns(candles);

      if (patterns.length === 0) {
        await message.reply(`📊 No patterns detected on ${symbol} (${timeframe})`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`🎯 Chart Patterns: ${symbol}`)
        .setDescription(`Timeframe: ${timeframe}`)
        .addFields(
          ...patterns.map((p) => ({
            name: `${p.type} (${(p.confidence * 100).toFixed(0)}% confidence)`,
            value: `${p.description}\nTarget: $${p.potentialTarget?.toFixed(2) || 'N/A'} | Stop: $${p.potentialStop?.toFixed(2) || 'N/A'}`,
            inline: false,
          }))
        )
        .setFooter({ text: 'Pattern detection: Head&S, Double Top/Bottom, Triangles, Wedges' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !volume <symbol> [timeframe] - Volume profile analysis
   */
  async handleVolume(message: Message, args: string[]): Promise<void> {
    const symbol = args[0]?.toUpperCase() || 'BTC/USDT';
    const timeframe = args[1] || '4h';

    try {
      const candles = await this.priceDataService.fetchCandles(symbol, timeframe, 100);

      if (candles.length === 0) {
        await message.reply(`❌ No data for ${symbol}`);
        return;
      }

      const vp = AnalysisService.calculateVolumeProfile(candles);

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`📊 Volume Profile: ${symbol}`)
        .setDescription(`${timeframe} timeframe`)
        .addFields(
          { name: 'Point of Control', value: `$${vp.pointOfControl.toFixed(2)}`, inline: true },
          { name: 'Avg Volume', value: `${vp.avgVolume.toFixed(0)}`, inline: true },
          { name: 'Volume Trend', value: vp.volumeTrend.toUpperCase(), inline: true },
          {
            name: 'Volume at High/Low',
            value: `High: ${vp.volumeAtHigh.toFixed(0)} | Low: ${vp.volumeAtLow.toFixed(0)}`,
            inline: false,
          }
        )
        .setFooter({ text: 'POC: price level with highest volume' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !levels <symbol> [timeframe] - Support and resistance
   */
  async handleLevels(message: Message, args: string[]): Promise<void> {
    const symbol = args[0]?.toUpperCase() || 'BTC/USDT';
    const timeframe = args[1] || '4h';

    try {
      const candles = await this.priceDataService.fetchCandles(symbol, timeframe, 100);

      if (candles.length === 0) {
        await message.reply(`❌ No data for ${symbol}`);
        return;
      }

      const { support, resistance } = AnalysisService.detectLevels(candles);

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`📍 Support & Resistance: ${symbol}`)
        .setDescription(`${timeframe} timeframe`)
        .addFields(
          {
            name: '🔴 Resistance Levels',
            value: resistance.length > 0 ? resistance.map((r) => `$${r.toFixed(2)}`).join('\n') : 'None detected',
            inline: true,
          },
          {
            name: '🟢 Support Levels',
            value: support.length > 0 ? support.map((s) => `$${s.toFixed(2)}`).join('\n') : 'None detected',
            inline: true,
          }
        )
        .setFooter({ text: 'Detected from swing highs and lows' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !trend <symbol> [timeframe] - Trend strength (ADX)
   */
  async handleTrend(message: Message, args: string[]): Promise<void> {
    const symbol = args[0]?.toUpperCase() || 'BTC/USDT';
    const timeframe = args[1] || '4h';

    try {
      const candles = await this.priceDataService.fetchCandles(symbol, timeframe, 50);

      if (candles.length === 0) {
        await message.reply(`❌ No data for ${symbol}`);
        return;
      }

      const { adx, trend } = AnalysisService.calculateTrendStrength(candles);

      const trendEmoji =
        trend.includes('UPTREND') ? '📈' : trend.includes('DOWNTREND') ? '📉' : '➡️';

      const embed = new EmbedBuilder()
        .setColor(trend.includes('UPTREND') ? 0x00ff7f : trend.includes('DOWNTREND') ? 0xff0000 : 0xffff00)
        .setTitle(`${trendEmoji} Trend Analysis: ${symbol}`)
        .setDescription(`${timeframe} timeframe`)
        .addFields(
          { name: 'ADX Strength', value: `${adx.toFixed(2)}`, inline: true },
          { name: 'Trend', value: trend.replace(/_/g, ' '), inline: true },
          {
            name: 'Interpretation',
            value:
              adx > 25
                ? 'Strong directional trend'
                : adx > 10
                  ? 'Weak directional trend'
                  : 'Consolidation / Range',
            inline: false,
          }
        )
        .setFooter({ text: 'ADX > 25: Strong | 10-25: Moderate | < 10: Weak/Ranging' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !analyze <symbol> [timeframe] - Full technical analysis
   */
  async handleFullAnalysis(message: Message, args: string[]): Promise<void> {
    const symbol = args[0]?.toUpperCase() || 'BTC/USDT';
    const timeframe = args[1] || '4h';

    try {
      await message.reply(`🔍 Analyzing ${symbol}... (this may take a moment)`);

      const candles = await this.priceDataService.fetchCandles(symbol, timeframe, 100);

      if (candles.length === 0) {
        await message.reply(`❌ No data for ${symbol}`);
        return;
      }

      // Get all analyses
      const patterns = AnalysisService.detectPatterns(candles);
      const vp = AnalysisService.calculateVolumeProfile(candles);
      const { support, resistance } = AnalysisService.detectLevels(candles);
      const { adx, trend } = AnalysisService.calculateTrendStrength(candles);

      const currentPrice = candles[candles.length - 1].close;

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`🔬 Full Technical Analysis: ${symbol}`)
        .setDescription(`${timeframe} • Current: $${currentPrice.toFixed(2)}`)
        .addFields(
          {
            name: '📈 Trend',
            value: `${trend} (ADX: ${adx.toFixed(0)})`,
            inline: false,
          },
          {
            name: '🎯 Patterns',
            value: patterns.length > 0 ? patterns.map((p) => `${p.type} (${(p.confidence * 100).toFixed(0)}%)`).join('\n') : 'None',
            inline: true,
          },
          {
            name: '📊 Volume',
            value: `POC: $${vp.pointOfControl.toFixed(2)}\nTrend: ${vp.volumeTrend}`,
            inline: true,
          },
          {
            name: '🔴 Resistance',
            value: resistance.length > 0 ? resistance.map((r) => `$${r.toFixed(2)}`).join(' | ') : 'None',
            inline: false,
          },
          {
            name: '🟢 Support',
            value: support.length > 0 ? support.map((s) => `$${s.toFixed(2)}`).join(' | ') : 'None',
            inline: false,
          }
        )
        .setFooter({ text: 'Combines pattern, volume, trend, and level analysis' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }
}
