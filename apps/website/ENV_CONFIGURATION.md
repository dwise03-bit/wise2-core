# Environment Configuration Guide - WISE² Website

This guide documents how to configure environment variables for the WISE² website application.

## Quick Start

```bash
# Copy the example file
cp .env.example .env.local

# Edit the file with your local values
# Development values can use test/dummy data
nano .env.local
```

## Environment Files

### `.env.local` (Development)
- **Location**: `/apps/website/.env.local`
- **Git Status**: Ignored (in `.gitignore`)
- **Use Case**: Local development and testing
- **When Applied**: Automatically by Next.js during `npm run dev`
- **Security**: Can contain test keys and dummy data

### `.env.production`
- **Location**: `/apps/website/.env.production`
- **Git Status**: Tracked (but secrets should be managed via environment variables)
- **Use Case**: Production deployments on wise2.net
- **When Applied**: Used during `npm run build` and `npm start`
- **Security**: Should be managed via secrets manager or environment variables in CI/CD

### `.env.example`
- **Location**: `/apps/website/.env.example`
- **Git Status**: Tracked
- **Use Case**: Documentation and template
- **Purpose**: Shows all available configuration options and where to get values

## Configuration Variables

### Application Configuration

#### `NEXT_PUBLIC_SITE_URL`
- **Type**: URL
- **Required**: Yes
- **Public**: Yes (visible in browser)
- **Development Value**: `http://localhost:3001`
- **Production Value**: `https://wise2.net`
- **Purpose**: Main application URL used for redirects, links, and API calls
- **Notes**: Must include protocol (http/https)

#### `NEXT_PUBLIC_API_URL`
- **Type**: URL
- **Required**: Yes
- **Public**: Yes
- **Development Value**: `http://localhost:3000`
- **Production Value**: `https://api.wise2.net`
- **Purpose**: Backend API endpoint for all server requests
- **Notes**: Ensure CORS is configured to allow requests from NEXT_PUBLIC_SITE_URL

### Analytics Configuration

#### `NEXT_PUBLIC_ANALYTICS_ID`
- **Type**: String
- **Required**: No (optional)
- **Public**: Yes
- **Format**: `G-XXXXXXXXXX` (Google Analytics 4)
- **Development Value**: `G-LOCALHOST` or test ID
- **Production Value**: `G-WISE2NET` or your GA4 ID
- **How to Get**: 
  1. Go to https://analytics.google.com/
  2. Create/select property for your domain
  3. Find Measurement ID in Admin > Property Settings
- **Purpose**: Track user behavior, pageviews, and events

### Stripe Payment Configuration

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Type**: String
- **Required**: Yes (for checkout functionality)
- **Public**: Yes (publishable keys are meant for client-side use)
- **Format**: 
  - Test: `pk_test_*` (starts with pk_test_)
  - Live: `pk_live_*` (starts with pk_live_)
- **How to Get**: 
  1. Go to https://dashboard.stripe.com/apikeys
  2. Copy the "Publishable key"
  3. Use test key in development, live key in production
- **Purpose**: Initialize Stripe.js for payment elements
- **Notes**: This key is NOT sensitive; it's meant to be public

#### `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
#### `NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID`
#### `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
- **Type**: String
- **Required**: Yes (for pricing page and checkout)
- **Public**: Yes
- **Format**: `price_*` (Stripe price ID)
- **How to Get**: 
  1. Go to https://dashboard.stripe.com/products
  2. Select each product (Starter, Professional, Enterprise)
  3. Copy the Price ID from the pricing section
- **Purpose**: Link pricing tiers to Stripe checkout
- **Notes**: Must correspond to products created in Stripe dashboard

### Discord Integration

#### `DISCORD_WEBHOOK_URL`
- **Type**: URL
- **Required**: No (optional)
- **Public**: No (keep secret!)
- **Format**: `https://discord.com/api/webhooks/[WEBHOOK_ID]/[WEBHOOK_TOKEN]`
- **How to Get**: 
  1. Go to your Discord server
  2. Server Settings > Integrations > Webhooks
  3. Click "New Webhook"
  4. Name it (e.g., "wise2-website")
  5. Copy the webhook URL
- **Purpose**: Send notifications to Discord (alerts, events, activity logs)
- **Notes**: 
  - Keep this secret - don't commit to git
  - Requires webhook to be created in Discord server

### YouTube Integration

