# WISE² Discord Bot - Phase A

Discord integration bot for the WISE² Agentic OS kernel providing system commands, deployment status, decision logging, ad ops, and second-brain synchronization.

## Overview

**Status**: Phase A (MVP - Slash Commands & Webhooks)

**Bot Features**:
- 30+ slash commands for system operations, ad ops, WISE² knowledge access, and second-brain sync
- 6 Discord channels with webhook integration
- Real-time system status monitoring
- Daily sync and decision logging
- Alert distribution system
- Ad preview, approval, preset, and scheduling workflow
- Hub, search, and docs browsing for the full WISE² workspace
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
✅ Successfully reloaded application (/) commands.
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

### `/run-ads [count:<n>] [preset:<name>] [selection:<items>] [target:<channel>] [caption:<text>] [approval:true|false]`

Post WISE² ad creatives from the local ads folder into Discord.

```
/run-ads selection:1,3-5 target:#campaigns caption:Launching the blitz
→ Posts the selected image files from the ads folder
→ Defaults to /Users/danielwise/Downloads/WISE2_Revenue_Blitz_Ads
→ Supports up to 10 attachments per message and auto-chunks larger runs
→ Selection accepts file names or 1-based indexes
→ Presets: `launch`, `retargeting`, `ugc`, `direct-response`
→ `approval:true` turns the run into a button-gated approval flow
```

### `/preview-ads [count:<n>] [preset:<name>] [selection:<items>] [target:<channel>] [caption:<text>]`

Preview WISE² ad creatives before posting them live.

```
/preview-ads selection:a_bold_high_contrast_cyber_neon_promotional_poster.png
→ Shows the selected creatives in an ephemeral Discord reply
→ Attaches the first image as a visual preview
→ Uses the same local folder selection as /run-ads
→ Includes Approve & Post and Cancel buttons
```

### `/schedule-ads name:<text> cron:<expr> [timezone:<tz>] [preset:<name>] [selection:<items>] [count:<n>] [target:<channel>] [caption:<text>]`

Schedule recurring ad drops with cron syntax.

```
/schedule-ads name:weekday-blitz cron:"0 9 * * 1-5" timezone:America/New_York preset:launch target:#campaigns
→ Creates a recurring post schedule
→ Persists the schedule in data/ads-schedules.json
→ Rehydrates on bot restart
→ Uses the same selection and preset logic as /run-ads
```

### `/ads-schedules`

List all configured ad schedules.

```
/ads-schedules
→ Shows the cron expression, timezone, target channel, and status
```

### `/cancel-ad-schedule id:<schedule-id>`

Cancel a recurring ad schedule by ID.

```
/cancel-ad-schedule id:9f2a...
→ Stops the cron job immediately
→ Marks the schedule inactive in the JSON file
```

### `/ads-library`

Browse the full WISE² creative library.

```
/ads-library
→ Lists every available ad creative in the folder
→ Shows file sizes in the embed
→ Attaches the first asset as a quick visual reference
→ Includes the active preset catalog
```

### `/wise2-hub [section:<name>] [target:<channel>]`

Open the WISE² master command center.

```
/wise2-hub section:overview
→ Shows the unified WISE² overview card
→ Sections include modules, docs, operations, roadmap, brand, support, data, ads, and knowledge
→ If you pass a target channel, the hub card is also broadcast there
```

### `/wise2-search query:<text> [scope:<name>] [limit:<n>]`

Search the WISE² repo and second brain from Discord.

```
/wise2-search query:deployment scope:docs limit:5
→ Searches docs, code, data, brand, ops, or second-brain context
→ Returns matching file names and snippets
→ Great for finding the canonical doc or implementation point fast
```

### `/brain-status`

Show second-brain connectivity, knowledge counts, graph stats, and recent entries.

```
/brain-status
→ Shows API, Mongo, and Ollama health
→ Lists the most recent knowledge entries returned by the API
→ Confirms whether Discord is linked to the second brain
```

### `/brain-search query:<text> [limit:<n>]`

Search the WISE² second brain directly.

```
/brain-search query:launch plan limit:5
→ Searches the live knowledge base over the second-brain API
→ Returns titles, tags, and content previews
→ Best for vault items, decisions, and reusable knowledge
```

### `/brain-save title:<text> content:<text> [tags:<tag1,tag2>] [business:<key>] [type:<kind>]`

Save a note, decision, or reusable insight into the second brain from Discord.

```
/brain-save title:"Launch note" content:"Approved the blitz ad bundle" tags:ads,launch type:decision
→ Posts a structured knowledge entry to the second-brain API
→ Supports tags, business key, and entry type
→ Useful for capturing decisions live during Discord discussions
```

## Data Integration

Bot reads from the WISE² data layer:

```
data/
├── daily-logs/          ← /sync command reads from here
│   └── 2026-07-20.md
├── decisions/           ← /decision command writes to here
│   └── 2026-07-20-live-stream-redesign.md
├── ads-schedules.json   ← /schedule-ads stores recurring jobs here
└── inbox/               ← /tasks command reads from here
    └── ideas.md
```

### Ad Creative Folder

The `/run-ads` command reads local creative assets from:

```
/Users/danielwise/Downloads/WISE2_Revenue_Blitz_Ads
```

You can override this by setting `WISE2_ADS_DIR` in `services/bot/.env`.

### Ad Presets

Preset names available in the ad commands:

- `launch`
- `retargeting`
- `ugc`
- `direct-response`

### WISE² Hub Sections

Available section values for `/wise2-hub`:

- `overview`
- `modules`
- `docs`
- `operations`
- `roadmap`
- `brand`
- `support`
- `data`
- `ads`
- `knowledge`
- `second-brain`

### Second Brain Integration

The bot can connect to the WISE² second-brain API if you set these environment variables:

```bash
SECOND_BRAIN_API_URL=http://127.0.0.1:3012
SECOND_BRAIN_JWT_SECRET=your_shared_brain_secret
SECOND_BRAIN_SERVICE_SUB=discord-bot
SECOND_BRAIN_BUSINESS=wise2
```

Notes:

- `SECOND_BRAIN_API_URL` should point to the API root without the trailing `/api` or with it; both work.
- The bot signs requests with `SECOND_BRAIN_JWT_SECRET`, falling back to `JWT_SECRET` if you already use that shared secret.
- If the brain is offline or the secret is missing, the new brain commands fail gracefully with a clear error.

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
