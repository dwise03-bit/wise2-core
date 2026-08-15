# Stripe Webhook Implementation for Consulting Bookings

This document describes the Stripe webhook handler implementation for WISE² consulting booking payment processing.

## Overview

The webhook handler processes Stripe events related to payment intents and subscription lifecycle, with primary focus on:

1. **Payment Intent Success** - Confirm consulting bookings after successful payment
2. **Payment Intent Failure** - Handle payment retries for failed bookings
3. **Charge Refunded** - Process refunds for canceled bookings

## Architecture

### File Structure

```
packages/api/src/v1/billing/
├── stripe.webhook.ts          # Webhook handler (core logic)
├── billing.controller.ts       # HTTP endpoint & signature verification
├── billing.service.ts          # Billing business logic
└── billing.module.ts           # Module configuration
```

### Components

#### 1. StripeWebhookHandler (`stripe.webhook.ts`)

**Responsibilities:**
- Verify webhook signatures for security
- Route events to appropriate handlers
- Process PaymentIntent and Charge events
- Send confirmation/notification emails
- Track analytics events

**Key Methods:**

```typescript
verifyWebhookSignature(rawBody: string | Buffer, signature: string): Stripe.Event
- Verifies webhook authenticity using STRIPE_WEBHOOK_SECRET
- Throws BadRequestException if verification fails
- Returns verified event object

handleEvent(event: Stripe.Event): Promise<void>
- Main event router
- Switches on event.type to dispatch to handlers

onPaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void>
- Finds booking by stripePaymentIntentId
- Calls consultingService.confirmBooking()
- Sends confirmation emails to user and consultant
- Creates analytics event

onPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void>
- Finds booking by stripePaymentIntentId
- Marks booking.paymentStatus as 'failed'
- Sends payment retry email with retry link
- Tracks failure analytics

onChargeRefunded(charge: Stripe.Charge): Promise<void>
- Finds booking by charge.payment_intent
- Marks booking.paymentStatus as 'refunded'
- Sends refund confirmation email
- Tracks refund analytics
```

#### 2. BillingController (`billing.controller.ts`)

**Endpoint:** `POST /v1/billing/webhook`

**Signature Verification Flow:**
```
Raw Request Body + Stripe Signature Header
    ↓
Sent to StripeWebhookHandler.verifyWebhookSignature()
    ↓
Signature verified against STRIPE_WEBHOOK_SECRET
    ↓
Verified event processed by handleEvent()
    ↓
Return 200 OK (always, even on error)
```

**Security Measures:**
- Requires valid `stripe-signature` header
- Verifies signature using STRIPE_WEBHOOK_SECRET environment variable
- Returns 200 OK even on processing errors to prevent webhook retries
- Logs errors for debugging without exposing to client

#### 3. Email Service Extensions (`email.service.ts`)

New email methods added:

**sendBookingConfirmation()**
- Sent to: Client/User
- Contains: Session details, join link, pre-session tips

**sendConsultantBookingNotification()**
- Sent to: Consultant
- Contains: Client info, session details, dashboard link

**sendPaymentRetryEmail()**
- Sent to: Client/User
- Contains: Failure reason, retry link, help resources

**sendRefundConfirmation()**
- Sent to: Client/User
- Contains: Refund amount, timeline, rebooking options

## Event Flow

### Successful Booking Payment Flow

```
1. Client initiates booking via ConsultingService.createBooking()
   └─ Creates PaymentIntent in Stripe
   └─ Creates booking record with paymentStatus='pending'

2. Client completes payment in frontend (Stripe Elements/Stripe.js)

3. Stripe sends payment_intent.succeeded webhook

4. StripeWebhookHandler.onPaymentIntentSucceeded():
   ├─ Finds booking by stripePaymentIntentId
   ├─ Calls consultingService.confirmBooking()
   │  └─ Updates booking.paymentStatus='succeeded'
   ├─ Sends booking confirmation email to user
   ├─ Sends booking notification email to consultant
   ├─ TODO: Creates Google Calendar events
   └─ Tracks 'booking_confirmed' analytics event

5. User receives confirmation with join link
6. Consultant receives booking notification
```

### Failed Payment Retry Flow

```
1. Client attempts payment via PaymentIntent

2. Payment is declined (insufficient funds, card expired, etc.)

3. Stripe sends payment_intent.payment_failed webhook

4. StripeWebhookHandler.onPaymentIntentFailed():
   ├─ Finds booking by stripePaymentIntentId
   ├─ Updates booking.paymentStatus='failed'
   ├─ Sends payment retry email with retry link
   │  └─ Link: https://wise2.io/bookings/{bookingId}/payment-retry
   └─ Tracks 'booking_payment_failed' analytics event

5. User clicks retry link
   └─ Frontend creates new PaymentIntent or retries existing one

6. After successful retry:
   └─ payment_intent.succeeded webhook is sent (loop back to step 3)
```

### Booking Refund Flow

```
1. Booking is in 'scheduled' status and client requests cancellation

2. ConsultingService.cancelBooking():
   ├─ Calculates refund amount (50% if <24hrs, 100% otherwise)
   ├─ Creates refund in Stripe via stripe.refunds.create()
   └─ Updates booking.status='cancelled'

3. Stripe processes refund, sends charge.refunded webhook

4. StripeWebhookHandler.onChargeRefunded():
   ├─ Finds booking by charge.payment_intent
   ├─ Updates booking.paymentStatus='refunded'
   ├─ Sends refund confirmation email
   │  └─ Contains: refund amount, timeline (3-5 business days)
   └─ Tracks 'booking_refunded' analytics event

5. User receives refund confirmation
   └─ Shows rebooking options and help resources
```

