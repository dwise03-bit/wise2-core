/**
 * Phone Module
 * Central module for WISE² HVAC phone service
 * Orchestrates telephony, STT, TTS, and AI conversation
 */

import { Module } from '@nestjs/common';
import { GoogleVoiceProvider } from './providers/google-voice.provider';
import { CallSessionService } from './services/call-session.service';
import { STTService } from './services/stt.service';
import { TTSService } from './services/tts.service';
import { ConversationService } from './services/conversation.service';
import { PhoneWebhookController } from './controllers/phone-webhook.controller';

@Module({
  controllers: [PhoneWebhookController],
  providers: [
    {
      provide: 'TELEPHONY_PROVIDER',
      useFactory: () => {
        const config = {
          googleVoiceNumber: process.env.GOOGLE_VOICE_NUMBER || '',
          webhookUrl: process.env.PHONE_WEBHOOK_URL || '',
          webhookSecret: process.env.PHONE_WEBHOOK_SECRET || '',
        };
        return new GoogleVoiceProvider(config);
      },
    },
    CallSessionService,
    STTService,
    TTSService,
    ConversationService,
  ],
  exports: [
    'TELEPHONY_PROVIDER',
    CallSessionService,
    STTService,
    TTSService,
    ConversationService,
  ],
})
export class PhoneModule {}
