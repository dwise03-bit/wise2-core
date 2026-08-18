import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DemoSafetyService } from '../services/demo-safety.service';

/**
 * SMSSafetyInterceptor
 *
 * Intercepts SMS sending and blocks demo SMS from escaping to real numbers.
 * Applied to SMS-sending routes.
 *
 * Usage:
 * @UseInterceptors(SMSSafetyInterceptor)
 * @Post('send-sms')
 * async sendSMS(@Body() body: { tenantId: string; to: string; message: string }) {
 *   // Verified safe before reaching handler
 * }
 */
@Injectable()
export class SMSSafetyInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Demo/SMSSafetyInterceptor');

  constructor(private safety: DemoSafetyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.params.tenantId || request.body?.tenantId;
    const phoneNumber = request.body?.to;

    if (tenantId) {
      try {
        // Verify SMS is safe to send
        await this.safety.verifySMSSafe(tenantId);

        this.logger.debug(`SMS verified safe for tenant ${tenantId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`SMS blocked for tenant ${tenantId}: ${message}`, {
          to: phoneNumber,
        });

        await this.safety.logBlockedProviderCall(tenantId, 'sms', {
          to: phoneNumber,
          reason: message,
          timestamp: new Date(),
        });

        throw new ForbiddenException(
          'SMS sending is blocked in demo mode',
        );
      }
    }

    return next.handle();
  }
}
