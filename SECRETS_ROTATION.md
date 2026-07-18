# 🔐 Secrets Rotation — Action Required

Several secrets were exposed (pasted in chat and/or committed to git history).
Treat all of them as **compromised** and rotate. This file names *where* they
live, not the values themselves.

## 1. Stripe (URGENT)
Live Stripe keys were pasted into chat, so they're in conversation history.
- [ ] Stripe Dashboard → **Developers → API keys**
- [ ] **Roll** the Standard secret key (`sk_live_…`)
- [ ] **Roll** any Restricted keys (`rk_live_…`)
- [ ] Set the new secret **only** as `STRIPE_SECRET_KEY` in a secret store
      (GitHub Actions secrets or a gitignored `.env` on the server) — never in code
- [ ] Publishable key (`pk_live_…`) is **public/safe** — already in
      `apps/website/.env.production`, no rotation needed
- [ ] Add the live **price IDs** (not secret) to
      `NEXT_PUBLIC_STRIPE_STARTER/PROFESSIONAL/ENTERPRISE_PRICE_ID`

## 2. Committed in `.env.production` (repo root) — in git history
- [ ] **Postgres password** in `DATABASE_URL` → change the DB user's password,
      update the deploy env
- [ ] **Redis password** in `REDIS_URL` → rotate, update deploy env
- [ ] **`JWT_SECRET`** → generate a new one (`openssl rand -hex 32`); note this
      invalidates existing sessions/tokens

## 3. Committed in `apps/website/.env.production` — in git history
- [ ] **`DISCORD_WEBHOOK_URL`** → delete the webhook in Discord (Server Settings →
      Integrations → Webhooks) and create a new one; put the new URL in the
      server env, not in git

## 4. Stop tracking the env files (do AFTER the server has env another way)
`.gitignore` now ignores `.env.production`, but the files are still **tracked**.
Removing them from git will make the next `git pull` on the server delete them —
so first ensure the server gets its env independently (compose `env_file` outside
git, or values injected from a secret store). Then:
```bash
git rm --cached .env.production apps/website/.env.production
git commit -m "Untrack .env.production (secrets moved to server env)"
```

## 5. (Optional) Scrub git history
The secrets remain in past commits even after untracking. To purge them, rewrite
history with `git filter-repo` or BFG and force-push. This is destructive and
rewrites shared history — coordinate with anyone else on the repo first.

## 6. Prevent recurrence
- `.gitignore` now blocks `.env.production` / `.env.prod`
- `ci-security.yml` runs gitleaks (currently non-blocking; make it blocking
  **after** history is scrubbed, or it will flag the existing history)
