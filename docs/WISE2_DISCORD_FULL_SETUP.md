# WISE² Discord full setup

Final setup requires Discord account/server authorization; tokens cannot be safely invented or committed.

1. Create applications/bots for the configured bots in `services/discord-ecosystem/.env.example`.
2. Enable Message Content where needed and Guild Voice States for Voice Bot.
3. Copy tokens and application IDs into ignored `services/discord-ecosystem/.env`.
4. Set `GUILD_ID`, then run `bash scripts/setup-discord-ecosystem.sh`.
5. Open each generated invite URL and authorize it in the WISE² server.
6. Start with `pnpm --dir services/discord-ecosystem build` and `pnpm --dir services/discord-ecosystem start`.

The script validates configuration and prints invite URLs without printing tokens.
