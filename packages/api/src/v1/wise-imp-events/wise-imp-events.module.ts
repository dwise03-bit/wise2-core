import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WiseImpEventsController } from './wise-imp-events.controller';
import { WiseImpEventsService } from './wise-imp-events.service';

@Module({
  imports: [PrismaModule],
  controllers: [WiseImpEventsController],
  providers: [WiseImpEventsService],
})
export class WiseImpEventsModule {}
