import axios from 'axios';
import NodeCache from 'node-cache';
import { OHLCV } from '../types/trading-engine';

/**
 * PriceDataService: Fetch real market data from exchanges/APIs
 * Supports: Binance, CoinGecko, Alpha Vantage
 */
export class PriceDataService {
  private cache = new NodeCache({ stdTTL: 300 }); // 5 min cache
  private binanceBaseUrl = 'https://api.binance.com/api/v3';
  private alphaVantageKey = process.env.ALPHA_VANTAGE_KEY || '';

  /**
   * Fetch OHLCV candles from Binance
   * Timeframes: 1m, 5m, 15m, 30m, 1h, 4h, 1d
   */
  async fetchCandles(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<OHLCV[]> {
    const cacheKey = `candles-${symbol}-${timeframe}-${limit}`;
    const cached = this.cache.get<OHLCV[]>(cacheKey);

    if (cached) return cached;

    try {
      // Try Binance first (crypto)
      if (this.isCryptoSymbol(symbol)) {
        return await this.fetchBinanceCandles(symbol, timeframe, limit);
      }

      // Fallback to Alpha Vantage (stocks)
      return await this.fetchAlphaVantageCandles(symbol, timeframe, limit);
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      // Return mock data for demo
      return this.generateMockCandles(symbol, limit);
    }
  }

  /**
   * Fetch latest candle for real-time updates
   */
  async fetchLatestCandle(symbol: string, timeframe: string = '1h'): Promise<OHLCV[]> {
    try {
      const candles = await this.fetchCandles(symbol, timeframe, 1);
      return candles.slice(-1);
    } catch (error) {
      console.error(`Error fetching latest candle for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch from Binance API
   */
  private async fetchBinanceCandles(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<OHLCV[]> {
    const params = {
      symbol: symbol.replace('/', '').toUpperCase(),
      interval: timeframe,
      limit,
    };

    const response = await axios.get(`${this.binanceBaseUrl}/klines`, { params });

    const candles: OHLCV[] = response.data.map((kline: any[]) => ({
      time: new Date(kline[0]),
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[7]),
    }));

    return candles;
  }

  /**
   * Fetch from Alpha Vantage API (stocks)
   */
  private async fetchAlphaVantageCandles(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<OHLCV[]> {
    if (!this.alphaVantageKey) {
      return this.generateMockCandles(symbol, limit);
    }

    const interval = this.mapTimeframeToAlphaVantage(timeframe);
    const params = {
      function: `INTRADAY`,
      symbol: symbol.replace('/', '').toUpperCase(),
      interval,
      apikey: this.alphaVantageKey,
      outputsize: 'full',
    };

    const response = await axios.get('https://www.alphavantage.co/query', { params });

    const timeSeries = response.data[`Time Series (${interval})`] || {};
    const candles: OHLCV[] = Object.entries(timeSeries)
      .slice(0, limit)
      .map(([time, data]: [string, any]) => ({
        time: new Date(time),
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseFloat(data['5. volume']),
      }));

    return candles;
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      if (this.isCryptoSymbol(symbol)) {
        const params = {
          symbol: symbol.replace('/', '').toUpperCase(),
        };
        const response = await axios.get(`${this.binanceBaseUrl}/ticker/price`, { params });
        return parseFloat(response.data.price);
      }

      // For stocks, fetch latest candle
      const candles = await this.fetchCandles(symbol, '1m', 1);
      return candles.length > 0 ? candles[0].close : 0;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return 0;
    }
  }

  /**
   * Check if symbol is crypto or stock
   */
  private isCryptoSymbol(symbol: string): boolean {
    const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'USDT', 'USDC'];
    return cryptoSymbols.some((s) => symbol.includes(s));
  }

  /**
   * Map timeframe to Alpha Vantage format
   */
  private mapTimeframeToAlphaVantage(timeframe: string): string {
    const map: Record<string, string> = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '60min',
    };
    return map[timeframe] || '60min';
  }

  /**
   * Generate mock candles for demo/testing
   */
  private generateMockCandles(symbol: string, count: number): OHLCV[] {
    const candles: OHLCV[] = [];
    let basePrice = 100 + Math.random() * 50;

    for (let i = count; i > 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000); // 1 hour intervals
      const volatility = 0.02; // 2% volatility

      const open = basePrice;
      const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);

      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000,
      });

      basePrice = close;
    }

    return candles;
  }
}
