import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { TradingService } from './trading.service';

/**
 * WISE² Trading API Controller
 * Handles all trading-related endpoints for the ÆTHER-TRADER system
 */
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  /**
   * GET /api/trading/account
   * Get user's trading account details
   */
  @Get('account')
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
  async getPositions(@Request() req) {
    return this.tradingService.getPositions(req.user.id);
  }

  /**
   * POST /api/trading/close-position/:positionId
   * Close an open position
   */
  @Post('close-position/:positionId')
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
  async getTrades(@Request() req) {
    return this.tradingService.getTrades(req.user.id);
  }

  /**
   * POST /api/trading/journal-entry
   * Log a trade in the journal
   */
  @Post('journal-entry')
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
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
}
