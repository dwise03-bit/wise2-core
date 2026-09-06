# WISE² Grok Bot

This adds xAI/Grok as an isolated AI provider for the existing WISE² Discord bot.

## Required secret

Set this on the runtime host only. Never commit the real value.

```bash
XAI_API_KEY=xai-...
```

## Optional configuration

```bash
XAI_BASE_URL=https://api.x.ai/v1
XAI_MODEL=grok-4-1-fast-reasoning
XAI_TIMEOUT_MS=60000
```

## Integration

Register `grok-command.js` in the existing command map in `services/bot/index.js` and redeploy Discord commands using the existing WISE² bot deployment flow.

The provider is in `services/bot/lib/grok.js` and can also be reused by the WISE² dashboard/API/mobile services.

## Smoke test

After the bot is restarted and slash commands are deployed:

```text
/grok prompt: Give me today's top three WISE² sales priorities.
```

Expected behavior: the bot defers the Discord response, calls xAI, identifies itself as WISE² GROK, and safely chunks long responses to Discord limits.

## Security

- Keep `XAI_API_KEY` in the host secret store or `.env` excluded from Git.
- Do not expose the xAI key to browser/mobile clients.
- Route client apps through a WISE² server endpoint.
- Add per-user rate limits before exposing Grok to public/customer channels.
