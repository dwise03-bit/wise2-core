/**
 * Estimates Routes
 * Phase 8: Estimate creation, management, and sales workflow
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere } from '../middlewares/tenant-guard';
import { Decimal } from '@prisma/client/runtime/library';

const router = Router();

router.use(authenticate);
router.use(tenantGuard);

/**
 * Estimate package templates (GOOD, BETTER, BEST pricing)
 * TODO: Load from industry templates in Phase 15
 */
interface EstimatePackage {
  level: 'GOOD' | 'BETTER' | 'BEST';
  name: string;
  description: string;
  basePrice: number;
  services: string[];
  markup: number; // Multiplier for base price
}

const DEFAULT_PACKAGES: EstimatePackage[] = [
  {
    level: 'GOOD',
    name: 'Basic Service',
    description: 'Essential service to resolve the issue',
    basePrice: 300,
    services: ['Diagnosis', 'Repair'],
    markup: 1.0,
  },
  {
    level: 'BETTER',
    name: 'Standard Service',
    description: 'Recommended service with maintenance',
    basePrice: 500,
    services: ['Diagnosis', 'Repair', 'Maintenance Check', 'Warranty'],
    markup: 1.5,
  },
  {
    level: 'BEST',
    name: 'Premium Service',
    description: 'Complete solution with extended coverage',
    basePrice: 800,
    services: ['Diagnosis', 'Repair', 'Maintenance Check', 'Extended Warranty', 'Priority Support'],
    markup: 2.0,
  },
];

/**
 * POST /api/v1/crm/tenants/:tenantId/estimates
 * Create new estimate
 */
router.post('/tenants/:tenantId/estimates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId, customerId, packages, notes } = req.body;

    if (!leadId && !customerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'leadId or customerId is required' },
      });
    }

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'packages array is required' },
      });
    }

    // Verify lead/customer ownership if provided
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

    // Calculate estimate amount from packages
    let totalAmount = new Decimal(0);
    const estimateLines: any[] = [];

    for (const pkg of packages) {
      const packageTemplate = DEFAULT_PACKAGES.find((p) => p.level === pkg.level);
      if (!packageTemplate) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Invalid package level: ${pkg.level}` },
        });
      }

      const amount = packageTemplate.basePrice * packageTemplate.markup;
      totalAmount = totalAmount.plus(new Decimal(amount));

      estimateLines.push({
        level: pkg.level,
        name: packageTemplate.name,
        description: packageTemplate.description,
        services: packageTemplate.services,
        amount,
      });
    }

    // Create estimate
    const estimate = await db.estimate.create({
      data: {
        tenantId: req.tenant!.tenantId,
        leadId: leadId || null,
        customerId: customerId || null,
        amount: totalAmount,
        status: 'DRAFT',
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'ESTIMATE_CREATED',
        resourceType: 'Estimate',
        resourceId: estimate.id,
        changesAfter: {
          status: 'DRAFT',
          amount: totalAmount.toString(),
          packageCount: packages.length,
        },
        source: 'API',
      },
    });

    // Create follow-up for estimate follow-up
    await db.followUp.create({
      data: {
        tenantId: req.tenant!.tenantId,
        followUpType: 'ESTIMATE_FOLLOW_UP',
        relatedEntityType: 'Estimate',
        relatedEntityId: estimate.id,
        message: `Follow up on estimate: ${estimateLines.map((l) => l.name).join(', ')}`,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        priority: 10,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        estimate,
        packages: estimateLines,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/estimates/:estimateId
 * Get specific estimate
 */
router.get('/tenants/:tenantId/estimates/:estimateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estimateId } = req.params;

    const estimate = await db.estimate.findFirst({
      where: scopedWhere(req, { id: estimateId }),
      include: {
        lead: true,
        customer: true,
      },
    });

    if (!estimate) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Estimate not found' },
      });
    }

    res.json({ success: true, data: { estimate } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/estimates
 * List estimates with filtering
 */
router.get('/tenants/:tenantId/estimates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;
    const leadId = req.query.leadId as string | undefined;
    const customerId = req.query.customerId as string | undefined;

    const where = scopedWhere(req, {
      ...(status && { status }),
      ...(leadId && { leadId }),
      ...(customerId && { customerId }),
    });

    const [estimates, total] = await Promise.all([
      db.estimate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: true,
          customer: true,
        },
      }),
      db.estimate.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        estimates,
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
 * PATCH /api/v1/crm/tenants/:tenantId/estimates/:estimateId
 * Update estimate (send, mark as viewed, mark as sold, decline)
 */
router.patch('/tenants/:tenantId/estimates/:estimateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estimateId } = req.params;
    const { status } = req.body;

    const estimate = await db.estimate.findFirst({
      where: scopedWhere(req, { id: estimateId }),
    });

    if (!estimate) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Estimate not found' },
      });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'DECLINED'],
      SENT: ['VIEWED', 'DECLINED'],
      VIEWED: ['SOLD', 'DECLINED'],
      SOLD: [],
      DECLINED: [],
      EXPIRED: [],
    };

    if (status && !validTransitions[estimate.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${estimate.status} to ${status}`,
        },
      });
    }

    const updateData: any = { updatedAt: new Date() };

    if (status === 'SENT') {
      updateData.status = 'SENT';
      // TODO: Send estimate to customer via email/SMS
    } else if (status === 'VIEWED') {
      updateData.status = 'VIEWED';
      // Typically triggered by webhook from email tracking
    } else if (status === 'SOLD') {
      updateData.status = 'SOLD';
      updateData.soldAt = new Date();
      // TODO: Create job and invoice
    } else if (status === 'DECLINED') {
      updateData.status = 'DECLINED';
    }

    const updated = await db.estimate.update({
      where: { id: estimateId },
      data: updateData,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'ESTIMATE_STATUS_CHANGED',
        resourceType: 'Estimate',
        resourceId: estimateId,
        changesBefore: { status: estimate.status },
        changesAfter: { status: updated.status },
        source: 'API',
      },
    });

    // If sold, update lead status
    if (status === 'SOLD' && estimate.leadId) {
      await db.lead.update({
        where: { id: estimate.leadId },
        data: { status: 'WON', wonAt: new Date() },
      });
    }

    res.json({ success: true, data: { estimate: updated } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/estimate-packages
 * Get available estimate packages (templates for this industry)
 */
router.get('/tenants/:tenantId/estimate-packages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: req.tenant!.tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tenant not found' },
      });
    }

    // TODO: Load industry-specific packages from template
    // For now, return default packages
    const packages = DEFAULT_PACKAGES.map((pkg) => ({
      ...pkg,
      amount: pkg.basePrice * pkg.markup,
    }));

    res.json({
      success: true,
      data: {
        industry: tenant.vertical,
        packages,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
