/**
 * Workflow Routes
 * Phase 14: Event-driven workflow automation and execution
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere } from '../middlewares/tenant-guard';
import { WorkflowEngine, WorkflowTriggerEvent } from '../services/workflow-engine';

const router = Router();

// Initialize workflow engine (shared across all requests)
const workflowEngine = new WorkflowEngine();

router.use(authenticate);
router.use(tenantGuard);

/**
 * POST /api/v1/crm/tenants/:tenantId/workflows
 * Create workflow definition
 */
router.post(
  '/tenants/:tenantId/workflows',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, triggers, actions, enabled } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'name is required' },
        });
      }

      if (!triggers || !Array.isArray(triggers) || triggers.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'triggers array is required' },
        });
      }

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'actions array is required' },
        });
      }

      // Validate trigger types
      const validTriggers = ['LEAD_CREATED', 'ESTIMATE_SENT', 'ESTIMATE_VIEWED', 'JOB_COMPLETED', 'PAYMENT_RECEIVED', 'LEAD_STATUS_CHANGED', 'CUSTOM_WEBHOOK'];
      for (const trigger of triggers) {
        if (!validTriggers.includes(trigger.type)) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Invalid trigger type: ${trigger.type}` },
          });
        }
      }

      // Validate action types
      const validActions = ['SEND_SMS', 'SEND_EMAIL', 'CREATE_TASK', 'UPDATE_LEAD_STATUS', 'REQUEST_APPROVAL', 'CALL_WEBHOOK', 'CREATE_JOB'];
      for (const action of actions) {
        if (!validActions.includes(action.type)) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Invalid action type: ${action.type}` },
          });
        }
      }

      const workflow = await db.workflowDefinition.create({
        data: {
          tenantId: req.tenant!.tenantId,
          name,
          description: description || null,
          triggers,
          actions,
          enabled: enabled !== false, // Default to enabled
        },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          tenantId: req.tenant!.tenantId,
          actor: req.tenant!.userId,
          action: 'WORKFLOW_CREATED',
          resourceType: 'Workflow',
          resourceId: workflow.id,
          changesAfter: {
            name,
            triggers: triggers.length,
            actions: actions.length,
            enabled,
          },
          source: 'API',
        },
      });

      logger.info('Workflow created', { workflowId: workflow.id, name, triggers: triggers.length });

      res.status(201).json({ success: true, data: { workflow } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/workflows
 * List workflow definitions
 */
router.get('/tenants/:tenantId/workflows', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const enabled = req.query.enabled as string | undefined;

    const where = scopedWhere(req, {
      ...(enabled !== undefined && { enabled: enabled === 'true' }),
    });

    const [workflows, total] = await Promise.all([
      db.workflowDefinition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.workflowDefinition.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        workflows,
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
 * GET /api/v1/crm/tenants/:tenantId/workflows/:workflowId
 * Get specific workflow definition
 */
router.get('/tenants/:tenantId/workflows/:workflowId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workflowId } = req.params;

    const workflow = await db.workflowDefinition.findFirst({
      where: scopedWhere(req, { id: workflowId }),
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workflow not found' },
      });
    }

    res.json({ success: true, data: { workflow } });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/crm/tenants/:tenantId/workflows/:workflowId
 * Update workflow definition
 */
router.patch('/tenants/:tenantId/workflows/:workflowId', requireRole('OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workflowId } = req.params;
    const { name, description, triggers, actions, enabled } = req.body;

    const workflow = await db.workflowDefinition.findFirst({
      where: scopedWhere(req, { id: workflowId }),
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workflow not found' },
      });
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (triggers) updateData.triggers = triggers;
    if (actions) updateData.actions = actions;

    const updated = await db.workflowDefinition.update({
      where: { id: workflowId },
      data: updateData,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: req.tenant!.tenantId,
        actor: req.tenant!.userId,
        action: 'WORKFLOW_UPDATED',
        resourceType: 'Workflow',
        resourceId: workflowId,
        changesBefore: { name: workflow.name, enabled: workflow.enabled },
        changesAfter: { name: updated.name, enabled: updated.enabled },
        source: 'API',
      },
    });

    logger.info('Workflow updated', { workflowId, name: updated.name });

    res.json({ success: true, data: { workflow: updated } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/crm/tenants/:tenantId/workflows/:workflowId/trigger-test
 * Test workflow trigger manually
 */
router.post(
  '/tenants/:tenantId/workflows/:workflowId/trigger-test',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workflowId } = req.params;
      const { triggerData } = req.body;

      const workflow = await db.workflowDefinition.findFirst({
        where: scopedWhere(req, { id: workflowId }),
      });

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workflow not found' },
        });
      }

      if (!workflow.enabled) {
        return res.status(400).json({
          success: false,
          error: { code: 'WORKFLOW_DISABLED', message: 'Cannot test disabled workflow' },
        });
      }

      // Create workflow run
      const run = await db.workflowRun.create({
        data: {
          tenantId: req.tenant!.tenantId,
          workflowId,
          status: 'PENDING',
          triggerEvent: 'MANUAL_TEST',
          triggerData: triggerData || {},
        },
      });

      // Execute workflow (simplified for MVP)
      const results: any[] = [];

      try {
        for (const action of workflow.actions) {
          const result = await executeWorkflowAction(action, triggerData || {}, req.tenant!.tenantId);
          results.push(result);
        }

        // Mark as completed
        const completed = await db.workflowRun.update({
          where: { id: run.id },
          data: {
            status: 'COMPLETED',
            executionResult: results,
            completedAt: new Date(),
          },
        });

        logger.info('Workflow test executed', { workflowId, runId: run.id, actions: results.length });

        res.json({
          success: true,
          data: {
            run: completed,
            results,
          },
        });
      } catch (error) {
        // Mark as failed
        const failed = await db.workflowRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            executionError: error instanceof Error ? error.message : String(error),
            completedAt: new Date(),
          },
        });

        logger.error('Workflow test failed', { workflowId, runId: run.id, error });

        res.status(500).json({
          success: false,
          error: {
            code: 'WORKFLOW_EXECUTION_FAILED',
            message: 'Workflow test execution failed',
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/workflows/:workflowId/runs
 * List workflow execution history
 */
router.get('/tenants/:tenantId/workflows/:workflowId/runs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workflowId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;

    // Verify workflow ownership
    const workflow = await db.workflowDefinition.findFirst({
      where: scopedWhere(req, { id: workflowId }),
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workflow not found' },
      });
    }

    const where = scopedWhere(req, {
      workflowId,
      ...(status && { status }),
    });

    const [runs, total] = await Promise.all([
      db.workflowRun.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.workflowRun.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        runs,
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
 * GET /api/v1/crm/tenants/:tenantId/workflows/summary
 * Get workflow summary (count by status, recent runs)
 */
router.get('/tenants/:tenantId/workflows/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = scopedWhere(req);

    const [total, enabled, recent] = await Promise.all([
      db.workflowDefinition.count({ where }),
      db.workflowDefinition.count({ where: { ...where, enabled: true } }),
      db.workflowRun.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        enabled,
        recentRuns: recent,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Initialize workflows from database into engine
 */
async function initializeWorkflowsFromDatabase(): Promise<void> {
  try {
    const workflows = await db.workflowDefinition.findMany({
      where: { enabled: true },
    });

    for (const workflow of workflows) {
      workflowEngine.registerWorkflow({
        id: workflow.id,
        tenantId: workflow.tenantId,
        name: workflow.name,
        description: workflow.description || undefined,
        enabled: workflow.enabled,
        triggers: workflow.triggers.map((t: any) => t.type || t),
        actions: workflow.actions as any,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      });
    }

    logger.info('Workflows initialized into engine', { count: workflows.length });
  } catch (error) {
    logger.warn('Failed to initialize workflows from database', { error });
  }
}

// Initialize workflows on first request
let workflowsInitialized = false;

/**
 * POST /api/v1/crm/tenants/:tenantId/workflows/engine/initialize
 * Initialize workflow engine from database (admin only)
 */
router.post(
  '/tenants/:tenantId/workflows/engine/initialize',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await initializeWorkflowsFromDatabase();
      workflowsInitialized = true;

      res.json({
        success: true,
        data: {
          message: 'Workflow engine initialized',
          initialized: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/crm/tenants/:tenantId/workflows/engine/trigger-event
 * Manually trigger an event through the workflow engine
 */
router.post(
  '/tenants/:tenantId/workflows/engine/trigger-event',
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Initialize workflows if not already done
      if (!workflowsInitialized) {
        await initializeWorkflowsFromDatabase();
        workflowsInitialized = true;
      }

      const { triggerType, entityId, entityType, data } = req.body;

      if (!triggerType || !entityId || !entityType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'triggerType, entityId, and entityType are required',
          },
        });
      }

      const event: WorkflowTriggerEvent = {
        tenantId: req.tenant!.tenantId,
        triggerType: triggerType as any,
        entityId,
        entityType: entityType as any,
        data: data || {},
        timestamp: new Date(),
      };

      const executions = await workflowEngine.processTrigger(event);

      logger.info('Workflow event triggered', {
        tenantId: req.tenant!.tenantId,
        triggerType,
        executionsCount: executions.length,
      });

      res.json({
        success: true,
        data: {
          event,
          executions: executions.map(e => ({
            id: e.id,
            workflowId: e.workflowId,
            status: e.status,
            actionsCount: e.actions.length,
            completedAt: e.completedAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Workflow action executors
 */

async function executeWorkflowAction(action: any, triggerData: any, tenantId: string): Promise<any> {
  switch (action.type) {
    case 'SEND_SMS':
      return {
        type: 'SEND_SMS',
        status: 'sent',
        messageId: `sms_${Date.now()}`,
      };

    case 'SEND_EMAIL':
      return {
        type: 'SEND_EMAIL',
        status: 'sent',
        messageId: `email_${Date.now()}`,
      };

    case 'CREATE_TASK':
      return {
        type: 'CREATE_TASK',
        status: 'created',
        taskId: `task_${Date.now()}`,
      };

    case 'UPDATE_LEAD_STATUS':
      if (triggerData.leadId && action.config?.newStatus) {
        await db.lead.update({
          where: { id: triggerData.leadId },
          data: { status: action.config.newStatus },
        });
        return {
          type: 'UPDATE_LEAD_STATUS',
          status: 'updated',
          leadId: triggerData.leadId,
          newStatus: action.config.newStatus,
        };
      }
      throw new Error('leadId and newStatus required for UPDATE_LEAD_STATUS');

    case 'REQUEST_APPROVAL':
      return {
        type: 'REQUEST_APPROVAL',
        status: 'pending',
        approvalId: `approval_${Date.now()}`,
      };

    case 'CALL_WEBHOOK':
      // TODO: Call external webhook with trigger data
      return {
        type: 'CALL_WEBHOOK',
        status: 'called',
        url: action.config?.url,
      };

    case 'CREATE_JOB':
      return {
        type: 'CREATE_JOB',
        status: 'created',
        jobId: `job_${Date.now()}`,
      };

    default:
      throw new Error(`Unknown workflow action type: ${action.type}`);
  }
}

export default router;
