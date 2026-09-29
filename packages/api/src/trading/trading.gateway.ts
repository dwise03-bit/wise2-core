import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MarketDataService } from './market-data.service';
import { TradingService } from './trading.service';
import { Logger } from '@nestjs/common';

/**
 * Trading WebSocket Gateway
 * Broadcasts real-time market data and trading updates to connected clients
 */
@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://wise2.net' : 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/trading',
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private logger = new Logger('TradingGateway');
  private marketDataInterval!: NodeJS.Timeout;
  private connectedClients = new Set<string>();

  constructor(
    private marketDataService: MarketDataService,
    private tradingService: TradingService
  ) {
    this.startMarketDataBroadcast();
  }

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(`Client connected: ${client.id} (total: ${this.connectedClients.size})`);

    // Send initial market data
    const quotes = this.marketDataService.getQuotes(['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT']);
    client.emit('market-snapshot', Array.from(quotes.values()));
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (total: ${this.connectedClients.size})`);
  }

  /**
   * Subscribe to symbol updates
   */
  @SubscribeMessage('subscribe-symbol')
  handleSubscribe(@MessageBody() data: { symbol: string }, client: Socket) {
    client.join(`symbol:${data.symbol}`);
    const quote = this.marketDataService.getQuote(data.symbol);
    if (quote) {
      client.emit('quote-update', quote);
    }
  }

  /**
   * Unsubscribe from symbol
   */
  @SubscribeMessage('unsubscribe-symbol')
  handleUnsubscribe(@MessageBody() data: { symbol: string }, client: Socket) {
    client.leave(`symbol:${data.symbol}`);
  }

  /**
   * Get position updates
   */
  @SubscribeMessage('subscribe-positions')
  handleSubscribePositions(@MessageBody() data: { userId: string }, client: Socket) {
    client.join(`user:${data.userId}:positions`);
  }

  /**
   * Broadcast market data updates to all connected clients
   */
  private startMarketDataBroadcast() {
    this.marketDataInterval = setInterval(() => {
      const symbols = ['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT', 'GOOGL', 'TSLA'];

      symbols.forEach(symbol => {
        const quote = this.marketDataService.getQuote(symbol);
        if (quote) {
          // Broadcast to all subscribed clients
          this.server.to(`symbol:${symbol}`).emit('quote-update', quote);
        }
      });

      // Broadcast market summary
      const summary = {
        timestamp: new Date(),
        updateCount: symbols.length,
        activeConnections: this.connectedClients.size,
      };
      this.server.emit('market-summary', summary);
    }, 500); // 500ms update interval (2x per second)
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    clearInterval(this.marketDataInterval);
  }
}
