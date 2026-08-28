import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    AxiosAlpacaTransport,
    {
      provide: AlpacaPaperService,
      useFactory: (config: ConfigService, transport: AxiosAlpacaTransport) =>
        new AlpacaPaperService(config, transport),
      inject: [ConfigService, AxiosAlpacaTransport],
    },
  ],
})
export class TradingModule {}
