/**
 * Dispatch Routes
 * Phase 9: Job management and field service dispatch
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere } from '../middlewares/tenant-guard';

const router = Router();

router.use(authenticate);
router.use(tenantGuard);

/**
 * POST /api/v1/crm/tenants/:tenantId/jobs
 * Create new service job
 */
router.post('/tenants/:tenantId/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId, customerId, estimateId, serviceType, scheduledStart, scheduledEnd, notes } = req.body;

    if (!customerId && !leadId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'customerId or leadId is required' },
      });
    }

    if (!scheduledStart) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'scheduledStart is required' },
      });
    }

    // Verify customer/lead ownership
    if (customerId) {
      const customer = await db.revenueCustomer.findFirst({
        where: scopedWhere(req, { id: customerId }),
      });
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Customer not found' },
        });
      }
    }

    if (leadId) {
      const lead = await db.lead.findFirst({
        where: scopedWhere(req, { id: leadId }),
      });
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Lead not found' },
        });
      }
    }

    // Create job
    const job = await db.serviceJob.create({
      data: {
        tenantId: req.tenant!.tenantId,
        leadId: leadId || null,
        customerId: customerId || null,
        serviceType: serviceType || null,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        notes: notes || null,
        status: 'SCHEDULED',
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'JOB_CREATED',
        resourceType: 'ServiceJob',
        resourceId: job.id,
        changesAfter: {
          status: 'SCHEDULED',
          customerId,
          scheduledStart,
        },
        source: 'API',
      },
    });

    res.status(201).json({ success: true, data: { job } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/jobs
 * List jobs with filtering and status
 */
router.get('/tenants/:tenantId/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;
    const technician = req.query.technician as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const where = scopedWhere(req, {
      ...(status && { status }),
      ...(technician && { technician }),
      ...(startDate && { scheduledStart: { gte: startDate } }),
      ...(endDate && { scheduledStart: { lte: endDate } }),
    });

    const [jobs, total] = await Promise.all([
      db.serviceJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'asc' },
        include: {
          customer: true,
          lead: true,
        },
      }),
      db.serviceJob.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/jobs/:jobId
 * Get specific job detail
 */
router.get('/tenants/:tenantId/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    const job = await db.serviceJob.findFirst({
      where: scopedWhere(req, { id: jobId }),
      include: {
        customer: true,
        lead: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
    }

    res.json({ success: true, data: { job } });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/crm/tenants/:tenantId/jobs/:jobId
 * Update job status (assign, dispatch, mark complete)
 */
router.patch('/tenants/:tenantId/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { status, technician, revenue, notes } = req.body;

    const job = await db.serviceJob.findFirst({
      where: scopedWhere(req, { id: jobId }),
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['DISPATCHED', 'CANCELED'],
      DISPATCHED: ['ON_SITE', 'CANCELED'],
      ON_SITE: ['COMPLETED', 'CANCELED'],
      COMPLETED: [],
      CANCELED: [],
    };

    if (status && !validTransitions[job.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${job.status} to ${status}`,
        },
      });
    }

    const updateData: any = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    if (technician) {
      updateData.technician = technician;
    }

    if (revenue) {
      updateData.revenue = parseFloat(revenue);
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updated = await db.serviceJob.update({
      where: { id: jobId },
      data: updateData,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'JOB_UPDATED',
        resourceType: 'ServiceJob',
        resourceId: jobId,
        changesBefore: { status: job.status },
        changesAfter: { status: updated.status, technician, revenue },
        source: 'API',
      },
    });

    // If job completed, create follow-up for review request
    if (status === 'COMPLETED' && updated.customerId) {
      await db.followUp.create({
        data: {
          tenantId: req.tenant!.tenantId,
          followUpType: 'REVIEW_REQUEST',
          relatedEntityType: 'ServiceJob',
          relatedEntityId: jobId,
          message: 'Request customer review of completed service',
          dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
          priority: 5,
          status: 'PENDING',
        },
      });
    }

    res.json({ success: true, data: { job: updated } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/dispatch/board
 * Get dispatch board (unassigned jobs, crew assignments, schedule)
 */
router.get('/tenants/:tenantId/dispatch/board', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get unassigned jobs
    const unassignedJobs = await db.serviceJob.findMany({
      where: scopedWhere(req, {
        status: { in: ['SCHEDULED', 'DISPATCHED'] },
        technician: null,
      }),
      orderBy: { scheduledStart: 'asc' },
      include: { customer: true },
    });

    // Get jobs by technician (assigned jobs)
    const assignedJobs = await db.serviceJob.findMany({
      where: scopedWhere(req, {
        status: { in: ['DISPATCHED', 'ON_SITE'] },
        technician: { not: null },
      }),
      orderBy: [{ technician: 'asc' }, { scheduledStart: 'asc' }],
      include: { customer: true },
    });

    // Group assigned jobs by technician
    const jobsByTechnician: Record<string, any[]> = {};
    for (const job of assignedJobs) {
      if (job.technician) {
        if (!jobsByTechnician[job.technician]) {
          jobsByTechnician[job.technician] = [];
        }
        jobsByTechnician[job.technician].push(job);
      }
    }

    res.json({
      success: true,
      data: {
        unassignedJobs,
        jobsByTechnician,
        summary: {
          unassignedCount: unassignedJobs.length,
          assignedCount: assignedJobs.length,
          technicianCount: Object.keys(jobsByTechnician).length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/crm/tenants/:tenantId/dispatch/assign-batch
 * Assign multiple jobs to technicians (bulk dispatch)
 */
router.post(
  '/tenants/:tenantId/dispatch/assign-batch',
  requireRole('OWNER', 'ADMIN', 'DISPATCHER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assignments } = req.body; // [{ jobId, technician }, ...]

      if (!Array.isArray(assignments) || assignments.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'assignments array is required' },
        });
      }

      const results = [];

      for (const assignment of assignments) {
        const { jobId, technician } = assignment;

        // Verify job ownership
        const job = await db.serviceJob.findFirst({
          where: scopedWhere(req, { id: jobId }),
        });

        if (!job) {
          results.push({
            jobId,
            success: false,
            error: 'Job not found',
          });
          continue;
        }

        // Update job
        const updated = await db.serviceJob.update({
          where: { id: jobId },
          data: {
            technician,
            status: 'DISPATCHED',
          },
        });

        // Audit log
        await db.auditLog.create({
          data: {
            tenantId: req.tenant!.tenantId,
            actor: req.tenant!.userId,
            action: 'JOB_ASSIGNED',
            resourceType: 'ServiceJob',
            resourceId: jobId,
            changesAfter: { technician },
            source: 'API',
          },
        });

        results.push({
          jobId,
          success: true,
          job: updated,
        });
      }

      res.json({ success: true, data: { results } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
