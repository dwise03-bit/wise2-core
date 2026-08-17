/**
 * Reports Routes
 * Phase 11: Advanced reporting, custom analytics, and business intelligence
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
 * GET /api/v1/crm/tenants/:tenantId/reports/pipeline
 * Sales pipeline report with stage breakdown
 */
router.get('/tenants/:tenantId/reports/pipeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const leads = await db.lead.findMany({
      where: scopedWhere(req, { createdAt: { gte: startDate, lte: endDate } }),
    });

    const estimates = await db.estimate.findMany({
      where: scopedWhere(req, { createdAt: { gte: startDate, lte: endDate } }),
    });

    // Calculate pipeline stages
    const pipelineStages = {
      NEW_LEADS: leads.filter((l) => l.status === 'NEW').length,
      CONTACTED: leads.filter((l) => l.status === 'CONTACTED').length,
      QUALIFIED: leads.filter((l) => l.status === 'QUALIFIED').length,
      PROPOSALS: estimates.filter((e) => e.status === 'SENT' || e.status === 'VIEWED').length,
      NEGOTIATIONS: leads.filter((l) => l.status === 'PROPOSAL').length,
      WON: leads.filter((l) => l.status === 'WON').length,
      LOST: leads.filter((l) => l.status === 'LOST').length,
    };

    // Calculate values
    const value = {
      TOTAL_PIPELINE: estimates.reduce((sum, e) => sum + Number(e.amount), 0),
      SENT_ESTIMATES: estimates
        .filter((e) => e.status === 'SENT' || e.status === 'VIEWED')
        .reduce((sum, e) => sum + Number(e.amount), 0),
      WON_VALUE: estimates.filter((e) => e.status === 'SOLD').reduce((sum, e) => sum + Number(e.amount), 0),
    };

    // Calculate conversion rates
    const conversionRates = {
      LEAD_TO_ESTIMATE: leads.length > 0 ? (estimates.length / leads.length) * 100 : 0,
      ESTIMATE_TO_WON: estimates.length > 0 ? (value.WON_VALUE / value.TOTAL_PIPELINE) * 100 : 0,
    };

    res.json({
      success: true,
      data: {
        dateRange: { startDate, endDate },
        stages: pipelineStages,
        value,
        conversionRates,
        totalLeads: leads.length,
        totalEstimates: estimates.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/reports/performance
 * Performance metrics report (individual and team)
 */
router.get('/tenants/:tenantId/reports/performance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get jobs data
    const jobs = await db.serviceJob.findMany({
      where: scopedWhere(req, { createdAt: { gte: startDate } }),
    });

    // Performance metrics
    const jobsByTechnician: Record<string, any> = {};

    for (const job of jobs) {
      if (job.technician) {
        if (!jobsByTechnician[job.technician]) {
          jobsByTechnician[job.technician] = {
            total: 0,
            completed: 0,
            avgRevenue: 0,
            totalRevenue: 0,
            completionRate: 0,
          };
        }

        jobsByTechnician[job.technician].total++;

        if (job.status === 'COMPLETED') {
          jobsByTechnician[job.technician].completed++;
          jobsByTechnician[job.technician].totalRevenue += job.revenue || 0;
        }
      }
    }

    // Calculate rates and averages
    for (const tech in jobsByTechnician) {
      const data = jobsByTechnician[tech];
      data.completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      data.avgRevenue = data.completed > 0 ? data.totalRevenue / data.completed : 0;
    }

    res.json({
      success: true,
      data: {
        dateRange: { startDate, endDate: new Date() },
        byTechnician: jobsByTechnician,
        totalJobs: jobs.length,
        completedJobs: jobs.filter((j) => j.status === 'COMPLETED').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/reports/revenue
 * Revenue analysis report with forecasting
 */
router.get('/tenants/:tenantId/reports/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - months * 30 * 24 * 60 * 60 * 1000);

    // Get estimates by month
    const estimates = await db.estimate.findMany({
      where: scopedWhere(req, { createdAt: { gte: startDate, lte: endDate }, status: 'SOLD' }),
    });

    // Aggregate by month
    const revenueByMonth: Record<string, { sold: number; count: number }> = {};

    for (const estimate of estimates) {
      const monthKey = estimate.createdAt.toISOString().substring(0, 7);
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { sold: 0, count: 0 };
      }
      revenueByMonth[monthKey].sold += Number(estimate.amount);
      revenueByMonth[monthKey].count++;
    }

    // Calculate trends
    const months_array = Object.keys(revenueByMonth).sort();
    const avgMonthlyRevenue = months_array.length > 0 ? Object.values(revenueByMonth).reduce((sum, m) => sum + m.sold, 0) / months_array.length : 0;
    const lastMonthRevenue = months_array.length > 0 ? revenueByMonth[months_array[months_array.length - 1]]?.sold || 0 : 0;

    const trend = months_array.length > 1
      ? ((lastMonthRevenue - (revenueByMonth[months_array[months_array.length - 2]]?.sold || 0)) / (revenueByMonth[months_array[months_array.length - 2]]?.sold || 1)) * 100
      : 0;

    res.json({
      success: true,
      data: {
        dateRange: { startDate, endDate },
        revenueByMonth,
        avgMonthlyRevenue: Math.round(avgMonthlyRevenue),
        lastMonthRevenue: Math.round(lastMonthRevenue),
        trend: parseFloat(trend.toFixed(1)),
        totalEstimates: estimates.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/reports/customer-lifecycle
 * Customer lifecycle and retention analysis
 */
router.get('/tenants/:tenantId/reports/customer-lifecycle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await db.revenueCustomer.findMany({
      where: scopedWhere(req),
    });

    const contracts = await db.contract.findMany({
      where: scopedWhere(req),
    });

    // Lifecycle segments
    const segments = {
      newCustomers: customers.filter((c) => {
        const ageInDays = Math.floor((Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return ageInDays <= 30;
      }).length,
      activeCustomers: customers.filter((c) => {
        const daysSinceService = Math.floor((Date.now() - c.lastServicedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceService <= 90;
      }).length,
      atRiskCustomers: customers.filter((c) => {
        const daysSinceService = Math.floor((Date.now() - c.lastServicedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceService > 90 && daysSinceService <= 180;
      }).length,
      churnedCustomers: customers.filter((c) => {
        const daysSinceService = Math.floor((Date.now() - c.lastServicedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceService > 180;
      }).length,
    };

    // Contract status
    const contractStatus = {
      active: contracts.filter((c) => c.status === 'active').length,
      expired: contracts.filter((c) => c.status === 'expired').length,
      renewal: contracts.filter((c) => {
        const daysUntilRenewal = Math.floor((c.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilRenewal <= 30 && c.status === 'active';
      }).length,
    };

    // Retention rate
    const retentionRate = customers.length > 0 ? ((segments.activeCustomers + segments.atRiskCustomers) / customers.length) * 100 : 0;

    res.json({
      success: true,
      data: {
        segments,
        contractStatus,
        retentionRate: parseFloat(retentionRate.toFixed(1)),
        totalCustomers: customers.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/reports/export
 * Export report data in CSV or JSON format
 */
router.get('/tenants/:tenantId/reports/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportType = req.query.reportType as string || 'leads';
    const format = req.query.format as string || 'json';

    let data: any[] = [];

    switch (reportType) {
      case 'leads':
        data = await db.lead.findMany({
          where: scopedWhere(req),
        });
        break;

      case 'customers':
        data = await db.revenueCustomer.findMany({
          where: scopedWhere(req),
        });
        break;

      case 'estimates':
        data = await db.estimate.findMany({
          where: scopedWhere(req),
        });
        break;

      case 'jobs':
        data = await db.serviceJob.findMany({
          where: scopedWhere(req),
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REPORT', message: `Report type not found: ${reportType}` },
        });
    }

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return res.json({
          success: true,
          data: { csv: '' },
        });
      }

      const headers = Object.keys(data[0]);
      const csvContent =
        headers.join(',') +
        '\n' +
        data
          .map((row) =>
            headers
              .map((header) => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
              })
              .join(',')
          )
          .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-export.csv"`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: {
          reportType,
          format,
          rows: data.length,
          data,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/crm/tenants/:tenantId/reports/custom
 * Create and run custom report with filters
 */
router.post('/tenants/:tenantId/reports/custom', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, filters, groupBy, metrics } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name and type are required' },
      });
    }

    // Store custom report definition
    const customReport = await db.customReport.create({
      data: {
        tenantId: req.tenant!.tenantId,
        name,
        type,
        filters: filters || {},
        groupBy: groupBy || [],
        metrics: metrics || [],
      },
    });

    logger.info('Custom report created', { reportId: customReport.id, name });

    res.status(201).json({
      success: true,
      data: { report: customReport },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
