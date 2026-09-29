# Billing Components

Complete billing and subscription management UI for WISE² Studio.

## Overview

This directory contains all subscription and billing-related components, including:
- Subscription tier badges
- Pricing modals and pages
- Feature locking UI
- Billing portal access

## Components

### SubscriptionBadge

Displays the user's current subscription tier in the navbar.

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Badge size
- `showLabel?: boolean` - Show/hide tier label
- `onClick?: () => void` - Click handler

**Example:**
```tsx
<SubscriptionBadge 
  size="md"
  onClick={() => setShowUpgradeModal(true)}
/>
```

**Features:**
- Color-coded by tier (gray/green/gold)
- Shows expiration date for paid tiers
- Responsive sizing
- Clickable for quick access to upgrade

### UpgradeModal

Full pricing comparison modal with tier selection and upgrade functionality.

**Props:**
- `isOpen: boolean` - Show/hide modal
- `onClose: () => void` - Close handler
- `highlightTier?: 'free' | 'pro' | 'enterprise'` - Tier to highlight

**Example:**
```tsx
const [showModal, setShowModal] = useState(false);

return (
  <>
    <button onClick={() => setShowModal(true)}>Upgrade</button>
    <UpgradeModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      highlightTier="pro"
    />
  </>
);
```

**Features:**
- Monthly/yearly billing toggle
- Feature comparison table
- Current plan highlighting
- Color-coded upgrade buttons
- Smooth animations
- Loading states

### BillingPortalButton

Opens Stripe billing portal for subscription management.

**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost'` - Button style
- `size?: 'sm' | 'md' | 'lg'` - Button size

**Example:**
```tsx
<BillingPortalButton 
  variant="secondary" 
  size="md"
/>
```

**Features:**
- Only visible for paid tiers
- Opens portal in new window
- Loading and error states
- Responsive sizing

### FeatureLock

Wraps components to restrict access behind subscription tiers.

**Props:**
- `feature: keyof FEATURE_REQUIREMENTS` - Feature to lock
- `children: React.ReactNode` - Content to lock
- `fallback?: React.ReactNode` - Fallback UI
- `onAttemptLocked?: () => void` - Callback when locked feature attempted

**Example:**
```tsx
<FeatureLock feature="export_stems">
  <ExportButton />
</FeatureLock>
```

**Features:**
- Lock overlay on hover
- Upgrade prompt
- Feature requirement mapping
- Automatic tier checking
- Optional fallback UI
- Event callbacks

### FeatureLockBadge

Inline badge showing feature tier requirement.

**Props:**
- `feature: keyof FEATURE_REQUIREMENTS` - Feature to check
- `text?: string` - Custom text

**Example:**
```tsx
<FeatureLockBadge 
  feature="ai_music_generation" 
  text="Enterprise only"
/>
```

**Features:**
- Shows lock icon
- Auto-hides if available
- Customizable text
- Tooltip with tier info

### PricingPage

Full pricing page with all tiers, features, and FAQs.

**Props:**
- None (uses context for user state)

**Example:**
```tsx
import { PricingPage } from '@/components/Billing/PricingPage';

export default function Page() {
  return <PricingPage />;
}
```

**Features:**
- All three pricing tiers
- Monthly/yearly toggle
- Feature comparison
- FAQ section
- Call-to-action buttons
- Responsive grid layout

## Hooks

### useFeatureAvailability

Check if a feature is available for the current user.

```tsx
import { useFeatureAvailability } from '@/components/Billing/FeatureLock';

const isAvailable = useFeatureAvailability('export_stems');
```

## Configuration

All pricing tiers, features, and limits are defined in:
- `lib/subscription-config.ts` - Tier definitions
- `lib/stripe-service.ts` - Stripe integration
- `types/subscription.ts` - TypeScript types

### Adding New Features

1. Add to `FEATURE_REQUIREMENTS` in `FeatureLock.tsx`:
   ```typescript
   export const FEATURE_REQUIREMENTS = {
     export_stems: 'pro',
     new_feature: 'pro', // Add here
   };
   ```

2. Wrap component:
   ```tsx
   <FeatureLock feature="new_feature">
     <NewFeatureComponent />
   </FeatureLock>
   ```

3. Feature becomes restricted automatically

### Customizing Colors

Edit `getTierColor()` in `lib/subscription-config.ts`:

```typescript
export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'pro':
      return '#39FF14'; // Change here
    case 'enterprise':
      return '#FFD700'; // Change here
    default:
      return '#888888';
  }
}
```

### Customizing Pricing

Edit `PRICING_TIERS` in `lib/subscription-config.ts`:

```typescript
{
  name: 'pro',
  displayName: 'Pro',
  monthlyPrice: 29, // Change price
  yearlyPrice: 290,
  features: [
    { name: '32 tracks', included: true },
    // Add/remove features
  ],
}
```

## Styling

