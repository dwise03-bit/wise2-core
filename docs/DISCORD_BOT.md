# WISE² Discord Bot Integration

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: 2026-09-12

## Overview

The WISE² Discord Bot provides a seamless interface for Discord users to interact with WISE² Intent Management Platform (IMP). Users can:

- Submit intents via slash commands
- Receive real-time responses with rich embeds
- Approve/deny confirmation requests with buttons
- Monitor WISE² health and status
- Automate workflows through Discord

## Architecture

```
Discord User
    ↓
[Slash Command or Message]
    ↓
Discord Bot Service (Port 9003)
    ↓
Intent Classification
    ↓
WISE² IMP Service (Port 9002)
    ↓
Risk Assessment & Authorization
    ↓
[Confirmation Required?]
    ├─ Yes → Send Rich Embed + Buttons
    ├─ No → Execute Intent
    ↓
Return Result to Discord
```

## Setup

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to "Bot" section and click "Add Bot"
4. Under TOKEN, click "Reset Token" and copy it
5. Set `DISCORD_BOT_TOKEN` environment variable:

```bash
export DISCORD_BOT_TOKEN="your-bot-token-here"
```

### 2. Configure Bot Permissions

Required permissions:
- `Send Messages`
- `Embed Links`
- `Read Message History`
- `Add Reactions`
- `Use Slash Commands`

Permissions integer: `274877959168`

### 3. Add Bot to Server

1. Go to OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions: See above
4. Copy generated URL
5. Paste in browser and select server

### 4. Start Services

```bash
# Terminal 1: WISE² IMP Service
node services/wise2-imp-service.js

# Terminal 2: Discord Bot Service
node services/discord-bot-service.js
```

The bot will:
- Register slash commands with Discord
- Listen for interactions
- Route to WISE² IMP

## Commands

### `/ask` — Query Information

Submit a question to WISE².

**Options:**
- `question` (required): Your question
- `context` (optional): Additional context

**Example:**
```
/ask question:"What services do we offer?" context:"for new customers"
```

**Response:**
Rich embed with:
- Title: Intent classified
- Description: Query result
- Fields: Key data points
- Status: success/pending/failed

---

### `/do` — Execute Command

Execute an action in WISE².

**Options:**
- `action` (required): What to do
- `parameters` (optional): Configuration

**Example:**
```
/do action:"send notification" parameters:"to: all_users, message: System update"
```

**Confirmation Flow:**
1. System evaluates risk level
2. If high-risk: Send confirmation dialog with Approve/Deny buttons
3. User clicks button or responds
4. System executes or denies
5. Result posted to channel

---

### `/manage` — Resource Management

Manage users, services, and configuration.

**Options:**
- `resource` (required): users, services, config, projects
- `operation` (required): list, create, update, delete

**Example:**
```
/manage resource:"users" operation:"list"
/manage resource:"config" operation:"update"
```

---

### `/automate` — Set Up Workflows

Create triggered automations.

**Options:**
- `trigger` (required): Event that starts automation
- `action` (required): What happens

**Example:**
```
/automate trigger:"daily at 9am" action:"send summary email"
/automate trigger:"github push to main" action:"deploy to production"
```

---

### `/connect` — Integrate Services

Link external platforms.

**Options:**
- `service` (required): slack, github, api, webhook
- `config` (optional): Connection details

**Example:**
```
/connect service:"slack" config:"webhook_url: https://..."
/connect service:"github" config:"repo: wise2-core, token: ghp_..."
```

---

### `/alert` — Monitoring

Set up alerts and notifications.

**Options:**
- `target` (required): What to monitor
- `threshold` (optional): Alert condition

**Example:**
```
/alert target:"cpu usage" threshold:"80%"
/alert target:"error rate" threshold:"above 5%"
```

---

### `/status` — Service Health

Check WISE² health.

**Options:**
- `service` (optional): all, imp, hermes, discord

**Example:**
```
/status service:"all"
/status service:"imp"
```

**Response:**
- Service status (Online/Offline)
- Uptime
- Intents processed
- Last activity

---

### `/intent` — Generic Interface

Fallback for any task not covered by specific commands.

**Options:**
- `description` (required): What you want to do

**Example:**
```
/intent description:"Create a daily backup of our database"
```

## Confirmation Flow

High-risk operations require user confirmation:

### Confirmation Dialog

```
[⚠️ Confirmation Required]

Risk Level 3/4: DESTRUCTIVE
Action: delete_user_account

Confirmation ID: `conf_a1b2c3d4`

[✓ Approve] [✗ Deny]
```

### User Actions

1. **Click ✓ Approve**: System executes operation
2. **Click ✗ Deny**: Operation cancelled
3. **No response in 5 minutes**: Auto-denied

### Confirmation Token

For Level 3 operations, user must provide a confirmation token:

```
/do action:"destroy database" token:"your_confirmation_token"
```

Tokens are:
- Generated when confirmation dialog appears
- Valid for 5 minutes
- Single-use only
- Logged to audit trail

## Message Prefix Commands (Fallback)

If slash commands fail, use message prefix `!wise2`:

```
!wise2 intent "send email to all users"
!wise2 status
!wise2 help
```

## Response Types

### Success Response

```
✓ Operation Completed

Intent: send_notification
Status: success

To: all_users
Message: System update complete
Sent At: 2026-09-12 14:30:00
```

