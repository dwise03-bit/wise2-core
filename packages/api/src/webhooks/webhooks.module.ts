import { Module } from '@nestjs/common';
import { GoogleVoiceController } from './google-voice.controller';
import { GoogleVoiceService } from './google-voice.service';
import { TelnyxController } from './telnyx.controller';
import { TelnyxService } from './telnyx.service';
import { TelnyxDatabaseService } from './telnyx-database.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleVoiceController, TelnyxController],
  providers: [GoogleVoiceService, TelnyxService, TelnyxDatabaseService],
  exports: [GoogleVoiceService, TelnyxService],
})
export class WebhooksModule {}