## Configuration

### Environment Variables Required

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...          # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...        # Webhook endpoint secret (from Stripe Dashboard)

# Optional: Stripe product/price IDs for subscriptions
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

### Webhook Setup in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Create new endpoint:
   - URL: `https://api.wise2.io/v1/billing/webhook`
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.created`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. Copy webhook secret and set as `STRIPE_WEBHOOK_SECRET`

## Database Schema

### Booking Table Fields (Relevant)

```typescript
interface Booking {
  id: string;
  userId: string;
  consultantId: string;
  serviceId: string;
  
  // Payment tracking
  stripePaymentIntentId: string;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded';
  
  // Session details
  startTime: Date;
  endTime: Date;
  durationHours: number;
  totalPrice: number;
  notes?: string;
  meetingLink?: string;
  
  // Status tracking
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Relationships
  user: User;
  consultant: Consultant;
  service: ConsultingService;
}
```

## Error Handling

### Webhook Processing Errors

All webhook errors are handled gracefully:

```typescript
try {
  // Process event
} catch (error) {
  console.error('❌ Error processing event:', error);
  // Don't throw - webhook must return 200 OK
  // Errors are logged for debugging
}
```

**Why return 200 OK on error?**
- Stripe will retry failed webhooks (up to 5 times over 5 days)
- If we return an error status, Stripe may disable the webhook endpoint
- Logging errors allows manual investigation and recovery

### Signature Verification Errors

```typescript
if (!signature) {
  return { error: 'Missing stripe-signature header', received: false };
}

try {
  const event = this.stripeWebhookHandler.verifyWebhookSignature(rawBody, signature);
} catch (error) {
  // Signature invalid - potential security issue
  console.error('🔐 Webhook signature verification failed:', error);
  return { received: true, error: error.message };
}
```

## Testing

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Listen for events and forward to local server
stripe listen --forward-to localhost:3000/v1/billing/webhook

# Get webhook signing secret from output
# Set STRIPE_WEBHOOK_SECRET=whsec_...

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# Monitor webhook delivery
stripe logs tail
```

### Manual Testing with curl

```bash
# Generate test event payload
# Calculate signature with your webhook secret
# Send POST request to webhook endpoint

curl -X POST http://localhost:3000/v1/billing/webhook \
  -H "stripe-signature: t=...,v1=..." \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_...",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_...",
        "metadata": { ... }
      }
    }
  }'
```

## Future Enhancements

### TODO Items

1. **Google Calendar Integration**
   - Create calendar events for user and consultant
   - Send calendar invites
   - Handle rescheduling/cancellation updates

2. **Video Conference Integration**
   - Generate unique meeting link for each booking
   - Send join links to both parties
   - Support Zoom/Google Meet/Jitsi

3. **Booking Reminders**
   - Send reminder email 24 hours before session
   - Send reminder email 1 hour before session
   - Send reminder SMS (optional)

4. **Post-Call Automation**
   - Generate AI-powered call summary
   - Send summary email with action items
   - Schedule follow-up meeting automatically

5. **Advanced Analytics**
   - Track booking completion rate
   - Monitor payment failure rate
   - Analyze consultant utilization

6. **Webhook Retry Logic**
   - Implement dead-letter queue for failed events
   - Manual retry mechanism for failed webhooks
   - Webhook delivery dashboard

## Monitoring & Debugging

### Key Metrics to Track

```
- booking_confirmed (successful payments)
- booking_payment_failed (failed payments)
- booking_refunded (processed refunds)
- webhook_signature_verification_failed (security issues)
- webhook_event_processing_error (processing failures)
```

### Logs to Monitor

Look for these log entries in production:

```
✅ Payment Intent succeeded: pi_...
❌ Payment Intent failed: pi_...
💰 Charge refunded: ch_...
🔐 Webhook signature verification failed: ...
❌ Error processing payment_intent.succeeded: ...
```

## Security Considerations

1. **Webhook Signature Verification**
   - ✅ Implemented and required
   - Never process webhooks without verification

2. **Environment Variables**
   - Keep STRIPE_WEBHOOK_SECRET secret
   - Use `.env.example` for documentation only

3. **Raw Body Requirement**
   - Signature verification requires raw body
   - Don't use JSON body parsing middleware for webhook endpoint
   - Express middleware chain must preserve `req.rawBody`

4. **HTTPS in Production**
   - Webhook endpoint must use HTTPS
   - Stripe will not send to HTTP URLs

## Support & Troubleshooting

### Common Issues

**Issue: "Webhook signature verification failed"**
- Cause: STRIPE_WEBHOOK_SECRET not set or incorrect
- Solution: Copy webhook secret from Stripe Dashboard

**Issue: "No booking found for payment intent"**
- Cause: Booking not created before payment intent callback
- Solution: Ensure booking created successfully before client pays

**Issue: "Webhook endpoint disabled by Stripe"**
- Cause: Too many failed webhook responses
- Solution: Check logs, ensure 200 OK always returned

**Issue: Emails not sending**
- Cause: EmailService._send() not integrated with mail provider
- Solution: Update EmailService to integrate with SendGrid/Mailgun/SES

### Debug Mode

Enable detailed logging:

```typescript
// In stripe.webhook.ts
console.log('🔔 Stripe webhook received:', event.type);
console.log('📦 Event data:', JSON.stringify(event.data, null, 2));
console.log('✅ Payment Intent succeeded:', paymentIntent.id);
```

## References

- [Stripe Webhook Docs](https://stripe.com/docs/webhooks)
- [Stripe PaymentIntent Docs](https://stripe.com/docs/payments/payment-intents)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhook Security Best Practices](https://stripe.com/docs/webhooks/best-practices)