### Confirmation Needed

```
⚠️ Confirmation Required

Intent: delete_project
Risk Level: 3/4 (DESTRUCTIVE)

Project: "Old Demo"
Estimated Impact: 50 users

[✓ Approve] [✗ Deny]
```

### Error Response

```
❌ Operation Failed

Intent: update_config
Error: Invalid parameter format

Details:
- Parameter: timeout_ms
- Expected: integer
- Got: string "5s"
```

## Risk Levels

WISE² IMP assigns risk levels to intents:

| Level | Color | Examples | Confirmation |
|-------|-------|----------|--------------|
| 0 | 🟢 Green | View, list, query | None |
| 1 | 🟠 Orange | Update config, create project | Simple approval |
| 2 | 🟠🔴 Red-Orange | Delete resource, modify user | Explicit approval |
| 3 | 🔴 Red | Drop database, remove user | Token + approval |

## Audit Logging

All Discord interactions are logged:

```
2026-09-12 14:30:45 | user: dwise#0001 | intent: send_notification
2026-09-12 14:30:50 | status: approved | role: owner
2026-09-12 14:30:55 | result: success | message_count: 1000
```

Location: `data/logs/discord-bot.log`

## Environment Variables

```bash
DISCORD_BOT_TOKEN      # Bot token from Discord Developer Portal
WISE2_IMP_URL          # WISE² IMP service URL (default: http://localhost:9002)
LOG_DIR                # Logging directory (default: data/logs)
MEMORY_DIR             # Memory directory (default: data/memory)
BOT_PORT               # Logging server port (default: 9003)
```

## Deployment

### Docker Compose

```yaml
services:
  discord-bot:
    image: wise2/discord-bot:latest
    environment:
      DISCORD_BOT_TOKEN: ${DISCORD_BOT_TOKEN}
      WISE2_IMP_URL: http://wise2-imp:9002
    ports:
      - "9003:9003"
    depends_on:
      - wise2-imp
    restart: always
```

### Manual Deployment

```bash
# SSH into VPS
ssh dwise@173.208.147.165

# Pull latest code
cd /opt/wise2-core
git pull origin main

# Start bot
pm2 start services/discord-bot-service.js \
  --name "wise2-discord-bot" \
  --env DISCORD_BOT_TOKEN="your-token"

# Check status
pm2 status
pm2 logs wise2-discord-bot
```

### macOS Local Development

```bash
# Install dependencies
npm install discord.js

# Start service
DISCORD_BOT_TOKEN="your-token" node services/discord-bot-service.js

# Verify in Discord
# Use /status command to check bot is running
```

## Monitoring

### Health Check

```bash
# Check bot logs
tail -f data/logs/discord-bot.log

# Check WISE² IMP integration
curl http://localhost:9002/status

# Check Discord bot status
curl http://localhost:9003/log -X POST -d "test"
```

### Metrics

Track in `data/memory/discord-metrics.json`:
- Total intents processed
- Confirmations approved/denied
- Error rate
- Average response time
- Active guilds/channels

## Troubleshooting

### Bot Not Responding

1. Check token is set: `echo $DISCORD_BOT_TOKEN`
2. Verify WISE² IMP is running: `curl http://localhost:9002/status`
3. Check logs: `tail -f data/logs/discord-bot.log`
4. Verify bot has permissions in server

### Commands Not Showing

1. Restart bot to re-register commands
2. Check Discord app cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Verify bot has `applications.commands` scope
4. Check server permissions: Settings → Roles → @bot

### Confirmation Not Working

1. Verify WISE² IMP is running
2. Check confirmation endpoint: `curl http://localhost:9002/confirmations/ID`
3. Ensure token is not expired (5 min timeout)
4. Check role permissions (viewer/operator/owner)

### Slash Commands Failing

**Error: "Token is invalid"**
- Regenerate token in Discord Developer Portal
- Update `DISCORD_BOT_TOKEN` environment variable
- Restart bot

**Error: "Missing Access"**
- Bot missing required permissions
- Check OAuth2 scope and permissions
- Re-add bot to server with correct settings

**Error: "Command Not Found"**
- Bot crashed while registering commands
- Manually trigger registration by restarting
- Check for TypeScript compilation errors

## Integration with Other WISE² Systems

### With Hermes (iMessage)

Both Discord and iMessage use the same WISE² IMP router:

```
Discord Bot ──┐
             ├─→ WISE² IMP ──→ Intent Routing ──→ Authorization ──→ Execution
iMessage Bot ─┘
```

### With Slack (Future)

Planned integration will:
- Use same command structure
- Route through WISE² IMP
- Share audit logs
- Cross-platform confirmations

## Contributing

To add new commands:

1. Add command config to `intentToCommandMap` in `src/discord/intent-to-slash.ts`
2. Implement handler in `services/discord-bot-service.js`
3. Add tests in `tests/discord/`
4. Update this documentation
5. Commit with message: `feat: add discord command: <name>`

## Support

For issues or questions:
- Check logs: `data/logs/discord-bot.log`
- Read WISE² IMP docs: `WISE2_IMP_README.md`
- Contact: dwise03@gmail.com

---

**WISE² Discord Bot** — Bringing intention management to Discord. Built with ❤️ by the WISE² team.
