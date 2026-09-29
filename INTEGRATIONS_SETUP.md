# WISE² Discord Bot - Integrations Setup Guide

**Status**: ✅ All integrations ready  
**Version**: 1.0  
**Date**: 2026-07-21

---

## 📋 Integrations Available

Your WISE² Discord bot now includes **7 major integrations**:

1. **GitHub Integration**
2. **CI/CD Integration (GitHub Actions)**
3. **Error Tracking**
4. **Calendar Integration**
5. **Deployment Notifications**
6. **Analytics Dashboard**
7. **Automated Daily Standup**

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install express cron node-cron
```

### 2. Add Webhook Handler to Bot

Update your main `index.js`:

```javascript
const express = require("express");
const webhookHandler = require("./webhook-handler");

const app = express();
app.use("/webhooks", webhookHandler);

app.listen(3000, () => {
  console.log("✅ Webhook server running on port 3000");
});
```

### 3. Initialize Scheduled Tasks

In your bot startup code:

```javascript
const { initializeScheduledTasks } = require("./scheduled-tasks");

// After Discord client is ready
client.on("ready", () => {
  console.log("✅ Bot logged in");
  initializeScheduledTasks();
});
```

---

## 🔗 Integration Configuration

### GitHub Integration

**Setup:**
1. Go to your GitHub repo → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/webhooks/github`
3. Secret: Set `GITHUB_WEBHOOK_SECRET` in `.env`
4. Events to trigger:
   - ✅ Pushes
   - ✅ Pull requests
   - ✅ Releases

**What it does:**
- Posts commits to #deployments
- Notifies on PR opened/closed
- Announces releases

**Environment Variables:**
```
GITHUB_WEBHOOK_SECRET=your-webhook-secret-here
```

---

### CI/CD Integration (GitHub Actions)

**Setup:**
1. Add to your GitHub Actions workflow:

```yaml
- name: Discord Notification
  uses: sarisia/actions-status-discord@v1
  if: always()
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK_CI_CD }}
    status: ${{ job.status }}
```

2. Add secret: `DISCORD_WEBHOOK_CI_CD` = your #builds webhook URL

**What it does:**
- Posts build status to #builds
- Shows test results
- Tracks build duration

---

### Error Tracking Integration

**Usage in your code:**

```javascript
const { ErrorTrackingIntegration } = require("./integrations");

try {
  // Your code
} catch (error) {
  await ErrorTrackingIntegration.logError({
    message: error.message,
    service: "api-gateway",
    level: "error",
    stack: error.stack,
  });
}
```

**What it does:**
- Posts errors to #alerts
- Shows stack traces
- Tracks error severity

---

### Calendar Integration

**Usage:**

```javascript
const { CalendarIntegration } = require("./integrations");

await CalendarIntegration.postMeeting({
  title: "WISE² Sprint Planning",
  time: "2:00 PM UTC",
  organizer: "Product Team",
  description: "Weekly sprint planning and review",
});
```

**What it does:**
- Posts upcoming meetings to #status
- Sends reminders 30 mins before
- Tracks team events

---

### Deployment Notifications

**Usage:**

```javascript
const { DeploymentIntegration } = require("./integrations");

await DeploymentIntegration.notifyDeployment({
  service: "api-gateway",
  environment: "production",
  version: "v2.1.0",
  status: "successful",
  duration: "3m 42s",
});
```

**What it does:**
- Posts deployments to #deployments
- Shows version info
- Tracks deployment status

---

### Analytics Dashboard

**Automatic daily posting** (10:00 AM UTC)

**Metrics tracked:**
- Uptime percentage
- API calls/day
- Error count
- Active users
- Average response time

**Posts to:** #status

---

### Automated Daily Standup

**Automatic daily posting** (9:00 AM UTC)

**Reads from:** `data/daily-logs/{date}.md`

**Posts to:** #daily-sync

**Format:**
- Completed items
- In-progress items
- Blockers

---

## 📡 Webhook Endpoints

Your bot server exposes these endpoints:

```
POST /webhooks/github           → GitHub push/PR/release events
POST /webhooks/ci-cd            → GitHub Actions workflow results
POST /webhooks/errors           → Error tracking
POST /webhooks/deployments      → Deployment notifications
GET  /webhooks/health           → Health check
```

---

## ⏰ Scheduled Tasks

| Task | Schedule | Channel | Details |
|------|----------|---------|---------|
| Daily Standup | 9:00 AM UTC | #daily-sync | Reads daily log |
| Daily Analytics | 10:00 AM UTC | #status | Posts metrics |
| Meeting Reminders | 9:30 AM M/W/F | #status | 30 min before standup |
| Weekly Summary | 5:00 PM Friday | logs | Generates summary |

---

## 🔐 Security

**Webhook Verification:**
- GitHub webhooks are signed with `GITHUB_WEBHOOK_SECRET`
- All endpoints validate incoming data
- Use HTTPS for all webhook URLs

**Environment Variables:**
```bash
GITHUB_WEBHOOK_SECRET=your-secret
DISCORD_WEBHOOK_DEPLOYMENTS=https://...
DISCORD_WEBHOOK_ALERTS=https://...
DISCORD_WEBHOOK_BUILDS=https://...
DISCORD_WEBHOOK_DECISIONS=https://...
DISCORD_WEBHOOK_DAILY_SYNC=https://...
DISCORD_WEBHOOK_STATUS=https://...
```

---

## 🧪 Testing Integrations

### Test GitHub Integration

```bash
curl -X POST https://your-domain.com/webhooks/github \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","commits":[{"message":"test commit"}]}'
```

### Test Error Tracking

```bash
curl -X POST https://your-domain.com/webhooks/errors \
  -H "Content-Type: application/json" \
  -d '{"message":"Test error","service":"api","level":"error","stack":"error"}'
```

### Test Deployments

```bash
curl -X POST https://your-domain.com/webhooks/deployments \
  -H "Content-Type: application/json" \
  -d '{"service":"api","environment":"prod","version":"v1.0","status":"success"}'
```

---

## 📚 Files Structure

```
services/bot/
├── index.js                    # Main bot file
├── integrations.js             # Integration classes
├── webhook-handler.js          # Webhook endpoints
├── scheduled-tasks.js          # Cron jobs
├── .env                        # Webhook URLs & secrets
└── logs/
    ├── bot-out.log
    └── bot-error.log
```

---

## 🐛 Troubleshooting

### Webhooks not posting
1. Check webhook URL in `.env`
2. Verify Discord permissions
3. Check logs: `pm2 logs wise2-bot`

### Scheduled tasks not running
1. Check cron syntax
2. Verify timezone (UTC)
3. Restart bot: `pm2 restart wise2-bot`

### Integration errors
1. Check error logs
2. Verify environment variables
3. Test webhook manually

---

## 🚀 Next Steps

1. ✅ Configure GitHub webhook URL
2. ✅ Set up GitHub Actions workflow
3. ✅ Add error tracking to your services
4. ✅ Enable calendar integration
5. ✅ Monitor #status and #deployments channels

---

**Status**: ✅ All integrations ready for production  
**Maintained by**: WISE² Core Team  
**Last Updated**: 2026-07-21
