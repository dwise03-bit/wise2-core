# Discord credential solution

The repository already contains a valid bot credential for Discord application `1512638268225622147` (`Content Bot`). The ecosystem now falls back to `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, and `DISCORD_GUILD_ID` when dedicated REAPER values are absent. Dedicated bot credentials remain preferred.

Never reuse a token with a different application ID. The Developer Portal Wise2 server bot (`1532767617721438469`) requires its own token; that token must be copied manually after MFA, or the existing Content Bot credential can be used as the operational WISE² bot credential.
