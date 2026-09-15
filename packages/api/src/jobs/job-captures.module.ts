import { Module } from '@nestjs/common';
import { JobCapturesController } from './job-captures.controller';
import { JobCapturesService } from './job-captures.service';
import { JobRealtimeGateway } from './job-realtime.gateway';
import { StorageModule } from '../storage/storage.module';
import { HvacDiagnosticsModule } from '../hvac/hvac-diagnostics.module';

@Module({
  imports: [StorageModule, HvacDiagnosticsModule],
  controllers: [JobCapturesController],
  providers: [JobCapturesService, JobRealtimeGateway],
  exports: [JobCapturesService, JobRealtimeGateway],
})
export class JobCapturesModule {}
