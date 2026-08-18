import { Injectable } from '@nestjs/common';
import { LeadStatus, EstimateStatus, ServiceJobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isolateQuery, withTenant } from '../../common/prisma/tenant-isolation';

@Injectable()
export class DashboardStatsService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveKpis(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      // Get this week's dates
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // New Leads (this week)
      const newLeadsThisWeek = await this.prisma.lead.count({
        where: withTenant(tenantId, {
          createdAt: { gte: weekStart },
        }),
      });

      // New Leads (last week for comparison)
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(weekStart.getDate() - 7);
      const newLeadsLastWeek = await this.prisma.lead.count({
        where: withTenant(tenantId, {
          createdAt: { gte: lastWeekStart, lt: weekStart },
        }),
      });

      const leadsChange =
        lastWeekStart > 0
          ? Math.round(((newLeadsThisWeek - newLeadsLastWeek) / newLeadsLastWeek) * 100)
          : 0;

      // Revenue sold this week
      const soldEstimatesThisWeek = await this.prisma.estimate.aggregate({
        where: withTenant(tenantId, {
          status: EstimateStatus.SOLD,
          soldAt: { gte: weekStart },
        }),
        _sum: { amount: true },
      });

      const solvedThisWeek = Number(soldEstimatesThisWeek._sum.amount ?? 0);

      // Revenue sold last week
      const soldEstimatesLastWeek = await this.prisma.estimate.aggregate({
        where: withTenant(tenantId, {
          status: EstimateStatus.SOLD,
          soldAt: { gte: lastWeekStart, lt: weekStart },
        }),
        _sum: { amount: true },
      });

      const solvedLastWeek = Number(soldEstimatesLastWeek._sum.amount ?? 0);

      const revenueChange =
        solvedLastWeek > 0 ? Math.round(((solvedThisWeek - solvedLastWeek) / solvedLastWeek) * 100) : 0;

      // Jobs completed this week
      const jobsCompletedThisWeek = await this.prisma.serviceJob.count({
        where: withTenant(tenantId, {
          status: ServiceJobStatus.COMPLETED,
          completedAt: { gte: weekStart },
        }),
      });

      // Jobs completed last week
      const jobsCompletedLastWeek = await this.prisma.serviceJob.count({
        where: withTenant(tenantId, {
          status: ServiceJobStatus.COMPLETED,
          completedAt: { gte: lastWeekStart, lt: weekStart },
        }),
      });

      const jobsChange =
        jobsCompletedLastWeek > 0
          ? Math.round(((jobsCompletedThisWeek - jobsCompletedLastWeek) / jobsCompletedLastWeek) * 100)
          : 0;

      // Today's appointments
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      const todaysAppointments = await this.prisma.serviceJob.count({
        where: withTenant(tenantId, {
          scheduledStart: { gte: todayStart, lt: tomorrowStart },
        }),
      });

      return {
        newLeads: {
          count: newLeadsThisWeek,
          change: leadsChange,
        },
        soldThisWeek: {
          amount: solvedThisWeek,
          change: revenueChange,
        },
        jobsCompleted: {
          count: jobsCompletedThisWeek,
          change: jobsChange,
        },
        todaysAppointments: {
          count: todaysAppointments,
        },
      };
    });
  }

  async getPipelineMetrics(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      // Pipeline stages with counts
      const estimatePipeline = await this.prisma.estimate.groupBy({
        by: ['status'],
        where: withTenant(tenantId),
        _count: { _all: true },
        _sum: { amount: true },
      });

      const stages = Object.values(EstimateStatus).map((status) => {
        const row = estimatePipeline.find((g) => g.status === status);
        return {
          status,
          count: row?._count._all ?? 0,
          value: row?._sum.amount ? Number(row._sum.amount) : 0,
        };
      });

      // Total pipeline value (excluding SOLD and DECLINED)
      const openStages = stages.filter((s) => s.status !== EstimateStatus.SOLD && s.status !== EstimateStatus.DECLINED);
      const totalPipelineValue = openStages.reduce((sum, s) => sum + s.value, 0);

      // Conversion rate (SOLD / SENT)
      const sentCount = stages.find((s) => s.status === EstimateStatus.SENT)?.count ?? 1;
      const soldCount = stages.find((s) => s.status === EstimateStatus.SOLD)?.count ?? 0;
      const conversionRate = sentCount > 0 ? parseFloat(((soldCount / sentCount) * 100).toFixed(1)) : 0;

      return {
        stages,
        totalPipelineValue,
        conversionRate,
      };
    });
  }

  async getDispatchMetrics(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      // Today's jobs
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);

      const jobs = await this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, {
          scheduledStart: { gte: todayStart, lt: tomorrowStart },
        }),
        include: { customer: true },
        orderBy: { scheduledStart: 'asc' },
      });

      // Count by status
      const statusCounts = {
        scheduled: 0,
        dispatched: 0,
        onSite: 0,
        completed: 0,
      };

      jobs.forEach((job) => {
        switch (job.status) {
          case ServiceJobStatus.SCHEDULED:
            statusCounts.scheduled++;
            break;
          case ServiceJobStatus.DISPATCHED:
            statusCounts.dispatched++;
            break;
          case ServiceJobStatus.ON_SITE:
            statusCounts.onSite++;
            break;
          case ServiceJobStatus.COMPLETED:
            statusCounts.completed++;
            break;
        }
      });

      return {
        todaysJobs: jobs,
        statusCounts,
        totalJobs: jobs.length,
      };
    });
  }

  async getAlertsPanel(tenantId: string) {
    return isolateQuery(this.prisma, tenantId, async () => {
      const now = new Date();

      // Unsold estimates (DRAFT, SENT, VIEWED)
      const unsoldEstimates = await this.prisma.estimate.count({
        where: withTenant(tenantId, {
          status: { in: [EstimateStatus.DRAFT, EstimateStatus.SENT, EstimateStatus.VIEWED] },
        }),
      });

      // Customers waiting (leads in CONTACTING state older than 3 days)
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const customersWaiting = await this.prisma.lead.count({
        where: withTenant(tenantId, {
          status: LeadStatus.CONTACTING,
          createdAt: { lte: threeDaysAgo },
        }),
      });

      // Maintenance opportunities (leads or customers with equipment age > 10 years)
      const maintenanceDue = await this.prisma.revenueCustomer.count({
        where: withTenant(tenantId, {
          equipmentAge: { gte: 10 },
        }),
      });

      // Overdue follow-ups
      const overdueFollowUps = await this.prisma.followUp.count({
        where: withTenant(tenantId, {
          status: 'PENDING',
          dueAt: { lte: now },
        }),
      });

      return {
        unsoldEstimates,
        customersWaiting,
        maintenanceDue,
        overdueFollowUps,
      };
    });
  }

  async getRecentActivity(tenantId: string, limit: number = 10) {
    return isolateQuery(this.prisma, tenantId, async () => {
      // Get recent events (leads, estimates, jobs, conversations)
      const [recentLeads, recentEstimates, recentJobs] = await Promise.all([
        this.prisma.lead.findMany({
          where: withTenant(tenantId),
          select: { id: true, createdAt: true, status: true, summary: true },
          orderBy: { createdAt: 'desc' },
          take: Math.ceil(limit / 3),
        }),
        this.prisma.estimate.findMany({
          where: withTenant(tenantId),
          select: { id: true, createdAt: true, status: true, amount: true },
          orderBy: { createdAt: 'desc' },
          take: Math.ceil(limit / 3),
        }),
        this.prisma.serviceJob.findMany({
          where: withTenant(tenantId),
          select: { id: true, createdAt: true, status: true, serviceType: true },
          orderBy: { createdAt: 'desc' },
          take: Math.ceil(limit / 3),
        }),
      ]);

      const activities = [
        ...recentLeads.map((l) => ({
          id: l.id,
          type: 'lead',
          timestamp: l.createdAt,
          message: `New lead: ${l.summary || 'Untitled'}`,
          status: l.status,
        })),
        ...recentEstimates.map((e) => ({
          id: e.id,
          type: 'estimate',
          timestamp: e.createdAt,
          message: `Estimate: $${Number(e.amount).toFixed(2)}`,
          status: e.status,
        })),
        ...recentJobs.map((j) => ({
          id: j.id,
          type: 'job',
          timestamp: j.createdAt,
          message: `Job: ${j.serviceType || 'Service'}`,
          status: j.status,
        })),
      ];

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
    });
  }
}
