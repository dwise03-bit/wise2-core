import { Module } from '@nestjs/common';
import { ClipperService } from './clipper.service';
import { ClipperController } from './clipper.controller';
import { VideoExtractorService } from './video-extractor.service';
import { DiscordPublisherService } from './discord-publisher.service';
import { AudioAnalysisService } from './audio-analysis.service';
import { MomentDetectionService } from './moment-detection.service';
import { TranscriptionService } from './transcription.service';
import { CaptionGeneratorService } from './caption-generator.service';
import { PublishingCoordinatorService } from './publishing-coordinator.service';
import { InstagramPublisher } from './publishers/instagram-publisher';
import { TikTokPublisher } from './publishers/tiktok-publisher';
import { YouTubePublisher } from './publishers/youtube-publisher';
import { TwitterPublisher } from './publishers/twitter-publisher';

@Module({
  controllers: [ClipperController],
  providers: [
    ClipperService,
    VideoExtractorService,
    DiscordPublisherService,
    AudioAnalysisService,
    MomentDetectionService,
    TranscriptionService,
    CaptionGeneratorService,
    PublishingCoordinatorService,
    InstagramPublisher,
    TikTokPublisher,
    YouTubePublisher,
    TwitterPublisher,
  ],
  exports: [ClipperService],
})
export class ClipperModule {}
