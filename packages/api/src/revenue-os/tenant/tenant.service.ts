import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from './tenant-context';

/**
 * Resolves tenant context from an authenticated user id.
 *
 * The auth user lives in TypeORM while memberships live in Prisma, so this
 * service is the single crossing point between the two stores. It takes a
 * user id and nothing else — never a caller-supplied tenant id.
 */
@Injectable()
export class TenantService {
  private readonly logger = new Logger('RevenueOS/TenantService');

  constructor(private prisma: PrismaService) {}

  /**
   * Resolve the tenant for an authenticated user.
   *
   * When a user belongs to several tenants, `requestedTenantId` selects among
   * them — but only after the membership is confirmed server-side, so a
   * forged id resolves to null rather than granting access.
   */
  async resolveForUser(
    userId: string,
    requestedTenantId?: string,
  ): Promise<TenantContext | null> {
    if (!userId) {
      return null;
    }

    const memberships = await this.prisma.tenantMembership.findMany({
      where: { userId },
      include: { tenant: true },
      orderBy: { createdAt: 'asc' },
    });

    if (memberships.length === 0) {
      return null;
    }

    const membership = requestedTenantId
      ? memberships.find((m) => m.tenantId === requestedTenantId)
      : memberships[0];

    if (!membership) {
      // The user is a member of something, just not what they asked for.
      // Logged without the requested id to avoid echoing attacker input.
      this.logger.warn(
        `User ${userId} requested a tenant they are not a member of`,
      );
      return null;
    }

    return {
      tenantId: membership.tenantId,
      tenantSlug: membership.tenant.slug,
      userId,
      role: membership.role,
      revenueOsEnabled: membership.tenant.revenueOsEnabled,
      vertical: membership.tenant.vertical,
      enabledModules: membership.tenant.enabledModules,
    };
  }
}
