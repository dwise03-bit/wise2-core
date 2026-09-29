# Telnyx Production Setup Guide

**Status:** ✅ Code deployed to wise2.net  
**Date:** 2026-09-13  
**Endpoint:** `POST https://wise2.net/api/webhooks/telnyx/events`

---

## Overview

This guide walks through configuring Telnyx integration on the WISE² production environment. The code is already deployed; this configures the credentials and webhooks.

### What's Deployed

- **Telnyx Provider** — `packages/ai-phone/src/telnyx-provider.ts`
- **NestJS Webhook Controller** — `packages/api/src/webhooks/telnyx.controller.ts`
- **Call Orchestration Service** — `packages/api/src/webhooks/telnyx.service.ts`
- **Google Voice Support** — Preserved alongside Telnyx (dual-provider)

---

## Quick Setup (Automated)

### Option A: Automated Script (Recommended)

On the production VPS as `dwise`:

```bash
cd /home/dwise/wise2-core
bash scripts/deploy-telnyx-production.sh
```

The script will prompt for:
1. Telnyx API Key
2. Telnyx Phone Number
3. Telnyx Webhook Secret
4. Telnyx Connection ID
5. Google Voice credentials (optional)

Then it will:
- Update `.env` file
- Pull latest code
- Restart API container
- Verify webhook endpoint

---

## Manual Setup

If you prefer manual configuration:

### Step 1: SSH to Production

```bash
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
```

### Step 2: Get Telnyx Credentials

From **https://console.telnyx.com**:

1. **API Key** → Account Settings → API Keys → Copy your key
2. **Phone Number** → Phone Numbers → Your assigned number (format: +1234567890)
3. **Webhook Secret** → Webhooks → Security tab → Copy shared secret
4. **Connection ID** → Call Control → Connections → Your connection UUID

### Step 3: Update Environment

```bash
# Edit .env (or create if doesn't exist)
nano /home/dwise/.env

# Add these lines:
TELNYX_API_KEY=your_key_here
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_WEBHOOK_SECRET=your_secret_here
TELNYX_CONNECTION_ID=your_connection_id_here
TELNYX_API_URL=https://api.telnyx.com/v2
```

### Step 4: Restart API

```bash
cd /home/dwise/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml restart api
```

### Step 5: Verify

```bash
# Check API is running
curl http://localhost:3010/api/health

# Or via HTTPS
curl https://wise2.net/api/health
```

---

## Configure Telnyx Webhook

In **Telnyx Console**:

1. Go to **Webhooks** section
2. Set URL to:
   ```
   https://wise2.net/api/webhooks/telnyx/events
   ```
3. Select events to receive:
   - `call.initiated`
   - `call.answered`
   - `call.hangup`
   - `call.failed`
4. Save

---

## Testing

### Test Webhook Delivery

In Telnyx Console → Webhooks section:
1. Click "Send Test Event"
2. Should see **200 OK** response

### Test Inbound Call

1. From another phone, call your Telnyx number
2. Watch **Telnyx Console** for incoming call events
3. Webhook should POST to `https://wise2.net/api/webhooks/telnyx/events`

### Verify in Browser

On Mac Chrome:

1. Open **https://wise2.net**
2. Press **F12** (DevTools)
3. Go to **Network** tab
4. Make test call
5. Look for POST to `/api/webhooks/telnyx/events`
6. Should return **200 OK**

---

## Environment Variables Reference

### Required (Telnyx)

| Variable | Description | Example |
|----------|-------------|---------|
| `TELNYX_API_KEY` | Your Telnyx API key | `KEY_xxxxx` |
| `TELNYX_PHONE_NUMBER` | Phone number to receive calls | `+1234567890` |
| `TELNYX_WEBHOOK_SECRET` | Webhook security secret | `secret_xxxxx` |
| `TELNYX_CONNECTION_ID` | Call Control connection ID | `uuid-here` |

### Optional (Telnyx)

| Variable | Default | Description |
|----------|---------|-------------|
| `TELNYX_API_URL` | `https://api.telnyx.com/v2` | Telnyx API endpoint |

### Optional (Google Voice)

| Variable | Description |
|----------|-------------|
| `GOOGLE_PROJECT_ID` | Google Cloud Project ID |
| `GOOGLE_PHONE_NUMBER` | Google Voice number |
| `GOOGLE_PRIVATE_KEY` | Service account private key |
| `GOOGLE_CLIENT_EMAIL` | Service account email |

---

## Troubleshooting

### API won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Webhook not receiving events

1. Verify webhook URL in Telnyx Console is correct
2. Check Telnyx Console → Webhooks → Delivery logs
3. Ensure `TELNYX_WEBHOOK_SECRET` is correct
4. Try "Send Test Event" in Telnyx Console

### Connection refused

```bash
# Verify API container is running
docker ps | grep wise2-api

# Check if API is listening on port 3010
curl http://localhost:3010/api/health
```

### 502 Bad Gateway from nginx

```bash
# Check nginx logs
docker logs nginx  # if using nginx container
# or
tail -f /var/log/nginx/error.log  # if using system nginx

# Restart API
docker-compose -f docker-compose.prod.yml restart api
```

---

## File Locations

- **Production compose:** `/home/dwise/wise2-core/docker-compose.prod.yml`
- **Environment file:** `/home/dwise/.env`
- **Deployment script:** `/home/dwise/wise2-core/scripts/deploy-telnyx-production.sh`
- **API source:** `/home/dwise/wise2-core/packages/api/src/webhooks/`

---

## Verification Checklist

- [ ] Telnyx credentials in `.env`
- [ ] API container restarted
- [ ] `curl https://wise2.net/api/health` returns 200
- [ ] Webhook URL configured in Telnyx Console
- [ ] Test event sent from Telnyx Console (200 response)
- [ ] Inbound test call made and received
- [ ] Call events visible in Telnyx Console delivery logs
- [ ] Chrome DevTools Network tab shows POST to `/api/webhooks/telnyx/events`

---

## Next Steps

1. Configure webhook URL in Telnyx Console
2. Make test inbound call
3. Monitor webhook delivery in Telnyx Console
4. Test end-to-end call flow with real Telnyx account

For questions or issues, check the webhook controller at `packages/api/src/webhooks/telnyx.controller.ts`.
