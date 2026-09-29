# Stripe Webhook Handler - Complete Reference

This document provides the complete webhook implementation code for handling Stripe events.

## Webhook Endpoint

**URL**: `POST /api/v1/billing/webhook/stripe`  
**Authentication**: Webhook signature verification (no JWT needed)  
**Framework**: NestJS

## Controller Implementation

File: `packages/api/src/billing/stripe-webhook.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('v1/billing/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger('StripeWebhookController');

  constructor(
    private stripeService: StripeService,
    private billingService: BillingService
  ) {}

  /**
   * POST /api/v1/billing/webhook/stripe
   * Handle Stripe webhook events
   */
  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<any>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean }> {
    try {
      if (!signature) {
        throw new BadRequestException('Missing stripe-signature header');
      }

      // Get the raw body for signature verification
      const payload = request.rawBody?.toString() || JSON.stringify(request.body);

      // Verify the signature
      const isValid = this.stripeService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        this.logger.warn('❌ Invalid Stripe webhook signature');
        throw new BadRequestException('Invalid signature');
      }

      // Parse the event
      const event =
        typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

      this.logger.log(`📢 Received Stripe webhook: ${event.type}`);

      // Handle specific events with database updates
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.billingService.handleSubscriptionCreated(
            event.data.object
          );
          break;

        case 'customer.subscription.deleted':
          await this.billingService.handleSubscriptionDeleted(
            event.data.object.id
          );
          break;

        case 'invoice.payment_succeeded':
          this.logger.log(`💰 Invoice paid: ${event.data.object.id}`);
          break;

        case 'invoice.payment_failed':
          this.logger.warn(`❌ Invoice failed: ${event.data.object.id}`);
          break;

        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }

      this.logger.log(`✅ Processed webhook: ${event.type}`);
      return { received: true };
    } catch (error) {
      this.logger.error(
        `❌ Webhook error: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException(
        `Webhook failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log(`💳 Payment intent succeeded: ${paymentIntent.id}`);

    if (paymentIntent.metadata?.userId) {
      const userId = paymentIntent.metadata.userId;
      this.logger.log(`   User: ${userId}, Amount: ${paymentIntent.amount / 100}`);
    }
  }
}
```

## Service Webhook Handlers

File: `packages/api/src/billing/billing.service.ts`

```typescript
/**
 * Handle successful subscription creation/update from Stripe webhook
 */
async handleSubscriptionCreated(stripeSubscription: any) {
  const customerId = stripeSubscription.customer;
  const subscriptionId = stripeSubscription.id;
  const status = stripeSubscription.status;
  const priceId = stripeSubscription.items?.data?.[0]?.price?.id;

  this.logger.log(`📢 Processing subscription: ${subscriptionId}`);

  // Find user by Stripe customer ID
  const subscription = await this.prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    this.logger.warn(
      `⚠️  Stripe customer ${customerId} not found in database`
    );
    return;
  }

  // Determine plan from price ID
  let planId = 'STARTER';
  for (const [key, tier] of Object.entries(this.pricingTiers)) {
    if (tier.stripePriceId === priceId) {
      planId = key;
      break;
    }
  }

  // Update subscription record
  const updatedSubscription = await this.prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      plan: planId as any,
      status: status === 'active' ? 'ACTIVE' : 'TRIALING',
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialEndsAt: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    },
  });

  this.logger.log(
    `✅ Updated subscription for user ${updatedSubscription.userId}: ${planId}`
  );
}

/**
 * Handle subscription deletion from Stripe webhook
 */
async handleSubscriptionDeleted(stripeSubscriptionId: string) {
  this.logger.log(`📢 Processing subscription deletion: ${stripeSubscriptionId}`);

  const subscription = await this.prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!subscription) {
    this.logger.warn(
      `⚠️  Stripe subscription ${stripeSubscriptionId} not found in database`
    );
    return;
  }

  // Update subscription record
  const updatedSubscription = await this.prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      plan: 'FREE',
      status: 'CANCELED',
      canceledAt: new Date(),
      stripeSubscriptionId: null,
    },
  });

  this.logger.log(
    `✅ Cancelled subscription for user ${updatedSubscription.userId}`
  );
}
```

## Stripe Service - Webhook Verification

File: `packages/api/src/billing/stripe.service.ts`

```typescript
/**
 * Verify Stripe webhook signature
 * 
 * Stripe sends a signature header with each webhook. This verifies
 * that the webhook came from Stripe and hasn't been tampered with.
 */
verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!this.stripeApiKey) {
    return false;
  }

  try {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return false;
    }

    // Extract signature components
    // Format: t=timestamp,v1=signature1,v1=signature2
    const signatureParts = signature.split(',');
    let timestamp = '';
    let signature_hash = '';

    for (const part of signatureParts) {
      if (part.startsWith('t=')) {
        timestamp = part.substring(2);
      } else if (part.startsWith('v1=')) {
        signature_hash = part.substring(3);
      }
    }

    if (!timestamp || !signature_hash) {
      this.logger.warn('Invalid signature format');
      return false;
    }

    // Compute expected signature
    const crypto = require('crypto');
    const signedContent = `${timestamp}.${payload}`;
    const expectedHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedContent)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash),
      Buffer.from(signature_hash)
    );
  } catch (error) {
    this.logger.error(
      `Signature verification error: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

/**
 * Handle Stripe webhook event
 */
async handleWebhookEvent(event: any): Promise<void> {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    this.logger.error(
      `Webhook handling error: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

private async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  this.logger.log(`💳 Payment intent succeeded: ${paymentIntent.id}`);
  if (paymentIntent.metadata?.userId) {
    this.logger.log(`   User: ${paymentIntent.metadata.userId}`);
  }
}

private async handleSubscriptionUpdated(subscription: any): Promise<void> {
  this.logger.log(`📢 Subscription updated: ${subscription.id}`);
  this.logger.log(`   Status: ${subscription.status}`);
}

private async handleSubscriptionDeleted(subscription: any): Promise<void> {
  this.logger.log(`📢 Subscription deleted: ${subscription.id}`);
}

private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
  this.logger.log(`💰 Invoice payment succeeded: ${invoice.id}`);
  this.logger.log(`   Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
}

private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
  this.logger.warn(`❌ Invoice payment failed: ${invoice.id}`);
  if (invoice.next_payment_attempt) {
    this.logger.warn(
      `   Next retry: ${new Date(invoice.next_payment_attempt * 1000).toISOString()}`
    );
  }
}
```

## Webhook Events Reference

### payment_intent.succeeded
Fires when a payment intent is successfully completed.

**Webhook Body**:
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "customer": "cus_1234567890",
      "amount": 4900,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "userId": "user_123"
      }
    }
  }
}
```

### customer.subscription.created
Fires when a new subscription is created.

**Webhook Body**:
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "active",
      "current_period_start": 1686153600,
      "current_period_end": 1688745600,
      "trial_end": null,
      "items": {
        "data": [
          {
            "id": "si_1234567890",
            "price": {
              "id": "price_starter_monthly",
              "unit_amount": 4900,
              "recurring": {
                "interval": "month",
                "interval_count": 1
              }
            }
          }
        ]
      }
    }
  }
}
```

### customer.subscription.updated
Fires when a subscription is updated (e.g., plan change).

**Webhook Body**:
```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "active",
      "items": {
        "data": [
          {
            "price": {
              "id": "price_pro_monthly"
            }
          }
        ]
      }
    }
  }
}
```

### customer.subscription.deleted
Fires when a subscription is cancelled.

**Webhook Body**:
```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "canceled"
    }
  }
}
```

### invoice.payment_succeeded
Fires when an invoice payment succeeds.

**Webhook Body**:
```json
{
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_1234567890",
      "customer": "cus_1234567890",
      "subscription": "sub_1234567890",
      "amount_paid": 4900,
      "currency": "usd",
      "status": "paid",
      "invoice_pdf": "https://invoice.stripe.com/..."
    }
  }
}
```

### invoice.payment_failed
Fires when an invoice payment fails.

**Webhook Body**:
```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_1234567890",
      "customer": "cus_1234567890",
      "subscription": "sub_1234567890",
      "status": "open",
      "next_payment_attempt": 1686240000
    }
  }
}
```

## Testing Webhooks Locally

### Method 1: Using Stripe CLI (Recommended)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/v1/billing/webhook/stripe

# Note the signing secret output
# Export it to your .env.local
export STRIPE_WEBHOOK_SECRET=whsec_test_...

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

### Method 2: Using curl (Manual)

```bash
# Generate a test webhook signature
WEBHOOK_SECRET="whsec_test_..."
PAYLOAD='{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test"}}}'
TIMESTAMP=$(date +%s)
SIGNED_CONTENT="$TIMESTAMP.$PAYLOAD"

