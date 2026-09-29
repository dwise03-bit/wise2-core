import { Injectable, Logger, PayloadTooLargeException } from '@nestjs/common';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

/** Bounded payload size (Phase 12). Beyond this we refuse rather than parse. */
export const MAX_WEBHOOK_BYTES = 256 * 1024;

export interface WebhookAdmission {
  accepted: boolean;
  reason?: 'INVALID_SIGNATURE' | 'DUPLICATE' | 'UNKNOWN_TENANT' | 'TOO_LARGE';
  tenantId?: string;
  eventId?: string;
}

/**
 * Shared webhook admission control (Phase 12).
 *
 * Every inbound webhook passes through here before any business logic runs:
 * size bound, signature verification, replay/idempotency, and tenant
 * resolution from trusted provider mapping.
 *
 * Tenant is NEVER derived from a field in the request body. A payload can
 * claim any tenant it likes; only the provider-to-tenant mapping stored
 * server-side decides.
 */
@Injectable()
export class WebhookSecurityService {
  private readonly logger = new Logger('RevenueOS/WebhookSecurity');

  constructor(private prisma: PrismaService) {}

  /** Constant-time HMAC comparison. */
  verifyHmac(rawBody: string, signature: string | undefined, secret: string | undefined): boolean {
    if (!signature || !secret) {
      return false;
    }

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const provided = signature.replace(/^sha256=/, '');

    // Length check first: timingSafeEqual throws on mismatched lengths.
    if (expected.length !== provided.length) {
      return false;
    }

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
      return false;
    }
  }

  /**
   * Admit a webhook, or explain why not.
   *
   * `resolveTenant` is supplied by the caller and must look up tenant from a
   * trusted mapping — an inbound phone number, a provider account id — never
   * from the payload body.
   */
  async admit(params: {
    provider: string;
    externalId: string;
    rawBody: string;
    signature?: string;
    secret?: string;
    resolveTenant: () => Promise<string | null>;
  }): Promise<WebhookAdmission> {
    const { provider, externalId, rawBody, signature, secret, resolveTenant } = params;

    if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BYTES) {
      throw new PayloadTooLargeException('Webhook payload exceeds limit');
    }

    const signatureValid = this.verifyHmac(rawBody, signature, secret);
    const payloadHash = createHash('sha256').update(rawBody).digest('hex');

    if (!signatureValid) {
      // Recorded so repeated forged attempts are visible, but with no tenant
      // attached and no downstream processing.
      await this.recordAttempt(provider, externalId, payloadHash, null, false, 'invalid signature');
      this.logger.warn(`Rejected ${provider} webhook: invalid signature`);
      return { accepted: false, reason: 'INVALID_SIGNATURE' };
    }

    const tenantId = await resolveTenant();
    if (!tenantId) {
      await this.recordAttempt(provider, externalId, payloadHash, null, true, 'unknown tenant');
      this.logger.warn(`Rejected ${provider} webhook: no tenant mapping`);
      return { accepted: false, reason: 'UNKNOWN_TENANT' };
    }

    // Idempotency: the unique constraint on (provider, externalId) is the
    // real guard. Catching its violation is what makes concurrent duplicate
    // deliveries safe, not the read-then-write check alone.
    try {
      const event = await this.prisma.webhookEvent.create({
        data: { provider, externalId, tenantId, signatureValid: true, payloadHash },
      });
      return { accepted: true, tenantId, eventId: event.id };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        this.logger.log(`Duplicate ${provider} webhook ${externalId} ignored`);
        return { accepted: false, reason: 'DUPLICATE', tenantId };
      }
      throw err;
    }
  }

  /** Marks an admitted event as fully processed. */
  async markProcessed(eventId: string) {
    return this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date() },
    });
  }

  async markFailed(eventId: string, error: string) {
    return this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: { error },
    });
  }

  private async recordAttempt(
    provider: string,
    externalId: string,
    payloadHash: string,
    tenantId: string | null,
    signatureValid: boolean,
    error: string,
  ) {
    try {
      await this.prisma.webhookEvent.create({
        data: { provider, externalId, tenantId, signatureValid, payloadHash, error },
      });
    } catch (err: any) {
      // A duplicate rejected attempt is not itself an error worth throwing.
      if (err?.code !== 'P2002') {
        throw err;
      }
    }
  }
}
