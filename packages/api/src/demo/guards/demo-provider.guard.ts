import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DemoSafetyService } from '../services/demo-safety.service';
import { Reflector } from '@nestjs/core';

/**
 * DemoProviderGuard
 *
 * Prevents external provider calls (SMS, email, payments) in demo routes.
 * Checks that demo mode safety layers are properly configured.
 *
 * Usage:
 * @UseGuards(DemoProviderGuard)
 * @Post('send-sms')
 * async sendSms(@Body() body: { tenantId: string }) {
 *   // SMS will be verified safe before reaching this
 * }
 *
 * Can be bypassed per-route with @SkipDemoProviderGuard()
 */
@Injectable()
export class DemoProviderGuard implements CanActivate {
  private readonly logger = new Logger('Demo/ProviderGuard');

  constructor(
    private safety: DemoSafetyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked to skip this guard
    const skipGuard = this.reflector.get<boolean>(
      'skip-demo-provider-guard',
      context.getHandler(),
    );
    if (skipGuard) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.params.tenantId || request.body?.tenantId;

    if (!tenantId) {
      // No tenant context, cannot verify safety
      return true;
    }

    // Verify all providers are safe
    const safe = await this.safety.verifyAllProvidersSafe(tenantId);

    if (!safe.sms || !safe.email || !safe.payment || !safe.calls) {
      this.logger.error(
        `Provider safety check failed for tenant ${tenantId}`,
        safe,
      );
      throw new ForbiddenException(
        'Provider safety check failed. External calls are blocked.',
      );
    }

    this.logger.debug(`Provider safety verified for tenant ${tenantId}`);
    return true;
  }
}
