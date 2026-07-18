# API Testing & Integration Guide

This guide provides examples for testing and integrating the third-party service APIs.

## Table of Contents
1. [Stripe Checkout API](#stripe-checkout-api)
2. [Stripe Webhooks](#stripe-webhooks)
3. [Discord Webhook API](#discord-webhook-api)
4. [YouTube API](#youtube-api)

---

## Stripe Checkout API

### Create Checkout Session

**Endpoint:** `POST /api/checkout/session`

**Request:**
```bash
curl -X POST http://localhost:3001/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_professional_test_id",
    "customerId": "optional_customer_id",
    "metadata": {
      "planName": "Professional",
      "source": "website_pricing"
    },
    "successUrl": "http://localhost:3001/checkout/success",
    "cancelUrl": "http://localhost:3001/checkout/cancel"
  }'
```

**Response:**
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8"
}
```

**JavaScript Example:**
```javascript
async function createCheckoutSession(priceId) {
  const response = await fetch('/api/checkout/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      metadata: { planName: 'Professional' }
    })
  });

  const { url } = await response.json();
  window.location.href = url;
}

// Usage
createCheckoutSession('price_professional_live');
```

### Retrieve Checkout Session

**Endpoint:** `GET /api/checkout/session?session_id={sessionId}`

**Request:**
```bash
curl http://localhost:3001/api/checkout/session?session_id=cs_test_a1b2c3d4e5f6g7h8
```

**Response:**
```json
{
  "id": "cs_test_a1b2c3d4e5f6g7h8",
  "status": "paid",
  "customer": "cus_test_customer_id",
  "subscription": "sub_test_subscription_id",
  "amount_total": 49900,
  "currency": "usd"
}
```

---

## Stripe Webhooks

### Webhook Endpoint

**URL:** `POST /api/webhooks/stripe`

**Headers Required:**
```
stripe-signature: t=1234567890,v1=abcd1234...
Content-Type: application/json
```

### Test Webhook Events

**Using Stripe CLI:**
```bash
# Install Stripe CLI if not installed
# https://stripe.com/docs/stripe-cli

# Start listening
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### Manual Webhook Test

```bash
# Get your test webhook secret from Stripe CLI output

curl -X POST http://localhost:3001/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1234567890,v1=test_signature" \
  -d '{
    "id": "evt_test_123",
    "object": "event",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "object": "checkout.session",
        "customer": "cus_test_123",
        "subscription": "sub_test_123"
      }
    }
  }'
```

### Webhook Events Handled

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `handleCheckoutSessionCompleted()` | Update user subscription status |
| `customer.subscription.created` | `handleSubscriptionCreated()` | Create subscription record |
| `customer.subscription.updated` | `handleSubscriptionUpdated()` | Update subscription |
| `customer.subscription.deleted` | `handleSubscriptionDeleted()` | Revoke subscription |
| `invoice.payment_succeeded` | `handleInvoicePaymentSucceeded()` | Record payment |
| `invoice.payment_failed` | `handleInvoicePaymentFailed()` | Handle payment failure |

---

## Discord Webhook API

### Send Notification

**Endpoint:** `POST /api/webhooks/discord`

**Form Submission Request:**
```bash
curl -X POST http://localhost:3001/api/webhooks/discord \
  -H "Content-Type: application/json" \
  -d '{
    "type": "form_submission",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Pricing Question",
      "message": "I have questions about the Professional plan",
      "formType": "contact"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### Direct Discord Webhook Call

```bash
# Using Discord webhook URL directly (configured in DISCORD_WEBHOOK_URL)

curl -X POST https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "username": "WISE² Bot",
    "embeds": [
      {
        "title": "New Form Submission",
        "description": "Contact form from Jane Smith",
        "color": 22279,
        "fields": [
          {
            "name": "Email",
            "value": "jane@example.com",
            "inline": true
          },
          {
            "name": "Subject",
            "value": "Feature Request",
            "inline": true
          },
          {
            "name": "Message",
            "value": "Would love to see batch processing",
            "inline": false
          }
        ],
        "timestamp": "2026-07-18T10:30:00Z"
      }
    ]
  }'
```

### JavaScript Example

```javascript
// Send form submission to Discord
async function notifyDiscord(formData) {
  const response = await fetch('/api/webhooks/discord', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'form_submission',
      data: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        formType: 'contact'
      }
    })
  });

  return response.json();
}
```

---

## YouTube API

### Get Video Metadata

**YouTube Data API v3:**

```bash
# Get video info (requires API key in NEXT_PUBLIC_YOUTUBE_API_KEY)