#### `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID`
- **Type**: String
- **Required**: No (optional)
- **Public**: Yes
- **Format**: Starts with `UC` followed by alphanumeric characters
- **Example**: `UCxxxxxxxxxxxxxxxx`
- **How to Get**: 
  1. Go to https://www.youtube.com/@yourchannelname
  2. Replace `@yourchannelname` with your actual channel name
  3. Click on channel settings or "About"
  4. Find the channel ID (or go to https://www.youtube.com/account/advanced_account)
- **Purpose**: Display YouTube channel info, latest videos, subscribe links

#### `NEXT_PUBLIC_YOUTUBE_API_KEY`
- **Type**: String
- **Required**: No (optional - only if using YouTube Data API)
- **Public**: No (should be kept in server environment)
- **Format**: `AIzaSyxxxxxxxxxxxxxxxxxxxxxx` (starts with AIzaSy)
- **How to Get**: 
  1. Go to https://console.cloud.google.com/
  2. Create a new project or select existing
  3. Enable "YouTube Data API v3"
  4. Go to Credentials > Create Credential > API Key
  5. Restrict the key to HTTP referrers (your domain)
  6. Copy the API key
- **Purpose**: Fetch YouTube channel data via API (videos, playlists, etc.)
- **Notes**: 
  - Free tier has quotas (10,000 units per day)
  - Restrict to your domain only for security

### Stripe Server-Side Configuration (Secret Keys)

⚠️ **IMPORTANT**: These variables contain sensitive secrets and should ONLY be set via environment variables, never hardcoded in `.env` files or committed to git.

#### `STRIPE_SECRET_KEY`
- **Type**: String
- **Required**: Yes (only if using Stripe payment processing)
- **Public**: No (KEEP SECRET!)
- **Format**: 
  - Test: `sk_test_*` (starts with sk_test_)
  - Live: `sk_live_*` (starts with sk_live_)
- **How to Get**: 
  1. Go to https://dashboard.stripe.com/apikeys
  2. Look for "Secret key"
  3. Never share this key or commit it to git
- **Purpose**: Server-side authentication with Stripe API
- **Notes**: 
  - Used in `/api/checkout/session` and webhook handlers
  - Keep in production environment variables only
  - Rotate regularly

#### `STRIPE_WEBHOOK_SECRET`
- **Type**: String
- **Required**: Yes (only if using Stripe webhooks)
- **Public**: No (KEEP SECRET!)
- **Format**: `whsec_*` (starts with whsec_)
- **How to Get**: 
  1. Go to https://dashboard.stripe.com/webhooks
  2. Click on your webhook endpoint
  3. Click "Reveal" next to "Signing secret"
  4. Copy the secret (only visible once)
- **Purpose**: Verify webhook signatures from Stripe
- **Notes**: 
  - Used in `/api/webhooks/stripe` route
  - Different secret for each webhook endpoint
  - Keep in production environment variables only

### Hermes/AI Configuration

#### `HERMES_ENDPOINT`
- **Type**: URL
- **Required**: No (optional - only if using AI chat features)
- **Public**: No (internal service)
- **Format**: `http://[host]:[port]/[endpoint]`
- **Default**: `http://localhost:11434/v1/chat/completions`
- **Common Values**:
  - **Local Ollama**: `http://localhost:11434/v1/chat/completions`
  - **Remote LLM**: `https://api.example.com/v1/chat/completions`
- **How to Set Up** (with Ollama):
  1. Install Ollama: https://ollama.ai
  2. Start Ollama: `ollama serve`
  3. Pull a model: `ollama pull hermes` or `ollama pull mistral`
  4. Set `HERMES_ENDPOINT=http://localhost:11434/v1/chat/completions`
- **Purpose**: Endpoint for AI/LLM inference in `/api/chat` route
- **Notes**: 
  - Only used if chat/AI features are enabled
  - Can be any OpenAI-compatible API
  - Requires model to be running/accessible

### Node Environment

#### `NODE_ENV`
- **Type**: String
- **Required**: Yes
- **Public**: No
- **Values**: `development`, `production`, `test`
- **Development Value**: `development`
- **Production Value**: `production`
- **Purpose**: Controls Next.js build and runtime behavior
- **Auto-Set**: Usually set automatically by Next.js

## Setup Instructions

### For Local Development

```bash
# 1. Copy example to local env
cp .env.example .env.local

# 2. Update with local values
# - NEXT_PUBLIC_SITE_URL: http://localhost:3001
# - NEXT_PUBLIC_API_URL: http://localhost:3000
# - Use Stripe test keys (pk_test_*)
# - Discord webhook: optional for local development

# 3. Start development server
npm run dev

# 4. Verify env vars are loaded
# Visit http://localhost:3001 and check browser console
```

### For Production Deployment

```bash
# 1. Ensure .env.production has correct values
# 2. Set production Stripe keys (pk_live_*)
# 3. Set production API URL (https://api.wise2.net)
# 4. Set production site URL (https://wise2.net)
# 5. Deploy via CI/CD pipeline
npm run build
npm run start
```

### Via Environment Variables (Recommended for Production)

Instead of `.env.production` file, set environment variables:

```bash
# Docker
docker run -e NEXT_PUBLIC_SITE_URL=https://wise2.net \
           -e NEXT_PUBLIC_API_URL=https://api.wise2.net \
           -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... \
           wise2-website

# systemd (for bare metal deployment)
export NEXT_PUBLIC_SITE_URL=https://wise2.net
export NEXT_PUBLIC_API_URL=https://api.wise2.net
npm run start
```

## Validation Checklist

Before deploying, verify:

- [ ] `NEXT_PUBLIC_SITE_URL` is correct for the environment
- [ ] `NEXT_PUBLIC_API_URL` points to the correct backend
- [ ] Stripe keys are for the correct environment (test vs. live)
- [ ] Stripe price IDs exist and are active
- [ ] Discord webhook URL is valid (if using Discord)
- [ ] YouTube channel ID is correct (if using YouTube)
- [ ] No secrets are exposed in `.env.local`
- [ ] `.env.local` is in `.gitignore`

## Troubleshooting

### Variables Not Loading

```bash
# 1. Verify file exists in correct location
ls -la /apps/website/.env.local

# 2. Check file format (no quotes needed for values)
# CORRECT: NEXT_PUBLIC_SITE_URL=http://localhost:3001
# WRONG:   NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# 3. Restart dev server
npm run dev

# 4. Check browser console for logged values
```

### Stripe Integration Issues

```bash
# 1. Verify key format
# Test key: pk_test_... (46 chars)
# Live key: pk_live_... (48 chars)

# 2. Check price IDs are active in Stripe dashboard
# stripe.com/docs/products-prices/manage-prices

# 3. Ensure CORS is configured on API
```

### API Connection Errors

```bash
# 1. Verify NEXT_PUBLIC_API_URL is correct
# 2. Check CORS headers from backend
# 3. Ensure backend is running and accessible
# 4. Check browser Network tab in DevTools
```

## Security Best Practices

### Secrets Management

1. **Never commit `.env.local`** to git
2. **Keep secret keys secret**:
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
   - `DISCORD_WEBHOOK_URL` - Discord webhook URL
   - `NEXT_PUBLIC_YOUTUBE_API_KEY` - YouTube API key (if restrictive)
3. **Use test keys in development** - never test with live Stripe keys
4. **Rotate secrets regularly** in production
5. **Use secrets manager** for production:
   - GitHub Secrets (for CI/CD)
   - AWS Secrets Manager or Parameter Store
   - HashiCorp Vault
   - 1Password / LastPass Teams
6. **Review .gitignore** to ensure env files aren't tracked:
   ```
   .env.local
   .env.*.local
   .env
   ```

### Environment Variables in Production

```bash
# Option 1: Use environment variables instead of .env.production
export NEXT_PUBLIC_SITE_URL=https://wise2.net
export NEXT_PUBLIC_API_URL=https://api.wise2.net
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
export STRIPE_SECRET_KEY=sk_live_...
export STRIPE_WEBHOOK_SECRET=whsec_...
npm run build && npm run start

# Option 2: Docker with environment variables
docker run \
  -e NEXT_PUBLIC_SITE_URL=https://wise2.net \
  -e NEXT_PUBLIC_API_URL=https://api.wise2.net \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... \
  -e STRIPE_SECRET_KEY=sk_live_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  wise2-website

# Option 3: Docker with .env.production file (mounted via secret)
docker run \
  --secret stripe_secret \
  -e STRIPE_SECRET_KEY=/run/secrets/stripe_secret \
  wise2-website
```

### Public vs. Secret Variables

**Public Variables** (safe to expose in client code):
- All `NEXT_PUBLIC_*` variables
- These are visible in the browser

**Secret Variables** (server-side only):
- `STRIPE_SECRET_KEY` - Keep in backend only
- `STRIPE_WEBHOOK_SECRET` - Keep in backend only
- `HERMES_ENDPOINT` - Keep private (internal service)
- `DISCORD_WEBHOOK_URL` - Keep in backend only

### Validation Checklist

Before deploying, verify:
- [ ] No secret keys in client-side code
- [ ] `.env.local` is git-ignored
- [ ] No hardcoded secrets in committed files
- [ ] Secrets are managed via environment variables or secret manager
- [ ] All required variables are set
- [ ] No test/dummy keys in production

## Related Files

- **`.env.example`** - Template with all available variables
- **`.env.local`** - Development environment (git-ignored)
- **`.env.production`** - Production environment (git-tracked but sanitized)
- **`next.config.js`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration with path aliases

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Stripe Documentation](https://stripe.com/docs)
- [Google Analytics Setup](https://support.google.com/analytics/answer/9304153)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [YouTube API](https://developers.google.com/youtube/v3)

## Questions or Issues?

For issues with environment configuration, check:
1. The validation checklist above
2. The troubleshooting section
3. Console logs during development
4. Next.js documentation: https://nextjs.org/docs/basic-features/environment-variables
