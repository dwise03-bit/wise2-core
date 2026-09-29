/**
 * Follow-Up Routes
 * Phase 10: CRM follow-up identification, tracking, and execution
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
 * POST /api/v1/crm/tenants/:tenantId/followups/identify
 * Automatically identify follow-ups needed (expensive operation, run periodically)
 */
router.post(
  '/tenants/:tenantId/followups/identify',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const created: any[] = [];

      // Rule 1: New leads not contacted in 1 day
      const unconactedLeads = await db.lead.findMany({
        where: scopedWhere(req, {
          status: 'NEW',
          createdAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        }),
      });

      for (const lead of unconactedLeads) {
        const existing = await db.followUp.findFirst({
          where: {
            tenantId: req.tenant!.tenantId,
            relatedEntityId: lead.id,
            followUpType: 'LEAD_CONTACT',
            status: 'PENDING',
          },
        });

        if (!existing) {
          const followUp = await db.followUp.create({
            data: {
              tenantId: req.tenant!.tenantId,
              followUpType: 'LEAD_CONTACT',
              relatedEntityType: 'Lead',
              relatedEntityId: lead.id,
              message: `Contact new lead (source: ${lead.source})`,
              dueAt: new Date(),
              priority: 10,
              status: 'PENDING',
            },
          });
          created.push(followUp);
        }
      }

      // Rule 2: Estimates sent but not viewed in 2 days
      const unviewedEstimates = await db.estimate.findMany({
        where: scopedWhere(req, {
          status: 'SENT',
          createdAt: { lte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
        }),
      });

      for (const estimate of unviewedEstimates) {
        const existing = await db.followUp.findFirst({
          where: {
            tenantId: req.tenant!.tenantId,
            relatedEntityId: estimate.id,
            followUpType: 'ESTIMATE_FOLLOW_UP',
            status: 'PENDING',
          },
        });

        if (!existing) {
          const followUp = await db.followUp.create({
            data: {
              tenantId: req.tenant!.tenantId,
              followUpType: 'ESTIMATE_FOLLOW_UP',
              relatedEntityType: 'Estimate',
              relatedEntityId: estimate.id,
              message: `Estimate not viewed - reach out to customer`,
              dueAt: new Date(),
              priority: 8,
              status: 'PENDING',
            },
          });
          created.push(followUp);
        }
      }

      // Rule 3: Upcoming maintenance for active contracts
      const contracts = await db.contract.findMany({
        where: scopedWhere(req, {
          status: 'active',
          renewalDate: {
            gte: new Date(),
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        }),
      });

      for (const contract of contracts) {
        const existing = await db.followUp.findFirst({
          where: {
            tenantId: req.tenant!.tenantId,
            relatedEntityId: contract.id,
            followUpType: 'MAINTENANCE_OPPORTUNITY',
            status: 'PENDING',
          },
        });

        if (!existing) {
          const followUp = await db.followUp.create({
            data: {
              tenantId: req.tenant!.tenantId,
              followUpType: 'MAINTENANCE_OPPORTUNITY',
              relatedEntityType: 'Contract',
              relatedEntityId: contract.id,
              message: `Maintenance opportunity for contract renewal (${contract.frequency})`,
              dueAt: new Date(contract.renewalDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
              priority: 7,
              status: 'PENDING',
            },
          });
          created.push(followUp);
        }
      }

      // Rule 4: Long-time customers without recent service
      const inactiveCustomers = await db.revenueCustomer.findMany({
        where: scopedWhere(req, {
          lastServicedAt: {
            lte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90+ days ago
          },
        }),
      });

      for (const customer of inactiveCustomers) {
        const existing = await db.followUp.findFirst({
          where: {
            tenantId: req.tenant!.tenantId,
            relatedEntityId: customer.id,
            followUpType: 'REACTIVATION',
            status: 'PENDING',
          },
        });

        if (!existing) {
          const followUp = await db.followUp.create({
            data: {
              tenantId: req.tenant!.tenantId,
              followUpType: 'REACTIVATION',
              relatedEntityType: 'RevenueCustomer',
              relatedEntityId: customer.id,
              message: `Reactivation opportunity - customer inactive 90+ days`,
              dueAt: new Date(),
              priority: 5,
              status: 'PENDING',
            },
          });
          created.push(followUp);
        }
      }

      logger.info('Identified follow-ups', {
        tenantId: req.tenant!.tenantId,
        count: created.length,
      });

      res.json({
        success: true,
        data: {
          identified: created.length,
          followUps: created,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/followups
 * List follow-ups (sorted by priority and due date)
 */
router.get('/tenants/:tenantId/followups', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const overduOnly = req.query.overdueOnly === 'true';

    const where = scopedWhere(req, {
      ...(status && { status }),
      ...(type && { followUpType: type }),
      ...(overduOnly && { dueAt: { lte: new Date() } }),
    });

    const [followUps, total] = await Promise.all([
      db.followUp.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: 'asc' }, // PENDING first
          { priority: 'desc' }, // High priority first
          { dueAt: 'asc' }, // Due soon first
        ],
      }),
      db.followUp.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        followUps,
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
 * GET /api/v1/crm/tenants/:tenantId/followups/summary
 * Get follow-up summary (counts by type and status)
 */
router.get('/tenants/:tenantId/followups/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = scopedWhere(req);

    const [total, pending, overdue, byType] = await Promise.all([
      db.followUp.count({ where }),
      db.followUp.count({ where: { ...where, status: 'PENDING' } }),
      db.followUp.count({
        where: { ...where, status: 'PENDING', dueAt: { lte: new Date() } },
      }),
      db.followUp.groupBy({
        by: ['followUpType'],
        where,
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        overdue,
        byType: byType.map((item) => ({
          type: item.followUpType,
          count: item._count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/crm/tenants/:tenantId/followups/:followUpId
 * Update follow-up status (mark complete, skip, reassign)
 */
router.patch('/tenants/:tenantId/followups/:followUpId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { followUpId } = req.params;
    const { status, assignedTo, notes } = req.body;

    const followUp = await db.followUp.findFirst({
      where: scopedWhere(req, { id: followUpId }),
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Follow-up not found' },
      });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    const updated = await db.followUp.update({
      where: { id: followUpId },
      data: updateData,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'FOLLOWUP_UPDATED',
        resourceType: 'FollowUp',
        resourceId: followUpId,
        changesBefore: { status: followUp.status },
        changesAfter: { status: updated.status, assignedTo },
        source: 'API',
      },
    });

    res.json({ success: true, data: { followUp: updated } });
  } catch (error) {
    next(error);
  }
});

export default router;