curl "https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=dQw4w9WgXcQ&key=YOUR_API_KEY"
```

**Response Example:**
```json
{
  "items": [
    {
      "id": "dQw4w9WgXcQ",
      "snippet": {
        "title": "Rick Astley - Never Gonna Give You Up",
        "description": "Music video...",
        "thumbnails": {
          "default": {"url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg"},
          "medium": {"url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"},
          "high": {"url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"}
        }
      },
      "statistics": {
        "viewCount": "1000000000",
        "likeCount": "15000000",
        "commentCount": "500000"
      }
    }
  ]
}
```

### Video Embed URL

```bash
# Get embed URL
https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&modestbranding=1

# Parameters:
# autoplay=1       - Auto-start video
# controls=1       - Show player controls
# modestbranding=1 - Minimal YouTube branding
# rel=0            - Don't show related videos
```

### JavaScript Example

```javascript
import { getYouTubeEmbedUrl, getVideoThumbnail } from '@/lib/youtube';

// Get embed URL
const embedUrl = getYouTubeEmbedUrl('dQw4w9WgXcQ', {
  autoplay: false,
  controls: true,
  modestbranding: true
});

// Get thumbnail
const thumbUrl = getVideoThumbnail('dQw4w9WgXcQ', 'high');

// Create embed
const iframe = `
  <iframe
    src="${embedUrl}"
    width="560"
    height="315"
    frameborder="0"
    allowfullscreen
  ></iframe>
`;
```

---

## Testing Checklist

### Stripe Testing

- [ ] **Create Checkout Session**
  ```bash
  curl -X POST http://localhost:3001/api/checkout/session \
    -H "Content-Type: application/json" \
    -d '{"priceId":"price_professional_test_id"}'
  ```

- [ ] **Test with Valid Card** (4242 4242 4242 4242)
  - Verify redirect to success page
  - Check session ID is returned

- [ ] **Test with Invalid Card** (4000 0000 0000 0002)
  - Verify decline error
  - Check error message displayed

- [ ] **Webhook Testing**
  - Start Stripe CLI: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`
  - Trigger event: `stripe trigger checkout.session.completed`
  - Check webhook logs: `stripe logs tail`

### Discord Testing

- [ ] **Send Test Notification**
  ```bash
  curl -X POST http://localhost:3001/api/webhooks/discord \
    -H "Content-Type: application/json" \
    -d '{"type":"form_submission","data":{"name":"Test","email":"test@test.com","subject":"Test","message":"Test message"}}'
  ```

- [ ] **Verify in Discord Channel**
  - Check webhook message appears
  - Verify formatting and embeds
  - Check all fields display correctly

### YouTube Testing

- [ ] **Embed Video**
  - Verify iframe loads
  - Test play button works
  - Check responsive sizing

- [ ] **Gallery**
  - Test category filters
  - Verify thumbnails load
  - Check mobile responsiveness

---

## Troubleshooting

### Stripe Issues

**401 Unauthorized:**
```
Error: Invalid API key provided
Solution: Check STRIPE_SECRET_KEY in environment
```

**Invalid Price ID:**
```
Error: No such price
Solution: Verify price_id exists in Stripe dashboard
```

**Webhook Signature Invalid:**
```
Error: No signatures found matching the expected signature for payload
Solution: Ensure STRIPE_WEBHOOK_SECRET matches webhook endpoint secret
```

### Discord Issues

**401 Unauthorized:**
```
Error: 401 Invalid Webhook Token
Solution: Verify DISCORD_WEBHOOK_URL is correct and hasn't expired
```

**Rate Limited:**
```
Error: 429 Too Many Requests
Solution: Add delay between requests or implement backoff
```

### YouTube Issues

**Invalid Video ID:**
```
Error: Video not found
Solution: Verify video ID and check video is public
```

**Embed Blocked:**
```
Error: Refused to frame
Solution: Check Content Security Policy headers allow youtube.com
```

---

## Environment Variable Reference

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Yes (server) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes (server) | `whsec_...` |
| `DISCORD_WEBHOOK_URL` | Yes | `https://discord.com/api/webhooks/...` |
| `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` | No | `UCxxxxxx` |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | No | `AIzaSy...` |

---

## Rate Limits

| Service | Limit | Period |
|---------|-------|--------|
| Stripe API | 100 requests | 1 second |
| Discord Webhooks | 10 requests | 10 seconds |
| YouTube API | 10,000 quota | 1 day |

---

## Security Notes

1. Never log API secrets
2. Always validate webhook signatures
3. Use HTTPS in production
4. Rotate webhook secrets regularly
5. Monitor webhook logs for errors
6. Implement rate limiting
7. Sanitize user input
8. Use environment variables for all secrets

---

Last Updated: 2026-07-18
