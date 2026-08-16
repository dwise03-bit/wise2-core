# Stripe Frontend Integration Guide

Complete guide to integrating billing features into WISE² apps.

## Quick Start

### 1. Install Dependencies

The billing components are part of `@wise2/ui-components`. No additional Stripe packages needed (we use the HTTP API directly).

```bash
npm install @wise2/ui-components
```

### 2. Add Billing Components to App

Example for Next.js app:

```bash
# Create billing page
touch apps/studio/app/billing/page.tsx
```

### 3. Use Components

```tsx
import { StripeCheckout, FeatureGate, useSubscription } from '@wise2/ui-components/billing';

export default function BillingPage() {
  const { subscription, loading, error, upgrade } = useSubscription();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      {subscription && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <p className="text-lg">
            <strong>{subscription.plan}</strong> - {subscription.generationsPerMonth} generations/month
          </p>
          <p className="text-gray-600 mt-2">
            Used: {subscription.generationsUsed}/{subscription.generationsPerMonth}
          </p>
        </div>
      )}

      {/* Pricing tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingCard
          name="Starter"
          price="$49"
          features={['100 generations/month', 'Email support']}
          onUpgrade={() => upgrade('STARTER', '/billing/success', '/billing/cancel')}
          isCurrentPlan={subscription?.plan === 'STARTER'}
        />
        <PricingCard
          name="Pro"
          price="$99"
          features={['Unlimited generations', 'Priority support', 'API access']}
          onUpgrade={() => upgrade('PRO', '/billing/success', '/billing/cancel')}
          isCurrentPlan={subscription?.plan === 'PRO'}
          highlighted
        />
      </div>
    </div>
  );
}
```

---

## Components Reference

### StripeCheckout Component

Handles the checkout flow. Redirects to Stripe checkout when clicked.

**Props:**
```tsx
interface StripeCheckoutProps {
  planId: string;              // 'STARTER' | 'PRO' | 'ENTERPRISE'
  planName?: string;           // 'Starter Plan'
  monthlyPrice?: number;       // 49
  onSuccess?: (sessionId: string) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  isLoading?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<StripeCheckout
  planId="STARTER"
  planName="Starter"
  monthlyPrice={49}
  onSuccess={(sessionId) => console.log('Session:', sessionId)}
  onCancel={() => router.push('/billing')}
  onError={(error) => alert(error.message)}
/>
```

---

### FeatureGate Component

Wraps features that should be gated by subscription. Blocks access and shows upgrade prompt when limit reached.

**Props:**
```tsx
interface FeatureGateProps {
  featureName: string;         // 'music_generation'
  children: React.ReactNode;   // Content to gate
  onUpgrade?: () => void;      // Called when user clicks upgrade
  showLimitWarning?: boolean;  // Show warning at 80% of limit
  warningThreshold?: number;   // 0.2 = 20% remaining
  className?: string;
}
```

**Usage:**
```tsx
<FeatureGate 
  featureName="music_generation"
  onUpgrade={() => router.push('/upgrade')}
>
  <MusicGenerator />
</FeatureGate>
```

**Behavior:**
- Shows content if user is within limits
- Shows warning at 80% usage
- Blocks content and shows upgrade modal at 100% usage
- Automatically rechecks every minute

---

### useSubscription Hook

Provides access to subscription data and billing methods.

**Returns:**
```tsx
{
  subscription: Subscription | null;      // Current subscription data
  loading: boolean;                       // Data loading state
  error: string | null;                   // Error message if any
  refresh: () => Promise<void>;           // Manually refresh data
  upgrade: (planId, successUrl, cancelUrl) => Promise<string>; // Get checkout URL
  downgrade: (planId) => Promise<void>;   // Change to lower plan
  canGenerate: () => Promise<{...}>;      // Check generation limit
  recordGeneration: (type?) => Promise<void>; // Log a generation
}
```

**Usage:**
```tsx
import { useSubscription } from '@wise2/ui-components/billing';

export default function Dashboard() {
  const { subscription, loading, error, upgrade, canGenerate } = useSubscription();

  const handleGenerate = async () => {
    const { allowed, remaining } = await canGenerate();

    if (!allowed) {
      alert('Generation limit reached. Upgrade to continue.');
      return;
    }

    // Generate music...
    await generateMusic();

    // Record the generation
    await recordGeneration('music');
  };

  if (loading) return <div>Loading subscription...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Plan: {subscription?.plan}</p>
      <p>Remaining: {subscription?.generationsPerMonth - subscription?.generationsUsed}</p>
      <button onClick={handleGenerate}>Generate Music</button>
    </div>
  );
}
```

---

## useGenerationLimit Hook

Dedicated hook for checking generation limits.

