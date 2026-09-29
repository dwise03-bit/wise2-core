import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CherryCountRequestTenant {
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'VIEWER';
}

@Injectable()
export class CherryCountTenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');

    const requested =
      typeof request.headers?.['x-tenant-id'] === 'string'
        ? request.headers['x-tenant-id']
        : undefined;

    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        userId,
        tenant: { state: 'ACTIVE', vertical: 'retail_popup' },
        ...(requested ? { tenantId: requested } : {}),
      },
      include: {
        tenant: {
          select: { id: true, state: true, vertical: true, enabledModules: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership || membership.tenant.state !== 'ACTIVE') {
      throw new ForbiddenException('No active Cherry Count workspace is available');
    }

    request.cherryCountTenant = {
      tenantId: membership.tenantId,
      role: membership.role,
    } satisfies CherryCountRequestTenant;

    return true;
  }
}
