import { Module } from '@nestjs/common';
import { GoogleVoiceController } from './google-voice.controller';
import { GoogleVoiceService } from './google-voice.service';

@Module({
  controllers: [GoogleVoiceController],
  providers: [GoogleVoiceService],
  exports: [GoogleVoiceService],
})
export class WebhooksModule {}
