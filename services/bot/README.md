# WISE² Discord Bot - Phase A

Discord integration bot for the WISE² Agentic OS kernel providing system commands, deployment status, decision logging, and team synchronization.

## Overview

**Status**: Phase A (MVP - Slash Commands & Webhooks)

**Bot Features**:
- 7 slash commands for system operations
- 6 Discord channels with webhook integration
- Real-time system status monitoring
- Daily sync and decision logging
- Alert distribution system
- Integration with data layer (`data/daily-logs`, `data/decisions`)

## Technology Stack

- **Library**: discord.js 14.x (slash commands)
- **Runtime**: Node.js 18+
- **Language**: JavaScript
- **Hosting**: Replit (Phase A) or wise2.net (Future)

## Quick Start

### 1. Install Dependencies

```bash
cd services/bot
npm install
```

### 2. Create Discord Bot

Follow Discord Developer Portal setup:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click "New Application" and name it "WISE² Bot"
3. Go to "Bot" tab → "Add Bot"
4. Under "TOKEN" section, click "Copy" to copy your bot token
5. Enable these **Privileged Gateway Intents**:
   - ✅ Message Content Intent
   - ✅ Guild Messages Intent
   - ✅ Guilds Intent

**Copy your bot token** (you'll need it for `.env`)

### 3. Invite Bot to Server

In Developer Portal, go to OAuth2 → URL Generator:
- Scopes: `bot`
- Permissions:
  - ✅ Send Messages
  - ✅ Embed Links
  - ✅ Read Messages/View Channels
  - ✅ Use Slash Commands

Copy the generated URL and open it in browser to invite bot to your server.

### 4. Create Discord Channels

Create these 6 channels in your WISE² Discord server:

```
#deployments    - Deployment notifications
#alerts         - System alerts & warnings
#builds         - Build logs & CI/CD status
#decisions      - Logged decisions (ADR format)
#daily-sync     - Daily status synchronization
#status         - System health & metrics
```

### 5. Create Webhooks

For each channel:

1. Right-click channel → Settings
2. Go to Integrations → Webhooks
3. Click "New Webhook"
4. Copy the webhook URL (save temporarily)
5. **Example**: `https://discord.com/api/webhooks/123456/abcdef...`

### 6. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your values:

```bash
# From Discord Developer Portal
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Your server ID (right-click server icon → Copy Server ID)
DISCORD_GUILD_ID=your_guild_id_here

# Webhooks from each channel (from step 5)
DISCORD_WEBHOOK_DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
# ... etc for all 6 channels
```

### 7. Start the Bot

```bash
npm start
```

Expected output:

```
✅ Logged in as WISE² Bot#1234
Guilds: WISE²(123456789)
✅ Successfully reloaded 7 application (/) commands.
✅ Sent startup ping to #status
```

## Commands (Slash Commands)

### `/status`

Show system health: git status, docker containers, recent commits.

```
/status
→ Git Status: [current git state]
→ Docker Containers: [running containers]
→ Recent Commits: [last 5 commits]
```

### `/deploy`

Show deployment configuration and info.

```
/deploy
→ Server: 173.208.147.165 (gpu-nmls)
→ Environment: production
→ Docker Compose: docker-compose.prod.yml
→ Auto-Deploy: Enabled (GitHub Actions)
→ Last Deployments: [recent commits]
```

### `/phase`

Show current project phase (modernization status).

```
/phase
→ Current Phase: Phase 5-6 (In Progress)
→ Website: ✅ LIVE on :3000
→ Creative Studio: ✅ LIVE at /studio
→ Phase Status: [detailed breakdown]
```

### `/tasks`

List pending tasks from `data/inbox/`.

```
/tasks
→ Tasks from inbox files
→ Shows first 200 chars of each task
→ Max 5 tasks displayed
```

### `/decision topic:<topic> description:<details>`

Log a new decision in ADR (Architecture Decision Record) format.

```
/decision topic:live-stream-redesign description:Locked brand ref for live stream page

→ Creates: data/decisions/2026-07-20-live-stream-redesign.md
→ Format: Markdown with date, author, status tracking
```

### `/sync`

Show today's daily sync log.

```
/sync
→ Reads: data/daily-logs/YYYY-MM-DD.md
→ Shows: Daily activity, blockers, next actions
```

### `/alert channel:<channel> message:<msg> [severity:<level>]`

Send alert to a Discord channel via webhook.

```
/alert channel:alerts message:Database migration started severity:warning

→ Channels: deployments, alerts, builds, decisions, daily-sync, status
→ Severity: info (default), warning, critical
→ Color-coded by severity
```

## Data Integration

Bot reads from the WISE² data layer:

```
data/
├── daily-logs/          ← /sync command reads from here
│   └── 2026-07-20.md
├── decisions/           ← /decision command writes to here
│   └── 2026-07-20-live-stream-redesign.md
└── inbox/               ← /tasks command reads from here
    └── ideas.md
```

### Daily Log Format

```markdown
# 2026-07-20 - Daily Log

## Sessions
- 09:00 - @design: Finalized live stream page design
- 11:30 - @dev: Implemented live stream components

## Decisions Made
- Locked brand ref for live stream page

## Blockers
- Waiting on reference images from user

## Next Actions
- [ ] Test live stream on mobile
- [ ] Write launch copy
```

### Decision Format (ADR)

```markdown
# Live Stream Redesign

**Date**: 2026-07-20
**Author**: dwise

## Decision

Locked brand reference for live stream page per master design system.

## Status
- [ ] Approved
- [ ] Implemented
- [ ] Closed

---
*Logged via Discord bot*
```

## Environment Variables

See `.env.example` for complete reference:

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_BOT_TOKEN` | Bot authentication token | `MTA4...` |
| `DISCORD_CLIENT_ID` | OAuth2 client ID | `123456789` |
| `DISCORD_CLIENT_SECRET` | OAuth2 secret | `abc123...` |
| `DISCORD_GUILD_ID` | Server ID | `987654321` |
| `DISCORD_WEBHOOK_*` | Channel webhooks (6 total) | `https://discord.com/...` |
| `DATA_DIR` | Path to data layer | `../../data` |
| `DEPLOY_SERVER` | Server display name | `173.208.147.165` |
| `NODE_ENV` | Environment | `production` |

## Deployment

### Phase A: Replit (Free Tier)

1. Go to [replit.com](https://replit.com)
2. Create new Repl → Import from GitHub
3. Repo: `dwise03/wise2-core`
4. Add secrets (use `.env` variables)
5. Run: `cd services/bot && npm start`

**Note**: Replit free tier has limitations. Use "Always On" for production.

### Future: wise2.net

- Docker container on 173.208.147.165
- PM2 process manager
- Persistent Redis for state
- Webhook retry logic

## Troubleshooting

### Bot shows as offline

- ✅ Check `DISCORD_BOT_TOKEN` is valid
- ✅ Check bot is invited to server
- ✅ Check gateway intents are enabled in Developer Portal

### Commands not showing up

- ✅ Run bot with `npm start` to deploy commands
- ✅ Commands are guild-specific (only visible in your server)
- ✅ Restart bot after changing `GUILD_ID`

### Webhooks fail to send

- ✅ Verify webhook URLs in `.env` are correct
- ✅ Check webhook still exists in Discord (not deleted)
- ✅ Verify bot has "Manage Webhooks" permission

### Data files not found

- ✅ Verify `DATA_DIR` path is correct (relative to services/bot/)
- ✅ Check that `data/daily-logs/` and `data/decisions/` exist
- ✅ Daily log should exist at: `data/daily-logs/YYYY-MM-DD.md`

## Phase B Roadmap

Future enhancements (post-MVP):

- [ ] OAuth2 integration for user authentication
- [ ] Role-based command access (admin, dev, ops)
- [ ] Persistent state in Redis
- [ ] Scheduled messages (daily stand-up, reminders)
- [ ] GitHub integration (push notifications, PR reviews)
- [ ] Deployment approval workflows
- [ ] Custom command middleware

## Development

### Local Testing

```bash
# Install dev dependencies
npm install --save-dev nodemon

# Run with auto-reload
npm run dev
```

### Logs

Bot logs to stdout:

```
[MSG] - Discord message received
[CMD] - Slash command executed
✅ - Success
❌ - Error
```

### Adding New Commands

1. Add command object to `commands` in `index.js`:

```javascript
my_command: {
  data: {
    name: "my_command",
    description: "Does something cool",
    options: [/* optional params */]
  },
  async execute(interaction) {
    // Your command logic
    await interaction.reply("Result!");
  }
}
```

2. Restart bot to deploy new command

## Documentation

- `DEPLOYMENT_HANDOFF.md` - Deployment procedures
- `OUTSTANDING_ISSUES.md` - Known issues & fixes
- CLAUDE.md - WISE² operational philosophy
- data/daily-logs/ - Session activity logs
- data/decisions/ - Architecture decisions

## Support

For issues or questions, see the WISE² Discord server or file a decision.

---

**Bot Version**: 1.0 (Phase A MVP)  
**Owner**: WISE² Development Team  
**Last Updated**: 2026-07-20
