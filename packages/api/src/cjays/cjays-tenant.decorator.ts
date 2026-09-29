import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CjaysRequestTenant } from './cjays-tenant.guard';

export const CjaysTenant = createParamDecorator((_data: unknown, context: ExecutionContext): CjaysRequestTenant => {
  const tenant = context.switchToHttp().getRequest().cjaysTenant;
  if (!tenant) throw new Error('CJAYS tenant context is missing');
  return tenant;
});
