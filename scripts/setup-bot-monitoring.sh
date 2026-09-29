#!/bin/bash

# Setup Discord Bot Monitoring
# Configures health checks, alerting, and usage tracking
# Usage: ./setup-bot-monitoring.sh [--webhook <url>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up Discord Bot Monitoring..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create necessary directories
echo "1️⃣  Creating log directories..."
mkdir -p "$PROJECT_ROOT/data/logs/health-checks"
mkdir -p "$PROJECT_ROOT/data/logs/discord-usage"
echo "   ✅ Directories created"
echo ""

# Parse arguments
WEBHOOK_URL=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --webhook) WEBHOOK_URL="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# Save webhook URL if provided
if [ -n "$WEBHOOK_URL" ]; then
  echo "2️⃣  Configuring alert webhook..."
  echo "DISCORD_HEALTH_WEBHOOK=$WEBHOOK_URL" > "$PROJECT_ROOT/.env.monitoring"
  echo "   ✅ Webhook configured"
  echo ""
fi

# Create PM2 cron job for health checks
echo "3️⃣  Setting up PM2 monitoring..."

# Create PM2 config for health checks
cat > "$PROJECT_ROOT/pm2-monitor-config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'wise-discord',
      script: './services/wise-discord/bot.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      error_file: './data/logs/discord-error.log',
      out_file: './data/logs/discord-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      ignore_watch: ['node_modules', 'data', '.git'],
      env: {
        NODE_ENV: 'production'
      },
      cron_restart: '0 0 * * *',  // Daily restart at midnight
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'dwise',
      host: '173.208.147.165',
      ref: 'origin/main',
      repo: 'https://github.com/dwise/wise2-core.git',
      path: '/home/dwise/wise2-core',
      'post-deploy': 'npm install && npm start'
    }
  }
};
EOF

echo "   ✅ PM2 config created"
echo ""

# Create systemd timer for health checks (on Linux)
if command -v systemctl &> /dev/null; then
  echo "4️⃣  Setting up systemd health check timer..."

  # Create service file
  sudo tee /etc/systemd/system/wise-discord-health-check.service > /dev/null << EOF
[Unit]
Description=WISE² Discord Bot Health Check
After=network.target

[Service]
Type=oneshot
User=dwise
WorkingDirectory=$PROJECT_ROOT
ExecStart=$SCRIPT_DIR/bot-health-check.sh --alert-webhook ${WEBHOOK_URL}
StandardOutput=journal
StandardError=journal
EOF

  # Create timer file
  sudo tee /etc/systemd/system/wise-discord-health-check.timer > /dev/null << EOF
[Unit]
Description=WISE² Discord Bot Health Check Timer
Requires=wise-discord-health-check.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=15min
AccuracySec=1min

[Install]
WantedBy=timers.target
EOF

  # Enable and start timer
  sudo systemctl daemon-reload
  sudo systemctl enable wise-discord-health-check.timer
  sudo systemctl start wise-discord-health-check.timer

  echo "   ✅ Systemd timer configured"
  echo "   ✅ Health checks will run every 15 minutes"
  echo ""
else
  echo "4️⃣  ⏭️  Skipping systemd setup (not on Linux)"
  echo "   (Use cron instead on macOS)"
  echo ""
fi

# Setup cron job for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "4️⃣  Setting up macOS cron job..."

  # Create crontab entry
  cron_entry="*/15 * * * * $SCRIPT_DIR/bot-health-check.sh --quiet --alert-webhook ${WEBHOOK_URL}"

  # Add to crontab (if not already present)
  (crontab -l 2>/dev/null | grep -v "bot-health-check" | cat; echo "$cron_entry") | crontab -

  echo "   ✅ Cron job configured"
  echo "   ✅ Health checks will run every 15 minutes"
  echo ""
fi

# Create dashboard README
cat > "$PROJECT_ROOT/MONITORING_SETUP.md" << 'EOF'
# Discord Bot Monitoring Setup

This directory contains monitoring infrastructure for the WISE² Discord bot.

## What's Included

### 1. Health Check Script (`scripts/bot-health-check.sh`)
- Tests bot process status
- Checks memory usage
- Monitors uptime
- Detects errors in logs
- Verifies Discord connectivity
- Generates JSON reports

