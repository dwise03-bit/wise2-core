/**
 * Authentication middleware
 * Validates JWT tokens and extracts user context
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config_ } from '../config';
import { logger } from '../logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'operator' | 'developer' | 'viewer';
    permissions: string[];
  };
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, config_.jwt.secret, {
      algorithms: [config_.jwt.algorithm],
    });
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Token has expired', 401, 'TOKEN_EXPIRED');
    }
    throw new ApiError('Invalid token', 401, 'INVALID_TOKEN');
  }
}

/**
 * Authentication middleware
 * Validates token and attaches user to request
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(
        'Missing authentication token',
        401,
        'UNAUTHORIZED',
      );
    }

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    logger.debug('User authenticated', {
      userId: req.user.id,
      role: req.user.role,
    });

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else {
      logger.error('Authentication error', { error });
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication failed',
        },
      });
    }
  }
}

/**
 * Authorization middleware
 * Checks if user has required permission
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn('Permission denied', {
        userId: req.user.id,
        requiredPermission: permission,
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          details: {
            required_permission: permission,
            user_role: req.user.role,
          },
        },
      });
      return;
    }

    next();
  };
}

/**
 * Authorization by role
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role denied', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient role',
          details: {
            required_roles: roles,
            user_role: req.user.role,
          },
        },
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication
 * Extracts user if token provided, but doesn't fail if missing
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };
    }

    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth
    next();
  }
}
