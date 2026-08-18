import { TenantRole } from '@prisma/client';

/**
 * Tenant context resolved from the authenticated session.
 *
 * SECURITY: this is only ever built by TenantGuard from server-side
 * membership records. A tenant id supplied by the browser — query string,
 * body, header — is never authoritative and must never reach this type.
 */
export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  /** Auth user id (TypeORM `user.entity.ts`), the identity seam. */
  userId: string;
  role: TenantRole;
  revenueOsEnabled: boolean;
}

/** Request shape after TenantGuard has run. */
export interface RequestWithTenant {
  user?: { id: string; email: string; role?: string };
  tenant?: TenantContext;
  tenant_id?: string;
  user_id?: string;
}
