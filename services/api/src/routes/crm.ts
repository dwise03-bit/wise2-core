/**
 * CRM Routes (Leads, Customers, Pipeline)
 * Core business operations for the Command Center
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere, validateOwnership } from '../middlewares/tenant-guard';

const router = Router();

// All CRM routes require authentication and tenant context
router.use(authenticate);
router.use(tenantGuard);

/**
 * ============================================================================
 * LEADS ROUTES
 * ============================================================================
 */

/**
 * GET /api/v1/crm/tenants/:tenantId/leads
 * List leads for the tenant
 */
router.get('/tenants/:tenantId/leads', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    // Filters
    const status = req.query.status as string | undefined;
    const source = req.query.source as string | undefined;

    const where = scopedWhere(req, {
      ...(status && { status }),
      ...(source && { source }),
    });

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          conversations: { take: 1, orderBy: { createdAt: 'desc' } },
          estimates: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      }),
      db.lead.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        leads,
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
 * GET /api/v1/crm/tenants/:tenantId/leads/:leadId
 * Get specific lead with full details
 */
router.get('/tenants/:tenantId/leads/:leadId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId } = req.params;

    const lead = await db.lead.findFirst({
      where: scopedWhere(req, { id: leadId }),
      include: {
        customer: true,
        conversations: { orderBy: { createdAt: 'desc' } },
        estimates: { orderBy: { createdAt: 'desc' } },
        serviceJobs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
    }

    res.json({ success: true, data: { lead } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/crm/tenants/:tenantId/leads
 * Create new lead
 */
router.post('/tenants/:tenantId/leads', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, serviceType, summary, customerId, estimatedValue } = req.body;

    if (!source) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'source is required' },
      });
    }

    const lead = await db.lead.create({
      data: {
        tenantId: req.tenant!.tenantId,
        source,
        serviceType: serviceType || null,
        summary: summary || null,
        customerId: customerId || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        status: 'NEW',
      },
      include: {
        customer: true,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'LEAD_CREATED',
        resourceType: 'Lead',
        resourceId: lead.id,
        source: 'API',
      },
    });

    // Trigger workflows
    // TODO: Trigger lead.created workflow

    res.status(201).json({ success: true, data: { lead } });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/crm/tenants/:tenantId/leads/:leadId
 * Update lead (status, estimate, etc.)
 */
router.patch('/tenants/:tenantId/leads/:leadId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId } = req.params;
    const { status, customerId, summary } = req.body;

    // Verify ownership
    const existingLead = await db.lead.findFirst({
      where: scopedWhere(req, { id: leadId }),
    });

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
    }

    // Check if status change triggers approval requirement
    if (status && status !== existingLead.status) {
      const approvalRequired = ['WON', 'LOST'].includes(status);

      if (approvalRequired) {
        // Create approval request
        const approval = await db.approval.create({
          data: {
            tenantId: req.tenant!.tenantId,
            actor: req.tenant!.userId,
            action: 'LEAD_STATUS_CHANGE',
            target: 'Lead',
            targetId: leadId,
            preview: `Change lead status from ${existingLead.status} to ${status}`,
            payload: { leadId, status },
            payloadHash: `lead_${leadId}_${status}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour expiry
          },
        });

        return res.status(202).json({
          success: true,
          data: {
            message: 'Approval required for status change',
            approvalId: approval.id,
          },
        });
      }
    }

    const lead = await db.lead.update({
      where: { id: leadId },
      data: {
        ...(status && { status }),
        ...(customerId && { customerId }),
        ...(summary && { summary }),
        updatedAt: new Date(),
      },
      include: { customer: true },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'LEAD_UPDATED',
        resourceType: 'Lead',
        resourceId: leadId,
        changesBefore: { status: existingLead.status },
        changesAfter: { status: lead.status },
        source: 'API',
      },
    });

    res.json({ success: true, data: { lead } });
  } catch (error) {
    next(error);
  }
});

/**
 * ============================================================================
 * CUSTOMERS ROUTES
 * ============================================================================
 */

/**
 * GET /api/v1/crm/tenants/:tenantId/customers
 * List customers for the tenant
 */
router.get('/tenants/:tenantId/customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const search = req.query.search as string | undefined;

    const where = scopedWhere(req, {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    });

    const [customers, total] = await Promise.all([
      db.revenueCustomer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          leads: { take: 1, orderBy: { createdAt: 'desc' } },
          contracts: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      }),
      db.revenueCustomer.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        customers,
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
 * POST /api/v1/crm/tenants/:tenantId/customers
 * Create new customer
 */
router.post('/tenants/:tenantId/customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, email, addressLine1, city, state, postalCode, notes } = req.body;

    if (!firstName && !email && !phone) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'At least one of firstName, email, or phone is required' },
      });
    }

    const customer = await db.revenueCustomer.create({
      data: {
        tenantId: req.tenant!.tenantId,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        email: email || null,
        addressLine1: addressLine1 || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        notes: notes || null,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'CUSTOMER_CREATED',
        resourceType: 'RevenueCustomer',
        resourceId: customer.id,
        source: 'API',
      },
    });

    res.status(201).json({ success: true, data: { customer } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/customers/:customerId
 * Get specific customer with full details
 */
router.get('/tenants/:tenantId/customers/:customerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;

    const customer = await db.revenueCustomer.findFirst({
      where: scopedWhere(req, { id: customerId }),
      include: {
        leads: { orderBy: { createdAt: 'desc' } },
        contracts: { orderBy: { createdAt: 'desc' } },
        serviceJobs: { orderBy: { createdAt: 'desc' } },
        estimates: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Customer not found' },
      });
    }

    res.json({ success: true, data: { customer } });
  } catch (error) {
    next(error);
  }
});

/**
 * ============================================================================
 * DASHBOARD METRICS
 * ============================================================================
 */

/**
 * GET /api/v1/crm/tenants/:tenantId/metrics
 * Get dashboard metrics
 */
router.get('/tenants/:tenantId/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = scopedWhere(req);

    const [leadCount, leadsHot, customersTotal, estimatesOpen, estimatesWon, jobsCompleted, invoicesOutstanding] = await Promise.all([
      db.lead.count({ where }),
      db.lead.count({ where: { ...where, urgency: 'EMERGENCY' } }),
      db.revenueCustomer.count({ where }),
      db.estimate.count({ where: { ...where, status: 'SENT' } }),
      db.estimate.count({ where: { ...where, status: 'SOLD' } }),
      db.serviceJob.count({ where: { ...where, status: 'COMPLETED' } }),
      db.estimate.count({ where: { ...where, status: 'DRAFT' } }), // Placeholder for invoices
    ]);

    // Calculate pipeline value
    const pipelineEstimates = await db.estimate.findMany({
      where: { ...where, status: { in: ['SENT', 'VIEWED'] } },
      select: { amount: true },
    });
    const pipelineValue = pipelineEstimates.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      success: true,
      data: {
        leads: {
          total: leadCount,
          hot: leadsHot,
        },
        customers: {
          total: customersTotal,
        },
        estimates: {
          open: estimatesOpen,
          won: estimatesWon,
        },
        jobs: {
          completed: jobsCompleted,
        },
        invoices: {
          outstanding: invoicesOutstanding,
        },
        pipeline: {
          value: pipelineValue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