**Returns:**
```tsx
{
  limit: GenerationLimit | null;
  loading: boolean;
  error: string | null;
  checkLimit: () => Promise<void>;
}
```

**Usage:**
```tsx
import { useGenerationLimit } from '@wise2/ui-components/billing';

export default function GenerationForm() {
  const { limit, loading, error, checkLimit } = useGenerationLimit();

  if (loading) return <div>Checking limits...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!limit?.allowed) {
    return (
      <div className="alert alert-warning">
        <p>Generation limit reached.</p>
        <p>Resets on {limit?.resetDate.toLocaleDateString()}</p>
        <button onClick={checkLimit}>Check again</button>
      </div>
    );
  }

  return (
    <div>
      <p>{limit.remaining} generations remaining</p>
      <GenerationForm />
    </div>
  );
}
```

---

## Page Templates

### Billing Dashboard Page

```tsx
// apps/studio/app/billing/page.tsx
'use client';

import { useSubscription } from '@wise2/ui-components/billing';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();
  const { subscription, loading, error, upgrade } = useSubscription();

  const handleUpgrade = async (planId: string) => {
    try {
      const checkoutUrl = await upgrade(
        planId,
        `${window.location.origin}/billing/success`,
        `${window.location.origin}/billing/cancel`
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-12">Billing & Subscription</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow mb-12 p-8">
        <h2 className="text-2xl font-semibold mb-6">Current Plan</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Plan</p>
            <p className="text-2xl font-bold">{subscription?.plan}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-2xl font-bold capitalize">
              {subscription?.status.toLowerCase()}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Generations/Month</p>
            <p className="text-2xl font-bold">{subscription?.generationsPerMonth}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Used This Month</p>
            <p className="text-2xl font-bold">{subscription?.generationsUsed}</p>
          </div>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-gray-600 mt-6">
            Billing period ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Pricing Tiers */}
      <h2 className="text-2xl font-semibold mb-6">Upgrade Your Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Starter */}
        <div className="border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-2">Starter</h3>
          <p className="text-gray-600 mb-6">Perfect for getting started</p>

          <p className="text-3xl font-bold mb-6">$49<span className="text-lg text-gray-600">/mo</span></p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              100 generations/month
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Email support
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Basic features
            </li>
          </ul>

          {subscription?.plan === 'STARTER' ? (
            <button
              disabled
              className="w-full py-2 bg-gray-300 text-gray-600 rounded font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => handleUpgrade('STARTER')}
              className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
            >
              Upgrade Now
            </button>
          )}
        </div>

        {/* Pro - Featured */}
        <div className="border-2 border-blue-600 rounded-lg p-8 relative bg-blue-50">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              POPULAR
            </span>
          </div>

          <h3 className="text-xl font-semibold mb-2">Pro</h3>
          <p className="text-gray-600 mb-6">Best for most users</p>

          <p className="text-3xl font-bold mb-6">$99<span className="text-lg text-gray-600">/mo</span></p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Unlimited generations
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Priority support
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              API access
            </li>
          </ul>

          {subscription?.plan === 'PRO' ? (
            <button
              disabled
              className="w-full py-2 bg-blue-300 text-white rounded font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => handleUpgrade('PRO')}
              className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
            >
              Upgrade Now
            </button>
          )}
        </div>

        {/* Enterprise */}
        <div className="border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
          <p className="text-gray-600 mb-6">For large-scale needs</p>

          <p className="text-3xl font-bold mb-6">$299<span className="text-lg text-gray-600">/mo</span></p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Unlimited everything
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Dedicated support
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Custom integrations
            </li>
          </ul>

          <button
            onClick={() => router.push('/contact')}
            className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded font-semibold hover:bg-blue-50"
          >
            Contact Sales
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold mb-6">Generation Usage</h2>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>This Month</span>
            <span>
              {subscription?.generationsUsed} / {subscription?.generationsPerMonth}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${
                  ((subscription?.generationsUsed || 0) / (subscription?.generationsPerMonth || 1)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          Resets on the first day of each month
        </p>
      </div>
    </div>
  );
}
```

### Success/Cancel Pages

```tsx
// apps/studio/app/billing/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Refresh subscription and redirect after 2 seconds
    setTimeout(() => {
      router.push('/billing');
    }, 2000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your subscription has been activated.</p>
        <p className="text-sm text-gray-500">Redirecting to billing page...</p>
      </div>
    </div>
  );
}
```

```tsx
// apps/studio/app/billing/cancel/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">×</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Checkout Cancelled</h1>
        <p className="text-gray-600 mb-6">Your payment was not processed.</p>
        <button
          onClick={() => router.push('/billing')}
          className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
        >
          Return to Billing
        </button>
      </div>
    </div>
  );
}
```

---

## Protecting Features with Feature Gates

### Example: Music Generation

