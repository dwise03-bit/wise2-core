import { Module } from '@nestjs/common';
import { Phase3Controller } from './phase3.controller';
import { DamageDetectionService } from '../ml/damage-detection.service';
import { AREngineService } from '../ar/ar-engine.service';
import { VoiceCommandService } from '../voice/voice-command.service';
import { ModelTrainingService } from '../ml/model-training.service';

@Module({
  controllers: [Phase3Controller],
  providers: [DamageDetectionService, AREngineService, VoiceCommandService, ModelTrainingService],
  exports: [DamageDetectionService, AREngineService, VoiceCommandService, ModelTrainingService],
})
export class Phase3Module {}
