import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CherryCountRequestTenant } from './cherry-count-tenant.guard';

export const CherryCountTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CherryCountRequestTenant => {
    const request = ctx.switchToHttp().getRequest();
    return request.cherryCountTenant;
  },
);
