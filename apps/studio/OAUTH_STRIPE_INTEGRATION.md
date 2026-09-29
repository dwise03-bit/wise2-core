# Google OAuth & Stripe Integration Guide

WISE² Studio now includes complete Google OAuth and Stripe payment integration for authentication and subscription management.

## What's New

### Authentication
- **Google Identity Services** for seamless sign-in/sign-up
- **Auto-account creation** when signing in with Google for the first time
- **localStorage-based user sessions** (MVP - can be upgraded to backend)
- **Subscription state tracking** integrated with auth

### Billing
- **Three pricing tiers**: Free, Pro ($29/mo), Enterprise ($99/mo)
- **Stripe integration** for payment processing
- **Feature-locking system** to restrict premium features
- **Subscription management** UI with billing portal access
- **Usage tracking** for rate limiting

## Setup Instructions

### 1. Environment Configuration

Create `.env.local` in `/apps/studio/`:

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Product/Price IDs (create in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_...

# Redirect URLs
NEXT_PUBLIC_STRIPE_SUCCESS_URL=http://localhost:3003/subscription/success
NEXT_PUBLIC_STRIPE_CANCEL_URL=http://localhost:3003/subscription/cancel
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Identity Services" API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3003` (development)
   - `https://studio.wise2.app` (production)
6. Copy Client ID to `.env.local`

### 3. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create three products:
   - **Free** (no price needed - handled locally)
   - **Pro** - Add monthly price: $29/month
   - **Enterprise** - Add monthly price: $99/month
3. Get the Price IDs for Pro and Enterprise
4. Add them to `.env.local`
5. Set up webhook endpoint (for production):
   - Endpoint: `https://your-api.com/v1/webhooks/stripe`
   - Events: `invoice.payment_succeeded`, `customer.subscription.updated`, etc.

## Architecture

### File Structure

```
apps/studio/
├── context/
│   └── AuthContext.tsx           # Global auth + subscription state
├── components/
│   ├── Auth/
│   │   └── GoogleSignIn.tsx       # Google OAuth button & flow
│   └── Billing/
│       ├── SubscriptionBadge.tsx  # Tier display in navbar
│       ├── UpgradeModal.tsx       # Tier selection modal
│       ├── BillingPortalButton.tsx # Manage subscription button
│       ├── FeatureLock.tsx        # Lock premium features
│       └── PricingPage.tsx        # /pricing route
├── hooks/
│   ├── useAuth.ts                # Auth hook (wrapper)
│   └── useSubscription.ts        # Subscription operations
├── lib/
│   ├── storage-service.ts        # localStorage management
│   ├── subscription-config.ts    # Tier limits & pricing
│   └── stripe-service.ts         # Stripe API calls
├── types/
│   └── subscription.ts           # TypeScript types
└── app/
    ├── auth/page.tsx             # Sign-in page
    └── pricing/page.tsx          # Pricing page
```

### Data Flow

```
User Signs In with Google
         ↓
GoogleSignIn component decodes JWT
         ↓
Calls AuthContext.loginWithGoogle()
         ↓
Creates/retrieves user from localStorage
         ↓
Initializes subscription (defaults to free)
         ↓
Stores user + subscription data
         ↓
Redirects to dashboard
```

### State Management

All auth and subscription state lives in `AuthContext` and persists to `localStorage`:

```typescript
// Access auth state anywhere
const { user, tier, subscription, canUseFeature } = useAuthContext();

// Or use convenience hook
const { user, tier, canUseFeature } = useAuth();
```

## Component Usage

### 1. SubscriptionBadge (Navbar)

```tsx
import { SubscriptionBadge } from '@/components/Billing/SubscriptionBadge';

export function NavBar() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      <SubscriptionBadge 
        size="md" 
        onClick={() => setShowUpgradeModal(true)} 
      />
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
```

### 2. FeatureLock (Lock Premium Features)

```tsx
import { FeatureLock, FEATURE_REQUIREMENTS } from '@/components/Billing/FeatureLock';

export function ExportButton() {
  return (
    <FeatureLock feature="export_stems">
      <button>Export as STEMS</button>
    </FeatureLock>
  );
}
```

### 3. Feature Checking

```tsx
import { useAuthContext } from '@/context/AuthContext';

export function Controls() {
  const { tier, canUseFeature } = useAuthContext();

  if (canUseFeature('canLiveStream')) {
    return <LiveStreamButton />;
  }

  return null;
}
```

### 4. BillingPortalButton

```tsx
import { BillingPortalButton } from '@/components/Billing/BillingPortalButton';

export function SettingsPage() {
  return (
    <div>
      <h2>Subscription Settings</h2>
      <BillingPortalButton variant="secondary" />
    </div>
  );
}
```

## Subscription Tiers

### Free Tier
- 5 projects/month
- 2 tracks max per project
- 1 GB storage
- Basic recording
- Standard effects only
- No export STEMS
- No live streaming

### Pro Tier ($29/month)
- Unlimited projects
- 32 tracks max per project
- 100 GB storage
- Advanced recording
- All effects
- Export STEMS ✓
- Live streaming ✓
- Email support

### Enterprise Tier ($99/month)
- Unlimited everything
- 128 tracks max per project
- 1000 GB storage
- Professional-grade tools
- All effects
- Export STEMS ✓
- Live streaming ✓
- Discord priority support
- AI music generation ✓

## Feature Locking

Features are locked behind tiers using the `FEATURE_REQUIREMENTS` map:

```typescript
export const FEATURE_REQUIREMENTS: Record<string, SubscriptionTier> = {
  export_stems: 'pro',
  live_streaming: 'pro',
  advanced_effects: 'pro',
  ai_music_generation: 'enterprise',
};
```

Add new features by:
1. Define in `FEATURE_REQUIREMENTS`
2. Wrap component with `<FeatureLock>`
3. Feature becomes automatically restricted

## Testing

### Sign-In Flow
```bash
1. Visit http://localhost:3003/auth
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Should redirect to / (studio home)
5. User data stored in localStorage
```

### Pricing Page
```bash
1. Visit http://localhost:3003/pricing
2. Toggle monthly/yearly
3. Click "Upgrade" button
4. UpgradeModal appears
5. Select tier and click upgrade
6. Subscription updates immediately (MVP)
```

### Feature Locking
```bash
1. Sign in as free user
2. Try to access Pro feature
3. See lock overlay with upgrade prompt
4. Click to open upgrade modal
5. Upgrade to Pro
6. Feature becomes available
```

## Production Deployment

### Before Going Live

1. **Stripe Setup**
   - Switch to production keys
   - Set up webhooks for subscription events
   - Enable billing portal

2. **Google OAuth**
   - Update authorized redirect URIs for production domain
   - Enable reCAPTCHA protection if needed

3. **Database** (Optional upgrade from localStorage)
   - Create Supabase/Firebase tables:
     - `users` (id, google_id, email, name, avatar, created_at)
     - `subscriptions` (user_id, tier, stripe_id, status, created_at)
     - `usage` (user_id, projects_count, storage_used, updated_at)
   - Update storage-service.ts to use backend

4. **Environment Variables**
   - Set production keys in deployment platform
   - Never commit .env.local

5. **API Endpoints** (Needed for production Stripe integration)
   - `POST /api/v1/stripe/create-checkout-session`
   - `POST /api/v1/stripe/billing-portal`
   - `POST /api/v1/stripe/subscription-status`
   - `POST /api/v1/webhooks/stripe`

## Customization

### Update Pricing Tiers

Edit `lib/subscription-config.ts`:

```typescript
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'pro',
    displayName: 'Pro',
    monthlyPrice: 29, // Change price here
    features: [
      { name: '32 tracks', included: true },
      // Add/remove features
    ],
  },
  // ...
];
```

### Update Feature Limits

Edit `lib/subscription-config.ts` `TIER_LIMITS`:

```typescript
export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  pro: {
    maxProjects: 100,
    maxTracks: 32, // Change here
    maxStorageGB: 100,
    // ...
  },
};
```

### Change Colors

Edit `lib/subscription-config.ts` `getTierColor()`:

```typescript
export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'pro':
      return '#39FF14'; // Neon Green - change this
    // ...
  }
}
```

## Troubleshooting

### Google Sign-In Not Working

- Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Verify redirect URI is whitelisted in Google Cloud Console
- Check browser console for errors
- Clear localStorage and try again

### Stripe Checkout Failing

- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
- Check that price IDs are valid in Stripe Dashboard
- Ensure webhook URL is configured (production)
- Check Stripe logs for errors

### Features Not Locking

- Verify `FEATURE_REQUIREMENTS` has the feature defined
- Check `<FeatureLock>` wrapping the component
- Inspect localStorage to confirm subscription tier
- Reload page to refresh state

### localStorage Not Persisting

- Check if browser allows localStorage
- Private/Incognito mode may not persist
- Verify no extensions are clearing localStorage
- Check browser developer tools > Storage > localStorage

## API Endpoints (To Implement)

These endpoints should be implemented in the backend:

### Create Checkout Session
```
POST /api/v1/stripe/create-checkout-session
{
  "tier": "pro",
  "billingPeriod": "monthly",
  "successUrl": "...",
  "cancelUrl": "..."
}
→ { "sessionId": "...", "url": "..." }
```

### Get Billing Portal
```
POST /api/v1/stripe/billing-portal
→ { "url": "https://billing.stripe.com/..." }
```

### Get Subscription Status
```
GET /api/v1/stripe/subscription-status
→ { "tier": "pro", "status": "active", ... }
```

### Webhook Handler
```
POST /api/v1/webhooks/stripe
Events: customer.subscription.created, customer.subscription.updated, etc.
```

## Security Considerations

1. **JWT Tokens**: Store securely in httpOnly cookies (backend integration)
2. **Stripe Keys**: Never expose secret key to frontend
3. **User ID Verification**: Always verify user owns the subscription (backend)
4. **Rate Limiting**: Implement per-tier rate limits on API endpoints
5. **HTTPS Only**: Ensure all Stripe redirects use HTTPS

## Next Steps

1. Set up Google OAuth credentials
2. Set up Stripe account and products
3. Add environment variables
4. Test sign-in and upgrade flows
5. Integrate with navbar and studio components
6. Customize pricing and features for your needs
7. Deploy to production with proper keys

## Support

For issues or questions:
- Check browser console for errors
- Review Stripe Dashboard logs
- Check Google Cloud Console OAuth settings
- See troubleshooting section above
