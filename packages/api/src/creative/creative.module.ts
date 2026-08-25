import { Module } from '@nestjs/common';
import { CreativeGenerationController } from './controllers/generation.controller';
import { CreativeGenerationService } from './services/generation.service';

@Module({
  controllers: [CreativeGenerationController],
  providers: [CreativeGenerationService],
  exports: [CreativeGenerationService],
})
export class CreativeModule {}
