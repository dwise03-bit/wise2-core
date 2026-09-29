# Third-Party Integrations

This document provides comprehensive setup and usage instructions for Stripe, Discord, and YouTube integrations in the WISE² website.

## Table of Contents

1. [Stripe Integration](#stripe-integration)
2. [Discord Integration](#discord-integration)
3. [YouTube Integration](#youtube-integration)
4. [Environment Variables](#environment-variables)
5. [Testing & Verification](#testing--verification)
6. [Deployment Checklist](#deployment-checklist)

---

## Stripe Integration

### Overview

Stripe handles all payment processing and subscription management for WISE² pricing plans.

**Features:**
- Subscription management (Starter, Professional, Enterprise)
- Secure checkout flow with Stripe's hosted checkout
- Webhook handling for payment events
- Customer management
- Invoice tracking

### Setup Instructions

#### 1. Get Stripe Credentials

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign in to your Stripe account
3. Navigate to **Settings > API Keys**
4. Copy your **Publishable Key** (starts with `pk_live_` or `pk_test_`)
5. Copy your **Secret Key** (starts with `sk_live_` or `sk_test_`)
6. Go to **Webhooks** and create a new webhook endpoint:
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: 
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
7. Copy the **Webhook Signing Secret** (starts with `whsec_`)

#### 2. Create Price IDs

1. In Stripe Dashboard, go to **Products** section
2. Create three products:
   - **Starter** - $199/month
   - **Professional** - $499/month (recommended)
   - **Enterprise** - Custom pricing
3. For each product, create a price with:
   - Currency: USD
   - Billing Period: Monthly
   - Copy the Price ID (starts with `price_`)

#### 3. Set Environment Variables

**For Development (.env.local):**
```env
# Use test mode credentials
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_secret_key
STRIPE_WEBHOOK_SECRET=whsec_test_your_test_webhook_secret

NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_starter_test_id
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID=price_professional_test_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_test_id
```

**For Production (.env.production):**
```env
# Set via deployment platform environment variables (not in file):
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - NEXT_PUBLIC_STRIPE_*_PRICE_ID
```

#### 4. Install Dependencies

```bash
npm install stripe
npm install --save-dev @types/stripe
```

### Components & Files

**Client Components:**
- `components/StripeCheckoutButton.tsx` - Button to initiate checkout
- `app/checkout/success/page.tsx` - Success page after payment
- `app/checkout/cancel/page.tsx` - Cancel/error page

**Server Utilities:**
- `lib/stripe.ts` - Stripe configuration and utilities
- `app/api/checkout/session/route.ts` - Create/retrieve checkout sessions
- `app/api/webhooks/stripe/route.ts` - Handle Stripe webhook events

### Usage Examples

#### Creating a Checkout Button

```tsx
import StripeCheckoutButton from '@/components/StripeCheckoutButton';

export default function PricingCard() {
  return (
    <StripeCheckoutButton
      priceId={pricingPlan.priceId}
      planName={pricingPlan.name}
      buttonText="Subscribe Now"
      className="w-full py-3 bg-blue-600 text-white rounded-lg"
      onSuccess={(sessionId) => console.log('Checkout started:', sessionId)}
      onError={(error) => console.error('Checkout error:', error)}
    />
  );
}
```

#### Handling Webhooks

Webhook handlers in `app/api/webhooks/stripe/route.ts` automatically process:
- Successful checkouts → Grant subscription access
- Subscription creation → Create user records
- Payment failures → Send notifications
- Subscription cancellation → Revoke access

### Testing with Stripe Test Cards

Use these test card numbers in test mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

**Declined Payment:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**3D Secure Required:**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

---

## Discord Integration

### Overview

Discord integration enables:
- Community links in navigation and footer
- Webhook notifications for form submissions
- Subscription event alerts
- User engagement tracking

### Setup Instructions

#### 1. Create Discord Server & Webhook

1. Create a Discord server or use existing one
2. Go to **Server Settings > Integrations > Webhooks**
3. Click **New Webhook**
4. Name it `WISE² Bot`
5. Copy the **Webhook URL** (paste into `DISCORD_WEBHOOK_URL`)

#### 2. Set Environment Variables

```env
# Community Links
NEXT_PUBLIC_DISCORD_SERVER_INVITE=https://discord.gg/wise2
NEXT_PUBLIC_DISCORD_COMMUNITY_LINK=https://discord.gg/wise2

# Webhook for notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### Components & Files

**Client Components:**
- `components/DiscordLink.tsx` - Renders Discord community links in various styles

**Server Utilities:**
- `lib/discord.ts` - Discord webhook configuration and notification functions
- `app/api/webhooks/discord/route.ts` - Webhook endpoint handler

### Usage Examples

#### Adding Discord Link to Footer

```tsx
import { DiscordLink } from '@/components/DiscordLink';

export function Footer() {
  return (
    <footer>
      <div className="space-y-4">
        <DiscordLink variant="button" label="Join Our Community" />
        <DiscordLink variant="text" label="Discord Server" />
        <DiscordLink variant="icon" />
      </div>
    </footer>
  );
}
```

#### Sending Form Submission Notification

```tsx
import { notifyFormSubmission } from '@/lib/discord';

async function handleFormSubmit(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
    type: 'contact' as const,
  };

  await notifyFormSubmission(data);
  // Process form...
}
```

#### Sending Custom Notification

```tsx
import { sendDiscordNotification } from '@/lib/discord';

await sendDiscordNotification('New user event', {
  title: 'Important Notification',
  description: 'Something happened',
  color: 0xFF5733,
  fields: [
    { name: 'Status', value: 'Active', inline: true },
    { name: 'Count', value: '42', inline: true },
  ],
});
```

---

## YouTube Integration

### Overview

YouTube integration provides:
- Embedded video players with lazy loading
- Video gallery with category filtering
- Demo video display
- Channel links and playlists

### Setup Instructions

#### 1. Get YouTube Channel Information

1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Find your **Channel ID** in Settings > Basic Info
3. (Optional) Get **API Key** from [Google Cloud Console](https://console.cloud.google.com/) for advanced features

#### 2. Set Environment Variables

```env
# Channel Configuration
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxx
NEXT_PUBLIC_YOUTUBE_CHANNEL_URL=https://www.youtube.com/@your_channel_name

# Video IDs (from your published videos)
NEXT_PUBLIC_YOUTUBE_DEMO_VIDEO_ID=dQw4w9WgXcQ
NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID=PLxxxxxxxxxxxxxx

# Optional API Key
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
```

### Components & Files

**Client Components:**
- `components/YouTubeEmbed.tsx` - Single video embed with lazy loading
- `components/YouTubeGallery.tsx` - Video gallery with filtering

**Server Utilities:**
- `lib/youtube.ts` - YouTube configuration and utility functions

### Usage Examples

#### Embedding a Single Video

```tsx
import { YouTubeEmbed } from '@/components/YouTubeEmbed';

export default function HeroSection() {
  return (
    <section>
      <YouTubeEmbed
        videoId="dQw4w9WgXcQ"
        title="WISE² Introduction"
        className="max-w-4xl mx-auto"
        aspectRatio="video"
        showThumbnail={true}
      />
    </section>
  );
}
```

#### Creating a Video Gallery

```tsx
import { YouTubeGallery } from '@/components/YouTubeGallery';

export default function TutorialsPage() {
  return (
    <section className="py-16">
      <h2 className="text-4xl font-bold mb-8">Video Tutorials</h2>
      <YouTubeGallery
        columns={3}
        showCategories={true}
        defaultCategory={null}
      />
    </section>
  );
}
```

#### Getting Video Utilities

```tsx
import {
  getYouTubeEmbedUrl,
  getVideoThumbnail,
  getChannelUrl,
  getPlaylistUrl,
} from '@/lib/youtube';

// Get embed URL with options
const embedUrl = getYouTubeEmbedUrl('dQw4w9WgXcQ', {
  autoplay: false,
  controls: true,
  modestbranding: true,
});

// Get thumbnail
const thumbnail = getVideoThumbnail('dQw4w9WgXcQ', 'high');

// Get channel/playlist URLs
const channelUrl = getChannelUrl();
const playlistUrl = getPlaylistUrl();
```

---

## Environment Variables

### Summary Table

| Variable | Type | Environment | Example | Purpose |
|----------|------|-------------|---------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | All | `pk_test_...` | Stripe client-side key |
| `STRIPE_SECRET_KEY` | Secret | Server | `sk_test_...` | Stripe server-side key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Server | `whsec_...` | Stripe webhook verification |
| `NEXT_PUBLIC_STRIPE_*_PRICE_ID` | Public | All | `price_...` | Stripe pricing IDs |
| `DISCORD_WEBHOOK_URL` | Secret | Server | `https://discord.com/api/webhooks/...` | Discord notifications |
| `NEXT_PUBLIC_DISCORD_*_LINK` | Public | Client | `https://discord.gg/wise2` | Discord links |
| `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` | Public | Client | `UCxxxxx...` | YouTube channel |
| `NEXT_PUBLIC_YOUTUBE_DEMO_VIDEO_ID` | Public | Client | `dQw4w9WgXcQ` | Demo video ID |

### Loading Environment Variables

**For Development:**
- Copy credentials into `.env.local`
- Next.js automatically loads these

**For Production:**
- Set via deployment platform (Vercel, Heroku, etc.)
- Never commit secrets to repository
- Use `.env.example` for documentation

---

## Testing & Verification

### Stripe Testing Checklist

- [ ] Test checkout flow with valid test card
- [ ] Test payment declined scenario
- [ ] Verify webhook receives completion event
- [ ] Check success page displays correctly
- [ ] Verify cancel page works
- [ ] Test customer lookup via session ID
- [ ] Test with invalid price ID (error handling)

### Discord Testing Checklist

- [ ] Verify webhook URL is accessible
- [ ] Test form submission notification
- [ ] Check notification formatting in Discord
- [ ] Test with multiple embed fields
- [ ] Verify error messages don't expose secrets

### YouTube Testing Checklist

- [ ] Verify video embed displays correctly
- [ ] Test thumbnail lazy loading
- [ ] Check responsive behavior on mobile
- [ ] Verify video gallery filtering works
- [ ] Test with invalid video IDs
- [ ] Check video duration/info display

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhook events to local machine
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed

# Check webhook logs
stripe logs tail
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All credentials are set in deployment platform
- [ ] Secret keys are NOT in version control
- [ ] Environment variables are documented
- [ ] All integrations tested in staging
- [ ] Error handling is in place
- [ ] Logging is configured

### Stripe Production Setup

- [ ] Switch to live mode credentials
- [ ] Update webhook endpoint to production URL
- [ ] Configure production prices
- [ ] Test with real payment method
- [ ] Set up email notifications
- [ ] Configure retry policies

### Discord Production Setup

- [ ] Use production Discord server
- [ ] Verify webhook URL
- [ ] Test notifications with real events
- [ ] Set up channel permissions

### YouTube Production Setup

- [ ] Verify all video IDs are correct
- [ ] Update channel URL if needed
- [ ] Embed videos in correct sections
- [ ] Test all gallery filters

### After Deployment

- [ ] Monitor webhook logs
- [ ] Check checkout conversion rates
- [ ] Verify payment processing
- [ ] Monitor error rates
- [ ] Set up alerts for failures

---

## Troubleshooting

### Stripe Issues

**Webhook not receiving events:**
- Verify endpoint URL is correct
- Check firewall/CORS settings
- Verify webhook secret in code
- Check Stripe dashboard for error logs

**Checkout session fails:**
- Verify price ID is valid
- Check publishable key
- Verify customer can access Stripe

**Payment declined:**
- Check card test details
- Verify card expiry
- Check for fraud flags

### Discord Issues

**Webhook returns 401/403:**
- Verify webhook URL is correct
- Check server permissions
- Regenerate webhook if needed

**Messages not appearing:**
- Verify channel exists
- Check bot permissions
- Verify webhook content is valid JSON

### YouTube Issues

**Video not embedding:**
- Verify video ID is correct
- Check video is public
- Verify iframe permissions

**Gallery not filtering:**
- Verify category names match
- Check video data structure
- Verify state management

---

## Support & Resources

**Stripe:**
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Integration Guides](https://stripe.com/docs/integrations)
- [Stripe Support](https://support.stripe.com/)

**Discord:**
- [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook)
- [Discord API Support](https://discord.gg/discord-api)

**YouTube:**
- [YouTube Embed Documentation](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Channel Management](https://studio.youtube.com/)

---

## Security Considerations

1. **Never expose secret keys** - Keep `STRIPE_SECRET_KEY` and webhooks server-side only
2. **Validate webhook signatures** - Always verify Stripe webhook authenticity
3. **Sanitize user input** - Validate form data before sending to Discord
4. **Use HTTPS** - All webhook endpoints must use HTTPS in production
5. **Rate limiting** - Implement rate limits on checkout endpoints
6. **Error messages** - Don't expose sensitive information in error responses
7. **Token rotation** - Regularly rotate Discord webhook tokens
8. **Monitoring** - Set up alerts for payment failures and webhook errors

---

Last Updated: 2026-07-18
