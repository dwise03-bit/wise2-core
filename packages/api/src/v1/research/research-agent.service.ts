import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { CreatorDiscoveryService } from './creator-discovery.service';
import { PlatformMonitorService } from './platform-monitor.service';
import { PlatformSource, ResearchStatus } from '@prisma/client';

@Injectable()
export class ResearchAgentService {
  private readonly logger = new Logger('ResearchAgentService');

  constructor(
    private prisma: PrismaService,
    private discovery: CreatorDiscoveryService,
    private monitor: PlatformMonitorService,
  ) {}

  /**
   * Daily research job: Discover trending creators and schedule clips
   * Runs once per day to find new clipping opportunities
   */
  async runDailyResearch(): Promise<any> {
    this.logger.log('🤖 Starting daily research job...');

    const job = await this.prisma.researchJob.create({
      data: {
        jobType: 'daily-discovery',
        status: ResearchStatus.ANALYZING,
        platforms: [PlatformSource.YOUTUBE, PlatformSource.TWITCH],
      },
    });

    try {
      // Step 1: Discover trending creators
      this.logger.log('Step 1: Discovering trending creators...');
      const trendingCreators = await this.discovery.discoverTrendingCreators(
        [PlatformSource.YOUTUBE, PlatformSource.TWITCH],
        ['tech', 'business', 'content-creation'],
        20,
      );

      // Step 2: Score for clipping potential
      this.logger.log('Step 2: Scoring clipping potential...');
      const topClippers = trendingCreators
        .sort((a, b) => (b.clippingScore || 0) - (a.clippingScore || 0))
        .slice(0, 10);

      // Step 3: Schedule clips from top creators
      this.logger.log('Step 3: Scheduling clips...');
      let totalScheduled = 0;
      for (const creator of topClippers) {
        const scheduled = await this.monitor.scheduleClipsFromLiveContent(creator.handle, [
          PlatformSource.YOUTUBE,
          PlatformSource.TWITCH,
        ]);
        totalScheduled += scheduled.length;
      }

      // Complete job
      await this.prisma.researchJob.update({
        where: { id: job.id },
        data: {
          status: ResearchStatus.COMPLETED,
          resultCount: topClippers.length,
          topCreators: topClippers.map((c) => c.id),
          completedAt: new Date(),
          nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next run tomorrow
        },
      });

      this.logger.log(
        `✅ Daily research complete: ${trendingCreators.length} creators found, ${totalScheduled} clips scheduled`,
      );

      return {
        status: 'completed',
        creatorsFound: trendingCreators.length,
        clipsScheduled: totalScheduled,
        topCreators: topClippers.map((c) => ({
          name: c.name,
          handle: c.handle,
          score: c.clippingScore,
        })),
      };
    } catch (error: any) {
      this.logger.error(`❌ Research job failed: ${error.message}`, error);

      await this.prisma.researchJob.update({
        where: { id: job.id },
        data: {
          status: ResearchStatus.FAILED,
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Trend analysis: What's trending right now that we should clip?
   */
  async analyzeTrendingTopics(): Promise<any> {
    this.logger.log('📈 Analyzing trending topics...');

    // TODO: Implement trend analysis
    // - Analyze trending hashtags across platforms
    // - Identify emerging topics
    // - Find creators talking about trends
    // - Score trend relevance

    return {
      trends: [
        { topic: 'AI Breakthroughs', volume: 10000, relevance: 0.95, topCreators: [] },
        { topic: 'Web3 Updates', volume: 5000, relevance: 0.70, topCreators: [] },
        { topic: 'Tech Layoffs', volume: 8000, relevance: 0.85, topCreators: [] },
      ],
    };
  }

  /**
   * Creator comparison: How does creator A compare to creator B?
   */
  async compareCreators(creatorId1: string, creatorId2: string): Promise<any> {
    const creator1 = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId1 },
      include: { research: { orderBy: { createdAt: 'desc' }, take: 1 }, metrics: { take: 1 } },
    });

    const creator2 = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId2 },
      include: { research: { orderBy: { createdAt: 'desc' }, take: 1 }, metrics: { take: 1 } },
    });

    if (!creator1 || !creator2) throw new Error('Creator not found');

    return {
      creator1: {
        name: creator1.name,
        clippingScore: creator1.clippingScore,
        trendingScore: creator1.trendingScore,
        followers: creator1.followerCount,
      },
      creator2: {
        name: creator2.name,
        clippingScore: creator2.clippingScore,
        trendingScore: creator2.trendingScore,
        followers: creator2.followerCount,
      },
      winner: (creator1.clippingScore || 0) > (creator2.clippingScore || 0) ? 'creator1' : 'creator2',
      differenceScore: Math.abs((creator1.clippingScore || 0) - (creator2.clippingScore || 0)),
    };
  }

  /**
   * Niche research: Find creators in specific niches
   */
  async findCreatorsInNiche(niche: string, minScore: number = 60): Promise<any[]> {
    this.logger.log(`🔍 Finding creators in niche: ${niche}`);

    const creators = await this.prisma.creatorProfile.findMany({
      where: {
        contentCategories: { has: niche },
        clippingScore: { gte: minScore },
        isBlacklisted: false,
      },
      orderBy: { clippingScore: 'desc' },
      take: 20,
    });

    return creators.map((c) => ({
      name: c.name,
      handle: c.handle,
      clippingScore: c.clippingScore,
      platforms: c.platforms,
    }));
  }
}
