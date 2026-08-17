/**
 * Webhook Routes
 * Handles external events (Stripe, etc.) that trigger business processes
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../logger';
import { db } from '../database';
import { provisioningService } from '../services/provisioning.service';

const router = Router();

/**
 * Stripe webhook secret (from environment)
 * Must be configured in .env
 */
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(body: string, signature: string | null): boolean {
  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    logger.warn('Missing Stripe signature or webhook secret');
    return false;
  }

  try {
    const hash = crypto
      .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(`t0=${hash}`),
      Buffer.from(signature.split(',')[0])
    );
  } catch (error) {
    logger.error('Webhook signature verification error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * POST /api/v1/webhooks/stripe
 * Stripe event webhook
 */
router.post('/stripe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get raw body for signature verification
    const body = (req as any).rawBody || JSON.stringify(req.body);
    const signature = req.headers['stripe-signature'] as string | undefined;

    // Verify signature
    if (!verifyStripeSignature(body, signature || null)) {
      logger.warn('Invalid Stripe webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Log event
    logger.info('Stripe webhook received', {
      type: event.type,
      id: event.id,
    });

    // Create webhook event record for idempotency
    const webhookEvent = await db.webhookEvent.findUnique({
      where: {
        provider_externalId: {
          provider: 'stripe',
          externalId: event.id,
        },
      },
    });

    if (webhookEvent?.processedAt) {
      logger.info('Webhook already processed', { eventId: event.id });
      return res.json({ received: true });
    }

    // Handle different event types
    switch (event.type) {
      case 'charge.succeeded':
        await handleChargeSucceeded(event);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;

      default:
        logger.debug('Unhandled Stripe event type', { type: event.type });
    }

    // Mark webhook as processed
    await db.webhookEvent.upsert({
      where: {
        provider_externalId: {
          provider: 'stripe',
          externalId: event.id,
        },
      },
      create: {
        provider: 'stripe',
        externalId: event.id,
        signatureValid: true,
        processedAt: new Date(),
        payloadHash: crypto.createHash('sha256').update(body).digest('hex'),
      },
      update: {
        signatureValid: true,
        processedAt: new Date(),
      },
    });

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Return 200 to acknowledge even on error, to prevent Stripe retries
    res.json({ received: true, error: 'Processing failed' });
  }
});

/**
 * Handle charge.succeeded event
 * Triggers tenant provisioning
 */
async function handleChargeSucceeded(event: any): Promise<void> {
  const charge = event.data.object;
  const customerId = charge.customer;
  const metadata = charge.metadata || {};

  if (!customerId) {
    logger.warn('Charge succeeded without customer ID');
    return;
  }

  logger.info('Processing charge.succeeded', {
    chargeId: charge.id,
    customerId,
    amount: charge.amount,
  });

  // Find user who created this charge (from metadata or Stripe lookup)
  const userId = metadata.user_id;
  const businessName = metadata.business_name || 'New Business';
  const industry = metadata.industry || 'hvac';

  if (!userId) {
    logger.warn('Charge succeeded without user ID in metadata', {
      chargeId: charge.id,
    });
    return;
  }

  // Create or activate tenant
  const tenantId = metadata.tenant_id || generateTenantId();

  try {
    await provisioningService.startProvisioning({
      tenantId,
      userId,
      businessName,
      industry,
      stripeCustomerId: customerId,
    });

    logger.info('Tenant provisioning started', {
      tenantId,
      chargeId: charge.id,
    });
  } catch (error) {
    logger.error('Failed to start provisioning', {
      error: error instanceof Error ? error.message : String(error),
      tenantId,
      chargeId: charge.id,
    });
  }
}

/**
 * Handle payment_intent.succeeded event
 * Triggers tenant provisioning
 */
async function handlePaymentIntentSucceeded(event: any): Promise<void> {
  const intent = event.data.object;
  const customerId = intent.customer;
  const metadata = intent.metadata || {};

  if (!customerId) {
    logger.warn('Payment intent succeeded without customer ID');
    return;
  }

  logger.info('Processing payment_intent.succeeded', {
    intentId: intent.id,
    customerId,
    amount: intent.amount,
  });

  const userId = metadata.user_id;
  const businessName = metadata.business_name || 'New Business';
  const industry = metadata.industry || 'hvac';

  if (!userId) {
    logger.warn('Payment intent succeeded without user ID in metadata', {
      intentId: intent.id,
    });
    return;
  }

  const tenantId = metadata.tenant_id || generateTenantId();

  try {
    await provisioningService.startProvisioning({
      tenantId,
      userId,
      businessName,
      industry,
      stripeCustomerId: customerId,
    });

    logger.info('Tenant provisioning started', {
      tenantId,
      intentId: intent.id,
    });
  } catch (error) {
    logger.error('Failed to start provisioning', {
      error: error instanceof Error ? error.message : String(error),
      tenantId,
      intentId: intent.id,
    });
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(event: any): Promise<void> {
  const subscription = event.data.object;
  const customerId = subscription.customer;

  logger.info('Subscription created', {
    subscriptionId: subscription.id,
    customerId,
  });

  // Associate subscription with any pending provisioning
  // TODO: Update tenant with stripeSubscriptionId
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(event: any): Promise<void> {
  const invoice = event.data.object;
  const customerId = invoice.customer;

  logger.info('Invoice payment succeeded', {
    invoiceId: invoice.id,
    customerId,
  });

  // Update tenant subscription state if needed
  // TODO: Check for renewal payments vs new signups
}

/**
 * Generate a unique tenant ID
 */
function generateTenantId(): string {
  // Use a simple ID format: tenant_<timestamp>_<random>
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tenant_${timestamp}_${random}`;
}

/**
 * GET /api/v1/webhooks/health
 * Webhook service health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'webhooks',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
