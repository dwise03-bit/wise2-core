# Codex Remote Setup

This is the working checklist for running WISE2 Core remote operations from Codex.

## Target

- Repository: `dwise03-bit/wise2-core`
- Production host: `dwise@173.208.147.165`
- Remote checkout: `/home/dwise/wise2-core`
- Production domain: `https://wise2.net`
- Active deployment workflow: `.github/workflows/deploy.yml`

## Quick Check

Run this before remote work:

```bash
bash scripts/codex-remote-check.sh
```

The script verifies:

- local command availability for `git`, `ssh`, and `gh`
- GitHub CLI authentication
- access to the GitHub repository
- GitHub Actions secrets required by the active deploy workflow
- non-interactive SSH to the VPS
- remote availability of the repo, Git, Docker, and Docker Compose

## Current Remote Path

Codex can work remotely in two supported ways:

1. Push to `main` and let GitHub Actions deploy over SSH.
2. SSH to the VPS for status checks, logs, and emergency manual operations.

Use GitHub Actions for normal production deployment. Use direct SSH for inspection, recovery, or targeted verification.

## Required GitHub Actions Secrets

The active workflow deploys with `appleboy/ssh-action` and expects these repository secrets:

```text
DEPLOY_HOST
DEPLOY_USER
DEPLOY_KEY
STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID
STRIPE_WEBHOOK_SECRET
DATABASE_URL
APP_URL
API_BASE_URL
```

Optional email delivery secrets:

```text
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
```

Remote deploys can run without SendGrid, but transactional email will stay disabled until those values are set.

Do not commit secret values to the repo. Set them with GitHub repository secrets or with the GitHub CLI.

If production values already exist in an ignored env file, sync the required app secrets without printing values:

```bash
bash scripts/codex-sync-github-secrets.sh
```

By default this reads the ignored production env files under `/home/dwise/wise2-core` over SSH and writes the required application secrets to `dwise03-bit/wise2-core`. To use local env files instead:

```bash
SOURCE=local ENV_FILE=.env.production bash scripts/codex-sync-github-secrets.sh
```

## Useful Commands

Check remote services:

```bash
ssh dwise@173.208.147.165 'cd /home/dwise/wise2-core && docker compose -f docker-compose.prod.yml ps'
```

Read recent remote logs:

```bash
ssh dwise@173.208.147.165 'cd /home/dwise/wise2-core && docker compose -f docker-compose.prod.yml logs -n 80'
```

Check public endpoints:

```bash
curl -I https://wise2.net
curl -I https://wise2.net/dashboard
curl -I https://api.wise2.net
```

Trigger normal deployment:

```bash
git push origin main
```

## Notes

- Local Codex SSH access should be non-interactive; password prompts will block automation.
- The VPS already has the project checkout and Docker Compose available.
- Keep deploy operations append-only in daily logs and avoid editing historical decision records.
