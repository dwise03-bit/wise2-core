import { PrismaClient } from '@prisma/client';

export async function isolateQuery<T>(
  prisma: PrismaClient,
  tenant_id: string,
  query: () => Promise<T>,
): Promise<T> {
  void prisma;

  if (!tenant_id) {
    throw new Error('Tenant ID required for isolated query');
  }

  return query();
}

export function withTenant<T extends Record<string, any>>(
  tenant_id: string,
  whereClause: T = {} as T,
): T & { tenantId: string } {
  if (!tenant_id) {
    throw new Error('Tenant ID required for tenant-scoped query');
  }

  return {
    ...whereClause,
    tenantId: tenant_id,
  };
}
