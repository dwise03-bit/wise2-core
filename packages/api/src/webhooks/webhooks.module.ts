import { Module } from '@nestjs/common';
import { GoogleVoiceController } from './google-voice.controller';
import { GoogleVoiceService } from './google-voice.service';
import { TelnyxController } from './telnyx.controller';
import { TelnyxService } from './telnyx.service';

@Module({
  controllers: [GoogleVoiceController, TelnyxController],
  providers: [GoogleVoiceService, TelnyxService],
  exports: [GoogleVoiceService, TelnyxService],
})
export class WebhooksModule {}
