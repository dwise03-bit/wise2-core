import { Module } from '@nestjs/common';
import { SoundLabsController } from './sound-labs.controller';
import { SoundLabsService } from './sound-labs.service';
import { EntitlementsService } from '../billing/entitlements.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SoundLabsController],
  providers: [SoundLabsService, EntitlementsService, PrismaService],
  exports: [SoundLabsService],
})
export class SoundLabsModule {}
