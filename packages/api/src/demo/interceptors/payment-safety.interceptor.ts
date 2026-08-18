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
 * PaymentSafetyInterceptor
 *
 * CRITICAL: Intercepts payment processing and prevents real charges in demo mode.
 * This is the most important safety layer - it prevents accidental customer charges.
 *
 * Applied to payment/checkout routes:
 *
 * Usage:
 * @UseInterceptors(PaymentSafetyInterceptor)
 * @Post('checkout')
 * async processPayment(@Body() body: { tenantId: string; amount: number }) {
 *   // Verified safe before reaching handler
 * }
 */
@Injectable()
export class PaymentSafetyInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Demo/PaymentSafetyInterceptor');

  constructor(private safety: DemoSafetyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.params.tenantId || request.body?.tenantId;
    const amount = request.body?.amount;
    const customerId = request.body?.customerId || request.body?.stripeCustomerId;

    if (tenantId) {
      try {
        // CRITICAL: Verify payment is safe (demo mode + SIMULATED)
        await this.safety.verifyPaymentSafe(tenantId);

        this.logger.debug(`Payment verified safe (simulated) for tenant ${tenantId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        this.logger.error(
          `CRITICAL: Payment blocked for tenant ${tenantId}: ${message}`,
          {
            amount,
            customerId,
            reason: 'Demo mode or PaymentMode not SIMULATED',
          },
        );

        await this.safety.logBlockedProviderCall(tenantId, 'payment', {
          amount,
          customerId,
          reason: message,
          timestamp: new Date(),
          critical: true,
        });

        // Fail hard - do not proceed
        throw new ForbiddenException(
          'Payment processing is blocked in demo mode. No charges will be made.',
        );
      }
    }

    return next.handle();
  }
}
