import { Module } from '@nestjs/common';
import { HvacTelemetryController } from './hvac-telemetry.controller';
import { HvacTelemetryService } from './hvac-telemetry.service';

@Module({
  controllers: [HvacTelemetryController],
  providers: [HvacTelemetryService],
  exports: [HvacTelemetryService],
})
export class HvacTelemetryModule {}
