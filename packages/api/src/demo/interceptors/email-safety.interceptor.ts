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
 * EmailSafetyInterceptor
 *
 * Intercepts email sending and blocks demo emails from escaping.
 * Applied to email-sending routes.
 *
 * Usage:
 * @UseInterceptors(EmailSafetyInterceptor)
 * @Post('send-email')
 * async sendEmail(@Body() body: { tenantId: string; to: string; html: string }) {
 *   // Verified safe before reaching handler
 * }
 */
@Injectable()
export class EmailSafetyInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Demo/EmailSafetyInterceptor');

  constructor(private safety: DemoSafetyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.params.tenantId || request.body?.tenantId;
    const emailTo = request.body?.to;

    if (tenantId) {
      try {
        // Verify email is safe to send
        await this.safety.verifyEmailSafe(tenantId);

        this.logger.debug(`Email verified safe for tenant ${tenantId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Email blocked for tenant ${tenantId}: ${message}`, {
          to: emailTo,
        });

        await this.safety.logBlockedProviderCall(tenantId, 'email', {
          to: emailTo,
          reason: message,
          timestamp: new Date(),
        });

        throw new ForbiddenException(
          'Email sending is blocked in demo mode',
        );
      }
    }

    return next.handle();
  }
}
