# WISE² Grok provider

The Discord bot exposes the provider through the existing command registry:

`/grok prompt:<question>`

Configuration is runtime-only; never commit the API key:

```dotenv
XAI_API_KEY=
XAI_MODEL=grok-4.6
XAI_BASE_URL=https://api.x.ai
WISE2_GROK_ENABLED=true
WISE2_GROK_TIMEOUT_MS=30000
WISE2_GROK_MAX_TOKENS=1200
WISE2_GROK_TEMPERATURE=0.2
```

The integration uses xAI's Responses API (`/v1/responses`) and bearer authentication. The health endpoint is `/health/grok`; it reports configuration metadata only and never returns credentials. Conversation memory is bounded to eight messages and held in-process with a 30-minute lifecycle boundary; it is intentionally not a durable transcript.

If `XAI_API_KEY` is unavailable, the bot remains safe and reports that Grok is not configured. No automatic provider fallback is enabled until a provider-specific privacy and authorization policy exists.
