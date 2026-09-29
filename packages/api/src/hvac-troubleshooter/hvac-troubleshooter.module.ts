import { Module } from '@nestjs/common';
import { HvacTroubleshooterController } from './hvac-troubleshooter.controller';
import { HvacTroubleshooterService } from './hvac-troubleshooter.service';
import { HvacTroubleshooterGateway } from './hvac-troubleshooter.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HvacTroubleshooterController],
  providers: [HvacTroubleshooterService, HvacTroubleshooterGateway],
  exports: [HvacTroubleshooterService],
})
export class HvacTroubleshooterModule {}
