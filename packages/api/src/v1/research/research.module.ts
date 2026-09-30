import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchAgentService } from './research-agent.service';
import { CreatorDiscoveryService } from './creator-discovery.service';
import { PlatformMonitorService } from './platform-monitor.service';
import { ScheduledClippingService } from './scheduled-clipping.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClipperModule } from '../clipper/clipper.module';

@Module({
  imports: [PrismaModule, ClipperModule],
  controllers: [ResearchController],
  providers: [
    ResearchAgentService,
    CreatorDiscoveryService,
    PlatformMonitorService,
    ScheduledClippingService,
  ],
  exports: [
    ResearchAgentService,
    CreatorDiscoveryService,
    PlatformMonitorService,
    ScheduledClippingService,
  ],
})
export class ResearchModule {}
