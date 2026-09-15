# WISE² Discord Webhook Setup Guide

## Overview

Discord webhooks enable WISE² to send real-time notifications, metrics, and alerts to Discord channels.

## Prerequisites

1. Discord server with admin access
2. At least 2 channels:
   - `#gpt-responses` — For GPT responses and AI notifications
   - `#system-notifications` — For system alerts and metrics

## Setup Steps

### Step 1: Create Discord Webhook URLs

For each channel, create a webhook:

1. Open Discord → Right-click channel → Edit Channel
2. Go to Integrations → Webhooks
3. Click "Create Webhook"
4. Give it a name (e.g., "WISE² GPT Bot" for #gpt-responses)
5. Copy the webhook URL (looks like: `https://discord.com/api/webhooks/1234567890/abcdefg...`)
6. Repeat for each channel

### Step 2: Configure Environment Variables on VPS

SSH into the VPS and update `.env`:

```bash
ssh dwise@173.208.147.165

# Edit .env file
nano /home/dwise/.env

# Add or update these lines:
DISCORD_GPT_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE
DISCORD_NOTIFICATIONS_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Step 3: Restart API Service

```bash
docker restart wise2-api
```

### Step 4: Test Webhooks

Send a test message:

```bash
curl -X POST https://api.wise2.net/api/command-center/discord/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"message": "Test notification from WISE²"}'
```

Or test from the dashboard GPT widget (when using GPT features).

## Webhook URLs by Purpose

| Purpose | Channel | Environment Variable | Use Case |
|---------|---------|----------------------|----------|
| **GPT Responses** | #gpt-responses | `DISCORD_GPT_WEBHOOK` | AI recommendations, insights |
| **System Notifications** | #system-notifications | `DISCORD_NOTIFICATIONS_WEBHOOK` | Alerts, metrics updates, errors |

## Message Format

Webhooks send rich embeds with:
- Color-coded status (🟢 success, 🟡 warning, 🔴 error)
- Embedded metrics and data
- Formatted text with markdown
- Timestamps and source attribution

Example message:
```
[WISE² GPT Bot] 
Revenue Report
Today: $4,230
Month to Date: $87,450
Status: ✅ On Track
```

## Testing Checklist

- [ ] Webhook URLs created in Discord
- [ ] Environment variables set on VPS
- [ ] API service restarted
- [ ] Test message received in Discord
- [ ] Message formatting looks correct
- [ ] Multiple messages don't cause errors

## Troubleshooting

### "Missing Permissions" Error
- Verify webhook has the correct channel
- Check Discord role permissions
- Regenerate webhook if issues persist

### Messages Not Appearing
- Verify webhook URL is correct
- Check API logs: `docker logs wise2-api | grep -i discord`
- Ensure channel is not muted/archived
- Test webhook directly with curl command

### Rate Limiting
- Discord allows ~30 messages per minute per webhook
- Monitor for "429 Too Many Requests" errors
- Batch related notifications into single messages

## Dashboard Integration

Once configured, the dashboard will show:
- ✅ Discord connection status
- 📊 Webhook activity metrics
- 📝 Message send history
- ⚙️ Webhook URL management

## Advanced: Custom Embed Format

To customize webhook message embeds, edit:

```
packages/api/src/webhooks/gpt-discord.service.ts
```

Example:
```typescript
const embed = {
  title: "Custom Title",
  description: "Custom description",
  color: 0x3498db,  // Blue
  fields: [
    { name: "Field 1", value: "Value 1", inline: true },
    { name: "Field 2", value: "Value 2", inline: true }
  ],
  footer: { text: "WISE² Command Center" },
  timestamp: new Date().toISOString()
};
```

## Commands for Discord Bot Integration

Once webhooks are active, these commands become available:

### View Commands
```
/wise2 status         — Real-time system status
/wise2 revenue        — Today's revenue metrics
/wise2 jobs           — Active jobs list
/wise2 recommendations — AI recommendations
```

### Action Commands
```
/wise2 alert <message>  — Send custom alert
/wise2 notify <channel> — Test webhook to channel
```

## Need Help?

- Check logs: `docker logs wise2-api | tail -50`
- Verify webhook status: Dashboard → Settings → Integrations
- Review API docs: https://api.wise2.net/api-docs

---

**Last Updated**: 2026-09-15  
**Status**: Ready for Configuration
