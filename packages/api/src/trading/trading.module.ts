import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';

/**
 * WISE² Trading Module
 * Provides RESTful endpoints for the ÆTHER-TRADER quantitative trading system
 */
@Module({
  imports: [PrismaModule],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
