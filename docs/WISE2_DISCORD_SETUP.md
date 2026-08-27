# WISE2 Discord Setup

This runbook sets up the Wise2 Discord integration for:

- Discord OAuth sign-in on the website
- The Wise2 Discord bot in the platform API
- Channel webhook notifications
- Live Revenue OS and Hermes commands from Discord

## Required Environment Variables

Set these in the API and website environments:

```env
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://wise2.net/api/auth/discord/callback

DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=

DISCORD_WEBHOOK_URL=
DISCORD_WEBHOOK_ALERTS=
DISCORD_WEBHOOK_BUILDS=
DISCORD_WEBHOOK_DEPLOYMENTS=
DISCORD_WEBHOOK_DECISIONS=

DISCORD_DEFAULT_TENANT_ID=
DISCORD_DEFAULT_HERMES_USER_ID=
```

## Discord Developer Portal

1. Create a new Discord application.
2. Add a Bot to the application.
3. Copy the application ID into `DISCORD_CLIENT_ID`.
4. Copy the bot token into `DISCORD_BOT_TOKEN`.
5. Generate a client secret and store it in `DISCORD_CLIENT_SECRET`.
6. Add the Wise2 callback URL to the OAuth redirect list:
   `https://wise2.net/api/auth/discord/callback`

## OAuth Scopes

Use these scopes for website sign-in:

- `identify`
- `email`
- `guilds`

## Bot Invite

Invite the bot to the Wise2 server with the `bot` and `applications.commands` scopes.

After the bot joins:

1. Enable Developer Mode in Discord.
2. Right-click the Wise2 server.
3. Copy Server ID.
4. Store it in `DISCORD_GUILD_ID`.

## Channel Webhooks

Create webhooks for the channels you want Wise2 to use:

- `DISCORD_WEBHOOK_ALERTS`
- `DISCORD_WEBHOOK_BUILDS`
- `DISCORD_WEBHOOK_DEPLOYMENTS`
- `DISCORD_WEBHOOK_DECISIONS`

If you only want one channel at first, set `DISCORD_WEBHOOK_URL` and let the
channel-specific keys fall back to it.

## Wise2 Runtime Context

These power live Discord commands:

- `DISCORD_DEFAULT_TENANT_ID`
  Used for Revenue OS data like pipeline, alerts, and dispatch.
- `DISCORD_DEFAULT_HERMES_USER_ID`
  Used for Discord `/ask` requests into Hermes.

## Validation

After deploying env changes:

1. Restart the platform API.
2. Open Command Center at `/dashboard/discord`.
3. Confirm:
   - Bot is connected
   - OAuth is configured
   - Webhook channels are configured
   - Revenue tenant is set
   - Hermes user is set
4. Send a test notification from the dashboard.
5. Run `/help` and `/status` in Discord.

## Notes

- Rotate any Discord token or webhook URL that was ever pasted into chat or logs.
- The dashboard surfaces live setup status from `/v1/discord/setup`.
- Slash commands are registered when the API boots and the bot connects.
