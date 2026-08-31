import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiPhoneRuntimeService } from './ai-phone-runtime.service';
import { AiPhoneWebhookController } from './ai-phone-webhook.controller';
import { AiPhoneService } from './ai-phone.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AiPhoneWebhookController],
  providers: [AiPhoneService, AiPhoneRuntimeService],
  exports: [AiPhoneService],
})
export class AiPhoneModule {}
