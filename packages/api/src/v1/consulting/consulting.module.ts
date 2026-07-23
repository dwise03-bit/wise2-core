import { Module } from '@nestjs/common';
import { ConsultingService } from './consulting.service';
import { PostCallSummaryService } from './postcall.service';
import { PostCallScheduler } from './postcall.scheduler';
import { ConsultingController } from './consulting.controller';
import { PostCallController } from './postcall.controller';
import { PrismaService } from '@app/common/prisma.service';
import { EmailService } from '../email/email.service';
import { QueueService } from '@app/queue/queue.service';

@Module({
  controllers: [ConsultingController, PostCallController],
  providers: [
    ConsultingService,
    PostCallSummaryService,
    PostCallScheduler,
    PrismaService,
    EmailService,
    QueueService,
  ],
  exports: [ConsultingService, PostCallSummaryService],
})
export class ConsultingModule {}
