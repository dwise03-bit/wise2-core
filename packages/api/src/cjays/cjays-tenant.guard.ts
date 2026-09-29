import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CjaysRequestTenant {
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'VIEWER';
}

@Injectable()
export class CjaysTenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');

    const requested = typeof request.headers?.['x-tenant-id'] === 'string' ? request.headers['x-tenant-id'] : undefined;
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { userId, ...(requested ? { tenantId: requested } : {}) },
      include: { tenant: { select: { id: true, state: true, vertical: true, enabledModules: true } } },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership || membership.tenant.state !== 'ACTIVE') throw new ForbiddenException('No active Wise² client workspace is available');

    request.cjaysTenant = { tenantId: membership.tenantId, role: membership.role } satisfies CjaysRequestTenant;
    return true;
  }
}
