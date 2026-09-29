import { Module } from '@nestjs/common';
import { GoogleVoiceController } from './google-voice.controller';
import { GoogleVoiceService } from './google-voice.service';
import { TelnyxController } from './telnyx.controller';
import { TelnyxService } from './telnyx.service';
import { TelnyxDatabaseService } from './telnyx-database.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [PrismaModule, ToolsModule],
  controllers: [GoogleVoiceController, TelnyxController],
  providers: [GoogleVoiceService, TelnyxService, TelnyxDatabaseService],
  exports: [GoogleVoiceService, TelnyxService, TelnyxDatabaseService],
})
export class WebhooksModule {}
