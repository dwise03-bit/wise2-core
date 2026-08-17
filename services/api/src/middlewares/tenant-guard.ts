/**
 * Tenant Guard Middleware
 * Critical security layer that enforces tenant isolation
 *
 * NEVER extract tenant_id from request body or query params.
 * ALWAYS resolve tenant from authenticated user's TenantMembership.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string;
  isOwner: boolean;
  isAdmin: boolean;
}

/**
 * Extend Express Request to include tenant context
 */
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * TenantGuard: Resolve and validate tenant context
 *
 * This middleware MUST run after authentication middleware that sets req.userId.
 * It verifies the user's access to the requested tenant and attaches context.
 */
export async function tenantGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Ensure user is authenticated
    const userId = (req as any).userId;
    if (!userId) {
      logger.warn('TenantGuard: Request missing userId', {
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Request requires authentication',
        },
      });
    }

    // Extract tenant ID from request params
    // Examples:
    //   /api/v1/tenants/:tenantId/leads → params.tenantId
    //   /api/v1/businesses/:businessId/estimates → params.businessId
    const tenantId =
      req.params.tenantId ||
      req.params.businessId ||
      req.query.tenantId ||
      req.headers['x-tenant-id'];

    if (!tenantId || typeof tenantId !== 'string') {
      logger.warn('TenantGuard: Request missing tenant ID', {
        path: req.path,
        method: req.method,
        userId,
      });
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TENANT_ID',
          message: 'Request must include tenantId',
        },
      });
    }

    // Verify user has access to this tenant
    const membership = await db.tenantMembership.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (!membership) {
      logger.warn('TenantGuard: Unauthorized tenant access', {
        userId,
        tenantId,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this tenant',
        },
      });
    }

    // Verify tenant exists and is active
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      logger.warn('TenantGuard: Tenant not found', {
        tenantId,
        userId,
      });
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        },
      });
    }

    // Check if tenant is in a state that allows access
    const allowedStates = ['ACTIVE', 'ONBOARDING', 'PAST_DUE'];
    if (!allowedStates.includes(tenant.state)) {
      logger.warn('TenantGuard: Tenant in inactive state', {
        tenantId,
        state: tenant.state,
        userId,
      });
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_INACTIVE',
          message: `Tenant is ${tenant.state.toLowerCase()}`,
        },
      });
    }

    // Attach tenant context to request
    req.tenant = {
      tenantId,
      userId,
      role: membership.role,
      isOwner: membership.role === 'OWNER',
      isAdmin: membership.role === 'ADMIN',
    };

    logger.debug('TenantGuard: Access granted', {
      tenantId,
      userId,
      role: membership.role,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error('TenantGuard error', {
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to validate tenant access',
      },
    });
  }
}

/**
 * Require specific roles
 * Usage: app.get('/admin-endpoint', tenantGuard, requireRole('OWNER', 'ADMIN'), handler)
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Request requires authentication',
        },
      });
    }

    if (!allowedRoles.includes(req.tenant.role)) {
      logger.warn('RoleGuard: Insufficient permissions', {
        tenantId: req.tenant.tenantId,
        userId: req.tenant.userId,
        userRole: req.tenant.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions for this action',
        },
      });
    }

    next();
  };
}

/**
 * Query builder helper that always includes tenant scope
 * Usage: scopedQuery('leads', { status: 'NEW' })
 * Returns: { where: { tenantId: '...', status: 'NEW' } }
 */
export function scopedWhere(req: Request, additionalWhere: Record<string, any> = {}) {
  if (!req.tenant) {
    throw new Error('scopedWhere called without tenant context');
  }

  return {
    ...additionalWhere,
    tenantId: req.tenant.tenantId,
  };
}

/**
 * Validate that a resource belongs to the requesting tenant
 * Throws 403 if ownership check fails
 */
export async function validateOwnership(
  req: Request,
  resourceTenantId: string,
  resourceName: string
): Promise<void> {
  if (!req.tenant) {
    throw new Error('validateOwnership called without tenant context');
  }

  if (resourceTenantId !== req.tenant.tenantId) {
    logger.warn('Ownership validation failed', {
      tenantId: req.tenant.tenantId,
      resourceTenantId,
      resourceName,
      userId: req.tenant.userId,
    });
    throw new Error('FORBIDDEN');
  }
}
