# Discord Bot Deployment Guide

This guide covers deploying the WISE² Discord bot to various hosting platforms.

## Phase A: Replit (MVP - Free Tier)

### Quick Setup (5 minutes)

1. **Create Replit Account**
   - Go to [replit.com](https://replit.com)
   - Sign up or log in

2. **Import Project**
   - Click "Create" → "Import from GitHub"
   - Repository: `dwise03/wise2-core`
   - Language: Node.js

3. **Configure Secrets**
   - Click "Secrets" (lock icon on left sidebar)
   - Add each environment variable from `.env`:
     ```
     DISCORD_BOT_TOKEN=your_token
     DISCORD_CLIENT_ID=your_id
     DISCORD_CLIENT_SECRET=your_secret
     DISCORD_GUILD_ID=your_guild
     DISCORD_WEBHOOK_DEPLOYMENTS=https://...
     ... (all 6 webhooks)
     ```

4. **Run Bot**
   - Open Shell (bottom of Replit)
   - Run: `cd services/bot && npm install && npm start`
   - Bot should come online in Discord

### Keeping Bot Running 24/7

Replit free tier hibernates after 1 hour of inactivity. For persistent bot:

**Option A: Replit Paid ($7/month)**
- Go to account settings → Plan
- Upgrade to "Starter" for "Always On"

**Option B: Uptime Monitor (Free)**
- Use [uptimerobot.com](https://uptimerobot.com)
- Create HTTP monitor to ping bot health endpoint every 5 min
- Prevents hibernation

**Option C: Modal (Free Forever)**
- Alternative platform: [modal.com](https://modal.com)
- Better for long-running processes
- 100 hours/month free

### Replit Advantages
- ✅ Zero setup, automatic restart
- ✅ Free tier sufficient for MVP
- ✅ Easy secret management
- ✅ Quick iteration for development
- ❌ Hibernates on free tier
- ❌ Limited compute resources

---

## Phase B: Docker (Production - wise2.net)

### Docker Setup

Bot includes `Dockerfile` for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
```

### Build Docker Image

```bash
cd services/bot
docker build -t wise2-bot:latest .
```

### Run Container

```bash
docker run -d \
  --name wise2-bot \
  --restart always \
  --env-file .env.prod \
  wise2-bot:latest
```

### Docker Compose Setup

Add to root `docker-compose.prod.yml`:

```yaml
services:
  bot:
    build:
      context: services/bot
      dockerfile: Dockerfile
    container_name: wise2-bot
    restart: always
    env_file: services/bot/.env.prod
    depends_on:
      - api
    networks:
      - wise2-network
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

networks:
  wise2-network:
    driver: bridge
```

### Deploy to 173.208.147.165

```bash
# SSH to server
ssh dwise@173.208.147.165

# Navigate to project
cd /home/dwise/wise2-core

# Pull latest changes
git pull origin main

# Build and run
docker-compose -f docker-compose.prod.yml up -d bot

# Check logs
docker-compose logs -f bot
```

---

## Phase C: PM2 (Process Manager)

For managing bot as system process:

### Install PM2

```bash
npm install -g pm2
```

### Create Ecosystem Config

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "wise2-bot",
      script: "index.js",
      cwd: "./services/bot",
      env: {
        NODE_ENV: "production"
      },
      env_production: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/bot-error.log",
      out_file: "./logs/bot-out.log",
      watch: false,
      ignore_watch: ["node_modules", "logs", ".env"]
    }
  ]
};
```

### Start Bot

```bash
# Start
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs wise2-bot

# Save PM2 config to auto-start on boot
pm2 startup
pm2 save
```

---

## Health Monitoring

### Uptime Robot Setup (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create account and log in
3. Add HTTP monitor:
   - URL: `http://your-bot-url/health` (future endpoint)
   - Interval: 5 minutes
   - Notifications: email/Slack

### Discord Health Check

Bot sends startup ping to #status channel on boot. Check if message appears to verify bot is running.

### Log Monitoring

**Local**: `pm2 logs wise2-bot`

**Docker**: `docker-compose logs -f bot`

**Replit**: Check console output directly

---

## Environment Configuration by Platform

### Replit (.env in Replit Secrets)
```
All variables loaded from Secrets UI
```

### Docker (`.env.prod`)
```bash
# Copy template
cp .env.example .env.prod

# Edit with production values
vim .env.prod
```

### Local Development (`.env`)
```bash
# Copy template
cp .env.example .env

# Edit with test values
vim .env
```

---

## Scaling Strategy

### Phase A: Single Instance (Current)
- 1 bot instance on Replit/Modal
- Sufficient for MVP
- No persistence

### Phase B: High Availability (Q3 2026)
- Bot cluster on Docker Swarm
- Persistent Redis for state
- Load balancer in front
- Automatic failover

### Phase C: Distributed (Q4 2026)
- Kubernetes deployment
- Multiple replicas
- Horizontal scaling
- Prometheus monitoring

---

## Common Issues

### Bot offline after deploy

**Check logs**:
- Replit: View console output
- Docker: `docker-compose logs bot`
- PM2: `pm2 logs wise2-bot`

**Common causes**:
- Invalid `DISCORD_BOT_TOKEN`
- Missing `DISCORD_GUILD_ID`
- Bot not invited to server
- Gateway intents not enabled

### Commands not responding

- Check bot token is valid
- Verify slash commands deployed: bot logs should show ✅ confirmation
- Check bot has permission to send messages in channel

### Webhook errors

- Verify webhook URLs in `.env` are complete
- Check webhooks still exist in Discord (Settings > Webhooks)
- Verify bot permissions include "Manage Webhooks"

---

## Backup & Recovery

### Database State

Currently stateless (reads from data/ directory only).

Future: Add Redis for state persistence.

### Configuration Backup

```bash
# Backup .env (DO NOT commit to git)
cp services/bot/.env services/bot/.env.backup

# Backup logs
cp -r logs/ logs.backup/
```

### Disaster Recovery

If bot crashes:

1. **Check logs** for error cause
2. **Fix issue** (token expired, webhook deleted, etc.)
3. **Restart bot**:
   - Replit: Click "Run" button
   - Docker: `docker-compose restart bot`
   - PM2: `pm2 restart wise2-bot`

---

## Cost Analysis

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Replit Free** | $0 | No setup, easy | Hibernates |
| **Replit Paid** | $7/mo | Always on | Pay monthly |
| **Modal** | $0-10 | 100h free | Limited free tier |
| **Docker (self-hosted)** | $5-20/mo | Full control | Maintenance |
| **Railway** | $5+/mo | Simple deploy | Limited free tier |

**Recommendation**: Start with Replit free + Uptime Robot, migrate to self-hosted Docker on wise2.net by end of Q3 2026.

---

## Next Steps

1. Deploy bot to Replit (Phase A MVP)
2. Test all 7 commands
3. Verify webhook delivery to all 6 channels
4. Monitor for 1 week
5. Plan Phase B (OAuth + advanced features)

See README.md for command reference and CLAUDE.md for operational philosophy.