SIGNATURE=$(echo -n "$SIGNED_CONTENT" | \
  openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | \
  sed 's/^.* //')

# Send webhook
curl -X POST http://localhost:3000/api/v1/billing/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=$TIMESTAMP,v1=$SIGNATURE" \
  -d "$PAYLOAD"
```

### Method 3: Using Postman

1. Create new POST request
2. URL: `http://localhost:3000/api/v1/billing/webhook/stripe`
3. Headers:
   - `Content-Type: application/json`
   - `stripe-signature: t=1234567890,v1=signature_here`
4. Body: Webhook JSON payload (see examples above)
5. Send

## Error Handling

### Common Webhook Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid signature` | Wrong webhook secret | Verify `STRIPE_WEBHOOK_SECRET` in `.env` |
| `Customer not found` | User not in database | Verify customer was created before subscription |
| `Price not found` | Invalid `stripePriceId` | Verify price IDs in `pricingTiers` match Stripe |
| `Subscription not found` | Webhook for unknown subscription | Check if subscription exists in database |
| `Timeout` | Webhook taking too long | Optimize database queries, use async processing |

### Database Transaction Safety

For critical updates, wrap in a transaction:

```typescript
const result = await this.prisma.$transaction(async (tx) => {
  const subscription = await tx.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return await tx.subscription.update({
    where: { id: subscription.id },
    data: {
      plan: planId,
      status: 'ACTIVE',
    },
  });
});
```

## Monitoring Webhooks in Production

### View Failed Webhooks

**Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Click on your endpoint
3. View "Recent Attempts"
4. Check "Failed Deliveries" tab

### Set Up Alerts

**Email Alerts:**
1. Stripe Dashboard → Settings → Billing settings
2. Enable "Failure alerts"

**Datadog/New Relic Integration:**
```typescript
// Log webhook metrics
this.logger.log({
  service: 'stripe',
  event: event.type,
  timestamp: new Date(),
  duration_ms: Date.now() - startTime,
  status: 'success',
});
```

## Security Best Practices

1. **Always verify signatures** - Never process webhooks without verification
2. **Use HTTPS only** - Webhook endpoint must be HTTPS
3. **Implement idempotency** - Handle duplicate webhooks gracefully
4. **Log all events** - For audit trail and debugging
5. **Never expose secrets** - Keep webhook secret in environment variables
6. **Rate limit** - Prevent abuse of webhook endpoint
7. **Timeout protection** - Process webhooks within 30 seconds
8. **Error notification** - Alert on failed webhooks

---

**Last Updated**: 2026-07-18
**Stripe API Version**: v1 (November 2024)
