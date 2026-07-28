import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ConsultingAuditService } from './consulting-audit.service';
import { ConsultingAuditController } from './consulting-audit.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ConsultingAuditController],
  providers: [ConsultingAuditService],
  exports: [ConsultingAuditService],
})
export class ConsultingAuditModule {}
