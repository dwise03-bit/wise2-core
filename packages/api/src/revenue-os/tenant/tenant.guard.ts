import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantService } from './tenant.service';
import { RequestWithTenant } from './tenant-context';

/**
 * Attaches tenant context to the request, or refuses it.
 *
 * Runs after JwtAuthGuard, which populates `request.user`. Order matters:
 * without an authenticated user this guard denies rather than guessing.
 *
 * Phase 16 feature gate is enforced here too, so a disabled Revenue OS
 * cannot be reached through any controller that uses this guard.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private tenantService: TenantService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // A client may *request* a tenant, but resolveForUser only honours it
    // after confirming membership server-side.
    const requestedTenantId = this.readRequestedTenantId(context);

    const tenant = await this.tenantService.resolveForUser(
      userId,
      requestedTenantId,
    );

    if (!tenant) {
      // Deliberately indistinguishable from "no such tenant": a caller must
      // not be able to probe which tenant ids exist.
      throw new ForbiddenException('No accessible tenant for this account');
    }

    const globallyEnabled =
      this.configService.get<string>('REVENUE_OS_ENABLED') === 'true';

    if (!globallyEnabled || !tenant.revenueOsEnabled) {
      // 404 rather than 403: a disabled product should not advertise itself.
      throw new NotFoundException();
    }

    request.tenant = tenant;
    return true;
  }

  private readRequestedTenantId(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const header = request.headers?.['x-tenant-id'];
    if (typeof header === 'string' && header.length > 0) {
      return header;
    }
    return undefined;
  }
}
