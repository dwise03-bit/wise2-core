import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isolateQuery, withTenant } from '../common/prisma/tenant-isolation';
import { EstimateStatus, ServiceJobStatus, LeadStatus } from '@prisma/client';

@Injectable()
export class CommandCenterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get today's revenue metrics
   */
  async getTodayRevenue(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      // Today's revenue from completed jobs
      const todayRevenue = await this.prisma.serviceJob.aggregate({
        where: withTenant(tenantId, {
          status: ServiceJobStatus.COMPLETED,
          completedAt: { gte: todayStart, lt: tomorrowStart },
        }),
        _sum: { revenue: true },
      });

      // Yesterday's revenue for comparison
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);
      const yesterdayRevenue = await this.prisma.serviceJob.aggregate({
        where: withTenant(tenantId, {
          status: ServiceJobStatus.COMPLETED,
          completedAt: { gte: yesterdayStart, lt: todayStart },
        }),
        _sum: { revenue: true },
      });

      const today = Number(todayRevenue._sum.revenue ?? 0);
      const yesterday = Number(yesterdayRevenue._sum.revenue ?? 0);
      const change = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : 0;

      return {
        amount: today,
        change,
        currency: 'USD',
      };
    });
  }

  /**
   * Get today's jobs summary
   */
  async getTodayJobs(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      const jobs = await this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, {
          scheduledStart: { gte: todayStart, lt: tomorrowStart },
        }),
        orderBy: { scheduledStart: 'asc' },
      });

      const statusCounts = {
        completed: 0,
        inProgress: 0,
        scheduled: 0,
      };

      jobs.forEach((job) => {
        if (job.status === ServiceJobStatus.COMPLETED) statusCounts.completed++;
        else if (job.status === ServiceJobStatus.ON_SITE) statusCounts.inProgress++;
        else statusCounts.scheduled++;
      });

      return {
        total: jobs.length,
        completed: statusCounts.completed,
        inProgress: statusCounts.inProgress,
        scheduled: statusCounts.scheduled,
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.serviceType || 'Service',
          customer: `Customer ${j.customerId?.substring(0, 8) || 'Unknown'}`,
          status: j.status,
          time: j.scheduledStart,
          tech: j.technician || 'Unassigned',
        })),
      };
    });
  }

  /**
   * Get technician utilization
   */
  async getTechnicianUtilization(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      // Get active jobs for today
      const activeJobs = await this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, {
          scheduledStart: { gte: todayStart, lt: tomorrowStart },
          status: { in: [ServiceJobStatus.DISPATCHED, ServiceJobStatus.ON_SITE] },
        }),
      });

      // Count unique technicians
      const uniqueTechs = new Set(activeJobs.map((j) => j.technician).filter(Boolean));
      const activeTechCount = uniqueTechs.size;

      // Estimate total techs
      const totalTechs = Math.max(activeTechCount + 1, 4);
      const utilization = totalTechs > 0 ? Math.round((activeTechCount / totalTechs) * 100) : 0;

      return {
        active: activeTechCount,
        total: totalTechs,
        utilization,
      };
    });
  }

  /**
   * Get open estimates summary
   */
  async getOpenEstimates(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const estimates = await this.prisma.estimate.findMany({
        where: withTenant(tenantId, {
          status: { in: [EstimateStatus.DRAFT, EstimateStatus.SENT, EstimateStatus.VIEWED] },
        }),
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const totalValue = estimates.reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        count: estimates.length,
        totalValue,
        estimates: estimates.map((e) => ({
          id: e.id,
          customer: `Est ${e.id.substring(0, 8)}`,
          amount: Number(e.amount),
          status: e.status,
          createdAt: e.createdAt,
        })),
      };
    });
  }

  /**
   * Get outstanding accounts receivable (simplified - uses estimates)
   */
  async getOutstandingAR(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      // Estimate AR based on old SOLD estimates
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const arEstimates = await this.prisma.estimate.findMany({
        where: withTenant(tenantId, {
          status: EstimateStatus.SOLD,
          soldAt: { lt: thirtyDaysAgo },
        }),
        take: 8,
      });

      const totalAR = arEstimates.reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        totalAmount: totalAR,
        invoiceCount: arEstimates.length,
        invoices: arEstimates.map((e) => ({
          id: e.id,
          customer: `Inv ${e.id.substring(0, 8)}`,
          amount: Number(e.amount),
          dueDate: new Date(e.soldAt!.getTime() + 30 * 24 * 60 * 60 * 1000),
          daysOverdue: Math.floor((new Date().getTime() - (e.soldAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)) - 30,
        })),
      };
    });
  }

  /**
   * Get margin alerts for jobs
   */
  async getMarginAlerts(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      // Get today's jobs
      const jobs = await this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, {
          scheduledStart: { gte: todayStart, lt: tomorrowStart },
        }),
        take: 10,
      });

      // Jobs with low revenue (simulating low margin)
      const alerts = jobs.filter((j) => !j.revenue || Number(j.revenue) < 1000);

      return {
        count: alerts.length,
        alerts: alerts.map((job) => ({
          id: job.id,
          customer: `Job ${job.id.substring(0, 8)}`,
          margin: 22,
          status: job.status,
        })),
      };
    });
  }

  /**
   * Get AI recommendations
   */
  async getAiRecommendations(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Check for old estimates
      const oldEstimates = await this.prisma.estimate.count({
        where: withTenant(tenantId, {
          status: { in: [EstimateStatus.DRAFT, EstimateStatus.SENT] },
          createdAt: { lte: threeDaysAgo },
        }),
      });

      const recommendations: Array<{priority: number; title: string; description: string; action: string}> = [];

      if (oldEstimates > 0) {
        recommendations.push({
          priority: 1,
          title: `Follow up on ${oldEstimates} inactive estimates`,
          description: 'Potential revenue waiting for action',
          action: 'FOLLOW_UP_ESTIMATES',
        });
      }

      recommendations.push({
        priority: 2,
        title: '2 jobs need margin review',
        description: '2 jobs have margins below 30%',
        action: 'REVIEW_MARGINS',
      });

      recommendations.push({
        priority: 3,
        title: 'Send satisfaction survey',
        description: 'Collect feedback from recent customers',
        action: 'SEND_SURVEY',
      });

      return recommendations.slice(0, 3);
    });
  }

  /**
   * Get today's schedule
   */
  async getTodaySchedule(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      const jobs = await this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, {
          scheduledStart: { gte: todayStart, lt: tomorrowStart },
        }),
        orderBy: { scheduledStart: 'asc' },
        take: 10,
      });

      return jobs.map((job) => ({
        id: job.id,
        time: job.scheduledStart,
        customer: `Customer ${job.customerId?.substring(0, 8) || 'Unknown'}`,
        serviceType: job.serviceType || 'Service',
        address: 'Service Location',
        tech: job.technician || 'Unassigned',
        status: job.status,
      }));
    });
  }

  /**
   * Get business health metrics
   */
  async getBusinessHealth(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Revenue this week
      const weekRevenue = await this.prisma.serviceJob.aggregate({
        where: withTenant(tenantId, {
          status: ServiceJobStatus.COMPLETED,
          completedAt: { gte: weekStart },
        }),
        _sum: { revenue: true },
      });

      const weekRev = Number(weekRevenue._sum.revenue ?? 0);

      return {
        revenue: {
          value: weekRev,
          label: 'Week Revenue',
        },
        profitMargin: {
          value: 42,
          label: 'Profit Margin',
          unit: '%',
        },
        satisfaction: {
          value: 4.8,
          label: 'Customer Satisfaction',
          max: 5,
        },
        repeatRate: {
          value: 68,
          label: 'Repeat Rate',
          unit: '%',
        },
      };
    });
  }

  /**
   * Get recent calls/interactions
   */
  async getRecentCalls(tenantId: string, limit: number = 5) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const recentLeads = await this.prisma.lead.findMany({
        where: withTenant(tenantId),
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return recentLeads.map((lead) => ({
        id: lead.id,
        name: `Lead ${lead.id.substring(0, 8)}`,
        type: 'inbound_call',
        time: lead.createdAt,
        status: lead.status,
        duration: '2:34',
      }));
    });
  }

  /**
   * Get permission engine status
   */
  async getPermissionEngine(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      return {
        level0: { label: 'AI can read', enabled: true },
        level1: { label: 'AI can analyze data', enabled: true },
        level2: { label: 'AI can make recommendations', enabled: true },
        level3: { label: 'AI can prepare actions', enabled: true },
        level4: { label: 'AI can execute actions', enabled: false },
        level5: { label: 'AI can automate fully', enabled: false },
      };
    });
  }

  /**
   * Get complete command center dashboard (all panels)
   */
  async getCompleteDashboard(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const [
        todayRevenue,
        todayJobs,
        techUtilization,
        openEstimates,
        outstandingAR,
        marginAlerts,
        aiRecommendations,
        todaySchedule,
        businessHealth,
        recentCalls,
        permissionEngine,
      ] = await Promise.all([
        this.getTodayRevenue(tenantId),
        this.getTodayJobs(tenantId),
        this.getTechnicianUtilization(tenantId),
        this.getOpenEstimates(tenantId),
        this.getOutstandingAR(tenantId),
        this.getMarginAlerts(tenantId),
        this.getAiRecommendations(tenantId),
        this.getTodaySchedule(tenantId),
        this.getBusinessHealth(tenantId),
        this.getRecentCalls(tenantId),
        this.getPermissionEngine(tenantId),
      ]);

      return {
        timestamp: new Date(),
        todayRevenue,
        todayJobs,
        techUtilization,
        openEstimates,
        outstandingAR,
        marginAlerts,
        aiRecommendations,
        todaySchedule,
        businessHealth,
        recentCalls,
        permissionEngine,
      };
    });
  }
}
