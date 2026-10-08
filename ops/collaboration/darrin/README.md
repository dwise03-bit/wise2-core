# Darrin WISE² Workstation Bootstrap

Canonical identity: `wisevillain86`.

This pack connects Darrin's workstation to the existing WISE² collaboration model. It does not contain passwords, tokens, Tailscale auth keys, or SSH private keys.

## One-time workstation setup

Install Git, GitHub CLI, OpenSSH, Tailscale, Node.js, Docker, and the project-specific dependencies required by each repository.

Generate Darrin's key on Darrin's computer:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/id_ed25519_wise2 -C "wisevillain86 WISE2"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_wise2
cat ~/.ssh/id_ed25519_wise2.pub
```

Add ONLY the displayed public key to the `wisevillain86` GitHub account. Never copy the private key into GitHub, chat, email, or this repository.

Copy `ssh-config.example` entries into `~/.ssh/config`, then:

```bash
chmod 600 ~/.ssh/config
ssh -T git@github.com
tailscale status
```

Clone the canonical repos with SSH:

```bash
mkdir -p ~/wise2 && cd ~/wise2
git clone git@github.com:dwise03-bit/wise2-core.git
git clone git@github.com:dwise03-bit/wise2.net.git
git clone git@github.com:dwise03-bit/wise2-dashboard.git
git clone git@github.com:dwise03-bit/Wise2-hardware.git
```

Run:

```bash
cd ~/wise2/wise2-core
bash ops/collaboration/darrin/verify-access.sh
```

## Current GitHub access verified 2026-10-07

- wise2-core: write
- wise2.net: admin
- wise2-dashboard: admin
- Wise2-hardware: admin

## Production rule

Full operational access does not bypass the WISE² GREEN deployment gate. Deploy from an exact GitHub commit SHA. Never destroy another developer's dirty working tree and never force-reset production as a sync mechanism.

See `.github/COLLABORATION.md` (not yet created) and `docs/superpowers/specs/2026-09-14-wise2-bridge-sync-design.md`.
