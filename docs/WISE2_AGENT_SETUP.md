# WISE² Claude + Codex Setup

## Profiles

The repository contract is shared through `AGENTS.md`, `CLAUDE.md`, PromptOS, and `.agents/skills/`.

On the Mac:

```bash
source ~/.zshrc
scripts/wise2-preflight.sh mobile
scripts/wise2-mobile.sh status
scripts/wise2-sync.sh --check
```

For explicit VPS inspection, create `~/.config/wise2/agents.env` from `config/agents/wise2-profiles.env.example`, then run:

```bash
scripts/wise2-vps.sh check
scripts/wise2-vps.sh status
```

Do not put tokens, Apple signing files, provisioning profiles, or private keys in the repository or `agents.env` committed files.

## Model policy

- Hosted/VPS profiles are preferred for architecture, large refactors, and cross-app reasoning.
- `claude-local` is explicit and uses the small `qwen2.5-coder:1.5b` model.
- Ollama is capped at one parallel request and one loaded model on the 16 GB Mac.
- A hosted model outage must be visible; it must not silently launch a large local model.

## Mobile policy

The Mac is the execution host for Xcode, iOS simulators/devices, Android Studio, Android emulators/devices, and signing. The VPS can run Linux-compatible API, package, Docker, and CI checks. Android is not currently initialized under `apps/wise2-android`; the tooling reports that state rather than creating a fake project.
