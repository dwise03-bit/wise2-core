import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { ClipperService } from './clipper.service';
import { CreateMediaDto } from './dtos/create-media.dto';
import { CreateClipDto } from './dtos/create-clip.dto';
import { PublishClipDto } from './dtos/publish-clip.dto';

@Controller('v1/clipper')
@UseGuards(JwtAuthGuard)
export class ClipperController {
  constructor(private clipperService: ClipperService) {}

  // Media Asset endpoints
  @Post('media/upload')
  async createMediaAsset(@Request() req, @Body() dto: CreateMediaDto) {
    return this.clipperService.createMediaAsset(req.user.id, dto);
  }

  @Get('media/:id')
  async getMediaAsset(@Request() req, @Param('id') id: string) {
    return this.clipperService.getMediaAsset(req.user.id, id);
  }

  @Post('media/:id/analyze')
  async analyzeMedia(@Request() req, @Param('id') id: string) {
    return this.clipperService.analyzeMedia(req.user.id, id);
  }

  // Clip endpoints
  @Post('clips')
  async createClip(@Request() req, @Body() dto: CreateClipDto) {
    return this.clipperService.createClip(req.user.id, dto);
  }

  @Get('clips/:id')
  async getClip(@Request() req, @Param('id') id: string) {
    return this.clipperService.getClip(req.user.id, id);
  }

  @Post('clips/:id/extract')
  @HttpCode(202) // Accepted, async processing
  async extractClip(@Request() req, @Param('id') id: string) {
    return this.clipperService.extractClip(req.user.id, id);
  }

  // Publishing endpoints
  @Post('clips/:id/publish')
  @HttpCode(202) // Accepted, async processing
  async publishClip(@Request() req, @Param('id') id: string, @Body() dto: PublishClipDto) {
    return this.clipperService.publishClip(req.user.id, id, dto);
  }

  @Get('clips/:id/publishing-jobs')
  async getPublishingJobs(@Request() req, @Param('id') id: string) {
    return this.clipperService.getPublishingJobs(req.user.id, id);
  }

  // Phase 2: AI-powered suggestions
  @Get('media/:id/suggested-clips')
  async getSuggestedClips(@Request() req, @Param('id') id: string) {
    return this.clipperService.getSuggestedClips(req.user.id, id);
  }
}
