import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { AETHERTrader, TradeSetup, OHLCV } from '../types/trading-engine';
import { PriceDataService } from './price-data-service';
import { ChartService } from './chart-service';

interface TrackedSymbol {
  symbol: string;
  trader: AETHERTrader;
  channelId: string;
  updateInterval: ReturnType<typeof setInterval> | null;
  lastSetups: TradeSetup[];
}

export class TradingBotService {
  private client: Client;
  private priceDataService: PriceDataService;
  private chartService: ChartService;
  private trackedSymbols = new Map<string, TrackedSymbol>();
  private updateTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    client: Client,
    priceDataService: PriceDataService,
    chartService: ChartService
  ) {
    this.client = client;
    this.priceDataService = priceDataService;
    this.chartService = chartService;
  }

  /**
   * Start tracking a trading symbol
   */
  async trackSymbol(
    symbol: string,
    channelId: string,
    timeframe: string = '1h'
  ): Promise<boolean> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || channel.isDMBased()) {
        throw new Error('Invalid channel');
      }

      // Fetch historical data
      const candles = await this.priceDataService.fetchCandles(symbol, timeframe);

      if (candles.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }

      // Create trader
      const trader = new AETHERTrader(symbol);

      // Feed candles to trader
      for (const candle of candles) {
        trader.addCandle(candle);
      }

      // Store tracking info
      this.trackedSymbols.set(symbol, {
        symbol,
        trader,
        channelId,
        updateInterval: null,
        lastSetups: [],
      });

      return true;
    } catch (error) {
      console.error(`Error tracking ${symbol}:`, error);
      return false;
    }
  }

  /**
   * Stop tracking a symbol
   */
  stopTracking(symbol: string): boolean {
    const tracked = this.trackedSymbols.get(symbol);
    if (tracked?.updateInterval) {
      clearInterval(tracked.updateInterval);
    }
    return this.trackedSymbols.delete(symbol);
  }

  /**
   * Poll for new price data and detect setups
   */
  async startPricePolling(intervalSeconds: number = 60) {
    if (this.updateTimer) clearInterval(this.updateTimer);

    this.updateTimer = setInterval(async () => {
      for (const [symbol, tracked] of this.trackedSymbols) {
        try {
          // Fetch latest candle
          const latestCandles = await this.priceDataService.fetchLatestCandle(symbol);

          if (latestCandles.length > 0) {
            const candle = latestCandles[0];
            tracked.trader.addCandle(candle);

            // Scan for setups
            const setups = tracked.trader.scan();

            // Detect new setups
            const newSetups = setups.filter(
              (setup: TradeSetup) => !tracked.lastSetups.find((s) => s.id === setup.id)
            );

            if (newSetups.length > 0) {
              await this.notifySetups(symbol, newSetups, tracked.channelId);
            }

            tracked.lastSetups = setups;
          }
        } catch (error) {
          console.error(`Error polling ${symbol}:`, error);
        }
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Notify Discord channel about new trade setups
   */
  private async notifySetups(
    symbol: string,
    setups: TradeSetup[],
    channelId: string
  ) {
    try {
      const channel = (await this.client.channels.fetch(channelId)) as TextChannel;

      for (const setup of setups as TradeSetup[]) {
        const embed = new EmbedBuilder()
          .setTitle(`🎯 New Setup: ${setup.symbol}`)
          .setColor(setup.direction === 'LONG' ? 0x00ff00 : 0xff0000)
          .addFields(
            {
              name: 'Direction',
              value: `${setup.direction === 'LONG' ? '📈 LONG' : '📉 SHORT'}`,
              inline: true,
            },
            {
              name: 'Type',
              value: setup.type,
              inline: true,
            },
            {
              name: 'Confidence',
              value: `${(setup.confidence * 100).toFixed(1)}%`,
              inline: true,
            },
            {
              name: 'Entry Zone',
              value: `${setup.entryZone.start.toFixed(2)} - ${setup.entryZone.end.toFixed(2)}`,
              inline: false,
            },
            {
              name: 'Stop Loss',
              value: `$${setup.stopPrice.toFixed(2)}`,
              inline: true,
            },
            {
              name: 'Target',
              value: `$${setup.targetPrice.toFixed(2)}`,
              inline: true,
            },
            {
              name: 'Risk/Reward',
              value: `${setup.riskReward.toFixed(2)}:1`,
              inline: true,
            },
            {
              name: 'Fib Level',
              value: setup.fibonacciLevel,
              inline: true,
            },
            {
              name: 'Market Regime',
              value: `${setup.regime.type} (${(setup.regime.confidence * 100).toFixed(0)}%)`,
              inline: false,
            },
            {
              name: 'Rationale',
              value: setup.rationale,
              inline: false,
            }
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Generate and send chart
        try {
          const chartBuffer = await this.chartService.generateSetupChart(
            symbol,
            setup,
            await this.priceDataService.fetchCandles(symbol, '1h')
          );

          if (chartBuffer) {
            await channel.send({
              files: [{ attachment: chartBuffer, name: `${symbol}-setup.png` }],
            });
          }
        } catch (chartError) {
          console.error('Chart generation error:', chartError);
        }
      }
    } catch (error) {
      console.error(`Error notifying channel ${channelId}:`, error);
    }
  }

  /**
   * Get current market state for a symbol
   */
  async getMarketState(symbol: string) {
    const tracked = this.trackedSymbols.get(symbol);
    if (!tracked) return null;
    return tracked.trader.getMarketState();
  }

  /**
   * Get active setups for a symbol
   */
  getSetups(symbol: string): TradeSetup[] {
    const tracked = this.trackedSymbols.get(symbol);
    return tracked?.lastSetups || [];
  }

  /**
   * Get all tracked symbols
   */
  getTrackedSymbols(): string[] {
    return Array.from(this.trackedSymbols.keys());
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.updateTimer) clearInterval(this.updateTimer);
    for (const tracked of this.trackedSymbols.values()) {
      if (tracked.updateInterval) clearInterval(tracked.updateInterval);
    }
  }
}
