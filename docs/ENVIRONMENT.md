# Environment Variables Documentation

**WISE² Production Environment Setup Guide**

This document provides complete reference for all environment variables required to run WISE² in production. Use this guide to configure `.env.production` for cloud deployments, or `.env.pi` for Raspberry Pi edge deployments.

---

## Table of Contents

1. [Overview & Security](#overview--security)
2. [Core Application](#core-application)
3. [Database](#database)
4. [Redis (Cache & Queue)](#redis-cache--queue)
5. [Payment Processing (Stripe)](#payment-processing-stripe)
6. [Email (SendGrid)](#email-sendgrid)
7. [Authentication & OAuth](#authentication--oauth)
8. [Google Integration](#google-integration)
9. [Discord Integration](#discord-integration)
10. [AWS (Storage)](#aws-storage)
11. [Monitoring & Logging](#monitoring--logging)
12. [AI Providers](#ai-providers)
13. [Security & CORS](#security--cors)
14. [Rate Limiting](#rate-limiting)
15. [Optional Features](#optional-features)
16. [Setup Checklist](#setup-checklist)
17. [Validation & Testing](#validation--testing)
18. [Troubleshooting](#troubleshooting)

---

## Overview & Security

### What is .env.production?

`.env.production` is a configuration file containing sensitive credentials and deployment-specific settings for WISE² production environments. This file is **NOT committed to git** — it's managed via secure credential stores and deployed separately.

### Security Guidelines

- **Never commit `.env.production` to version control** — it's listed in `.gitignore` and must stay secret
- **Use a secrets vault** for production:
  - AWS Secrets Manager (recommended for cloud deployments)
  - HashiCorp Vault (for self-hosted)
  - GitHub Secrets (for CI/CD)
  - Docker secrets (for container orchestration)
- **Rotate credentials regularly**:
  - API keys: every 90 days
  - Database passwords: every 120 days
  - Webhook secrets: when rotating integrations
- **Use environment-specific files**:
  - `.env.production` — Production (locked down)
  - `.env.staging` — Staging (test-like, but isolated)
  - `.env.development` — Local development (public test keys)
  - `.env.pi` — Raspberry Pi edge deployment

### Loading Order

The application loads environment files in this order (later overrides earlier):

1. `.env` (committed defaults)
2. `.env.local` (local development overrides)
3. `.env.{NODE_ENV}` (e.g., `.env.production` for production)
4. `.env.{NODE_ENV}.local` (environment-specific local overrides)

---

## Core Application

These variables configure the basic WISE² application runtime.

### NODE_ENV

**Type**: String  
**Description**: Defines the application environment. Affects logging, error handling, performance optimization, and feature flags.  
**Example Value**: `production`  
**Required**: Yes  
**Valid Values**: `production`, `staging`, `development`, `test`

**Where to Get It**: Not from external source — set based on deployment target

**Common Mistakes**:
- Setting to `development` in production (disables optimizations, enables verbose logging)
- Forgetting to set to `production` (Next.js won't optimize static files)
- Typos cause app to behave as `development`

---

### PORT

**Type**: Number  
**Description**: HTTP server port for the Next.js application (website and studio).  
**Example Value**: `3000`  
**Required**: Yes  
**Typical Values**: `3000` (production), `3001` (staging), `3005` (local dashboard)

**Where to Get It**: Not external — configure based on infrastructure

**Common Mistakes**:
- Using the same port for API and web app (causes conflict)
- Forgetting to expose port in firewall/security groups
- Nginx/proxy server listening on same port

**Related Variables**: `API_PORT` (separate for backend API)

---

### API_PORT

**Type**: Number  
**Description**: HTTP server port for the NestJS API backend.  
**Example Value**: `3001`  
**Required**: Yes (if running separate API)  
**Typical Values**: `3001` (production), `3002` (staging)

**Where to Get It**: Not external — configure based on infrastructure

**Note**: Must be different from `PORT` (the web app port)

---

### APP_URL

**Type**: String (URL)  
**Description**: Public-facing URL for the WISE² web application. Used for OAuth redirects, email links, social sharing, and API references.  
**Example Value**: `https://wise2.net`  
**Required**: Yes  
**Format**: `https://` (always) or `http://` (local only)

**Where to Get It**:
- Production: Your domain (e.g., `wise2.net`)
- Staging: Staging domain (e.g., `staging.wise2.net`)
- Local: `http://localhost:3000`

**Common Mistakes**:
- Missing `https://` in production
- Including `/` at the end (`https://wise2.net/`)
- Mismatched between OAuth provider config and actual app URL
- Different APP_URL and NEXTAUTH_URL causing session issues

**Related Variables**: `NEXTAUTH_URL`, `API_BASE_URL`

---

### API_BASE_URL

**Type**: String (URL)  
**Description**: Public-facing URL for the NestJS API backend. Used by frontend for API requests and webhooks.  
**Example Value**: `https://api.wise2.net`  
**Required**: Yes  
**Format**: `https://` (always) or `http://` (local only)

**Where to Get It**:
- Production: API domain (e.g., `api.wise2.net`)
- Staging: Staging API domain (e.g., `api.staging.wise2.net`)
- Local: `http://localhost:3001`

**Common Mistakes**:
- CORS errors because frontend and API URLs don't match config
- Forgetting to update in webhook configurations (Stripe, Discord, etc.)
- Mixing `http` and `https`

**Related Variables**: `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`

---

### NEXT_PUBLIC_API_URL

**Type**: String (URL)  
**Description**: Frontend-accessible API URL (exposed to browser JavaScript). Must match `API_BASE_URL` in most cases. The `NEXT_PUBLIC_` prefix means this value is available in browser code.  
**Example Value**: `https://api.wise2.net`  
**Required**: Yes  
**Note**: Publicly visible in browser — never put secrets here

**Where to Get It**: Same as `API_BASE_URL`

**Common Mistakes**:
- Different from `API_BASE_URL` causing frontend to hit wrong server
- Putting secret values here (they're visible to browser)

---

## Database

PostgreSQL configuration for the WISE² core database.

### DATABASE_URL

**Type**: String (Connection String)  
**Description**: Full PostgreSQL connection string. Used by Prisma ORM and database clients.  
**Example Value**: `postgresql://wise2:your-secure-password@postgres:5432/wise2_prod`  
**Required**: Yes  
**Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`

**Where to Get It**:
- Cloud: AWS RDS endpoint provided in console
- Self-hosted: Your PostgreSQL server hostname/IP
- Docker: `postgres` (service name in docker-compose)

**Common Mistakes**:
- Password not URL-encoded (spaces, special chars fail)
- Wrong database name (common: typo in `wise2_prod`)
- Port mismatch (PostgreSQL default is 5432)
- Connection refused — firewall blocking database port

**Related Variables**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DATABASE_PASSWORD`

**Example Construction**:
```bash
# If you have these individual vars:
DB_USER=wise2
DATABASE_PASSWORD=MySecureP@ss123
DB_HOST=postgres.example.com
DB_PORT=5432
DB_NAME=wise2_prod

# DATABASE_URL should be:
postgresql://wise2:MySecureP@ss123@postgres.example.com:5432/wise2_prod
```

---

### DATABASE_PASSWORD

**Type**: String  
**Description**: PostgreSQL database user password. Should be strong and unique.  
**Example Value**: (generated, never shared)  
**Required**: Yes  
**Min Length**: 16 characters (recommended 24+)

**Where to Get It**:
- Generate: `openssl rand -base64 32`
- AWS RDS: Created during database setup
- Store in: Password manager or secrets vault

**Common Mistakes**:
- Too short or predictable password
- Not URL-encoded when used in DATABASE_URL
- Sharing in commit history or Slack

**Generation Example**:
```bash
openssl rand -base64 32
# Output: k9z7mQ2pX5nL8wR3bV4cF6jH9yU0tE2sP5dW8gJ1oK4a=
```

---

### DB_HOST

**Type**: String  
**Description**: PostgreSQL server hostname or IP address.  
**Example Value**: `postgres.c5jxz9x5x9x9.us-east-1.rds.amazonaws.com`  
**Required**: Yes  
**Typical Values**:
- AWS RDS: `wise2-db.c5jxz9x5x9x9.us-east-1.rds.amazonaws.com`
- Docker: `postgres` (service name)
- Self-hosted: `10.0.1.50` or `db.internal.company.com`

**Where to Get It**:
- AWS RDS: Console → Databases → your-instance → Endpoint
- Docker Compose: Service name from `docker-compose.yml`
- Self-hosted: Your infrastructure

---

### DB_PORT

**Type**: Number  
**Description**: PostgreSQL server port.  
**Example Value**: `5432`  
**Required**: Yes  
**Standard Value**: `5432` (PostgreSQL default)

---

### DB_NAME

**Type**: String  
**Description**: PostgreSQL database name (must exist or be created).  
**Example Value**: `wise2_prod`  
**Required**: Yes  
**Naming Convention**: `wise2_prod` (production), `wise2_staging` (staging), `wise2_dev` (development)

---

### DB_USER

**Type**: String  
**Description**: PostgreSQL database user (must have appropriate permissions).  
**Example Value**: `wise2`  
**Required**: Yes  
**Required Permissions**: `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `SELECT`

**Where to Get It**: Created during database setup (or AWS RDS master user)

---

## Redis (Cache & Queue)

Redis configuration for caching and job queue processing.

### REDIS_URL

**Type**: String (Connection String)  
**Description**: Full Redis connection string. Used by cache and queue services.  
**Example Value**: `redis://:your-secure-password@redis:6379/0`  
**Required**: Yes (if Redis is enabled)  
**Format**: `redis://[:password]@[host]:[port]/[database]`

**Where to Get It**:
- AWS ElastiCache: Endpoint provided in console
- Self-hosted: Your Redis server hostname/IP
- Docker: `redis` (service name)

**Common Mistakes**:
- Missing password prefix `:` even when Redis has no password
- Wrong port (Redis default is 6379)
- Connection refused — firewall/security group

**Related Variables**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

---

### REDIS_HOST

**Type**: String  
**Description**: Redis server hostname or IP address.  
**Example Value**: `redis.c5jxz9x5x9x9.ng.0001.use1.cache.amazonaws.com`  
**Required**: Yes (if using separate variables)  
**Typical Values**:
- AWS ElastiCache: `wise2-cache.c5jxz9x5x9x9.ng.0001.use1.cache.amazonaws.com`
- Docker: `redis`
- Self-hosted: `10.0.1.51` or `cache.internal.company.com`

---

### REDIS_PORT

**Type**: Number  
**Description**: Redis server port.  
**Example Value**: `6379`  
**Required**: Yes (if using separate variables)  
**Standard Value**: `6379` (Redis default)

---

### REDIS_PASSWORD

**Type**: String  
**Description**: Redis authentication password (if required).  
**Example Value**: (generated, never shared)  
**Required**: Only if Redis auth is enabled  
**Min Length**: 16 characters (recommended)

**Where to Get It**:
- AWS ElastiCache: Auth token from console
- Generate: `openssl rand -base64 32`

**Common Mistakes**:
- Redis auth enabled but password not provided (connection fails)
- Password not URL-encoded in REDIS_URL

---

## Payment Processing (Stripe)

Stripe configuration for subscription billing and one-time payments.

### STRIPE_PUBLIC_KEY

**Type**: String  
**Description**: Stripe publishable key (safe to expose to frontend). Used by Stripe.js for payment forms.  
**Example Value**: `pk_live_51Iy...` (starts with `pk_live_` or `pk_test_`)  
**Required**: Yes (if Stripe is enabled)  
**Security Level**: Public (can be in git for test keys only)

**Where to Get It**:
- Stripe Dashboard: https://dashboard.stripe.com/apikeys
- Two sets available: Test (pk_test_) and Live (pk_live_)
- For production: Use Live keys (pk_live_)

**Common Mistakes**:
- Using test key in production (won't process real payments)
- Using live key in development (wastes live resources)
- Confusing public and secret keys
- Not rotating keys on team changes

**Related Variables**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

### STRIPE_SECRET_KEY

**Type**: String  
**Description**: Stripe secret key (must never be exposed to frontend). Used by backend for payment processing, customer management, subscriptions.  
**Example Value**: `sk_live_51Iy...` (starts with `sk_live_` or `sk_test_`)  
**Required**: Yes (if Stripe is enabled)  
**Security Level**: SECRET — backend only, never expose

**Where to Get It**: Stripe Dashboard: https://dashboard.stripe.com/apikeys

**Common Mistakes**:
- Exposing in frontend code or environment variables prefixed `NEXT_PUBLIC_`
- Committing to git (check git history if exposed)
- Using test key in production

**If Compromised**: Immediately revoke in Stripe dashboard and generate new key

---

### STRIPE_WEBHOOK_SECRET

**Type**: String  
**Description**: Webhook signing secret for Stripe events (payments, subscriptions, etc.). Validates that webhook events are from Stripe.  
**Example Value**: `whsec_1234567890abc...` (starts with `whsec_`)  
**Required**: Yes (if webhooks are enabled)  
**Security Level**: SECRET — backend only

**Where to Get It**:
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.wise2.net/webhooks/stripe`
3. Copy "Signing secret"

**Common Mistakes**:
- Wrong endpoint URL (events won't deliver)
- Secret not kept in sync across environments
- Webhook signature validation disabled for "testing"

**Related Variables**: Webhook endpoint in API code: `POST /webhooks/stripe`

---

### STRIPE_STARTER_PRICE_ID

**Type**: String  
**Description**: Stripe price ID for Starter plan. References a price object in Stripe dashboard.  
**Example Value**: `price_1Iy1234567890abcdefghijk` (starts with `price_`)  
**Required**: Yes (if Stripe is enabled)  
**Multiple Plans**: Usually multiple (starter, pro, enterprise)

**Where to Get It**:
1. Stripe Dashboard → Products
2. Find/create Starter product
3. Copy Price ID

**Common Mistakes**:
- Using product ID instead of price ID
- Inconsistent IDs between environments (test vs. live)
- Price ID linked to wrong plan

**Related Variables**: `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID`

---

### STRIPE_PRO_PRICE_ID

**Type**: String  
**Description**: Stripe price ID for Professional/Pro plan.  
**Example Value**: `price_1Iy0987654321zyxwvutsrqp`  
**Required**: Yes (if Stripe is enabled)  

**Where to Get It**: Stripe Dashboard → Products → Pro product → Price ID

---

### STRIPE_ENTERPRISE_PRICE_ID

**Type**: String  
**Description**: Stripe price ID for Enterprise plan (if offered).  
**Example Value**: `price_1Iy1122334455aabbccddeeff`  
**Required**: Only if Enterprise tier exists  

---

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Type**: String  
**Description**: Frontend-accessible Stripe public key. Same as `STRIPE_PUBLIC_KEY` but exposed to browser.  
**Example Value**: `pk_live_51Iy...`  
**Required**: Yes (if Stripe is enabled)  
**Note**: Prefix `NEXT_PUBLIC_` makes this visible to browser

---

### NEXT_PUBLIC_STRIPE_SUCCESS_URL

**Type**: String (URL)  
**Description**: Redirect URL after successful payment.  
**Example Value**: `https://wise2.net/dashboard?session={CHECKOUT_SESSION_ID}`  
**Required**: Yes (if Stripe checkout is enabled)  

**Where to Get It**: Set to a page in your app that shows payment success

---

### NEXT_PUBLIC_STRIPE_CANCEL_URL

**Type**: String (URL)  
**Description**: Redirect URL if user cancels payment.  
**Example Value**: `https://wise2.net/pricing`  
**Required**: Yes (if Stripe checkout is enabled)  

---

## Email (SendGrid)

SendGrid configuration for transactional email (password resets, confirmations, notifications).

### SENDGRID_API_KEY

**Type**: String  
**Description**: SendGrid API key for sending emails. Enables password resets, welcome emails, notifications.  
**Example Value**: `SG.1A2B3C...` (starts with `SG.`)  
**Required**: Yes (if email is enabled)  
**Security Level**: SECRET — backend only

**Where to Get It**:
1. SendGrid Dashboard: https://app.sendgrid.com/settings/api_keys
2. Create a new API key (or use existing)
3. Copy the full key (displayed once)

**Common Mistakes**:
- API key displayed once and not saved (must generate new)
- Wrong permissions (select "Restricted Access" with Mail Send permission)
- Not whitelisting sender domain

**If Compromised**: Delete key immediately in SendGrid dashboard

---

### SENDGRID_FROM_EMAIL

**Type**: String (Email)  
**Description**: "From" email address for outbound emails. Must be domain-verified in SendGrid.  
**Example Value**: `noreply@wise2.net`  
**Required**: Yes (if email is enabled)  
**Format**: `name@yourdomain.com`

**Where to Get It**:
- Subdomain you own (typically `noreply@`, `hello@`, `support@`)
- Must verify domain in SendGrid: Settings → Sender Authentication

**Common Mistakes**:
- Using non-domain email (e.g., Gmail account)
- Domain not verified (emails go to spam)
- Typo in email address

**Related Variables**: `SENDGRID_FROM_NAME`

---

### SENDGRID_FROM_NAME

**Type**: String  
**Description**: Display name for emails (appears in recipient's inbox as "From: WISE² <noreply@wise2.net>").  
**Example Value**: `WISE²`  
**Required**: No (defaults to domain)  

---

## Authentication & OAuth

Session management and third-party OAuth configuration.

### JWT_SECRET

**Type**: String  
**Description**: Secret key for signing JWT tokens. Critical for session security.  
**Example Value**: (generated, never shared)  
**Required**: Yes  
**Min Length**: 32 characters (recommended 64+)  
**Security Level**: SECRET

**Where to Get It**:
- Generate: `openssl rand -base64 64`
- Store in secrets vault

**Common Mistakes**:
- Too short (less than 32 chars)
- Using predictable value
- Same key across environments

**Generation Example**:
```bash
openssl rand -base64 64
# Output: K9z7mQ2pX5nL8wR3bV4cF6jH9yU0tE2sP5dW8gJ1oK4a=N2bT5jR8pW1cX4sH7kL9zQ3vF6dG9nM2oP5tS8uV1yX4=
```

---

### JWT_EXPIRY

**Type**: String (duration)  
**Description**: JWT token expiration time. Controls session length.  
**Example Value**: `7d`  
**Required**: No (defaults to 7d)  
**Valid Formats**: `7d`, `30d`, `24h`, `3600s`

**Common Mistakes**:
- Too long (security risk, compromised token valid for too long)
- Too short (users logged out frequently, bad UX)
- Mismatched with session refresh strategy

---

### NEXTAUTH_SECRET

**Type**: String  
**Description**: NextAuth.js encryption key for sessions and CSRF tokens. Critical for Next.js OAuth flows.  
**Example Value**: (generated, never shared)  
**Required**: Yes (if using NextAuth)  
**Min Length**: 32 characters (recommended 64+)

**Where to Get It**:
- Generate: `openssl rand -base64 64`
- Store in secrets vault

**Common Mistakes**:
- Different from `JWT_SECRET` (can be same or different — recommended different for defense-in-depth)
- Too short
- Not rotated when compromised

---

### NEXTAUTH_URL

**Type**: String (URL)  
**Description**: Base URL for NextAuth.js OAuth callbacks. Must match OAuth provider config.  
**Example Value**: `https://wise2.net`  
**Required**: Yes (if using NextAuth)  
**Format**: `https://` (always) or `http://` (local only)

**Where to Get It**: Same as `APP_URL`

**Common Mistakes**:
- Different from `APP_URL` (causes OAuth redirect failures)
- Including path (should be domain only)
- Mismatch with OAuth provider's redirect URI config

---

### GOOGLE_CLIENT_ID

**Type**: String  
**Description**: Google OAuth 2.0 client ID. Enables "Sign in with Google" feature.  
**Example Value**: `1234567890.apps.googleusercontent.com`  
**Required**: Only if Google OAuth is enabled  

**Where to Get It**:
1. Google Cloud Console: https://console.cloud.google.com
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (type: Web application)
4. Add authorized redirect URIs:
   - `https://wise2.net/api/auth/callback/google`
   - `https://wise2.net/studio/api/auth/callback/google`
5. Copy Client ID

**Common Mistakes**:
- Redirect URI not registered (OAuth flow fails)
- Using Client Secret where Client ID expected
- Scope missing (must request `openid profile email`)

---

### GOOGLE_CLIENT_SECRET

**Type**: String  
**Description**: Google OAuth 2.0 client secret. Used by backend to verify OAuth flows.  
**Example Value**: (generated by Google, never share)  
**Required**: Only if Google OAuth is enabled  
**Security Level**: SECRET — backend only

**Where to Get It**: Google Cloud Console → Credentials → your OAuth app → Client Secret

**Common Mistakes**:
- Exposing in frontend code
- Committing to git
- Sharing in Slack/email

**If Compromised**: Regenerate in Google Cloud Console

---

## Google Integration

Google Workspace and Calendar integration for consulting/scheduling features.

### GOOGLE_CALENDAR_CLIENT_ID

**Type**: String  
**Description**: Google OAuth client ID specifically for Calendar API access.  
**Example Value**: `1234567890.apps.googleusercontent.com`  
**Required**: Only if Google Calendar is enabled  

**Where to Get It**: Same as `GOOGLE_CLIENT_ID` (can reuse if same OAuth app)

**Required Scopes**: 
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/calendar.events.readonly`

---

### GOOGLE_CALENDAR_CLIENT_SECRET

**Type**: String  
**Description**: Google OAuth client secret for Calendar API.  
**Example Value**: (generated by Google)  
**Required**: Only if Google Calendar is enabled  
**Security Level**: SECRET

**Where to Get It**: Same as `GOOGLE_CLIENT_SECRET`

---

### NEXT_PUBLIC_GOOGLE_CLIENT_ID

**Type**: String  
**Description**: Frontend-accessible Google client ID for browser-based OAuth flows.  
**Example Value**: `1234567890.apps.googleusercontent.com`  
**Required**: Only if Google sign-in is used in frontend  
**Note**: Prefix `NEXT_PUBLIC_` makes this visible to browser (safe — it's meant to be public)

---

### NEXT_PUBLIC_YOUTUBE_API_KEY

**Type**: String  
**Description**: YouTube Data API key for retrieving video metadata, playlists, channel info.  
**Example Value**: `AIzaSy...` (starts with `AIzaSy`)  
**Required**: Only if YouTube integration is enabled  
**Security Level**: Restricted key (restricted to YouTube API)

**Where to Get It**:
1. Google Cloud Console → APIs & Services → Credentials
2. Create an API key
3. Restrict to YouTube Data API v3
4. (Optional) Restrict to specific domains for web use

---

### NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

**Type**: String  
**Description**: YouTube channel ID for fetching uploads, playlists, analytics.  
**Example Value**: `UC1234567890AbCdEfGhIjKl`  
**Required**: Only if YouTube integration is enabled  

**Where to Get It**:
- Your YouTube channel: youtube.com/@yourchannel
- In URL or channel settings → About → Share channel

---

### NEXT_PUBLIC_YOUTUBE_CHANNEL_URL

**Type**: String (URL)  
**Description**: Public YouTube channel URL.  
**Example Value**: `https://www.youtube.com/@wise2`  
**Required**: Only if YouTube links are displayed  

---

### NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID

**Type**: String  
**Description**: YouTube playlist ID for featured videos.  
**Example Value**: `PLxxxxxxxxxxxxxx`  
**Required**: Only if playlists are featured  

---

### NEXT_PUBLIC_YOUTUBE_DEMO_VIDEO_ID

**Type**: String  
**Description**: YouTube video ID for demo/intro video.  
**Example Value**: `dQw4w9WgXcQ`  
**Required**: Only if demo video is displayed  

---

## Discord Integration

Discord bot and webhook configuration for notifications and community features.

### DISCORD_BOT_TOKEN

**Type**: String  
**Description**: Discord bot token for bot commands and interactions. Enables slash commands, message commands, etc.  
**Example Value**: (generated by Discord, never share)  
**Required**: Only if Discord bot is enabled  
**Security Level**: SECRET — backend only

**Where to Get It**:
1. Discord Developer Portal: https://discord.com/developers/applications
2. Create a new application
3. Bot → Add Bot
4. Copy Token (regenerate if exposed)

**Common Mistakes**:
- Exposing in git or logs
- Reusing old token after regeneration
- Bot not invited to test server

**If Compromised**: Regenerate immediately in Discord Developer Portal

---

### DISCORD_WEBHOOK_URL

**Type**: String (URL)  
**Description**: Webhook URL for general notifications (deployments, alerts, updates).  
**Example Value**: `https://discord.com/api/webhooks/123456789/ABCDefGhIjKlMnOpQrStUvWxYz...`  
**Required**: Only if Discord webhooks are enabled  
**Security Level**: SECRET (treat as password)

**Where to Get It**:
1. Discord server → Channel → Channel settings → Webhooks
2. Create Webhook
3. Copy full URL

**Common Mistakes**:
- Webhooks in public channels (notifies everyone)
- URL exposed in logs or Slack
- Using same webhook for multiple critical alerts (noisy)

---

### DISCORD_WEBHOOK_ALERTS

**Type**: String (URL)  
**Description**: Webhook for system alerts and errors (separate from general notifications).  
**Example Value**: `https://discord.com/api/webhooks/...`  
**Required**: Only if alert notifications are enabled  

---

### DISCORD_WEBHOOK_DEPLOYMENTS

**Type**: String (URL)  
**Description**: Webhook for deployment notifications (CI/CD pipeline events).  
**Example Value**: `https://discord.com/api/webhooks/...`  
**Required**: Only if deployment notifications are enabled  

---

### DISCORD_WEBHOOK_BUILDS

**Type**: String (URL)  
**Description**: Webhook for build status notifications.  
**Example Value**: `https://discord.com/api/webhooks/...`  
**Required**: Only if build notifications are enabled  

---

### DISCORD_CLIENT_ID

**Type**: String  
**Description**: Discord OAuth app ID for "Login with Discord" feature.  
**Example Value**: `123456789012345678`  
**Required**: Only if Discord OAuth is enabled  

**Where to Get It**: Discord Developer Portal → Application → General Information → Application ID

---

### DISCORD_CLIENT_SECRET

**Type**: String  
**Description**: Discord OAuth app secret. Used by backend for OAuth flow.  
**Example Value**: (generated by Discord)  
**Required**: Only if Discord OAuth is enabled  
**Security Level**: SECRET

**Where to Get It**: Discord Developer Portal → Application → OAuth2 → Client Secret

---

### DISCORD_REDIRECT_URI

**Type**: String (URL)  
**Description**: OAuth callback URL registered in Discord Developer Portal.  
**Example Value**: `https://wise2.net/api/auth/callback/discord`  
**Required**: Only if Discord OAuth is enabled  

**Must Match**: What's registered in Discord Developer Portal → OAuth2 → Redirects

---

### NEXT_PUBLIC_DISCORD_CLIENT_ID

**Type**: String  
**Description**: Frontend-accessible Discord client ID for browser OAuth flows.  
**Example Value**: `123456789012345678`  
**Required**: Only if Discord sign-in is in frontend  

---

### NEXT_PUBLIC_DISCORD_REDIRECT_URI

**Type**: String (URL)  
**Description**: Discord OAuth redirect URI visible to browser.  
**Example Value**: `https://wise2.net/api/auth/callback/discord`  
**Required**: Only if Discord sign-in is in frontend  

---

### NEXT_PUBLIC_DISCORD_SERVER_INVITE

**Type**: String (URL)  
**Description**: Invite link to Discord community server.  
**Example Value**: `https://discord.gg/wise2community`  
**Required**: Only if community link is displayed  

---

## AWS (Storage)

AWS configuration for file uploads, backups, media storage.

### AWS_ACCESS_KEY_ID

**Type**: String  
**Description**: AWS access key for programmatic access (S3, other services).  
**Example Value**: `AKIAIOSFODNN7EXAMPLE`  
**Required**: Only if AWS S3/other services are used  
**Security Level**: SECRET

**Where to Get It**:
1. AWS IAM Console: https://console.aws.amazon.com/iam/
2. Users → Select user → Security Credentials
3. Access Keys → Create Access Key
4. Copy Access Key ID

**Common Mistakes**:
- Using root account credentials (use IAM user instead)
- Key not restricted to specific services/buckets
- Committing to git
- Not rotating regularly

**If Compromised**: Delete immediately in IAM console and create new

---

### AWS_SECRET_ACCESS_KEY

**Type**: String  
**Description**: AWS secret access key (password for access key).  
**Example Value**: (generated by AWS, shown once)  
**Required**: Only if AWS services are used  
**Security Level**: SECRET

**Where to Get It**: AWS IAM → Users → Security Credentials (displayed only once)

**Common Mistakes**:
- Not saved when first generated (must recreate)
- Exposing in git or logs
- Using root credentials

---

### AWS_REGION

**Type**: String  
**Description**: AWS region for S3 bucket and other services.  
**Example Value**: `us-east-1`  
**Required**: Only if AWS services are used  
**Common Values**: `us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`

**Where to Get It**: AWS Console → S3 → Bucket → Properties → Region

---

### AWS_S3_BUCKET

**Type**: String  
**Description**: S3 bucket name for file uploads, media storage, backups.  
**Example Value**: `wise2-prod-media`  
**Required**: Only if S3 is used  
**Format**: Globally unique bucket name (lowercase, hyphens only)

**Where to Get It**: AWS S3 Console → Bucket name

**Common Mistakes**:
- Bucket doesn't exist (must create first)
- Bucket permissions not configured (access denied)
- Wrong region (bucket exists in different region)

---

## Monitoring & Logging

Observability configuration for production monitoring.

### LOG_LEVEL

**Type**: String  
**Description**: Application logging level. Controls verbosity of logs.  
**Example Value**: `info`  
**Required**: No (defaults to `info`)  
**Valid Values**: `error`, `warn`, `info`, `debug`

**Common Mistakes**:
- `debug` in production (massive log volume, performance impact)
- `error` in development (miss important warnings)
- Log level not changed across environments

---

### PROMETHEUS_PORT

**Type**: Number  
**Description**: Port for Prometheus metrics endpoint (if metrics are enabled).  
**Example Value**: `9090`  
**Required**: Only if Prometheus monitoring is enabled  

**Where to Get It**: Set to an available port on your server

---

### GRAFANA_PASSWORD

**Type**: String  
**Description**: Admin password for Grafana dashboard (if used).  
**Example Value**: (generated, never share)  
**Required**: Only if Grafana is deployed  
**Min Length**: 16 characters

**Where to Get It**: Generate secure password, store in secrets vault

---

## AI Providers

AI/LLM API configuration for AI features (Claude, GPT, etc.).

### ANTHROPIC_API_KEY

**Type**: String  
**Description**: Anthropic API key for Claude LLM features.  
**Example Value**: `sk-ant-...` (starts with `sk-ant-`)  
**Required**: Only if Claude features are enabled  
**Security Level**: SECRET

**Where to Get It**: Anthropic Console: https://console.anthropic.com/api-keys

**Common Mistakes**:
- Exposing in frontend (use backend proxy)
- Committing to git
- Rate limits exceeded (track usage)

---

## Security & CORS

Cross-Origin Resource Sharing and security configuration.

### CORS_ORIGIN

**Type**: String (comma-separated URLs)  
**Description**: Allowed origins for CORS requests. Controls which domains can call the API.  
**Example Value**: `https://wise2.net,https://www.wise2.net,https://studio.wise2.net`  
**Required**: Yes (if API is used from frontend)  
**Format**: Comma-separated list of full URLs

**Common Mistakes**:
- Allowing `*` (all origins) in production
- Missing `www` or subdomain variants
- Including path in CORS origin
- Different between apps (studio uses different domain)

**Recommended Setup**:
```
https://wise2.net,https://www.wise2.net,https://studio.wise2.net
```

---

### CORS_CREDENTIALS

**Type**: Boolean  
**Description**: Allow credentials (cookies, auth headers) in CORS requests.  
**Example Value**: `true`  
**Required**: No (defaults to `true`)  
**Valid Values**: `true`, `false`

**When to Use**:
- `true`: User is authenticated, cookies carry session
- `false`: Only unauthenticated API calls

---

## Rate Limiting

API rate limiting configuration for DDoS protection.

### RATE_LIMIT_WINDOW_MS

**Type**: Number  
**Description**: Time window for rate limit calculation (milliseconds).  
**Example Value**: `900000`  
**Required**: No (defaults to 15 minutes)  
**Common Values**: `60000` (1 min), `300000` (5 min), `900000` (15 min)

**15 minutes in milliseconds**: 15 * 60 * 1000 = 900,000

---

### RATE_LIMIT_MAX_REQUESTS

**Type**: Number  
**Description**: Maximum requests per window per IP/user.  
**Example Value**: `100`  
**Required**: No (defaults to 100)  

**Common Values**:
- `10` - Strict (for sensitive endpoints)
- `100` - Standard (general API)
- `1000` - Lenient (bulk operations)

---

## Optional Features

Feature flags and optional integrations.

### TRIAL_DAYS

**Type**: Number  
**Description**: Length of free trial for new users (days).  
**Example Value**: `14`  
**Required**: No (defaults to 14)  

---

### ENABLE_TRIALS

**Type**: Boolean  
**Description**: Enable/disable trial feature.  
**Example Value**: `true`  
**Required**: No (defaults to `true`)  
**Valid Values**: `true`, `false`

---

### DEPLOYMENT_ENVIRONMENT

**Type**: String  
**Description**: Named deployment environment.  
**Example Value**: `production`  
**Required**: No  
**Valid Values**: `production`, `staging`, `development`

---

### DEMO_MODE

**Type**: Boolean  
**Description**: Enable demo mode (restricted features, mock data).  
**Example Value**: `false`  
**Required**: No (defaults to `false`)  

---

## Setup Checklist

Complete this checklist to set up `.env.production` for your environment.

### Phase 1: Create File

- [ ] Copy template: `cp .env.production.example .env.production`
- [ ] Verify `.env.production` is in `.gitignore` (should be)
- [ ] Verify `.env.production` is not tracked by git

### Phase 2: Core Application

- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=3000`
- [ ] Set `API_PORT=3001`
- [ ] Set `APP_URL` to your domain (e.g., `https://wise2.net`)
- [ ] Set `API_BASE_URL` to your API domain (e.g., `https://api.wise2.net`)
- [ ] Set `NEXT_PUBLIC_API_URL` to same as `API_BASE_URL`

### Phase 3: Database

- [ ] Create PostgreSQL database (AWS RDS or self-hosted)
- [ ] Generate database password: `openssl rand -base64 32`
- [ ] Set `DATABASE_URL` connection string
- [ ] Set individual DB vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DATABASE_PASSWORD`
- [ ] Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Phase 4: Redis (Optional)

- [ ] (Skip if not using Redis)
- [ ] Set up Redis (AWS ElastiCache or self-hosted)
- [ ] Generate Redis password: `openssl rand -base64 32`
- [ ] Set `REDIS_URL`
- [ ] Test connection: `redis-cli -u $REDIS_URL ping`

### Phase 5: Authentication

- [ ] Generate `JWT_SECRET`: `openssl rand -base64 64`
- [ ] Generate `NEXTAUTH_SECRET`: `openssl rand -base64 64`
- [ ] Set `JWT_EXPIRY` (e.g., `7d`)
- [ ] Set `NEXTAUTH_URL` to `APP_URL`

### Phase 6: OAuth (Google)

- [ ] Create Google OAuth app (Google Cloud Console)
- [ ] Register redirect URIs:
  - `https://wise2.net/api/auth/callback/google`
  - `https://wise2.net/studio/api/auth/callback/google`
- [ ] Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] (Optional) Set up Google Calendar: `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`

### Phase 7: OAuth (Discord)

- [ ] Create Discord OAuth app (Discord Developer Portal)
- [ ] Register redirect URI: `https://wise2.net/api/auth/callback/discord`
- [ ] Set `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`
- [ ] Set `NEXT_PUBLIC_DISCORD_CLIENT_ID` and `NEXT_PUBLIC_DISCORD_REDIRECT_URI`
- [ ] Set `NEXT_PUBLIC_DISCORD_SERVER_INVITE` (Discord community link)

### Phase 8: Stripe (Payments)

- [ ] Get Stripe keys (live keys for production)
- [ ] Set `STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY` (use live keys)
- [ ] Create products and prices in Stripe dashboard
- [ ] Set price IDs: `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, etc.
- [ ] Create webhook endpoint: `POST https://api.wise2.net/webhooks/stripe`
- [ ] Set `STRIPE_WEBHOOK_SECRET` from webhook signing secret
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_SUCCESS_URL`, `NEXT_PUBLIC_STRIPE_CANCEL_URL`

### Phase 9: Email (SendGrid)

- [ ] Create SendGrid account and get API key
- [ ] Verify sender domain in SendGrid
- [ ] Set `SENDGRID_API_KEY`
- [ ] Set `SENDGRID_FROM_EMAIL` to verified sender
- [ ] (Optional) Set `SENDGRID_FROM_NAME`

### Phase 10: Discord Webhooks (Notifications)

- [ ] Create Discord server (or use existing)
- [ ] Create private channels for: notifications, alerts, deployments, builds
- [ ] Create webhooks for each channel
- [ ] Set webhook URLs: `DISCORD_WEBHOOK_URL`, `DISCORD_WEBHOOK_ALERTS`, `DISCORD_WEBHOOK_DEPLOYMENTS`, `DISCORD_WEBHOOK_BUILDS`

### Phase 11: AWS (Storage)

- [ ] (Skip if not using AWS)
- [ ] Create IAM user (not root account)
- [ ] Create access key for IAM user
- [ ] Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- [ ] Create S3 bucket
- [ ] Configure bucket policy (allow IAM user access)
- [ ] Set `AWS_REGION` and `AWS_S3_BUCKET`

### Phase 12: Monitoring

- [ ] Set `LOG_LEVEL=info` (or `debug` for staging)
- [ ] (Optional) Set up Prometheus/Grafana: `PROMETHEUS_PORT`, `GRAFANA_PASSWORD`

### Phase 13: Security

- [ ] Set `CORS_ORIGIN` to your domains only (not `*`)
- [ ] Set `CORS_CREDENTIALS=true`
- [ ] Set rate limiting: `RATE_LIMIT_WINDOW_MS=900000`, `RATE_LIMIT_MAX_REQUESTS=100`

### Phase 14: Features

- [ ] Set `TRIAL_DAYS=14`
- [ ] Set `ENABLE_TRIALS=true`
- [ ] Set `DEPLOYMENT_ENVIRONMENT=production`
- [ ] Set `DEMO_MODE=false`

### Phase 15: Deploy to Secrets Vault

- [ ] Upload `.env.production` to AWS Secrets Manager, HashiCorp Vault, or Docker Secrets
- [ ] Configure application to load from secrets vault (not .env file)
- [ ] Delete local `.env.production` file
- [ ] Verify file is not in git history: `git log --full-history --oneline -- .env.production`

### Phase 16: Rotate Credentials

- [ ] Set calendar reminder to rotate API keys every 90 days
- [ ] Document password reset procedures
- [ ] Test credential rotation in staging first

---

## Validation & Testing

Test each environment variable before deploying to production.

### 1. Load & Parse Test

```bash
# Check that .env.production loads without errors
node -e "require('dotenv').config({ path: '.env.production' }); console.log('✓ .env loaded')"
```

### 2. Core Application

```bash
# Verify ports are not in use
lsof -i :3000
lsof -i :3001

# Test app starts with configuration
PORT=3000 API_PORT=3001 NODE_ENV=production npm run build
npm run start
```

### 3. Database Connectivity

```bash
# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT version();"

# Within application (run migrations):
npm run db:migrate
```

### 4. Redis Connectivity

```bash
# Test Redis connection
redis-cli -u "$REDIS_URL" ping
# Expected: PONG
```

### 5. Stripe Keys

```bash
# Test Stripe secret key validity
curl https://api.stripe.com/v1/customers \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  -H "Content-Type: application/json"
# Should return customers list (not 401 Unauthorized)
```

### 6. SendGrid Email

```bash
# Test SendGrid API key
curl "https://api.sendgrid.com/v3/mail/send" \
  -X POST \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "'$SENDGRID_FROM_EMAIL'"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

### 7. Discord Webhook

```bash
# Test Discord webhook
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test notification from WISE²"}'
```

### 8. AWS S3

```bash
# Test S3 bucket access
aws s3 ls "s3://$AWS_S3_BUCKET/" \
  --region "$AWS_REGION" \
  --profile wise2
# Should list bucket contents
```

### 9. OAuth (Google)

```bash
# Test Google OAuth via browser
# Visit: https://wise2.net/api/auth/signin?callbackUrl=/dashboard
# Should redirect to Google login
# After login, should redirect back to app
```

### 10. CORS

```bash
# Test CORS headers
curl -X OPTIONS "https://api.wise2.net/health" \
  -H "Origin: https://wise2.net" \
  -H "Access-Control-Request-Method: GET" \
  -v
# Should include: Access-Control-Allow-Origin: https://wise2.net
```

### 11. Security Headers

```bash
# Verify security headers are present
curl -I https://api.wise2.net
# Should include: Strict-Transport-Security, X-Content-Type-Options, etc.
```

### 12. Application Health Check

```bash
# After deployment, test app health
curl https://api.wise2.net/health
# Expected response: {"status":"ok"} or similar
```

---

## Troubleshooting

Common issues and solutions.

### "Connection refused" on Database

**Symptoms**: 
- `Error: connect ECONNREFUSED 127.0.0.1:5432`
- Database connection timeout

**Causes**:
1. PostgreSQL server not running
2. Port mismatch (wrong port in connection string)
3. Wrong host (localhost vs. network address)
4. Firewall blocking connection

**Solutions**:
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Test connection directly
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1"

# Check firewall (AWS security groups)
# Allow inbound on port 5432 from app server IP
```

### "Invalid API key" Errors

**Symptoms**:
- Stripe: `Invalid API Key provided`
- SendGrid: `401 Unauthorized`
- Discord: `401: Unauthorized`

**Causes**:
1. Wrong key (test vs. live, reversed)
2. Key expired or revoked
3. Typo in key
4. Wrong format (missing prefix like `sk_live_`)

**Solutions**:
```bash
# Verify key format
echo $STRIPE_SECRET_KEY | grep "sk_live_"
# Should match

# Check key is still valid (regenerate if needed)
# Stripe Dashboard → API Keys → Check status
```

### OAuth Redirect URI Mismatch

**Symptoms**:
- "Redirect URI doesn't match" error
- OAuth loop (infinite redirect)

**Causes**:
1. Redirect URI not registered in OAuth provider
2. Mismatch in domain/protocol/path
3. `APP_URL` doesn't match registered domain

**Solutions**:
```bash
# Verify registered URIs in OAuth provider
# For Google: Google Cloud Console → OAuth 2.0 Credentials → Edit → Authorized redirect URIs

# Should match:
echo "Expected: https://$APP_URL/api/auth/callback/google"
echo "Registered in Google Cloud Console"
```

### CORS Errors

**Symptoms**:
- `Access to XMLHttpRequest from origin 'https://wise2.net' has been blocked by CORS policy`

**Causes**:
1. `CORS_ORIGIN` doesn't include requesting domain
2. Typo in domain
3. Missing scheme (`https://` vs `http://`)

**Solutions**:
```bash
# Check CORS_ORIGIN value
echo $CORS_ORIGIN

# Add domain if missing
CORS_ORIGIN="https://wise2.net,https://www.wise2.net"

# Verify header in response
curl -H "Origin: https://wise2.net" -v https://api.wise2.net/api/endpoint
# Should include: Access-Control-Allow-Origin header
```

### Memory Leaks (Node.js)

**Symptoms**:
- Process gets slower over time
- Crashes after running for hours

**Causes**:
1. Memory leak in application code
2. Unbounded cache growth
3. Too many open database connections

**Solutions**:
```bash
# Set memory limit for Node.js
NODE_OPTIONS="--max-old-space-size=512"

# Monitor memory usage
top -p $(pgrep -f "node")

# Check for connection leaks
# Add query: SELECT count(*) FROM pg_stat_activity;
```

### Rate Limit Too Aggressive

**Symptoms**:
- Legitimate users getting "Too Many Requests" (429)
- API feeling slow

**Causes**:
1. `RATE_LIMIT_MAX_REQUESTS` too low
2. Window too short
3. Not accounting for multiple users per IP (office networks)

**Solutions**:
```bash
# Increase limits
RATE_LIMIT_MAX_REQUESTS=500  # From 100
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour instead of 15 min

# Or use token-based rate limiting (more complex)
```

### Logs Not Appearing

**Symptoms**:
- No logs in output even though app is running

**Causes**:
1. `LOG_LEVEL` set too high (`error` when you need `info`)
2. Logs written to file (check log directory)
3. Logging service misconfigured

**Solutions**:
```bash
# Check log level
echo $LOG_LEVEL

# Lower log level for debugging
LOG_LEVEL=debug npm run start

# Check for log file
find . -name "*.log" | head -10
```

---

## Next Steps

1. **Use this guide to populate `.env.production`** with all required credentials
2. **Test each section** using the Validation & Testing section above
3. **Store `.env.production` in secrets vault** (AWS Secrets Manager, Vault, etc.)
4. **Configure application to load from vault** (not filesystem)
5. **Set up credential rotation** calendar reminder
6. **Document your specific overrides** (e.g., if you use Redis vs. in-memory cache)

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs/keys)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [SendGrid Email API](https://sendgrid.com/docs/for-developers/sending-email/authentication/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [OWASP Environment Variable Security](https://owasp.org/www-community/attacks/Environment_Variable)

---

**Last Updated**: 2026-07-23  
**Maintainer**: WISE² Infrastructure Team  
**For questions or updates**: Submit issue to repository

