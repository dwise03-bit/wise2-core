import { Module } from '@nestjs/common';
import { HvacDiagnosticsController } from './hvac-diagnostics.controller';
import { HvacDiagnosticsService } from './hvac-diagnostics.service';

@Module({
  controllers: [HvacDiagnosticsController],
  providers: [HvacDiagnosticsService],
  exports: [HvacDiagnosticsService],
})
export class HvacDiagnosticsModule {}
