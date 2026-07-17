# Discord Bot Service

Discord integration bot for Wise² Core

## Overview

Discord bot providing:
- Server notifications
- Command handling
- User interactions
- Alert distribution
- Community management

## Technology Stack

- **Library**: discord.js 14.x
- **Runtime**: Node.js 18+
- **Language**: JavaScript

## Getting Started

```bash
npm install
npm run start
```

## Environment Variables

```bash
DISCORD_BOT_TOKEN=your_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_WEBHOOK_URL=your_webhook_url
```

## Commands

### Infrastructure Commands
- `!status` — Docker container status
- `!update` — Pull latest changes
- `!restart` — Restart all services
- `!logs [service]` — View service logs

### Hermes Website Builder
- `!website` — Show help menu
- `!website status` — Check builder service
- `!website jobs` — List recent build jobs
- `!website help` — Full documentation
- `!website api` — API endpoint info

See documentation in `docs/guides/discord-setup.md` and `../HERMES_INTEGRATION.md`

---

**Service Version**: 1.0
**Owner**: Bot Team
