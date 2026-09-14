# WISE² Discord Command Center Setup

This document guides the setup and deployment of the WISE² Discord Command Center.

## Prerequisites

- Node.js 20+
- Discord Bot Token
- Discord Server (Guild)
- Administrator access to the Discord server

## Configuration

### 1. Create Bot Environment File

Create `/opt/wise2-core/services/bot/.env` with the following values:

```bash
# Bot Authentication (REQUIRED)
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_OWNER_ID=274485978819584000  # Daniel Wise

# Webhooks for channel notifications (OPTIONAL)
DISCORD_WEBHOOK_DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_BUILDS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DECISIONS=https://discord.com/api/webhooks/...

# API Configuration
API_BASE_URL=http://localhost:3010
WEBHOOK_PORT=3002
WISE2_DISCORD_DEPLOY_ONLY=0
NODE_ENV=production
```

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application or select WISE² bot
3. Go to "Bot" section → "Add Bot"
4. Copy bot token to `DISCORD_BOT_TOKEN`
5. Under "OAuth2" → "URL Generator":
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Read Messages`, `Use Slash Commands`, `Manage Messages`, `Embed Links`
   - Copy URL and invite bot to Discord server

### 3. Discord Server Setup

Create channels:
- `#wise2-command` - Command center
- `#system-status` - System status updates
- `#alerts` - Critical alerts
- `#deployments` - Deployment notifications
- `#approvals` - Deployment approvals
- `#audit` - Audit log channel (optional)

### 4. Create Discord Roles

- `WISE² Admin` - Full administrative access
- `Developer` - Development and debugging
- `Sales` - CRM and sales operations
- `Field Tech` - HVAC and field operations
- `Support` - Customer support

## Starting the Bot

```bash
cd /opt/wise2-core/services/bot
npm install
npm start
```

Expected output:
```
🔧 Initializing WISE² Discord Command Center...
📦 Loading commands...
  system: 1 command(s)
  deployment: 1 command(s)
✅ Registered N slash commands
✅ WISE² Discord Command Center initialized!
```

## Available Commands

### System
- `/status` - System status check
- `/health` - Service health check
- `/services` - List all services
- `/uptime` - Service uptime
- `/logs` - View system logs
- `/incidents` - List active incidents

### Deployment (Owner/Admin only)
- `/deploy` - Deploy to staging or production
- `/rollback` - Rollback to previous release
- `/restart` - Restart service

### CRM (Sales/Admin)
- `/lead` - Manage leads
- `/leads` - List sales leads
- `/customer` - Customer info
- `/claim-lead` - Claim a lead

### AI
- `/ask-wise2` - Query WISE² AI
- `/agent` - Launch AI agent job

### Security (Owner/Admin)
- `/audit` - View audit logs
- `/access` - Check permissions

## Authorization

Commands use role-based access control (RBAC):

| Role | Access | Can Deploy? | Can View Audit? |
|------|--------|-------------|-----------------|
| OWNER (Daniel) | Full access | Yes | Yes |
| WISE² Admin | Deployments, admin ops | Yes | Yes |
| Developer | System info, debugging | No | No |
| Sales | CRM, leads | No | No |
| Support | Customer info | No | No |

Production deployments require explicit approval.

## Audit Logging

All commands logged to `/opt/wise2-core/data/audit-logs/YYYY-MM-DD.jsonl`

Query recent commands:
```bash
tail -10 /opt/wise2-core/data/audit-logs/2026-09-11.jsonl | jq .
```

## Testing

### Test Basic Command
```
User: /status
Bot response: WISE² System Status with service health
```

### Test Authorization
```
User (not admin): /deploy production
Bot response: ❌ You don't have permission to use `/deploy`
```

### Test Deployment Approval
```
Admin: /deploy production branch:main service:api
Bot: Shows approval buttons
Admin clicks: ✅ Approve
Bot: Executes deployment
```

## Troubleshooting

### Bot doesn't start
- Check `DISCORD_BOT_TOKEN` is valid
- Check `DISCORD_GUILD_ID` is correct
- Check Discord permissions are set correctly
- Review console for error messages

### Commands don't appear
- Bot might need `applications.commands` scope
- Slash commands may take 5 minutes to sync
- Try leaving and rejoining Discord server

### Permission denied
- Check role is assigned in Discord
- Role name must match exactly (case-sensitive)
- Contact server admin to assign role

### Rate limits
- Default: 5 commands/minute per user
- Deployment: 2 deployments/minute
- Wait before retrying if limited

## Security Notes

- 🔒 Never commit `.env` file
- 🔒 Never share bot token
- 🔒 Production deployments require approval
- 📋 All actions logged with attribution
- 🚫 Passwords/keys redacted in logs

## Files

- **Config:** `/opt/wise2-core/services/bot/.env`
- **Commands:** `/opt/wise2-core/services/bot/commands/`
- **Middleware:** `/opt/wise2-core/services/bot/middleware/`
- **Logs:** `/opt/wise2-core/data/audit-logs/`
