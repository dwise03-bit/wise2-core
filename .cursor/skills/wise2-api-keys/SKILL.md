---
name: wise2-api-keys
description: Interactive WISE² client workflow for gathering and storing API keys (Stripe, Google, Discord, Jobber, Twilio, OpenAI). Use when onboarding a client, collecting credentials, connecting integrations, or when the user mentions API keys, Jobber tokens, Stripe keys, or client secrets.
---

# WISE² API keys

Walk the client through one key at a time. Store via the tool. Never echo, log, or commit the raw value.

## Default workflow

1. Ask for a **client slug** (lowercase, hyphens) and a **profile**:
   - `core` — Stripe, Google, Discord, email
   - `phone` — core plus Twilio and OpenAI
   - `field-service` / `hvac` — phone plus Jobber
   - `studio` — YouTube, Twitch, Suno
   - `full` — everything
2. Call `api_keys_next` (MCP) or run:
   `pnpm --filter @wise2/api-keys start -- gather --client <slug> --profile <profile>`
3. Show the client the `clientSteps` and docs URL. Ask them to paste the key in chat or the wizard.
4. Call `api_keys_store` with `envVariable` and `value`. Confirm only the masked suffix (`…abcd`).
5. Repeat until `done` is true. Skip optional keys they do not have.

If MCP is not connected, use the CLI or the Command Center page `/dashboard/settings/api-keys`.

## Rules

- Never repeat the full secret in a reply, commit, log, ticket, or screenshot.
- Do not write keys into `.env.prod.example`, docs, or git-tracked files.
- Vault path: `data/clients/<slug>/keys.env` (gitignored). Override with `WISE2_API_KEYS_DIR`.
- If validation fails, show the error and ask them to paste again. Do not force-store a malformed key.
- Status output is masked. Treat any accidental full key as a leak: ask the client to rotate it.

## Commands

```bash
pnpm --filter @wise2/api-keys start -- gather --client getdown --profile field-service
pnpm --filter @wise2/api-keys start -- status --client getdown --profile field-service
pnpm --filter @wise2/api-keys test
```
