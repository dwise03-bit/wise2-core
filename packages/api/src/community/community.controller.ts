import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';

@ApiTags('community')
@Controller('v1/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('discord/setup')
  async setupDiscord(@Body() dto: { guild_id: string }) {
    return await this.communityService.setupDiscordServer(dto.guild_id);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('metric') metric: string = 'points') {
    return await this.communityService.getLeaderboard(metric);
  }

  @Post('features/vote')
  async voteOnFeature(@Body() dto: { user_id: string; feature_id: string }) {
    return await this.communityService.voteOnFeature(dto.user_id, dto.feature_id);
  }
}
