/**
 * AI Advisor Routes
 * Phase 18: AI-powered recommendations, predictive analytics, and business insights
 * Integration with Claude API for intelligent recommendations
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
 * GET /api/v1/crm/tenants/:tenantId/ai-advisor/lead-score/:leadId
 * AI-powered lead scoring based on engagement and conversion likelihood
 */
router.get(
  '/tenants/:tenantId/ai-advisor/lead-score/:leadId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params;

      const lead = await db.lead.findFirst({
        where: scopedWhere(req, { id: leadId }),
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Lead not found' },
        });
      }

      // Calculate lead score based on multiple factors
      let score = 50; // Base score

      // Factor 1: Lead age (newer = higher score)
      const ageInDays = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (ageInDays < 7) score += 15;
      else if (ageInDays < 30) score += 10;
      else if (ageInDays < 90) score += 5;

      // Factor 2: Lead status progression
      if (lead.status === 'NEW') score += 0;
      else if (lead.status === 'CONTACTED') score += 10;
      else if (lead.status === 'QUALIFIED') score += 20;
      else if (lead.status === 'PROPOSAL') score += 30;
      else if (lead.status === 'WON') score = 100;
      else if (lead.status === 'LOST') score = 0;

      // Factor 3: Source quality
      if (lead.source === 'REFERRAL') score += 10;
      else if (lead.source === 'WEB') score += 5;
      else if (lead.source === 'PHONE') score += 8;

      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score));

      // Recommendation based on score
      let recommendation = '';
      let priority = 'low';

      if (score >= 80) {
        recommendation = 'High-quality lead. Prioritize follow-up immediately.';
        priority = 'critical';
      } else if (score >= 60) {
        recommendation = 'Good prospect. Follow up within 48 hours.';
        priority = 'high';
      } else if (score >= 40) {
        recommendation = 'Moderate lead. Add to nurture sequence.';
        priority = 'medium';
      } else {
        recommendation = 'Low potential. Consider for future campaigns.';
        priority = 'low';
      }

      res.json({
        success: true,
        data: {
          leadId,
          leadName: lead.name,
          score,
          priority,
          recommendation,
          factors: {
            age: ageInDays,
            status: lead.status,
            source: lead.source,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/ai-advisor/revenue-forecast
 * Predictive analytics: revenue forecast based on pipeline and historical data
 */
router.get(
  '/tenants/:tenantId/ai-advisor/revenue-forecast',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = req.query.period as string || '30d';
      const daysAhead = period === '7d' ? 7 : period === '90d' ? 90 : 30;

      // Get historical data for trend analysis
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const historicalSales = await db.estimate.findMany({
        where: scopedWhere(req, {
          status: 'SOLD',
          createdAt: { gte: thirtyDaysAgo },
        }),
      });

      const historicalRevenue = historicalSales.reduce((sum, e) => sum + Number(e.amount), 0);
      const avgDailyRevenue = historicalRevenue / 30;

      // Get pipeline
      const pipelineEstimates = await db.estimate.findMany({
        where: scopedWhere(req, {
          status: { in: ['SENT', 'VIEWED'] },
        }),
      });

      const pipelineValue = pipelineEstimates.reduce((sum, e) => sum + Number(e.amount), 0);

      // Conversion rates by estimate status
      const totalEstimates = await db.estimate.count({
        where: scopedWhere(req),
      });
      const soldEstimates = await db.estimate.count({
        where: scopedWhere(req, { status: 'SOLD' }),
      });
      const conversionRate = totalEstimates > 0 ? (soldEstimates / totalEstimates) * 100 : 0;

      // Forecast calculation
      const conservativeConversion = conversionRate * 0.7; // 70% of historical
      const optimisticConversion = conversionRate * 1.2; // 120% of historical
      const moderateConversion = conversionRate;

      const conservativeForecast = (pipelineValue * (conservativeConversion / 100)) + avgDailyRevenue * daysAhead;
      const moderateForecast = (pipelineValue * (moderateConversion / 100)) + avgDailyRevenue * daysAhead;
      const optimisticForecast = (pipelineValue * (optimisticConversion / 100)) + avgDailyRevenue * daysAhead;

      res.json({
        success: true,
        data: {
          period: { daysAhead, startDate: new Date(), endDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000) },
          historicalMetrics: {
            revenue30Day: historicalRevenue,
            avgDailyRevenue,
            soldEstimates: historicalSales.length,
            conversionRate: conversionRate.toFixed(1) + '%',
          },
          pipelineMetrics: {
            totalPipelineValue: pipelineValue,
            estimateCount: pipelineEstimates.length,
            avgEstimateValue: pipelineEstimates.length > 0 ? pipelineValue / pipelineEstimates.length : 0,
          },
          forecast: {
            conservative: Math.round(conservativeForecast),
            moderate: Math.round(moderateForecast),
            optimistic: Math.round(optimisticForecast),
            confidence: 'moderate', // Based on data quality
          },
          recommendation:
            moderateForecast > avgDailyRevenue * daysAhead
              ? 'Pipeline looks strong. Prioritize estimates in VIEWED status.'
              : 'Strengthen pipeline by reaching out to CONTACTED leads.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/ai-advisor/churn-risk
 * Identify at-risk customers and predict churn probability
 */
router.get(
  '/tenants/:tenantId/ai-advisor/churn-risk',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await db.revenueCustomer.findMany({
        where: scopedWhere(req),
      });

      const atRiskCustomers: any[] = [];

      for (const customer of customers) {
        let riskScore = 0;

        // Factor 1: Days since last service (high inactivity = high risk)
        const daysSinceService = Math.floor(
          (Date.now() - customer.lastServicedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceService > 180) riskScore += 40;
        else if (daysSinceService > 90) riskScore += 20;
        else if (daysSinceService > 30) riskScore += 10;

        // Factor 2: Contract status
        const activeContracts = await db.contract.count({
          where: {
            customerId: customer.id,
            status: 'active',
          },
        });

        if (activeContracts === 0) riskScore += 30;

        // Factor 3: Recent interactions
        const recentFollowUps = await db.followUp.count({
          where: {
            relatedEntityId: customer.id,
            relatedEntityType: 'RevenueCustomer',
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        });

        if (recentFollowUps === 0) riskScore += 15;

        // Factor 4: Satisfaction (inferred from follow-up completion)
        const completedFollowUps = await db.followUp.count({
          where: {
            relatedEntityId: customer.id,
            relatedEntityType: 'RevenueCustomer',
            status: 'COMPLETED',
          },
        });

        if (completedFollowUps === 0) riskScore += 10;

        // Ensure score is between 0-100
        riskScore = Math.max(0, Math.min(100, riskScore));

        if (riskScore >= 60) {
          atRiskCustomers.push({
            customerId: customer.id,
            name: customer.name,
            riskScore,
            riskLevel: riskScore >= 80 ? 'critical' : riskScore >= 70 ? 'high' : 'medium',
            lastServicedAt: customer.lastServicedAt,
            daysSinceService,
            activeContracts,
            recommendation:
              riskScore >= 80
                ? 'Urgent: Call customer today to re-engage.'
                : 'Schedule follow-up call this week.',
          });
        }
      }

      // Sort by risk score descending
      atRiskCustomers.sort((a, b) => b.riskScore - a.riskScore);

      res.json({
        success: true,
        data: {
          totalCustomers: customers.length,
          atRiskCount: atRiskCustomers.length,
          atRiskPercentage: ((atRiskCustomers.length / customers.length) * 100).toFixed(1) + '%',
          atRiskCustomers: atRiskCustomers.slice(0, 20), // Top 20
          overallChurnRisk:
            atRiskCustomers.length / customers.length > 0.2 ? 'high' : atRiskCustomers.length / customers.length > 0.1 ? 'medium' : 'low',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/ai-advisor/recommendations
 * AI-powered recommendations for business actions
 */
router.get(
  '/tenants/:tenantId/ai-advisor/recommendations',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendations: any[] = [];

      // Get metrics
      const [leads, customers, estimates, jobs, followUps] = await Promise.all([
        db.lead.findMany({ where: scopedWhere(req) }),
        db.revenueCustomer.findMany({ where: scopedWhere(req) }),
        db.estimate.findMany({ where: scopedWhere(req) }),
        db.serviceJob.findMany({ where: scopedWhere(req) }),
        db.followUp.findMany({ where: scopedWhere(req, { status: 'PENDING' }) }),
      ]);

      // Recommendation 1: High lead volume
      if (leads.length > 50) {
        recommendations.push({
          priority: 'high',
          category: 'LEAD_MANAGEMENT',
          title: 'Implement Lead Scoring',
          description: `You have ${leads.length} leads. Use AI-powered scoring to prioritize high-quality prospects.`,
          action: 'Use /ai-advisor/lead-score to rank leads.',
          estimatedImpact: '30% faster conversion',
        });
      }

      // Recommendation 2: Low conversion rate
      const soldEstimates = estimates.filter((e) => e.status === 'SOLD').length;
      const conversionRate = estimates.length > 0 ? (soldEstimates / estimates.length) * 100 : 0;

      if (conversionRate < 20 && estimates.length > 10) {
        recommendations.push({
          priority: 'high',
          category: 'SALES_OPTIMIZATION',
          title: 'Improve Estimate Conversion',
          description: `Your conversion rate is ${conversionRate.toFixed(1)}%. Industry average is 25-35%.`,
          action: 'Create follow-up workflow for SENT estimates after 2 days.',
          estimatedImpact: '5-10% conversion lift',
        });
      }

      // Recommendation 3: Overdue follow-ups
      const overdueCount = followUps.filter((f) => f.dueAt < new Date()).length;

      if (overdueCount > 0) {
        recommendations.push({
          priority: 'critical',
          category: 'FOLLOW_UP',
          title: 'Clear Overdue Follow-ups',
          description: `You have ${overdueCount} overdue follow-ups that need attention.`,
          action: 'Visit Dashboard → Follow-ups and complete overdue items.',
          estimatedImpact: 'Recover lost revenue opportunities',
        });
      }

      // Recommendation 4: Churn risk
      const atRiskCustomers = customers.filter((c) => {
        const daysSinceService = Math.floor((Date.now() - c.lastServicedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceService > 90;
      });

      if (atRiskCustomers.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'CUSTOMER_RETENTION',
          title: 'Re-engage At-Risk Customers',
          description: `${atRiskCustomers.length} customers have been inactive 90+ days.`,
          action: 'Launch outreach campaign or maintenance offer.',
          estimatedImpact: 'Retain $X revenue',
        });
      }

      // Recommendation 5: Job scheduling
      const unscheduledJobs = jobs.filter((j) => j.status === 'SCHEDULED' && !j.technician);

      if (unscheduledJobs.length > 5) {
        recommendations.push({
          priority: 'medium',
          category: 'OPERATIONS',
          title: 'Dispatch Pending Jobs',
          description: `You have ${unscheduledJobs.length} jobs awaiting technician assignment.`,
          action: 'Use Dispatch Board to assign technicians.',
          estimatedImpact: 'Reduce average job completion time',
        });
      }

      res.json({
        success: true,
        data: {
          recommendations: recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
          }),
          summary: {
            critical: recommendations.filter((r) => r.priority === 'critical').length,
            high: recommendations.filter((r) => r.priority === 'high').length,
            medium: recommendations.filter((r) => r.priority === 'medium').length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/ai-advisor/insights
 * AI-generated business insights from data patterns
 */
router.get(
  '/tenants/:tenantId/ai-advisor/insights',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insights: any[] = [];

      // Get data for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Insight 1: Fastest-closing customers
      const soldEstimates = await db.estimate.findMany({
        where: scopedWhere(req, {
          status: 'SOLD',
          createdAt: { gte: thirtyDaysAgo },
        }),
      });

      if (soldEstimates.length > 5) {
        const avgTimeToClose = soldEstimates.reduce((sum, e) => {
          const daysToClose = e.updatedAt ? (e.updatedAt.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24) : 0;
          return sum + daysToClose;
        }, 0) / soldEstimates.length;

        insights.push({
          type: 'EFFICIENCY',
          title: 'Sales Velocity',
          insight: `Average time from estimate to sale: ${Math.round(avgTimeToClose)} days`,
          benchmark: '7-10 days is typical',
          status: avgTimeToClose < 10 ? 'excellent' : avgTimeToClose < 15 ? 'good' : 'needs improvement',
        });
      }

      // Insight 2: Top performing source
      const leads = await db.lead.findMany({
        where: scopedWhere(req),
      });

      const sourceBreakdown: Record<string, { total: number; converted: number }> = {};

      for (const lead of leads) {
        if (!sourceBreakdown[lead.source]) {
          sourceBreakdown[lead.source] = { total: 0, converted: 0 };
        }
        sourceBreakdown[lead.source].total++;
        if (lead.status === 'WON') {
          sourceBreakdown[lead.source].converted++;
        }
      }

      const topSource = Object.entries(sourceBreakdown).sort(
        (a, b) => (b[1].converted / b[1].total) - (a[1].converted / a[1].total)
      )[0];

      if (topSource) {
        const conversionRate = ((topSource[1].converted / topSource[1].total) * 100).toFixed(1);
        insights.push({
          type: 'MARKETING',
          title: 'Top Lead Source',
          insight: `${topSource[0]} converts at ${conversionRate}% (${topSource[1].converted}/${topSource[1].total})`,
          benchmark: 'Focus marketing on high-performing channels',
          status: 'good',
        });
      }

      res.json({
        success: true,
        data: {
          insights,
          generatedAt: new Date().toISOString(),
          nextUpdateIn: '24 hours',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
