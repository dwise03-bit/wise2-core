import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext, RequestWithTenant } from './tenant-context';

/**
 * Injects the tenant context resolved by TenantGuard.
 *
 * Controllers take tenant identity from this decorator only. Reading a
 * tenant id from a route param, query string or body is the exact mistake
 * Phase 3 forbids, and reviewers should treat any such read as a bug.
 */
export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<RequestWithTenant>();

    if (!request.tenant) {
      // Reaching here means the route is missing TenantGuard. Failing loudly
      // is safer than handing a controller an undefined tenant.
      throw new Error(
        'Tenant context missing — did the route forget @UseGuards(TenantGuard)?',
      );
    }

    return request.tenant;
  },
);
