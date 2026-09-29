import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { HermesAction } from './hermes-action.entity';
import { HermesController } from './hermes.controller';
import { HermesService } from './hermes.service';
import { ImageLockService } from './image/image-lock.service';
import { ImagePromptService } from './image/image-prompt.service';
import { ImageProviderService } from './image/image-provider.service';
import { ImageValidatorService } from './image/image-validator.service';
import { ImageOrchestratorService } from './image/image-orchestrator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HermesAction]),
    PrismaModule,
    HttpModule,
  ],
  controllers: [HermesController],
  providers: [
    HermesService,
    ImageLockService,
    ImagePromptService,
    ImageProviderService,
    ImageValidatorService,
    ImageOrchestratorService,
  ],
  exports: [
    HermesService,
    ImageOrchestratorService,
  ],
})
export class HermesModule {}
