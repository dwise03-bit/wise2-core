import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { verifyToken, extractToken, DecodedToken } from '../../../services/auth.service';

/**
 * Live Session Service
 * Manages JWT validation for live rooms.
 * CRITICAL: Enforces real JWT auth, explicitly rejects localStorage/demo identities.
 */

export interface LiveSessionContext {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class LiveSessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate JWT token for live session
   * - Extracts and verifies JWT
   * - Rejects localStorage/demo identities
   * - Returns session context
   */
  async validateToken(authHeader?: string): Promise<LiveSessionContext> {
    // Extract JWT from "Bearer <token>" header
    const token = extractToken(authHeader);

    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header. Live sessions require real JWT authentication.'
      );
    }

    // Verify token signature + expiry
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedException(
        'Invalid or expired JWT. Live sessions do not accept localStorage or demo identities.'
      );
    }

    // Explicit check: reject any token that looks like it came from browser storage
    // (demo tokens have specific markers)
    if (this.isDemoIdentity(decoded)) {
      throw new UnauthorizedException(
        'Demo/localStorage identities are not allowed in live sessions. Use real JWT authentication.'
      );
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      iat: decoded.iat,
      exp: decoded.exp,
    };
  }

  /**
   * Validate token from request context (extracted in middleware)
   */
  async validateSessionContext(req: any): Promise<LiveSessionContext> {
    if (!req.user) {
      throw new UnauthorizedException('No user context. Live sessions require JWT authentication.');
    }

    if (!req.user.id || !req.user.email) {
      throw new UnauthorizedException('Invalid user context. Missing userId or email.');
    }

    // Check expiry if available
    if (req.user.exp && Date.now() / 1000 > req.user.exp) {
      throw new UnauthorizedException('JWT token expired.');
    }

    return {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role || 'user',
      permissions: req.user.permissions || [],
      iat: req.user.iat || 0,
      exp: req.user.exp || 0,
    };
  }

  /**
   * Check if decoded token looks like a demo/localStorage identity
   * Markers:
   * - Missing standard claims (iat, exp)
   * - email contains 'demo' or 'test'
   * - userId looks synthetic (e.g., starts with 'demo_', 'test_')
   */
  private isDemoIdentity(decoded: DecodedToken): boolean {
    // Missing standard JWT claims
    if (!decoded.iat || !decoded.exp) {
      return true;
    }

    // Demo/test email
    const email = (decoded.email || '').toLowerCase();
    if (email.includes('demo') || email.includes('test')) {
      return true;
    }

    // Synthetic userId
    const userId = (decoded.userId || '').toLowerCase();
    if (userId.startsWith('demo_') || userId.startsWith('test_')) {
      return true;
    }

    return false;
  }

  /**
   * Get user session by userId (for presence tracking)
   */
  async getUserSession(userId: string): Promise<{ id: string; email: string; name: string | null } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    return user;
  }

  /**
   * Verify user has permission in live context
   */
  async hasPermission(
    userId: string,
    permission: 'can_speak' | 'can_chat' | 'can_suggest' | 'can_moderate' | 'can_invite'
  ): Promise<boolean> {
    // TODO: Look up user's role in live room, check permission bitmap
    // For now, all authenticated users have basic permissions
    return true;
  }
}
