# Integration Components

This directory contains pre-built components for third-party integrations with Stripe, Discord, and YouTube.

## Components

### Stripe Integration

#### `StripeCheckoutButton`
Button component that initiates Stripe checkout flow.

**Props:**
- `priceId` (required) - Stripe price ID
- `planName` (required) - Name of the plan
- `buttonText` - Button label (default: "Get Started")
- `className` - Additional CSS classes
- `onSuccess` - Callback when checkout starts
- `onError` - Callback on error

**Example:**
```tsx
import StripeCheckoutButton from '@/components/StripeCheckoutButton';

<StripeCheckoutButton
  priceId="price_professional_live"
  planName="Professional"
  buttonText="Subscribe"
  onSuccess={(sessionId) => console.log('Started checkout', sessionId)}
/>
```

#### `PricingWithStripe`
Complete pricing section with Stripe integration.

**Features:**
- Displays all pricing plans from Stripe config
- Integrates checkout buttons
- Shows plan features
- Responsive grid layout
- Hover animations

**Example:**
```tsx
import PricingWithStripe from '@/components/PricingWithStripe';

<PricingWithStripe />
```

---

### Discord Integration

#### `DiscordLink`
Flexible Discord community link component with multiple variants.

**Props:**
- `variant` - Display style: "button" | "icon" | "text" (default: "button")
- `className` - Additional CSS classes
- `label` - Link text (default: "Join Discord Community")
- `showIcon` - Show Discord icon (default: true)

**Variants:**

```tsx
// Button variant
<DiscordLink variant="button" label="Join Community" />

// Icon only (small clickable icon)
<DiscordLink variant="icon" />

// Text link
<DiscordLink variant="text" label="Discord Server" />
```

**Usage in Footer:**
```tsx
import { DiscordLink } from '@/components/DiscordLink';

<footer>
  <nav className="space-y-2">
    <DiscordLink variant="text" label="Join Discord" />
    <DiscordLink variant="icon" />
  </nav>
</footer>
```

---

### YouTube Integration

#### `YouTubeEmbed`
Embeds a single YouTube video with lazy loading and thumbnail preview.

**Props:**
- `videoId` (required) - YouTube video ID
- `title` - Video title for accessibility (default: "YouTube Video")
- `className` - Additional CSS classes
- `width` - Container width (default: "100%")
- `height` - Container height (default: "100%")
- `aspectRatio` - "video" (16:9) or "square" (default: "video")
- `autoplay` - Auto-start video (default: false)
- `showThumbnail` - Show thumbnail before loading (default: true)
- `onPlay` - Callback when play button clicked

**Example:**
```tsx
import { YouTubeEmbed } from '@/components/YouTubeEmbed';

<YouTubeEmbed
  videoId="dQw4w9WgXcQ"
  title="WISE² Demo"
  className="max-w-4xl mx-auto"
  aspectRatio="video"
  onPlay={() => console.log('Video started')}
/>
```

#### `YouTubeGallery`
Gallery of tutorial and demo videos with category filtering.

**Props:**
- `className` - Additional CSS classes
- `columns` - Number of columns (2, 3, or 4, default: 3)
- `showCategories` - Show category filter buttons (default: true)
- `defaultCategory` - Initially selected category (default: null/all)

**Features:**
- Category filter buttons
- Lazy-loaded thumbnails
- Responsive grid
- Video metadata (duration, description)
- Animation on scroll

**Example:**
```tsx
import { YouTubeGallery } from '@/components/YouTubeGallery';

<YouTubeGallery
  columns={3}
  showCategories={true}
  defaultCategory={null}
/>
```

**Adding Videos:**
Edit `lib/youtube.ts` and update the `DEMO_VIDEOS` array:

```tsx
export const DEMO_VIDEOS: VideoGalleryItem[] = [
  {
    id: 'your_video_id',
    title: 'Video Title',
    description: 'Video description',
    thumbnail: 'optional_thumbnail_url',
    duration: '5:30',
    category: 'Getting Started',
  },
  // ... more videos
];
```

---

## Complete Page Examples

### Pricing Page with Stripe

```tsx
'use client';

import PricingWithStripe from '@/components/PricingWithStripe';
import { SiteNav } from './components/SiteNav';

export default function PricingPage() {
  return (
    <>
      <SiteNav />
      <PricingWithStripe />
    </>
  );
}
```

### Features Page with YouTube

```tsx
'use client';

import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { YouTubeGallery } from '@/components/YouTubeGallery';

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero video */}
      <section className="py-12">
        <YouTubeEmbed
          videoId="dQw4w9WgXcQ"
          title="WISE² Features Overview"
          className="max-w-4xl mx-auto"
        />
      </section>

      {/* Tutorial gallery */}
      <section className="py-20">
        <h2 className="text-4xl font-bold mb-12">Video Tutorials</h2>
        <YouTubeGallery columns={3} showCategories={true} />
      </section>
    </div>
  );
}
```

### Community Page with Discord

```tsx
'use client';

import { DiscordLink } from '@/components/DiscordLink';

export default function CommunityPage() {
  return (
    <section className="py-20">
      <h1>Join Our Community</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2>Discord Server</h2>
          <p>Connect with other WISE² users, share tips, and get help.</p>
          <DiscordLink variant="button" label="Join Discord" />
        </div>
      </div>
    </section>
  );
}
```

---

## Styling & Customization

All components use Tailwind CSS with WISE² color tokens:
- Primary: `#0055FF` (Blue)
- Text: `#C5C5C5` (Gray)
- Background: Black (`#000000`)
- Discord: `#5865F2` (Discord Blue)

### Overriding Styles

Pass custom className to override:

```tsx
<StripeCheckoutButton
  priceId="price_123"
  planName="Pro"
  className="bg-red-600 hover:bg-red-700"
/>
```

### Dark/Light Mode

Components are optimized for dark mode. For light mode, add to parent:

```tsx
<div className="light">
  <StripeCheckoutButton ... />
</div>
```

---

## Error Handling

### Stripe Errors
```tsx
<StripeCheckoutButton
  priceId="price_123"
  planName="Pro"
  onError={(error) => {
    // Handle error
    console.error('Checkout failed:', error);
    // Show user-friendly message
  }}
/>
```

### YouTube Errors
- Invalid video ID: Shows broken thumbnail
- Network error: Retries iframe load
- Check browser console for details

---

## Performance Optimization

### Lazy Loading
All components use `whileInView` from Framer Motion to load only when visible.

### Image Optimization
YouTube thumbnails use Next.js `Image` optimization when possible.

### Code Splitting
Each component is isolated and can be code-split independently.

---

## Troubleshooting

**Stripe button not working:**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Check browser console for API errors
- Ensure price ID is valid

**Discord links not working:**
- Verify Discord invite URL is valid
- Check CORS if making API calls
- Ensure Discord server exists

**YouTube videos not loading:**
- Verify video ID is correct
- Check video is public/unlisted
- Verify iframe permissions in CSP headers

---

## Best Practices

1. **Always include error handlers** for Stripe checkout
2. **Lazy load videos** using the provided components
3. **Test links** in production environment
4. **Monitor webhook logs** for Stripe events
5. **Use TypeScript** for better component integration
6. **Responsive testing** on mobile devices

---

## Resources

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [YouTube Embed API](https://developers.google.com/youtube/iframe_api_reference)

---

Last Updated: 2026-07-18
