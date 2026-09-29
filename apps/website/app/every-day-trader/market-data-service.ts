// Live Market Data Service
// Connects to real-time market feeds and maintains data consistency

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  quotes: Record<string, MarketQuote>;
  candles: Record<string, ChartCandle[]>;
  lastUpdate: number;
}

// Singleton market data store
class MarketDataService {
  private data: MarketData = {
    quotes: {},
    candles: {},
    lastUpdate: 0,
  };

  private listeners: Set<(data: MarketData) => void> = new Set();

  // Subscribe to data updates
  subscribe(callback: (data: MarketData) => void) {
    this.listeners.add(callback);
    // Send initial data
    callback(this.data);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of updates
  private notify() {
    this.data.lastUpdate = Date.now();
    this.listeners.forEach(listener => listener(this.data));
  }

  // Update quote data
  updateQuote(symbol: string, quote: MarketQuote) {
    this.data.quotes[symbol] = quote;
    this.notify();
  }

  // Batch update quotes
  updateQuotes(quotes: Record<string, MarketQuote>) {
    this.data.quotes = { ...this.data.quotes, ...quotes };
    this.notify();
  }

  // Update candle data
  updateCandles(symbol: string, candles: ChartCandle[]) {
    this.data.candles[symbol] = candles;
    this.notify();
  }

  // Get current quote
  getQuote(symbol: string): MarketQuote | null {
    return this.data.quotes[symbol] || null;
  }

  // Get all data
  getData(): MarketData {
    return this.data;
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();

// Data source adapters
export const DataSources = {
  // Alpha Vantage adapter
  alphaVantage: {
    async fetchQuote(symbol: string, apiKey: string): Promise<MarketQuote> {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data['Global Quote']) {
          throw new Error('Invalid API response');
        }

        const quote = data['Global Quote'];
        const price = parseFloat(quote['05. price']);

        if (isNaN(price)) {
          throw new Error('Invalid price data');
        }

        return {
          symbol,
          price,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
          high: parseFloat(quote['03. high']) || price,
          low: parseFloat(quote['04. low']) || price,
          volume: parseFloat(quote['06. volume']) || 0,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error(`Alpha Vantage API error for ${symbol}:`, error);
        throw error;
      }
    },

    async fetchCandles(symbol: string, apiKey: string, interval: string = '60min'): Promise<ChartCandle[]> {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const timeSeries = data[`Time Series (${interval})`] || {};

      return Object.entries(timeSeries)
        .map(([time, values]: [string, any]) => ({
          time: new Date(time).getTime(),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume']),
        }))
        .reverse();
    },
  },

  // Yahoo Finance adapter (via Rapid API)
  yahooFinance: {
    async fetchQuote(symbol: string, apiKey: string): Promise<MarketQuote> {
      const url = `https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbols=${symbol}`;
      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
        },
      });
      const data = await res.json();
      const quote = data.quoteResponse.result[0];

      return {
        symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        high: quote.fiftyTwoWeekHigh,
        low: quote.fiftyTwoWeekLow,
        volume: quote.regularMarketVolume,
        timestamp: Date.now(),
      };
    },
  },

  // Mock data for development
  mock: {
    generateQuote(symbol: string, basePrice: number = 225): MarketQuote {
      const change = (Math.random() - 0.5) * 5;
      return {
        symbol,
        price: basePrice + change,
        change,
        changePercent: (change / basePrice) * 100,
        high: basePrice + Math.abs(change) + 2,
        low: basePrice - Math.abs(change) - 2,
        volume: Math.floor(Math.random() * 100000000),
        timestamp: Date.now(),
      };
    },

    generateCandles(count: number = 20): ChartCandle[] {
      let price = 225;
      const candles: ChartCandle[] = [];

      for (let i = 0; i < count; i++) {
        const open = price;
        const change = (Math.random() - 0.5) * 3;
        price += change;
        const high = Math.max(open, price) + Math.random() * 1;
        const low = Math.min(open, price) - Math.random() * 1;

        candles.push({
          time: Date.now() - (count - i) * 60000,
          open,
          high,
          low,
          close: price,
          volume: Math.floor(Math.random() * 5000000),
        });
      }

      return candles;
    },
  },
};

// Real-time data sync manager
export class LiveDataManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private dataSource: 'alpha-vantage' | 'yahoo' | 'mock' = 'mock';
  private apiKey: string = '';

  setDataSource(source: 'alpha-vantage' | 'yahoo' | 'mock', apiKey: string = '') {
    this.dataSource = source;
    this.apiKey = apiKey;
  }

  // Start live updates for a symbol
  startLiveUpdates(symbol: string, interval: number = 5000) {
    if (this.intervals.has(symbol)) return;

    const updateInterval = setInterval(async () => {
      try {
        if (this.dataSource === 'mock') {
          const quote = DataSources.mock.generateQuote(symbol);
          marketDataService.updateQuote(symbol, quote);
        } else if (this.dataSource === 'alpha-vantage') {
          try {
            const quote = await DataSources.alphaVantage.fetchQuote(symbol, this.apiKey);
            marketDataService.updateQuote(symbol, quote);
          } catch (apiError) {
            console.warn(`Alpha Vantage failed for ${symbol}, falling back to mock data`);
            // Fallback to mock data on API error
            const quote = DataSources.mock.generateQuote(symbol);
            marketDataService.updateQuote(symbol, quote);
          }
        }
      } catch (error) {
        console.error(`Failed to update ${symbol}:`, error);
      }
    }, interval);

    this.intervals.set(symbol, updateInterval);
  }

  // Stop live updates
  stopLiveUpdates(symbol: string) {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
  }

  // Stop all updates
  stopAll() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

export const liveDataManager = new LiveDataManager();
