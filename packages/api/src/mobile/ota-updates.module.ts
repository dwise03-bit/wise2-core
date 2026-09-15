import { Module } from '@nestjs/common';
import { OTAUpdatesService } from './ota-updates.service';
import { OTAUpdatesController } from './ota-updates.controller';

/**
 * OTA Updates Module
 * Provides mobile APK update management
 * - Version checking
 * - Delta updates (bandwidth-optimized)
 * - Staged rollouts
 * - Rollback capability
 */
@Module({
  providers: [OTAUpdatesService],
  controllers: [OTAUpdatesController],
  exports: [OTAUpdatesService],
})
export class OTAUpdatesModule {}
