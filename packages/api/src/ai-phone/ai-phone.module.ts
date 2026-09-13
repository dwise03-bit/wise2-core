import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiPhoneRuntimeService } from './ai-phone-runtime.service';
import { AiPhoneWebhookController } from './ai-phone-webhook.controller';
import { AiPhoneService } from './ai-phone.service';
import { TelnyxWebhookController } from './telnyx-webhook.controller';
import { RevenueOsModule } from '../revenue-os/revenue-os.module';
import { AssistantWriteController } from './assistant-write.controller';

@Module({
  imports: [PrismaModule, AuthModule, RevenueOsModule],
  controllers: [AiPhoneWebhookController, TelnyxWebhookController, AssistantWriteController],
  providers: [AiPhoneService, AiPhoneRuntimeService],
  exports: [AiPhoneService],
})
export class AiPhoneModule {}
