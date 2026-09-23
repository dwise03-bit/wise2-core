import { Injectable, Logger } from '@nestjs/common';
import WebSocket from 'isomorphic-ws';

interface QuoteData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: Date;
}

interface CandelData {
  symbol: string;
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Live Market Data Service
 * Provides real-time price feeds, aggregates market data, and distributes via WebSocket
 */
@Injectable()
export class MarketDataService {
  private readonly logger = new Logger('MarketDataService');
  private ws: WebSocket | null = null;
  private priceCache = new Map<string, QuoteData>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeWebSocket();
  }

  /**
   * Initialize Polygon.io WebSocket connection
   */
  private initializeWebSocket() {
    const apiKey = process.env.POLYGON_API_KEY;

    if (!apiKey) {
      this.logger.warn('POLYGON_API_KEY not configured. Using mock data.');
      this.startMockDataStream();
      return;
    }

    try {
      const wsUrl = `wss://socket.polygon.io/stocks`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.logger.log('✅ Connected to Polygon.io WebSocket');
        this.reconnectAttempts = 0;

        // Subscribe to quotes
        this.subscribe(['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NQ', 'ES', 'SPY']);
      };

      this.ws.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'Q') {
            // Quote data
            this.handleQuoteUpdate(data);
          } else if (data.type === 'T') {
            // Trade data
            this.handleTradeUpdate(data);
          }
        } catch (error) {
          this.logger.error('Error parsing market data:', error);
        }
      };

      this.ws.onerror = (error: any) => {
        this.logger.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.logger.warn('WebSocket closed. Attempting reconnect...');
        this.attemptReconnect();
      };
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket:', error);
      this.startMockDataStream();
    }
  }

  /**
   * Subscribe to market data updates
   */
  private subscribe(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const subscribeMsg = {
      action: 'subscribe',
      params: symbols.map(s => `Q.${s}`).join(','),
    };

    this.ws.send(JSON.stringify(subscribeMsg));
    this.logger.log(`Subscribed to quotes: ${symbols.join(', ')}`);
  }

  /**
   * Handle quote (bid/ask) updates
   */
  private handleQuoteUpdate(data: any) {
    const quote: QuoteData = {
      symbol: data.symbol,
      price: data.last || data.mid || 0,
      bid: data.bid || 0,
      ask: data.ask || 0,
      volume: data.size || 0,
      timestamp: new Date(),
    };

    this.priceCache.set(data.symbol, quote);

    // Broadcast to connected clients (will implement WebSocket gateway)
    this.broadcastUpdate('quote', quote);
  }

  /**
   * Handle trade updates
   */
  private handleTradeUpdate(data: any) {
    // Trade data for high-frequency updates
    const trade = {
      symbol: data.sym,
      price: data.p,
      volume: data.s,
      timestamp: new Date(),
    };

    this.broadcastUpdate('trade', trade);
  }

  /**
   * Attempt WebSocket reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnect attempts reached. Using mock data.');
      this.startMockDataStream();
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    this.reconnectAttempts++;

    this.logger.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    setTimeout(() => this.initializeWebSocket(), delay);
  }

  /**
   * Start mock data stream (fallback)
   */
  private startMockDataStream() {
    const symbols = ['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT'];
    const priceMap = {
      BTCUSD: 43000,
      ETHUSD: 2250,
      AAPL: 225,
      MSFT: 380,
    };

    setInterval(() => {
      symbols.forEach(symbol => {
        const basePrice = priceMap[symbol as keyof typeof priceMap] || 100;
        const change = (Math.random() - 0.5) * 2; // +/- 1%
        const price = basePrice + change;

        const quote: QuoteData = {
          symbol,
          price,
          bid: price - 0.01,
          ask: price + 0.01,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date(),
        };

        this.priceCache.set(symbol, quote);
        this.broadcastUpdate('quote', quote);
      });
    }, 1000);

    this.logger.log('Mock data stream started');
  }

  /**
   * Broadcast market data update
   */
  private broadcastUpdate(type: string, data: any) {
    // TODO: Implement WebSocket gateway broadcast
    // this.gateway.server.emit('market-update', { type, data });
  }

  /**
   * Get latest price for symbol
   */
  getPrice(symbol: string): number {
    return this.priceCache.get(symbol)?.price || 0;
  }

  /**
   * Get full quote data
   */
  getQuote(symbol: string): QuoteData | null {
    return this.priceCache.get(symbol) || null;
  }

  /**
   * Get multiple quotes
   */
  getQuotes(symbols: string[]): Map<string, QuoteData> {
    const result = new Map<string, QuoteData>();
    symbols.forEach(sym => {
      const quote = this.priceCache.get(sym);
      if (quote) {
        result.set(sym, quote);
      }
    });
    return result;
  }

  /**
   * Cleanup on module shutdown
   */
  onModuleDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
