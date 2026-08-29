# Claude Code Auth Mode for WISE2

Last updated: 2026-08-28

## Current State

`claude doctor` reports Claude Code native `2.1.250` is installed correctly.

Some parent shells may have `ANTHROPIC_BASE_URL` set to a custom endpoint. That mode can be useful for Anthropic-compatible gateways, but it disables Claude Code Remote Control and claude.ai subscription authentication because those features require `api.anthropic.com`.

The WISE2 `~/.zshrc` defines the normal `claude` shell function so it unsets `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, and related Anthropic overrides before launching Claude Code. Use `claude`, not the absolute binary path, for normal sessions.

## Recommended Default

Use standard Anthropic auth for normal WISE2 development sessions that need the full Claude Code experience:

```bash
claude
```

If Remote Control or subscription auth is needed, sign in interactively:

```bash
claude auth login
```

Then run:

```bash
/status
/doctor
```

Confirm that Claude Code reports the expected setting sources and no auth warnings.

## Custom Endpoint Mode

Use the custom endpoint only for intentional gateway or provider testing:

```bash
export ANTHROPIC_BASE_URL="<custom-endpoint>"
claude
```

When using custom endpoint mode, do not expect Remote Control or claude.ai subscription auth to be active.

The current local helper for this mode is `claude-local`.

## Operating Rule

Document which auth mode was used in `data/daily-logs/<today>.md` for deployment, production debugging, or long-running WISE2 sessions.
