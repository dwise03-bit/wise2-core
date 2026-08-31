import { Module, MiddlewareConsumer } from '@nestjs/common';
import { LiveRoomsController } from './live-rooms.controller';
import { LiveRoomsService } from './live-rooms.service';
import { LiveSessionService } from './live-session.service';
import { LiveSessionMiddleware } from './live-session.middleware';
import { VersionStackService } from './version-stack.service';
import { PresenceService } from './presence.service';
import { LiveWebSocketGateway } from './websocket-gateway';
import { PollCleanupService } from './poll-cleanup.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [LiveRoomsController],
  providers: [
    LiveRoomsService,
    LiveSessionService,
    VersionStackService,
    PresenceService,
    LiveWebSocketGateway,
    PollCleanupService,
    PrismaService,
  ],
  exports: [LiveRoomsService, LiveSessionService, VersionStackService, PresenceService],
})
export class LiveModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LiveSessionMiddleware)
      .forRoutes('v1/sound-labs/live/rooms');
  }
}
