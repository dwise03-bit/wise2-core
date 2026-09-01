import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AttributionMetrics {
  source: string;
  leads: number;
  dealsWon: number;
  revenueTotal: number;
  conversionRate: number;
  avgDealSize: number;
}

export interface TeamMetrics {
  owner: string;
  dealsWon: number;
  revenueTotal: number;
  conversionRate: number;
  avgDealSize: number;
}

export interface PipelineMetrics {
  stage: string;
  dealCount: number;
  totalValue: number;
  avgValue: number;
}

@Injectable()
export class AttributionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get attribution metrics by source
   */
  async getAttributionBySource(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AttributionMetrics[]> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // Get leads by source
    const leads = await this.prisma.lead.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
      where: startDate || endDate ? { createdAt: dateFilter } : {},
    });

    const metrics: AttributionMetrics[] = [];

    for (const lead of leads) {
      const source = lead.source || 'unknown';

      // Count leads from this source
      const leadCount = lead._count.id;

      // Get deals from this source
      const deals = await this.prisma.deal.findMany({
        where: { source },
      });

      const wonDeals = deals.filter((d) => d.stage === 'WON');

      // Calculate revenue
      const revenue = wonDeals.reduce(
        (sum, d) => sum + (d.value ? Number(d.value) : 0),
        0,
      );

      metrics.push({
        source,
        leads: leadCount,
        dealsWon: wonDeals.length,
        revenueTotal: revenue,
        conversionRate: leadCount > 0 ? (wonDeals.length / leadCount) * 100 : 0,
        avgDealSize: wonDeals.length > 0 ? revenue / wonDeals.length : 0,
      });
    }

    return metrics.sort((a, b) => b.revenueTotal - a.revenueTotal);
  }

  /**
   * Get attribution by sales owner
   */
  async getAttributionByOwner(
    startDate?: Date,
    endDate?: Date,
  ): Promise<TeamMetrics[]> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const deals = await this.prisma.deal.findMany({
      where: startDate || endDate ? { closedAt: dateFilter } : {},
      include: { owner: true },
    });

    const ownerMetrics = new Map<string, TeamMetrics>();

    for (const deal of deals) {
      const ownerName = deal.owner?.name || deal.ownerId || 'Unassigned';

      if (!ownerMetrics.has(ownerName)) {
        ownerMetrics.set(ownerName, {
          owner: ownerName,
          dealsWon: 0,
          revenueTotal: 0,
          conversionRate: 0,
          avgDealSize: 0,
        });
      }

      const metrics = ownerMetrics.get(ownerName)!;

      if (deal.stage === 'WON') {
        metrics.dealsWon += 1;
        metrics.revenueTotal += deal.value ? Number(deal.value) : 0;
      }
    }

    // Calculate conversion rates and avg deal size
    for (const metrics of ownerMetrics.values()) {
      metrics.avgDealSize =
        metrics.dealsWon > 0 ? metrics.revenueTotal / metrics.dealsWon : 0;
    }

    return Array.from(ownerMetrics.values()).sort(
      (a, b) => b.revenueTotal - a.revenueTotal,
    );
  }

  /**
   * Get pipeline metrics by stage
   */
  async getPipelineMetrics(): Promise<PipelineMetrics[]> {
    const stages = [
      'DISCOVERY',
      'QUALIFICATION',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSING',
      'WON',
      'LOST',
    ] as const;

    const metrics: PipelineMetrics[] = [];

    for (const stage of stages) {
      const deals = await this.prisma.deal.findMany({
        where: { stage: stage as any },
      });

      const totalValue = deals.reduce(
        (sum, d) => sum + (d.value ? Number(d.value) : 0),
        0,
      );

      metrics.push({
        stage,
        dealCount: deals.length,
        totalValue,
        avgValue: deals.length > 0 ? totalValue / deals.length : 0,
      });
    }

    return metrics;
  }

  /**
   * Get funnel metrics (conversion rates between stages)
   */
  async getFunnelMetrics(): Promise<any> {
    const stages = [
      'DISCOVERY',
      'QUALIFICATION',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSING',
      'WON',
    ];

    const stageCounts = new Map<string, number>();

    for (const stage of stages) {
      const count = await this.prisma.deal.count({
        where: { stage: stage as any },
      });
      stageCounts.set(stage, count);
    }

    // Calculate conversion rates
    const discovery = stageCounts.get('DISCOVERY') || 1;
    const funnel: any[] = [];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const count = stageCounts.get(stage) || 0;
      const conversionFromDiscovery =
        discovery > 0 ? (count / discovery) * 100 : 0;
      const conversionFromPrevious =
        i > 0
          ? ((count / (stageCounts.get(stages[i - 1]) || 1)) * 100)
          : 100;

      funnel.push({
        stage,
        count,
        conversionFromDiscovery,
        conversionFromPrevious,
      });
    }

    return funnel;
  }

  /**
   * Get revenue trend over time
   */
  async getRevenueTrend(days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.prisma.revenueEvent.findMany({
      where: {
        eventType: 'deal_won',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const trendMap = new Map<string, { revenue: number; deals: number }>();

    for (const event of events) {
      const date = event.createdAt.toISOString().split('T')[0];
      const current = trendMap.get(date) || { revenue: 0, deals: 0 };

      current.revenue += event.value ? Number(event.value) : 0;
      current.deals += 1;

      trendMap.set(date, current);
    }

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      deals: data.deals,
      avgValue: data.deals > 0 ? data.revenue / data.deals : 0,
    }));
  }

  /**
   * Get top performing deals
   */
  async getTopDeals(limit: number = 10): Promise<any[]> {
    const deals = await this.prisma.deal.findMany({
      where: { stage: 'WON' },
      include: { customer: true, owner: true },
      orderBy: { value: 'desc' },
      take: limit,
    });

    return deals.map((d) => ({
      id: d.id,
      customer: d.customer?.businessName,
      owner: d.owner?.name,
      value: d.value,
      stage: d.stage,
      closedAt: d.closedAt,
    }));
  }

  /**
   * Get conversion funnel insight
   */
  async getConversionInsights(): Promise<any> {
    const all = await this.prisma.deal.count();
    const won = await this.prisma.deal.count({ where: { stage: 'WON' } });
    const lost = await this.prisma.deal.count({ where: { stage: 'LOST' } });
    const open = await this.prisma.deal.count({
      where: { stage: { notIn: ['WON', 'LOST'] } },
    });

    return {
      totalDeals: all,
      wonDeals: won,
      lostDeals: lost,
      openDeals: open,
      winRate: all > 0 ? (won / all) * 100 : 0,
      lossRate: all > 0 ? (lost / all) * 100 : 0,
    };
  }
}
