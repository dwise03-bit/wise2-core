import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { PlatformSource } from '@prisma/client';
import { ResearchAgentService } from './research-agent.service';
import { CreatorDiscoveryService } from './creator-discovery.service';
import { PlatformMonitorService } from './platform-monitor.service';
import { ScheduledClippingService } from './scheduled-clipping.service';

@Controller('v1/research')
export class ResearchController {
  constructor(
    private agent: ResearchAgentService,
    private discovery: CreatorDiscoveryService,
    private monitor: PlatformMonitorService,
    private scheduling: ScheduledClippingService,
  ) {}

  /**
   * Daily research job - discover trending creators and schedule clips
   * POST /api/v1/research/daily
   */
  @Post('daily')
  async runDailyResearch() {
    return this.agent.runDailyResearch();
  }

  /**
   * Get trending topics for clipping
   * GET /api/v1/research/trends
   */
  @Get('trends')
  async getTrends() {
    return this.agent.analyzeTrendingTopics();
  }

  /**
   * Discover trending creators
   * GET /api/v1/research/creators/trending
   */
  @Get('creators/trending')
  async discoverCreators(@Query('limit') limit = 20) {
    return this.discovery.discoverTrendingCreators(undefined, undefined, limit);
  }

  /**
   * Deep dive analysis of a creator
   * GET /api/v1/research/creators/:handle/analysis
   */
  @Get('creators/:handle/analysis')
  async analyzeCreator(@Param('handle') handle: string) {
    return this.discovery.analyzeCreatorDeepDive(handle);
  }

  /**
   * Find creators in a specific niche
   * GET /api/v1/research/creators/niche/:niche
   */
  @Get('creators/niche/:niche')
  async findInNiche(@Param('niche') niche: string, @Query('minScore') minScore = 60) {
    return this.agent.findCreatorsInNiche(niche, minScore);
  }

  /**
   * Compare two creators
   * GET /api/v1/research/compare
   */
  @Get('compare')
  async compareCreators(
    @Query('creator1') creator1: string,
    @Query('creator2') creator2: string,
  ) {
    return this.agent.compareCreators(creator1, creator2);
  }

  /**
   * Schedule clips from a creator
   * POST /api/v1/research/schedule-clips
   */
  @Post('schedule-clips')
  async scheduleClips(
    @Body() { creatorHandle, platforms }: { creatorHandle: string; platforms: PlatformSource[] },
  ) {
    return this.monitor.scheduleClipsFromLiveContent(creatorHandle, platforms);
  }

  /**
   * Get scheduled clips for a creator
   * GET /api/v1/research/creators/:handle/scheduled
   */
  @Get('creators/:handle/scheduled')
  async getScheduledClips(@Param('handle') handle: string) {
    return this.scheduling.getScheduledClipsForCreator(handle);
  }

  /**
   * Process all scheduled clips (extract & publish)
   * POST /api/v1/research/process-scheduled
   */
  @Post('process-scheduled')
  async processScheduledClips() {
    return this.scheduling.processScheduledClips();
  }

  /**
   * Get scheduled clips statistics
   * GET /api/v1/research/scheduled-stats
   */
  @Get('scheduled-stats')
  async getScheduledStats() {
    return this.scheduling.getScheduledClipsStats();
  }

  /**
   * Reschedule a clip
   * PUT /api/v1/research/scheduled/:id/reschedule
   */
  @Post('scheduled/:id/reschedule')
  async rescheduleClip(
    @Param('id') id: string,
    @Body() { scheduledFor }: { scheduledFor: string },
  ) {
    return this.scheduling.rescheduleClip(id, new Date(scheduledFor));
  }

  /**
   * Cancel a scheduled clip
   * DELETE /api/v1/research/scheduled/:id
   */
  @Post('scheduled/:id/cancel')
  async cancelScheduledClip(@Param('id') id: string) {
    return this.scheduling.cancelScheduledClip(id);
  }
}
