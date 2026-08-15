# Third-Party Integrations - Quick Start Guide

Get Stripe, Discord, and YouTube integrations running in 5 minutes.

---

## 1. Install Dependencies

```bash
cd apps/website
npm install stripe @types/stripe
```

---

## 2. Get Credentials

### Stripe
1. Go to https://dashboard.stripe.com/
2. Copy **Publishable Key** from Settings > API Keys
3. Copy **Secret Key** from Settings > API Keys
4. Go to Webhooks, create endpoint to `https://your-domain.com/api/webhooks/stripe`
5. Copy **Webhook Secret**

### Discord
1. Create Discord server (or use existing)
2. Go to Server Settings > Integrations > Webhooks
3. Click "New Webhook"
4. Copy the **Webhook URL**

### YouTube
1. Go to YouTube Studio
2. Copy **Channel ID** from Settings > Basic Info
3. (Optional) Get API Key from Google Cloud Console

---

## 3. Set Environment Variables

Edit `apps/website/.env.local`:

```env
# Stripe (get from step 2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_starter_id
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID=price_professional_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
NEXT_PUBLIC_DISCORD_COMMUNITY_LINK=https://discord.gg/wise2

# YouTube
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UCxxxxxx
NEXT_PUBLIC_YOUTUBE_DEMO_VIDEO_ID=dQw4w9WgXcQ
```

---

## 4. Add to Your Pages

### Pricing with Stripe Checkout

```tsx
// app/pricing/page.tsx
import PricingWithStripe from '@/components/PricingWithStripe';

export default function PricingPage() {
  return <PricingWithStripe />;
}
```

### Discord Community Link

```tsx
// Footer or any component
import { DiscordLink } from '@/components/DiscordLink';

<DiscordLink variant="button" label="Join Community" />
```

### YouTube Video Embed

```tsx
// app/features/page.tsx
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { YouTubeGallery } from '@/components/YouTubeGallery';

export default function FeaturesPage() {
  return (
    <>
      <YouTubeEmbed videoId="dQw4w9WgXcQ" />
      <YouTubeGallery columns={3} showCategories={true} />
    </>
  );
}
```

---

## 5. Test Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start Stripe webhook listener
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Test in browser
# http://localhost:3001/#pricing
# Use card: 4242 4242 4242 4242
```

---

## Production Deployment

1. **Stripe:**
   - Switch to Live mode keys in Stripe Dashboard
   - Update webhook endpoint to production URL
   - Set environment variables in deployment platform

2. **Discord:**
   - Use production Discord server webhook

3. **YouTube:**
   - Update to your actual channel ID and video IDs

---

## Files You'll Use Most Often

| Component | Location | Purpose |
|-----------|----------|---------|
| Pricing Section | `components/PricingWithStripe.tsx` | Show pricing plans with checkout |
| Checkout Button | `components/StripeCheckoutButton.tsx` | Reusable checkout button |
| Discord Link | `components/DiscordLink.tsx` | Link to Discord community |
| Video Embed | `components/YouTubeEmbed.tsx` | Single video player |
| Video Gallery | `components/YouTubeGallery.tsx` | Multiple videos with filters |

---

## Common Snippets

### Stripe Checkout Button
```tsx
<StripeCheckoutButton
  priceId="price_professional_live"
  planName="Professional"
  buttonText="Subscribe Now"
  onError={(err) => console.error('Checkout error:', err)}
/>
```

### Discord Link Variants
```tsx
// As button
<DiscordLink variant="button" label="Join Community" />

// As icon only
<DiscordLink variant="icon" />

// As text link
<DiscordLink variant="text" label="Discord" />
```

### YouTube Video
```tsx
<YouTubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Demo Video"
  aspectRatio="video"
  showThumbnail={true}
/>
```

---

## Troubleshooting

**Stripe checkout not working?**
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify price IDs are correct in Stripe Dashboard
- Check browser console for errors

**Discord webhook failing?**
- Verify webhook URL is correct
- Check server permissions
- Regenerate webhook if needed

**YouTube video not showing?**
- Verify video ID is correct
- Check video is public/unlisted
- Ensure iframe permissions in CSP

---

## Next: Detailed Guides

- **Full Setup:** See `apps/website/INTEGRATIONS.md`
- **API Testing:** See `apps/website/API_TESTING.md`
- **Component API:** See `components/INTEGRATIONS_README.md`

---

## Support

**Issues?** Check these files in order:
1. `INTEGRATION_IMPLEMENTATION_SUMMARY.md` - Overview
2. `apps/website/INTEGRATIONS.md` - Detailed setup
3. `apps/website/API_TESTING.md` - Testing & troubleshooting

---

**Happy integrating!** 🚀
