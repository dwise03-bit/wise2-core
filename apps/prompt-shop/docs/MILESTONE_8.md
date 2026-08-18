# Milestone 8 — Claude integration

Claude is integrated as an optional server-side prompt-enhancement layer.

## Flow

`WT Prompt Engine → POST /api/claude/enhance → Anthropic Messages API → editable enhanced prompt`

The frontend never receives or references the Anthropic API key. `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` are read only by the Node server.

## API protections

- Same-origin API path
- Helmet security headers
- 64 KB JSON body limit
- 30 requests per minute rate limit
- Prompt presence and 30,000-character validation
- Sanitized upstream and configuration errors
- Loading, success, and error UI states

Without a configured key, the route returns HTTP 503 with `CLAUDE_NOT_CONFIGURED`; the Prompt Engine remains fully usable without enhancement.
