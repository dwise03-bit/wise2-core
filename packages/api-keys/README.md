# WISE² API keys

Interactive tool for gathering a client's API keys and storing them in a gitignored vault.

## Use

```bash
pnpm --filter @wise2/api-keys start -- gather --client getdown --profile field-service
pnpm --filter @wise2/api-keys start -- status --client getdown --profile field-service
pnpm --filter @wise2/api-keys test
```

Command Center wizard: `/dashboard/settings/api-keys`

Cursor MCP tools: `api_keys_next`, `api_keys_store`, `api_keys_status`

## Storage

Keys land in `data/clients/<slug>/keys.env` (the `data/` tree is gitignored).

Override the directory with `WISE2_API_KEYS_DIR`. Files are written `0600`. Status APIs return a masked suffix only.

Never commit `keys.env`, paste full secrets into tickets, or echo them back in chat.
