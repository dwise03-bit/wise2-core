import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/** Resolves tenant from a verified membership; body/query tenant ids are ignored. */
@Injectable()
export class WiseDefenseTenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.config.get<string>('WISE_DEFENSE_ENABLED') !== 'true') throw new NotFoundException();
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    const requested = typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : undefined;
    const memberships = await this.prisma.tenantMembership.findMany({ where: { userId }, select: { tenantId: true } });
    const tenantId = requested ? memberships.find((m) => m.tenantId === requested)?.tenantId : memberships[0]?.tenantId;
    if (!tenantId) throw new ForbiddenException('No accessible tenant for this account');
    const role = await this.prisma.wiseDefenseMembership.findFirst({ where: { tenantId, userId }, select: { role: true } });
    req.tenant_id = tenantId;
    req.wise_defense_role = role?.role ?? 'VIEWER';
    return true;
  }
}
