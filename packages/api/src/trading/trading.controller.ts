import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TradingService } from './trading.service';
import { TradingAssistantService } from './trading.assistant';
import { TradingViewService } from './tradingview.service';

/**
 * WISE² Trading API Controller
 * Handles all trading-related endpoints for the ÆTHER-TRADER system
 */
@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly assistantService: TradingAssistantService,
    private readonly tradingViewService: TradingViewService
  ) {}

  /**
   * GET /api/trading/account
   * Get user's trading account details
   */
  @Get('account')
  @UseGuards(JwtAuthGuard)
  async getAccount(@Request() req) {
    return this.tradingService.getAccount(req.user.id);
  }

  /**
   * GET /api/trading/market-data/:symbol
   * Get current market regime and detected setups
   */
  @Get('market-data/:symbol')
  async getMarketData(@Param('symbol') symbol: string) {
    return this.tradingService.getMarketData(symbol);
  }

  /**
   * POST /api/trading/ingest-candle/:symbol
   * Ingest new OHLCV candle
   */
  @Post('ingest-candle/:symbol')
  async ingestCandle(
    @Param('symbol') symbol: string,
    @Body() candle: { time: string; open: number; high: number; low: number; close: number; volume?: number }
  ) {
    return this.tradingService.ingestCandle(symbol, candle);
  }

  /**
   * GET /api/trading/setups/:symbol
   * Get active trade setups for a symbol
   */
  @Get('setups/:symbol')
  async getSetups(
    @Param('symbol') symbol: string,
    @Query('minConfidence') minConfidence?: string
  ) {
    return this.tradingService.getSetups(symbol, parseFloat(minConfidence || '0.65'));
  }

  /**
   * POST /api/trading/paper-order
   * Create a paper trading order
   */
  @Post('paper-order')
  @UseGuards(JwtAuthGuard)
  async createPaperOrder(
    @Request() req,
    @Body() orderData: {
      symbol: string;
      direction: 'LONG' | 'SHORT';
      quantity: number;
      entryPrice: number;
      stopPrice: number;
      target1: number;
      target2?: number;
    }
  ) {
    return this.tradingService.createPaperOrder(req.user.id, orderData);
  }

  /**
   * GET /api/trading/positions
   * Get user's open positions
   */
  @Get('positions')
  @UseGuards(JwtAuthGuard)
  async getPositions(@Request() req) {
    return this.tradingService.getPositions(req.user.id);
  }

  /**
   * POST /api/trading/close-position/:positionId
   * Close an open position
   */
  @Post('close-position/:positionId')
  @UseGuards(JwtAuthGuard)
  async closePosition(
    @Request() req,
    @Param('positionId') positionId: string,
    @Body() data: { exitPrice: number }
  ) {
    return this.tradingService.closePosition(req.user.id, positionId, data.exitPrice);
  }

  /**
   * GET /api/trading/trades
   * Get user's trade history
   */
  @Get('trades')
  @UseGuards(JwtAuthGuard)
  async getTrades(@Request() req) {
    return this.tradingService.getTrades(req.user.id);
  }

  /**
   * POST /api/trading/journal-entry
   * Log a trade in the journal
   */
  @Post('journal-entry')
  @UseGuards(JwtAuthGuard)
  async createJournalEntry(
    @Request() req,
    @Body() journalData: {
      symbol: string;
      tradeDate: string;
      result: 'WIN' | 'LOSS' | 'BREAKEVEN';
      pnl?: number;
      whatWentWell?: string;
      whatWentWrong?: string;
      lessonsLearned?: string;
    }
  ) {
    return this.tradingService.createJournalEntry(req.user.id, journalData);
  }

  /**
   * GET /api/trading/journal
   * Get user's trading journal
   */
  @Get('journal')
  @UseGuards(JwtAuthGuard)
  async getJournal(@Request() req) {
    return this.tradingService.getJournal(req.user.id);
  }

  /**
   * GET /api/trading/signals
   * Get active trading signals
   */
  @Get('signals')
  async getSignals() {
    return this.tradingService.getSignals();
  }

  /**
   * POST /api/trading/risk-event
   * Log a risk management event
   */
  @Post('risk-event')
  @UseGuards(JwtAuthGuard)
  async logRiskEvent(
    @Request() req,
    @Body() eventData: {
      eventType: string;
      message: string;
      blockedTrade?: boolean;
    }
  ) {
    return this.tradingService.logRiskEvent(req.user.id, eventData);
  }

  /**
   * GET /api/trading/tradingview/watchlist/:username
   * Sync watchlist from TradingView public profile
   */
  @Get('tradingview/watchlist/:username')
  async getTradingViewWatchlist(@Param('username') username: string) {
    const watchlist = await this.tradingViewService.getWatchlist(username);
    return { username, watchlist, count: watchlist.length };
  }

  /**
   * GET /api/trading/tradingview/alerts/:username
   * Get all price alerts for user
   */
  @Get('tradingview/alerts/:username')
  async getAlerts(@Param('username') username: string) {
    const alerts = this.tradingViewService.getAlerts(username);
    return { username, alerts, count: alerts.length };
  }

  /**
   * POST /api/trading/tradingview/alerts
   * Create a new price alert
   */
  @Post('tradingview/alerts')
  async createAlert(
    @Body()
    data: {
      username: string;
      symbol: string;
      type: 'ABOVE' | 'BELOW';
      price: number;
    }
  ) {
    const alert = this.tradingViewService.createAlert(
      data.username,
      data.symbol,
      data.type,
      data.price
    );
    return { alert, message: '✅ Alert created' };
  }

  /**
   * POST /api/trading/tradingview/alerts/:username/:alertId/toggle
   * Toggle alert active/paused status
   */
  @Post('tradingview/alerts/:username/:alertId/toggle')
  async toggleAlert(
    @Param('username') username: string,
    @Param('alertId') alertId: string
  ) {
    const success = this.tradingViewService.toggleAlert(username, alertId);
    return { success, message: success ? '✅ Alert toggled' : '❌ Alert not found' };
  }

  /**
   * Delete /api/trading/tradingview/alerts/:username/:alertId
   * Delete a price alert
   */
  @Delete('tradingview/alerts/:username/:alertId')
  async deleteAlert(
    @Param('username') username: string,
    @Param('alertId') alertId: string
  ) {
    const success = this.tradingViewService.deleteAlert(username, alertId);
    return { success, message: success ? '✅ Alert deleted' : '❌ Alert not found' };
  }

  /**
   * POST /api/trading/assistant
   * AI Trading Assistant - market analysis & guidance
   */
  @Post('assistant')
  async assistantChat(
    @Body() data: {
      message: string;
      context?: {
        symbol: string;
        lastPrice: number;
        change: number;
        regime: string;
        setups: number;
      };
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }
  ) {
    const response = await this.assistantService.processMessage(
      data.message,
      data.context || {
        symbol: 'BTCUSD',
        lastPrice: 0,
        change: 0,
        regime: 'RANGING',
        setups: 0,
      },
      data.conversationHistory || []
    );

    return { response };
  }
}
