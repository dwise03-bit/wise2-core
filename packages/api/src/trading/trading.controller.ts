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
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TradingService } from './trading.service';
import { AlpacaPaperService, PaperOrderInput } from './alpaca-paper.service';

/**
 * WISE² Trading API Controller
 * Paper broker credentials are held only by the backend.
 */
@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly alpacaPaper: AlpacaPaperService,
  ) {}

  @Get('account')
  @UseGuards(JwtAuthGuard)
  async getAccount(@Request() req) {
    return this.tradingService.getAccount(req.user.id);
  }

  // Android v0.2 contract: live Alpaca paper account, no broker secrets returned.
  @Get('paper/account')
  async getPaperAccount() {
    return this.alpacaPaper.getPaperAccount();
  }

  // Android v0.2 contract: live Alpaca market snapshots for the WISE² scanner.
  @Get('scanner')
  async getScanner(@Query('symbols') symbols?: string) {
    const parsed = symbols
      ? symbols.split(',').map(value => value.trim().toUpperCase()).filter(Boolean).slice(0, 12)
      : undefined;
    return this.alpacaPaper.getScanner(parsed);
  }

  // Android v0.2 contract: explicit client approval is mandatory and WISE Guard
  // re-checks risk server-side before a request reaches Alpaca paper trading.
  @Post('paper/orders')
  async submitApprovedPaperOrder(@Body() orderData: PaperOrderInput) {
    return this.alpacaPaper.submitPaperOrder(orderData);
  }

  @Get('market-data/:symbol')
  async getMarketData(@Param('symbol') symbol: string) {
    return this.tradingService.getMarketData(symbol);
  }

  @Post('ingest-candle/:symbol')
  async ingestCandle(
    @Param('symbol') symbol: string,
    @Body() candle: { time: string; open: number; high: number; low: number; close: number; volume?: number }
  ) {
    return this.tradingService.ingestCandle(symbol, candle);
  }

  @Get('setups/:symbol')
  async getSetups(
    @Param('symbol') symbol: string,
    @Query('minConfidence') minConfidence?: string
  ) {
    return this.tradingService.getSetups(symbol, parseFloat(minConfidence || '0.65'));
  }

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

  @Get('positions')
  @UseGuards(JwtAuthGuard)
  async getPositions(@Request() req) {
    return this.tradingService.getPositions(req.user.id);
  }

  @Post('close-position/:positionId')
  @UseGuards(JwtAuthGuard)
  async closePosition(
    @Request() req,
    @Param('positionId') positionId: string,
    @Body() data: { exitPrice: number }
  ) {
    return this.tradingService.closePosition(req.user.id, positionId, data.exitPrice);
  }

  @Get('trades')
  @UseGuards(JwtAuthGuard)
  async getTrades(@Request() req) {
    return this.tradingService.getTrades(req.user.id);
  }

  @Post('journal-entry')
  @UseGuards(JwtAuthGuard)
  async createJournalEntry(@Request() req, @Body() journalData: any) {
    return this.tradingService.createJournalEntry(req.user.id, journalData);
  }

  @Get('journal')
  @UseGuards(JwtAuthGuard)
  async getJournal(@Request() req) {
    return this.tradingService.getJournal(req.user.id);
  }

  @Get('signals')
  async getSignals() {
    return this.tradingService.getSignals();
  }

  @Post('risk-event')
  @UseGuards(JwtAuthGuard)
  async logRiskEvent(@Request() req, @Body() eventData: any) {
    return this.tradingService.logRiskEvent(req.user.id, eventData);
  }
}