**Run manually:**
```bash
./scripts/bot-health-check.sh

# With alerts enabled:
./scripts/bot-health-check.sh --alert-webhook <webhook-url>

# Quiet mode (for cron):
./scripts/bot-health-check.sh --quiet --alert-webhook <webhook-url>
```

### 2. Usage Tracking (`services/wise-discord/monitoring/usage-tracker.js`)
- Tracks command usage
- Records response times
- Monitors user activity
- Logs errors
- Generates statistics

**Integrated with bot** - tracks automatically when bot processes commands.

### 3. Automated Monitoring

**On Linux:**
- Systemd timer runs health checks every 15 minutes
- Service: `wise-discord-health-check.service`
- Timer: `wise-discord-health-check.timer`

**On macOS:**
- Cron job runs health checks every 15 minutes
- Edit with: `crontab -e`

## Health Check Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Memory | <300MB | 300-500MB | >500MB |
| Uptime | Running | Running | Crashed |
| Errors | None | <5 | >5 |
| Discord | Connected | Unknown | Offline |

## Alert Webhook

Configure alerts by setting `DISCORD_HEALTH_WEBHOOK` in `.env`:

```bash
DISCORD_HEALTH_WEBHOOK=https://discord.com/api/webhooks/...
```

Alerts are sent to Discord when:
- Bot process crashes
- Memory exceeds 500MB
- Multiple errors detected
- Discord connection fails

## Logs

Health check reports are saved to:
- `data/logs/health-checks/YYYY-MM-DD.json`

Usage tracking logs:
- `data/logs/discord-usage/YYYY-MM-DD.jsonl` (one entry per line)

## Viewing Reports

### Current Session Stats
```bash
# In Discord bot code:
const tracker = new UsageTracker();
const stats = tracker.getStats();
console.log(stats);
```

### Daily Reports
```bash
cat data/logs/health-checks/2026-09-16.json | jq .
```

### Usage Analysis
```bash
# Count commands today
wc -l data/logs/discord-usage/$(date +%Y-%m-%d).jsonl

# Show all commands from today
cat data/logs/discord-usage/$(date +%Y-%m-%d).jsonl | jq .command
```

## Commands

```bash
# Run health check manually
./scripts/bot-health-check.sh

# Check bot status via PM2
pm2 status wise-discord

# View bot logs
pm2 logs wise-discord

# Restart bot
pm2 restart wise-discord

# View systemd status (Linux)
sudo systemctl status wise-discord-health-check.timer
sudo systemctl status wise-discord-health-check.service

# View cron logs (macOS)
log stream --predicate 'process == "cron"'

# View last health check report
tail data/logs/health-checks/*.json
```

## Integration with Dashboard

The health check reports can be displayed in a web dashboard:

```javascript
// Load latest report
const report = JSON.parse(fs.readFileSync('data/logs/health-checks/2026-09-16.json'));

// Display in web UI
console.log(`Bot Health: ${report.health_percentage}%`);
console.log(`Memory: ${report.memory_mb}MB`);
console.log(`Status: ${report.bot_status}`);
```

## Troubleshooting

### Alerts not sending
1. Verify webhook URL is correct: `echo $DISCORD_HEALTH_WEBHOOK`
2. Check webhook hasn't expired
3. Verify Discord channel permissions

### Cron job not running
1. Check crontab: `crontab -l`
2. Check system logs: `log stream --predicate 'process == "cron"'`
3. Verify script is executable: `chmod +x scripts/bot-health-check.sh`

### Health checks showing offline
1. Check bot status: `pm2 status`
2. Restart bot: `pm2 restart wise-discord`
3. View logs: `pm2 logs wise-discord`

---

**Setup Date**: 2026-09-16
**Bot**: WISE² Discord v2.0
**Monitors**: Health, Performance, Usage, Errors
EOF

echo "5️⃣  Documentation created"
echo "   📖 See MONITORING_SETUP.md for details"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Monitoring setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure Discord webhook (optional)"
echo "   2. Run manual test: ./scripts/bot-health-check.sh"
echo "   3. Check reports: tail data/logs/health-checks/*.json"
echo "   4. Deploy bot: pm2 start services/wise-discord/bot.js"
echo ""
echo "📚 Full documentation: MONITORING_SETUP.md"
