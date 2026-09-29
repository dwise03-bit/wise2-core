# Stripe Integration Guide

## Overview

This guide covers integrating Stripe payment processing into the CC Craft & Create checkout flow.

## Setup Steps

### 1. Get Stripe API Keys

1. Go to [stripe.com](https://stripe.com) and create an account
2. Navigate to Developers → API Keys
3. Copy your **Publishable Key** (pk_test_...)
4. Copy your **Secret Key** (sk_test_...) — KEEP SECURE

### 2. Update Environment Variables

In `.env.local`:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

In production, use live keys:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
```

### 3. Install Stripe Dependencies

Already installed:
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`
- `stripe` (backend)

### 4. Frontend Integration

#### Option A: Simple Card Form (Current Implementation)

The checkout page currently accepts card number, expiry, and CVC as text inputs. To upgrade to secure Stripe Elements:

```tsx
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    const cardElement = elements.getElement(CardElement);
    const { paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    // Send paymentMethod.id to backend
  };
}
```

#### Option B: Full Payment Intent Flow (Recommended)

1. User submits checkout form
2. Backend creates PaymentIntent
3. Frontend confirms payment with Stripe
4. Order status updated on success

**Implementation:**
```tsx
const clientSecret = await createPaymentIntent(orderTotal);
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});

if (result.paymentIntent.status === 'succeeded') {
  // Order confirmed
  setOrderPlaced(true);
}
```

### 5. Backend API Endpoints

#### POST /api/payments

Creates a PaymentIntent for the order amount.

**Request:**
```json
{
  "amount": 100.00,
  "currency": "usd",
  "description": "Order #CC-1692724800000"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_xyz"
}
```

**Backend Implementation:**

```ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const intent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert to cents
  currency: 'usd',
  description,
  metadata: {
    orderId: order.id,
  },
});

return { success: true, clientSecret: intent.client_secret };
```

#### POST /api/orders/confirm-payment

Confirms payment and updates order status.

**Request:**
```json
{
  "orderId": 123,
  "paymentIntentId": "pi_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "order": { /* order details */ }
}
```

### 6. Webhook Setup (Optional but Recommended)

Stripe webhooks notify your server of payment events:

1. Create webhook endpoint: `POST /api/webhooks/stripe`
2. In Stripe Dashboard → Developers → Webhooks:
   - Add endpoint URL (e.g., `https://yourdomain.com/api/webhooks/stripe`)
   - Select events: `payment_intent.succeeded`, `payment_intent.failed`
3. Copy webhook signing secret
4. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Webhook Handler Example:**
```ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update order status to 'confirmed'
    await updateOrderStatus(paymentIntent.metadata.orderId, 'confirmed');
  }
}
```

## Testing

### Test Cards

Use these cards in test mode (any exp/CVC):

**Success:**
- 4242 4242 4242 4242 — Standard test card
- 4000 0000 0000 0002 — Declined
- 4000 0025 0000 3155 — Requires authentication

**Error Codes:**
- 4000 0000 0000 0002 — Card declined
- 4000 0000 0000 9995 — Rate limit error

### Testing Flow

1. Go to checkout
2. Enter customer info
3. Use test card 4242 4242 4242 4242
4. Submit
5. Stripe processes payment
6. Order created with `stripe_payment_id`
7. Confirmation page shown

## Files Modified/Created

### New Files
- `lib/stripe.ts` — Stripe utility functions
- `app/api/payments/route.ts` — Payment intent creation
- `components/StripePaymentForm.tsx` — Card element component

### Updated Files
- `app/checkout/page.tsx` — Stripe integration
- `app/api/orders/route.ts` — Payment ID storage
- `.env.local` — Stripe keys

## Current State

✅ Backend: Payment API endpoint created  
✅ Frontend: Stripe utilities set up  
✅ Checkout: Form structure ready  
🟡 Integration: Form elements need Stripe provider wrapping

## Implementation Checklist

- [ ] Stripe account created
- [ ] API keys added to `.env.local`
- [ ] `@stripe/stripe-js` loaded
- [ ] Payment intent endpoint created (`/api/payments`)
- [ ] Order confirmation endpoint created
- [ ] Card element integrated in checkout form
- [ ] Payment flow tested with test card
- [ ] Webhook endpoint created (optional)
- [ ] Error handling for declined cards
- [ ] Email confirmation sent on success
- [ ] Live keys configured for production

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Enable 3D Secure for compliance
- [ ] Set up webhook endpoint on production domain
- [ ] Configure PCI compliance settings
- [ ] Enable dispute/chargeback alerts
- [ ] Set up payment dispute handling
- [ ] Test live transactions (small amount)
- [ ] Monitor Stripe dashboard for errors

## Troubleshooting

### "Missing Stripe API Key"
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Check environment variable is correct format (`pk_test_...`)
- Restart dev server

### "Payment intent creation failed"
- Verify `STRIPE_SECRET_KEY` is set
- Check secret key format (`sk_test_...`)
- Verify webhook signing secret if using webhooks

### "Card declined"
- Use test card 4000 0000 0000 0002 to test decline flow
- Check order still created with pending status
- User can retry with different card

### CORS errors
- Stripe Elements should work cross-origin
- Check browser console for exact error
- Verify domain is added to Stripe allowed origins

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Testing Guide](https://stripe.com/docs/testing)

## Support

For issues:
1. Check Stripe dashboard → Developers → Logs
2. Review error messages in browser console
3. Verify API keys in `.env.local`
4. Check webhook delivery status
