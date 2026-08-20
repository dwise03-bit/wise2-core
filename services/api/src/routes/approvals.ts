/**
 * Approval Routes
 * Phase 13: Safety gates for high-impact external actions
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere } from '../middlewares/tenant-guard';
import crypto from 'crypto';
import { ApprovalExecutorFactory } from '../services/approval-executors';

const router = Router();

// Initialize approval executor factory (provides SMS, email, social, payment execution)
const executorFactory = new ApprovalExecutorFactory();

router.use(authenticate);
router.use(tenantGuard);

/**
 * GET /api/v1/crm/tenants/:tenantId/approvals
 * List pending approvals for the tenant
 */
router.get('/tenants/:tenantId/approvals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const status = req.query.status as string || 'PENDING';
    const action = req.query.action as string | undefined;

    const where = scopedWhere(req, {
      status,
      ...(action && { action }),
      expiresAt: { gte: new Date() }, // Exclude expired
    });

    const [approvals, total] = await Promise.all([
      db.approval.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.approval.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        approvals,
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
 * GET /api/v1/crm/tenants/:tenantId/approvals/:approvalId
 * Get specific approval with full details
 */
router.get('/tenants/:tenantId/approvals/:approvalId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { approvalId } = req.params;

    const approval = await db.approval.findFirst({
      where: scopedWhere(req, { id: approvalId }),
    });

    if (!approval) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Approval not found' },
      });
    }

    res.json({ success: true, data: { approval } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/crm/tenants/:tenantId/approvals/:approvalId/approve
 * Approve a pending action
 */
router.post(
  '/tenants/:tenantId/approvals/:approvalId/approve',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { approvalId } = req.params;
      const { note } = req.body;

      const approval = await db.approval.findFirst({
        where: scopedWhere(req, { id: approvalId }),
      });

      if (!approval) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Approval not found' },
        });
      }

      if (approval.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: `Cannot approve approval in ${approval.status} state`,
          },
        });
      }

      if (approval.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EXPIRED',
            message: 'Approval has expired',
          },
        });
      }

      // Update approval status
      const updated = await db.approval.update({
        where: { id: approvalId },
        data: {
          status: 'APPROVED',
          approver: req.tenant!.userId,
          approvedAt: new Date(),
          note: note || null,
        },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          tenantId: req.tenant!.tenantId,
          actor: req.tenant!.userId,
          action: 'APPROVAL_APPROVED',
          resourceType: 'Approval',
          resourceId: approvalId,
          changesAfter: {
            status: 'APPROVED',
            approver: req.tenant!.userId,
          },
          source: 'API',
        },
      });

      logger.info('Approval approved', {
        approvalId,
        action: approval.action,
        targetId: approval.targetId,
      });

      res.json({ success: true, data: { approval: updated } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/crm/tenants/:tenantId/approvals/:approvalId/reject
 * Reject a pending action
 */
router.post(
  '/tenants/:tenantId/approvals/:approvalId/reject',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { approvalId } = req.params;
      const { reason } = req.body;

      const approval = await db.approval.findFirst({
        where: scopedWhere(req, { id: approvalId }),
      });

      if (!approval) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Approval not found' },
        });
      }

      if (approval.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: `Cannot reject approval in ${approval.status} state`,
          },
        });
      }

      // Update approval status
      const updated = await db.approval.update({
        where: { id: approvalId },
        data: {
          status: 'REJECTED',
          approver: req.tenant!.userId,
          approvedAt: new Date(),
          note: reason || null,
        },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          tenantId: req.tenant!.tenantId,
          actor: req.tenant!.userId,
          action: 'APPROVAL_REJECTED',
          resourceType: 'Approval',
          resourceId: approvalId,
          changesAfter: {
            status: 'REJECTED',
            reason,
          },
          source: 'API',
        },
      });

      logger.info('Approval rejected', {
        approvalId,
        action: approval.action,
        reason,
      });

      res.json({ success: true, data: { approval: updated } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/crm/tenants/:tenantId/approvals/:approvalId/execute
 * Execute an approved action (after approval granted)
 * This is where the actual side effect (SMS, email, payment, etc.) would happen
 */
router.post(
  '/tenants/:tenantId/approvals/:approvalId/execute',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { approvalId } = req.params;

      const approval = await db.approval.findFirst({
        where: scopedWhere(req, { id: approvalId }),
      });

      if (!approval) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Approval not found' },
        });
      }

      if (approval.status !== 'APPROVED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: `Cannot execute approval in ${approval.status} state. Must be APPROVED.`,
          },
        });
      }

      // Execute the action based on type
      let result: any = {};

      try {
        switch (approval.action) {
          case 'SEND_SMS':
            result = await executeSendSMS(approval);
            break;
          case 'SEND_EMAIL':
            result = await executeSendEmail(approval);
            break;
          case 'PUBLISH_SOCIAL':
            result = await executePublishSocial(approval);
            break;
          case 'CHARGE_PAYMENT':
            result = await executeChargePayment(approval);
            break;
          case 'LEAD_STATUS_CHANGE':
            result = await executeLeadStatusChange(approval);
            break;
          default:
            throw new Error(`Unknown approval action: ${approval.action}`);
        }

        // Mark as executed
        const executed = await db.approval.update({
          where: { id: approvalId },
          data: {
            status: 'EXECUTED',
            executedAt: new Date(),
            executionResult: result,
          },
        });

        // Audit log
        await db.auditLog.create({
          data: {
            tenantId: req.tenant!.tenantId,
            actor: req.tenant!.userId,
            action: 'APPROVAL_EXECUTED',
            resourceType: 'Approval',
            resourceId: approvalId,
            changesAfter: { status: 'EXECUTED', result },
            source: 'API',
          },
        });

        res.json({ success: true, data: { approval: executed } });
      } catch (executionError) {
        // Mark as failed
        const failed = await db.approval.update({
          where: { id: approvalId },
          data: {
            status: 'FAILED',
            executedAt: new Date(),
            executionError: executionError instanceof Error ? executionError.message : String(executionError),
          },
        });

        logger.error('Approval execution failed', {
          approvalId,
          action: approval.action,
          error: executionError instanceof Error ? executionError.message : String(executionError),
        });

        res.status(500).json({
          success: false,
          error: {
            code: 'EXECUTION_FAILED',
            message: 'Failed to execute approved action',
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Execution handlers for different action types
 */

async function executeSendSMS(approval: any): Promise<any> {
  const { payload } = approval;
  logger.info('Execute: Send SMS', { phoneNumber: payload.phoneNumber, messageLength: payload.message?.length });
  return await executorFactory.executeSendSMS(payload);
}

async function executeSendEmail(approval: any): Promise<any> {
  const { payload } = approval;
  logger.info('Execute: Send Email', { email: payload.email, subject: payload.subject });
  return await executorFactory.executeSendEmail(payload);
}

async function executePublishSocial(approval: any): Promise<any> {
  const { payload } = approval;
  logger.info('Execute: Publish Social', { platform: payload.platform, contentLength: payload.content?.length });
  return await executorFactory.executePublishSocial(payload);
}

async function executeChargePayment(approval: any): Promise<any> {
  const { payload } = approval;
  logger.info('Execute: Charge Payment', { amount: payload.amount, description: payload.description });
  return await executorFactory.executeChargePayment(payload);
}

async function executeLeadStatusChange(approval: any): Promise<any> {
  const { payload } = approval;
  // This is an internal action, so execute immediately
  await db.lead.update({
    where: { id: payload.leadId },
    data: { status: payload.status },
  });
  return { action: 'lead_status_changed', leadId: payload.leadId, status: payload.status };
}

/**
 * GET /api/v1/crm/tenants/:tenantId/approvals/summary
 * Get approval summary (pending, approved, rejected, executed)
 */
router.get('/tenants/:tenantId/approvals/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = scopedWhere(req);

    const [pending, approved, rejected, executed, failed] = await Promise.all([
      db.approval.count({ where: { ...where, status: 'PENDING' } }),
      db.approval.count({ where: { ...where, status: 'APPROVED' } }),
      db.approval.count({ where: { ...where, status: 'REJECTED' } }),
      db.approval.count({ where: { ...where, status: 'EXECUTED' } }),
      db.approval.count({ where: { ...where, status: 'FAILED' } }),
    ]);

    res.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        executed,
        failed,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
