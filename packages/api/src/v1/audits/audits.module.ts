import { Module } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AuditsController],
  providers: [AuditsService, PrismaService],
  exports: [AuditsService],
})
export class AuditsModule {}
