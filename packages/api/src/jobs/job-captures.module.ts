import { Module } from '@nestjs/common';
import { JobCapturesController } from './job-captures.controller';
import { JobCapturesService } from './job-captures.service';
import { JobRealtimeGateway } from './job-realtime.gateway';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [JobCapturesController],
  providers: [JobCapturesService, JobRealtimeGateway],
  exports: [JobCapturesService, JobRealtimeGateway],
})
export class JobCapturesModule {}
