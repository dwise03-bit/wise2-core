# WISE² Phase 2 — Toolchain Install Plan (verified, awaiting sudo)

> These are the remaining installs. Each needs **sudo** (this build session has
> no sudo password) and some need **interactive auth**. Commands below are
> verified against official sources (2026-10-02). Run them, or paste into the
> Claude Code prompt with a leading `! ` to run in-session.

## Already present (no action)
git, curl, wget, jq, ripgrep (rg), fd, tmux, htop, unzip, gcc, make,
build-essential, python3 + venv + pip, Node v22.23.3, npm, Docker + Compose,
Claude Code (native), Tailscale, OpenSSH, Shannon launchers.

## Still missing — safe apt installs
```bash
sudo apt-get update
sudo apt-get install -y git-lfs btop tree shellcheck
git lfs install    # enable git-lfs for the user
```

## GitHub CLI (gh) — official apt repo (verified: cli.github.com)
```bash
sudo mkdir -p -m 755 /etc/apt/keyrings
wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt-get update && sudo apt-get install -y gh
# then authenticate (interactive, Daniel):
gh auth login
```

## OpenAI Codex CLI — official npm package (verified: @openai/codex)
> IMPORTANT: the official package is the SCOPED name `@openai/codex`.
> The unscoped `codex` on npm is an unrelated 2012 doc generator — do NOT install it.
> Codex is also Shannon's AI backend (SHANNON_AI_MODEL=openai-codex:gpt-5.6-sol).
```bash
sudo npm install -g @openai/codex   # npm global root is root-owned -> sudo
codex --version                      # verify
codex login                          # interactive OpenAI auth (Daniel)
```
Alternative without sudo (user-local npm prefix) — ask Daniel first, changes npm config:
```bash
npm config set prefix "$HOME/.npm-global"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc && . ~/.bashrc
npm install -g @openai/codex
```

## Git identity (Daniel) — no secrets, but Daniel's choice of name/email
```bash
git config --global user.name  "Daniel Wise"      # confirm exact name
git config --global user.email "dwise03@gmail.com" # confirm address
git config --global init.defaultBranch main
```

## wise2 CLI install (symlink — needs sudo)
```bash
sudo ln -sf /opt/wise2/scripts/wise2 /usr/local/bin/wise2
wise2 doctor
```

## Verify after installs
```bash
wise2 doctor   # expect gh/codex/git-identity WARNs to clear
```