All components use:
- Tailwind CSS for styling
- WISE² color variables
- Dark mode (primary)
- Responsive design
- Smooth transitions

Custom colors:
- Neon Green: `#39FF14` (Pro tier)
- Gold: `#FFD700` (Enterprise tier)
- Gray: `#888888` (Free tier)
- Dark backgrounds: `#000000`, `#0F0F0F`, `#111111`

## Integration Examples

### Add to Navbar

```tsx
import { SubscriptionBadge } from '@/components/Billing/SubscriptionBadge';
import { UpgradeModal } from '@/components/Billing/UpgradeModal';
import { useState } from 'react';

export function NavBar() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <nav>
      <SubscriptionBadge onClick={() => setShowUpgrade(true)} />
      <UpgradeModal 
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </nav>
  );
}
```

### Lock Export Feature

```tsx
import { FeatureLock } from '@/components/Billing/FeatureLock';

export function ExportPanel() {
  return (
    <FeatureLock feature="export_stems">
      <button>Export as STEMS</button>
    </FeatureLock>
  );
}
```

### Show Pricing Page

```tsx
// app/pricing/page.tsx
import { PricingPage } from '@/components/Billing/PricingPage';

export default function Page() {
  return <PricingPage />;
}
```

## State Management

All subscription state lives in `context/AuthContext`:

```tsx
import { useAuthContext } from '@/context/AuthContext';

export function Component() {
  const { 
    tier,           // Current subscription tier
    subscription,   // Full subscription object
    canUseFeature,  // Check feature availability
    upgradeToPro,   // Upgrade method
  } = useAuthContext();
}
```

## Error Handling

All components include error handling:

```tsx
const [error, setError] = useState<string | null>(null);

try {
  await upgradeToPro();
} catch (err) {
  setError(err.message);
}
```

Error messages display in UI with user-friendly text.

## Testing

### Test Feature Locking

1. Sign in as free user
2. Navigate to component with `<FeatureLock>`
3. Should see lock overlay
4. Click to open upgrade modal
5. Upgrade to Pro
6. Feature should become accessible

### Test Pricing Page

1. Visit `/pricing`
2. Toggle monthly/yearly
3. Click upgrade buttons
4. Modal should open with tier highlighted

### Test Subscription Badge

1. Should show in navbar
2. Click to open upgrade modal
3. Badge color changes after upgrade
4. Shows expiration date

## Browser Support

✓ Chrome 90+
✓ Firefox 88+
✓ Safari 14+
✓ Edge 90+
✓ Mobile browsers

## Performance

- No external API calls (MVP)
- localStorage only
- Code-split components
- Lazy loading ready
- Zero performance impact

## Security

✓ No sensitive data in components
✓ XSS protection via React
✓ CORS ready for backend
✓ JWT token handling in parent context
✓ Client-side validation

## TypeScript

All components are fully typed:
- Props interfaces
- Return types
- Event handlers
- State types

## Accessibility

✓ Semantic HTML
✓ ARIA labels where needed
✓ Keyboard navigation
✓ Color contrast compliance
✓ Focus management

## Responsive Design

All components are responsive:
- Mobile: Optimized for 375px+
- Tablet: 768px and up
- Desktop: 1280px and up
- Flexible grid layouts
- Touch-friendly buttons

## Files in This Directory

- `SubscriptionBadge.tsx` - Tier badge component (60 lines)
- `UpgradeModal.tsx` - Upgrade modal (240 lines)
- `BillingPortalButton.tsx` - Billing portal button (80 lines)
- `FeatureLock.tsx` - Feature locking (180 lines)
- `PricingPage.tsx` - Full pricing page (380 lines)
- `README.md` - This file

## Related Files

Configuration & State:
- `context/AuthContext.tsx` - Auth state management
- `lib/subscription-config.ts` - Tier definitions
- `lib/stripe-service.ts` - Stripe integration
- `lib/storage-service.ts` - Data persistence
- `types/subscription.ts` - TypeScript types
- `hooks/useSubscription.ts` - Subscription hook
- `hooks/useAuth.ts` - Auth hook

Routes & Pages:
- `app/pricing/page.tsx` - Pricing route
- `app/auth/page.tsx` - Sign-in page

## Documentation

Complete guides:
- `OAUTH_STRIPE_INTEGRATION.md` - Full setup guide
- `QUICK_START.md` - 10-minute setup
- `IMPLEMENTATION_CHECKLIST.md` - What's been built
- `BUILD_SUMMARY.md` - Overview

## Support

For issues or questions:
1. Check this README
2. See OAUTH_STRIPE_INTEGRATION.md
3. Check browser console for errors
4. Review context/AuthContext.tsx for state

## Version History

- v1.0.0 (July 2024) - Initial implementation
  - Google OAuth integration
  - Three subscription tiers
  - Feature locking system
  - Complete UI components
  - Comprehensive documentation
