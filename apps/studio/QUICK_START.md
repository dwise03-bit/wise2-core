# Quick Start - OAuth & Stripe Integration

Get Google OAuth and Stripe working in 10 minutes.

## Step 1: Copy Environment Template (1 min)

```bash
cd apps/studio
cp .env.local.example .env.local
```

Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

## Step 2: Install Dependencies (2 min)

```bash
npm install
# or
pnpm install
```

Already added to package.json:
- `@react-oauth/google`
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`

## Step 3: Test Google Sign-In (2 min)

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3003/auth`
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. Should redirect to home page with user data

## Step 4: Add to Navbar (3 min)

Update `components/Navigation/StudioNav.tsx`:

```tsx
'use client';

import { SubscriptionBadge } from '../../components/Billing/SubscriptionBadge';
import { UpgradeModal } from '../../components/Billing/UpgradeModal';
import { useState } from 'react';

export function StudioNav() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <nav className="...">
      {/* ... existing nav code ... */}

      {/* Add subscription badge before logout button */}
      <div className="border-t border-gray-700 px-3 py-4 space-y-2">
        <SubscriptionBadge 
          size="md"
          onClick={() => setShowUpgradeModal(true)}
        />
        
        {/* ... existing buttons ... */}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </nav>
  );
}
```

## Step 5: Lock a Feature (2 min)

Wrap any premium feature with `FeatureLock`:

```tsx
import { FeatureLock } from '../../components/Billing/FeatureLock';

export function ExportButton() {
  return (
    <FeatureLock feature="export_stems">
      <button>Export as STEMS</button>
    </FeatureLock>
  );
}
```

When free user hovers, they see a lock overlay asking to upgrade.

## Step 6: Verify Everything Works

1. **Sign In Flow**
   - Navigate to `/auth`
   - Click Google sign-in
   - Should see user email in navbar after redirect
   - localStorage should contain user data

2. **Subscription Badge**
   - Should show in navbar with gray badge + "Free"
   - Click it to open pricing modal

3. **Feature Locking**
   - Any component wrapped with `<FeatureLock>` should show lock
   - Hover to see upgrade prompt
   - Click to open upgrade modal

4. **Pricing Page**
   - Navigate to `/pricing`
   - Should see 3 tiers (Free, Pro, Enterprise)
   - Toggle monthly/yearly
   - Click upgrade buttons

## Common Use Cases

### Check if User is Authenticated

```tsx
import { useAuthContext } from '@/context/AuthContext';

export function MyComponent() {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Welcome {user?.name}</div>;
}
```

### Get Current Subscription Tier

```tsx
const { tier } = useAuthContext();

if (tier === 'pro') {
  return <ProFeature />;
}
```

### Check if Feature is Available

```tsx
const { canUseFeature } = useAuthContext();

if (canUseFeature('canLiveStream')) {
  return <LiveStreamButton />;
}
```

### Manually Upgrade Subscription

```tsx
const { upgradeToPro } = useAuthContext();

const handleUpgrade = async () => {
  try {
    await upgradeToPro();
    // User is now Pro
  } catch (error) {
    console.error('Upgrade failed:', error);
  }
};
```

### Lock Feature Behind Pro Tier

```tsx
import { FeatureLock, FEATURE_REQUIREMENTS } from '@/components/Billing/FeatureLock';

export function AdvancedButton() {
  return (
    <FeatureLock feature="advanced_effects">
      <button>Advanced Effects (Pro)</button>
    </FeatureLock>
  );
}
```

### Show Billing Portal

```tsx
import { BillingPortalButton } from '@/components/Billing/BillingPortalButton';

export function SettingsPage() {
  return (
    <div>
      <h2>Subscription</h2>
      <BillingPortalButton />
    </div>
  );
}
```

## Testing Checklist

- [ ] Google sign-in works
- [ ] User data shows in navbar
- [ ] Pricing page loads
- [ ] Feature lock works
- [ ] Upgrade modal opens
- [ ] localStorage persists user data
- [ ] No console errors

## Troubleshooting

### Google Sign-In Not Working

```
Error: Google client not initialized
→ Check NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
→ Restart dev server
→ Check Google Cloud Console OAuth settings
```

### FeatureLock Not Showing Lock

```
Feature doesn't show as locked
→ Check feature is in FEATURE_REQUIREMENTS
→ Verify subscription tier is 'free'
→ Reload page to refresh state
```

### localStorage Not Persisting

```
User data disappears on reload
→ Check browser allows localStorage
→ Not in Private/Incognito mode
→ Check localStorage in DevTools > Storage
```

## Next Steps

1. **For MVP**: Done! Users can sign in and see pricing

2. **For Basic Production**:
   - Set up real Stripe products and prices
   - Create backend API endpoints
   - Implement payment processing

3. **For Full Production**:
   - Set up database (Supabase/Firebase)
   - Implement subscription webhooks
   - Add email notifications
   - Set up usage tracking/limits
   - Add analytics

## File Reference

**Important Files:**
- `context/AuthContext.tsx` - Core auth logic
- `lib/storage-service.ts` - User data storage
- `lib/subscription-config.ts` - Pricing tiers
- `components/Billing/FeatureLock.tsx` - Feature restrictions
- `components/Auth/GoogleSignIn.tsx` - Google OAuth
- `.env.local` - Environment variables

**Documentation:**
- `OAUTH_STRIPE_INTEGRATION.md` - Complete guide
- `IMPLEMENTATION_CHECKLIST.md` - What's been built
- `QUICK_START.md` - This file

## Need Help?

See `OAUTH_STRIPE_INTEGRATION.md` for:
- Detailed setup instructions
- Component API documentation
- Google OAuth setup
- Stripe setup
- Production deployment
- Troubleshooting

## Summary

You now have:
✓ Google OAuth sign-in/sign-up
✓ Three subscription tiers (Free, Pro, Enterprise)
✓ Feature locking system
✓ Subscription badge in navbar
✓ Pricing comparison page
✓ localStorage persistence

All ready to integrate into your studio!
