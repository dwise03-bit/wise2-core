import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { AlpacaPaperService, AxiosAlpacaTransport } from './alpaca-paper.service';

/**
 * WISE² Trading Module
 * Provides RESTful endpoints for the ÆTHER-TRADER quantitative trading system.
 * Alpaca credentials remain server-side; Android never receives broker secrets.
 */
@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [TradingController],
  providers: [
    TradingService,
    AlpacaPaperService,
    AxiosAlpacaTransport,
    { provide: 'ALPACA_TRANSPORT', useExisting: AxiosAlpacaTransport },
    {
      provide: AlpacaPaperService,
      useFactory: (config, transport) => new AlpacaPaperService(config, transport),
      inject: [require('@nestjs/config').ConfigService, 'ALPACA_TRANSPORT'],
    },
  ],
})
export class TradingModule {}
