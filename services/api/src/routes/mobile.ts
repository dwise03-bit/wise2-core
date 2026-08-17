/**
 * Mobile API Routes
 * Phase 12: Mobile-optimized API for iOS/Android native clients
 * Simplified responses, optimized payloads, mobile-specific features
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
 * GET /api/v1/mobile/dashboard
 * Mobile dashboard with key metrics and actions
 * Lightweight payload optimized for mobile display
 */
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenant!.tenantId;

    // Fetch only necessary data
    const [pendingApprovals, overdueFollowUps, unassignedJobs, atRiskCustomers] = await Promise.all([
      db.approval.count({
        where: scopedWhere(req, { status: 'PENDING' }),
      }),
      db.followUp.count({
        where: scopedWhere(req, { status: 'PENDING', dueAt: { lte: new Date() } }),
      }),
      db.serviceJob.count({
        where: scopedWhere(req, { status: 'SCHEDULED', technician: null }),
      }),
      db.revenueCustomer.count({
        where: scopedWhere(req, { lastServicedAt: { lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } }),
      }),
    ]);

    res.json({
      success: true,
      data: {
        alerts: {
          pendingApprovals,
          overdueFollowUps,
          unassignedJobs,
          atRiskCustomers,
        },
        actions: [
          pendingApprovals > 0 && { type: 'APPROVALS', count: pendingApprovals, priority: 'high' },
          overdueFollowUps > 0 && { type: 'FOLLOWUPS', count: overdueFollowUps, priority: 'high' },
          unassignedJobs > 0 && { type: 'JOBS', count: unassignedJobs, priority: 'medium' },
        ].filter(Boolean),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/mobile/leads
 * Mobile-optimized lead list with minimal payload
 */
router.get('/leads', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;

    const where = scopedWhere(req, {
      ...(status && { status }),
    });

    const leads = await db.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        source: true,
        createdAt: true,
      },
    });

    const total = await db.lead.count({ where });

    res.json({
      success: true,
      data: {
        leads,
        pagination: { page, limit, total },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/mobile/leads/:leadId
 * Mobile lead detail with actions
 */
router.get('/leads/:leadId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId } = req.params;

    const lead = await db.lead.findFirst({
      where: scopedWhere(req, { id: leadId }),
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        source: true,
        notes: true,
        createdAt: true,
        wonAt: true,
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
    }

    // Quick actions
    const actions = [
      { type: 'CALL', label: 'Call', icon: 'phone' },
      { type: 'TEXT', label: 'Text', icon: 'chat' },
      { type: 'EMAIL', label: 'Email', icon: 'mail' },
      { type: 'CREATE_ESTIMATE', label: 'Estimate', icon: 'file' },
    ];

    res.json({
      success: true,
      data: {
        lead,
        actions,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/mobile/leads/:leadId/update-status
 * Quick status update (mobile-optimized)
 */
router.post('/leads/:leadId/update-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId } = req.params;
    const { status, note } = req.body;

    const lead = await db.lead.findFirst({
      where: scopedWhere(req, { id: leadId }),
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
    }

    const updated = await db.lead.update({
      where: { id: leadId },
      data: {
        status,
        notes: note ? `${lead.notes || ''}\n[${new Date().toISOString()}] ${note}` : lead.notes,
      },
    });

    res.json({
      success: true,
      data: { lead: updated },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/mobile/jobs
 * Mobile-optimized job list for field technicians
 */
router.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string || 'DISPATCHED';

    const jobs = await db.serviceJob.findMany({
      where: scopedWhere(req, { status }),
      orderBy: { scheduledStart: 'asc' },
      select: {
        id: true,
        customerId: true,
        serviceType: true,
        scheduledStart: true,
        scheduledEnd: true,
        status: true,
        notes: true,
      },
    });

    res.json({
      success: true,
      data: { jobs },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/mobile/jobs/:jobId/status
 * Update job status from field (mobile)
 */
router.patch('/jobs/:jobId/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { status, photos, notes } = req.body;

    const job = await db.serviceJob.findFirst({
      where: scopedWhere(req, { id: jobId }),
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
    }

    const updated = await db.serviceJob.update({
      where: { id: jobId },
      data: {
        status,
        notes: notes ? `${job.notes || ''}\n[${new Date().toISOString()}] ${notes}` : job.notes,
        updatedAt: new Date(),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    res.json({
      success: true,
      data: { job: updated },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/mobile/profile
 * User profile and preferences
 */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: req.tenant!.tenantId },
      select: {
        id: true,
        name: true,
        vertical: true,
      },
    });

    const membership = await db.tenantMembership.findFirst({
      where: {
        tenantId: req.tenant!.tenantId,
        userId: req.tenant!.userId,
      },
    });

    res.json({
      success: true,
      data: {
        tenant,
        user: {
          id: membership?.userId,
          role: membership?.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/mobile/sync
 * Sync endpoint for offline-first mobile apps
 * Returns data delta since lastSync timestamp
 */
router.get('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lastSync = req.query.lastSync ? new Date(req.query.lastSync as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [leads, jobs, approvals, followUps] = await Promise.all([
      db.lead.findMany({
        where: scopedWhere(req, { updatedAt: { gte: lastSync } }),
      }),
      db.serviceJob.findMany({
        where: scopedWhere(req, { updatedAt: { gte: lastSync } }),
      }),
      db.approval.findMany({
        where: scopedWhere(req, { updatedAt: { gte: lastSync } }),
      }),
      db.followUp.findMany({
        where: scopedWhere(req, { updatedAt: { gte: lastSync } }),
      }),
    ]);

    res.json({
      success: true,
      data: {
        lastSync,
        currentSync: new Date(),
        changes: {
          leads: { added: leads.length, data: leads },
          jobs: { added: jobs.length, data: jobs },
          approvals: { added: approvals.length, data: approvals },
          followUps: { added: followUps.length, data: followUps },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/mobile/offline-action
 * Queue action for offline-first sync when app comes back online
 */
router.post('/offline-action', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionType, resourceId, resourceType, payload, timestamp } = req.body;

    // Store offline action (in production, would use queue service)
    const offlineAction = await db.offlineAction.create({
      data: {
        tenantId: req.tenant!.tenantId,
        userId: req.tenant!.userId,
        actionType,
        resourceId,
        resourceType,
        payload,
        status: 'PENDING',
        clientTimestamp: new Date(timestamp),
      },
    });

    res.json({
      success: true,
      data: { offlineAction },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
