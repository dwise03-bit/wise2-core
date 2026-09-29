import { Module } from '@nestjs/common';
import { ClipperService } from './clipper.service';
import { ClipperController } from './clipper.controller';
import { VideoExtractorService } from './video-extractor.service';
import { DiscordPublisherService } from './discord-publisher.service';

@Module({
  controllers: [ClipperController],
  providers: [ClipperService, VideoExtractorService, DiscordPublisherService],
  exports: [ClipperService],
})
export class ClipperModule {}
