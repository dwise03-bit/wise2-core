/**
 * Business Intelligence Routes
 * Provides AI-powered insights and recommendations based on tenant data
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, scopedWhere } from '../middlewares/tenant-guard';

const router = Router();

router.use(authenticate);
router.use(tenantGuard);

/**
 * POST /api/v1/crm/tenants/:tenantId/business-intelligence/insights
 * Get AI-powered business insights and recommendations
 */
router.post(
  '/tenants/:tenantId/business-intelligence/insights',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question } = req.body;
      const businessId = req.tenant!.businessId;

      // Fetch current business metrics
      const [leads, estimates, jobs, followups] = await Promise.all([
        db.lead.findMany({
          where: scopedWhere(req),
          take: 50,
        }),
        db.estimate.findMany({
          where: scopedWhere(req),
          take: 20,
        }),
        db.job.findMany({
          where: scopedWhere(req),
          take: 30,
        }),
        db.followUp.findMany({
          where: scopedWhere(req),
          take: 20,
        }),
      ]);

      // Analyze metrics
      const leadsCount = leads.length;
      const leadsNew = leads.filter((l: any) => l.status === 'NEW').length;
      const leadsQualified = leads.filter((l: any) => l.status === 'QUALIFIED').length;
      const leadsBooked = leads.filter((l: any) => l.status === 'BOOKED').length;

      const estimatesCount = estimates.length;
      const estimatesPending = estimates.filter((e: any) => e.status === 'PENDING').length;
      const estimatesSent = estimates.filter((e: any) => e.status === 'SENT').length;
      const estimatesAccepted = estimates.filter((e: any) => e.status === 'ACCEPTED').length;

      const jobsCount = jobs.length;
      const jobsCompleted = jobs.filter((j: any) => j.status === 'COMPLETED').length;
      const jobsInProgress = jobs.filter((j: any) => j.status === 'IN_PROGRESS').length;
      const jobsUnassigned = jobs.filter((j: any) => !j.assignedTechnicianId).length;

      const followupsCount = followups.length;
      const followupsOverdue = followups.filter((f: any) => new Date(f.dueDate) < new Date()).length;

      // Calculate totals
      const totalLeadValue = leads.reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0);
      const estimateValue = estimates.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      // Generate insights based on metrics
      const insights = generateInsights({
        leadsCount,
        leadsNew,
        leadsQualified,
        leadsBooked,
        estimatesCount,
        estimatesPending,
        estimatesSent,
        estimatesAccepted,
        jobsCount,
        jobsCompleted,
        jobsInProgress,
        jobsUnassigned,
        followupsCount,
        followupsOverdue,
        totalLeadValue,
        estimateValue,
        question,
      });

      logger.info('Business insights generated', {
        tenantId: req.tenant!.tenantId,
        question,
        leadsCount,
        estimatesCount,
        jobsCount,
      });

      res.json({
        success: true,
        data: {
          question,
          insights,
          metrics: {
            leads: { total: leadsCount, new: leadsNew, qualified: leadsQualified, booked: leadsBooked },
            estimates: { total: estimatesCount, pending: estimatesPending, sent: estimatesSent, accepted: estimatesAccepted },
            jobs: { total: jobsCount, completed: jobsCompleted, inProgress: jobsInProgress, unassigned: jobsUnassigned },
            followups: { total: followupsCount, overdue: followupsOverdue },
            values: { totalLeadValue, estimateValue },
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/business-intelligence/summary
 * Get business summary dashboard data
 */
router.get(
  '/tenants/:tenantId/business-intelligence/summary',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [leads, estimates, jobs] = await Promise.all([
        db.lead.findMany({
          where: scopedWhere(req),
          take: 50,
        }),
        db.estimate.findMany({
          where: scopedWhere(req),
          take: 20,
        }),
        db.job.findMany({
          where: scopedWhere(req),
          take: 30,
        }),
      ]);

      // Calculate key metrics
      const conversionRate = leads.length > 0
        ? Math.round(((leads.filter((l: any) => l.status === 'BOOKED').length) / leads.length) * 100)
        : 0;

      const jobCompletionRate = jobs.length > 0
        ? Math.round(((jobs.filter((j: any) => j.status === 'COMPLETED').length) / jobs.length) * 100)
        : 0;

      const estimateCloseRate = estimates.length > 0
        ? Math.round(((estimates.filter((e: any) => e.status === 'ACCEPTED').length) / estimates.length) * 100)
        : 0;

      const totalRevenue = estimates
        .filter((e: any) => e.status === 'ACCEPTED')
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      res.json({
        success: true,
        data: {
          kpis: {
            totalLeads: leads.length,
            totalEstimates: estimates.length,
            totalJobs: jobs.length,
            conversionRate: `${conversionRate}%`,
            jobCompletionRate: `${jobCompletionRate}%`,
            estimateCloseRate: `${estimateCloseRate}%`,
            totalRevenue,
          },
          recentActivity: {
            newLeadsToday: leads.filter((l: any) => {
              const today = new Date().toDateString();
              return new Date(l.createdAt).toDateString() === today;
            }).length,
            pendingEstimates: estimates.filter((e: any) => e.status === 'PENDING').length,
            unassignedJobs: jobs.filter((j: any) => !j.assignedTechnicianId).length,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

function generateInsights(metrics: any): string {
  const insights = [];

  // Lead quality insights
  if (metrics.leadsNew > 5) {
    insights.push(`🎯 **High lead volume detected**: ${metrics.leadsNew} new leads. Focus on rapid qualification to move leads through pipeline faster.`);
  }

  if (metrics.leadsCount > 0) {
    const qualificationRate = Math.round((metrics.leadsQualified / metrics.leadsCount) * 100);
    if (qualificationRate > 50) {
      insights.push(`✅ **Strong qualification rate**: ${qualificationRate}% of leads are qualified. Keep up the good outreach!`);
    } else if (qualificationRate < 30) {
      insights.push(`⚠️ **Low qualification rate**: Only ${qualificationRate}% qualified. Review qualification criteria and follow-up processes.`);
    }
  }

  // Estimate insights
  if (metrics.estimatesPending > 3) {
    insights.push(`📋 **Action needed**: ${metrics.estimatesPending} pending estimates need to be sent to clients. Prioritize these today.`);
  }

  if (metrics.estimatesSent > 0) {
    const responseRate = Math.round((metrics.estimatesAccepted / (metrics.estimatesSent + metrics.estimatesAccepted)) * 100) || 0;
    if (responseRate > 60) {
      insights.push(`🎉 **Excellent estimate acceptance**: ${responseRate}% of sent estimates are accepted. Your pricing is competitive!`);
    } else if (responseRate < 30) {
      insights.push(`💭 **Review estimate strategy**: Only ${responseRate}% acceptance. Consider pricing, presentation, or follow-up approach.`);
    }
  }

  // Job dispatch insights
  if (metrics.jobsUnassigned > 2) {
    insights.push(`📍 **Dispatch queue building**: ${metrics.jobsUnassigned} jobs waiting for assignment. Assign these to keep technicians busy.`);
  }

  if (metrics.jobsCount > 0) {
    const completionRate = Math.round((metrics.jobsCompleted / metrics.jobsCount) * 100);
    if (completionRate > 70) {
      insights.push(`🏆 **High completion rate**: ${completionRate}% of jobs completed successfully. Excellent operational efficiency!`);
    }
  }

  // Follow-up insights
  if (metrics.followupsOverdue > 0) {
    insights.push(`🔔 **Overdue follow-ups**: ${metrics.followupsOverdue} follow-ups are overdue. Complete these ASAP to recover potential lost deals.`);
  }

  // Revenue insights
  if (metrics.estimateValue > 10000) {
    insights.push(`💰 **Strong pipeline value**: ${metrics.estimateValue} in estimate value. Focus on converting these to boost revenue.`);
  }

  // General recommendations
  if (metrics.leadsBooked > 0 && metrics.jobsInProgress > 0) {
    insights.push(`🚀 **Momentum is strong**: You have booked leads and jobs in progress. Keep the execution velocity high!`);
  } else if (metrics.leadsNew > 0 && metrics.estimatesCount === 0) {
    insights.push(`📈 **Next step**: Create estimates for your qualified leads to move them toward closed deals.`);
  }

  // Default insight if no others generated
  if (insights.length === 0) {
    insights.push(`📊 **Business Snapshot**: You have ${metrics.leadsCount} leads, ${metrics.estimatesCount} estimates, and ${metrics.jobsCount} jobs in progress. Keep tracking these metrics daily!`);
  }

  return insights.join('\n\n');
}

export default router;
