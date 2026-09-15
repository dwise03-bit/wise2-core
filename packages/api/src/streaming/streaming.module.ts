import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { MediasoupService } from './mediasoup.service';
import { RecordingService } from './recording.service';
import { MediaStorageService } from '../storage/media-storage.service';

@Module({
  controllers: [StreamingController],
  providers: [
    StreamingService,
    MediasoupService,
    RecordingService,
    MediaStorageService,
  ],
  exports: [StreamingService, MediasoupService, RecordingService],
})
export class StreamingModule {}
