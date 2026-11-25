import { Module } from '@nestjs/common';
import { GoogleVoiceController } from './google-voice.controller';
import { GoogleVoiceService } from './google-voice.service';
import { TelnyxController } from './telnyx.controller';
import { TelnyxService } from './telnyx.service';
import { TelnyxDatabaseService } from './telnyx-database.service';
import { TelnyxTextController } from './telnyx-text.controller';
import { TelnyxTextService } from './telnyx-text.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [PrismaModule, ToolsModule],
  controllers: [GoogleVoiceController, TelnyxController, TelnyxTextController],
  providers: [GoogleVoiceService, TelnyxService, TelnyxDatabaseService, TelnyxTextService],
  exports: [GoogleVoiceService, TelnyxService, TelnyxDatabaseService, TelnyxTextService],
})
export class WebhooksModule {}
