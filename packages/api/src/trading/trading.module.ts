import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { TradingAssistantService } from './trading.assistant';
import { MarketDataService } from './market-data.service';
import { TradingGateway } from './trading.gateway';

/**
 * WISE² Trading Module
 * Provides RESTful endpoints + WebSocket gateway for the ÆTHER-TRADER quantitative trading system
 */
@Module({
  imports: [PrismaModule],
  controllers: [TradingController],
  providers: [TradingService, TradingAssistantService, MarketDataService, TradingGateway],
})
export class TradingModule {}