```tsx
// apps/studio/components/MusicGenerator.tsx
'use client';

import { FeatureGate, useGenerationLimit } from '@wise2/ui-components/billing';
import { useState } from 'react';

export default function MusicGenerator() {
  const { limit, loading } = useGenerationLimit();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Your generation logic
      const response = await fetch('/api/v1/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* params */ }),
      });

      const result = await response.json();

      // Record the generation
      await fetch('/api/v1/billing/record-generation', {
        method: 'POST',
        body: JSON.stringify({ generationType: 'music' }),
      });

      // Show result...
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FeatureGate featureName="music_generation">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Music Generator</h2>

        {limit && (
          <p className="text-sm text-gray-600 mb-4">
            {limit.remaining} generations remaining
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !limit?.allowed}
          className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'Generate Music'}
        </button>
      </div>
    </FeatureGate>
  );
}
```

---

## Common Patterns

### Check Limit Before Action

```tsx
const { canGenerate, recordGeneration } = useSubscription();

const handleAction = async () => {
  const { allowed, reason } = await canGenerate();

  if (!allowed) {
    alert(reason);
    return;
  }

  // Do action
  await doSomething();

  // Record usage
  await recordGeneration();
};
```

### Show Upgrade CTA

```tsx
const { subscription } = useSubscription();

if (subscription?.plan === 'FREE') {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <p>Unlock unlimited features by upgrading to Pro.</p>
      <a href="/billing" className="text-blue-600 font-semibold">
        Learn more →
      </a>
    </div>
  );
}
```

### Handle Plan-Specific Permissions

```tsx
const { subscription } = useSubscription();

const canAccessAPI = subscription?.plan === 'PRO' || subscription?.plan === 'ENTERPRISE';
const canAccessAdvanced = subscription?.plan !== 'FREE';

if (!canAccessAPI) {
  return <div>API access requires Pro plan. <a href="/billing">Upgrade now</a></div>;
}
```

---

## Styling & Customization

All components use Tailwind CSS with default styling. Override via `className` prop:

```tsx
<FeatureGate
  featureName="music_generation"
  className="my-custom-class"
>
  <MusicGenerator />
</FeatureGate>
```

For global styling, modify the component source files in `packages/ui-components/src/billing/`.

---

## API Endpoints Reference

### GET /api/v1/billing/pricing
Get available pricing tiers.

**Response:**
```json
[
  {
    "id": "FREE",
    "name": "Free",
    "monthlyPrice": 0,
    "generationsPerMonth": 5,
    "features": ["5 generations/month", "Basic support"]
  },
  {
    "id": "STARTER",
    "name": "Starter",
    "monthlyPrice": 49,
    "generationsPerMonth": 100,
    "features": ["100 generations/month", "Email support"]
  },
  ...
]
```

### GET /api/v1/billing/subscription
Get current user's subscription.

**Response:**
```json
{
  "id": "sub_123",
  "userId": "user_123",
  "plan": "STARTER",
  "status": "ACTIVE",
  "generationsPerMonth": 100,
  "generationsUsed": 45,
  "currentPeriodStart": "2024-06-01T00:00:00Z",
  "currentPeriodEnd": "2024-07-01T00:00:00Z",
  "features": ["100 generations/month", "Email support"]
}
```

### POST /api/v1/billing/checkout
Create a checkout session for subscription upgrade.

**Request:**
```json
{
  "planId": "STARTER",
  "successUrl": "https://app.wise2.net/billing/success",
  "cancelUrl": "https://app.wise2.net/billing/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_123",
  "url": "https://checkout.stripe.com/pay/cs_test_123",
  "planId": "STARTER",
  "monthlyPrice": 49
}
```

### GET /api/v1/billing/can-generate
Check if user can generate.

**Response:**
```json
{
  "allowed": true,
  "remaining": 55,
  "resetDate": "2024-07-01T00:00:00Z"
}
```

### POST /api/v1/billing/record-generation
Record a generation for usage tracking.

**Request:**
```json
{
  "generationType": "music"
}
```

**Response:**
```json
{
  "recorded": true
}
```

---

## Troubleshooting

### "Cannot find module '@wise2/ui-components/billing'"
- Run `npm install` in root
- Make sure `packages/ui-components` is built
- Check import paths are correct

### Checkout redirects to wrong URL
- Verify `successUrl` and `cancelUrl` passed to checkout
- Ensure URLs match your app's domain
- Check environment variables for API endpoint

### Generation limit always blocks
- Verify user has a subscription record in database
- Check `canGenerateMusic()` response for error
- Ensure `lastResetDate` is recent

### Webhook not updating database
- Check webhook secret in `.env`
- Verify subscription with `stripeCustomerId` exists
- Look for errors in server logs
- Check Stripe Dashboard for webhook failures

---

**Last Updated**: 2026-07-18
