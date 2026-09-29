import { Module } from '@nestjs/common';
import { Phase3Controller } from './phase3.controller';
import { DamageDetectionService } from '../ml/damage-detection.service';
import { AREngineService } from '../ar/ar-engine.service';
import { VoiceCommandService } from '../voice/voice-command.service';

@Module({
  controllers: [Phase3Controller],
  providers: [DamageDetectionService, AREngineService, VoiceCommandService],
  exports: [DamageDetectionService, AREngineService, VoiceCommandService],
})
export class Phase3Module {}
