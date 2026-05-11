import { Module } from '@nestjs/common';
import { VideoStreamingService } from './video-streaming.service';
import { VideoStreamingController } from './video-streaming.controller';

@Module({
  providers: [VideoStreamingService],
  controllers: [VideoStreamingController],
  exports: [VideoStreamingService],
})
export class VideoStreamingModule {}
