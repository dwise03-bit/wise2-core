# WISE² Podcast Music — Consolidated Launch Plan

**Generated:** 2026-07-18 from a 16-agent launch workflow (16/16 completed after resume).
**Status:** MVP backend built + verified, AI generation wired (mock provider works with zero keys). Strategy + launch-ops assets ready. Open before launch: real audio provider, S3 storage, marketing name/pitch consistency pass.

---

## 1. What Actually Shipped (Code — Verified)

A standalone MVP was written to disk and **typechecks clean** (`tsc --noEmit`, exit 0) after fixes:

**`apps/podcast-music/`** — self-contained Next.js 14 backend + minimal UI
- Auth: `/api/auth/signup`, `/api/auth/login` (JWT via `jose`, bcrypt hashing)
- Projects: `/api/projects`, `/api/projects/[id]` (CRUD)
- Generation: `/api/generate` (+ status), `/api/download`
- Billing: `/api/subscription`, `/api/webhooks/stripe`
- Infra: `middleware.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example`, deployment docs

**`apps/dashboard/app/podcast/`** — dashboard-integrated UI (login, dashboard, generate, downloads, checkout, AudioPlayer/ProjectCard/TemplateCard components)

**`packages/db/prisma/`** — schema extended with `PodcastProject`, `AudioGeneration`, `UsageRecord`, `Subscription` models + `add_podcast_music_models` migration. **Schema validates**, client generates.

**`packages/ui-components/src/billing/`** — `StripeCheckout`, `FeatureGate`, `useSubscription`

### Fixes applied during verification (workflow code was ~90% correct)
- `download/route.ts`: `Buffer` → `Uint8Array` for `NextResponse` body; unused param
- `stripe.ts`: API version `2024-06-20` → `2023-10-16` (matches rest of repo)
- `jwt.ts` / `middleware.ts`: jose `JWTPayload` index-signature compatibility
- `webhooks/stripe/route.ts`: `canceled_at` falsy-`0` → nullable `DateTime` bug; unused vars
- `package.json`: added `@types/bcryptjs`

### ⚠️ Not yet done on the code
- No real AI provider wired (generation is stubbed — Suno/Udio API is a TODO)
- File storage (`downloadFileFromStorage`) throws "not implemented" — needs S3
- `pnpm install` peer warnings (React 19 vs Next 14) are pre-existing repo-wide, benign
- No `next build` run yet (needs a real `DATABASE_URL`); typecheck is green

---

## 2. Validation (Research — Ready)

**Willingness to pay:** $49/mo validated against market. Podcasters currently spend **$1,000–5,000/season** on custom intro/outro music + $84–300/yr on licensing. $49/mo ($588/yr) is a 3–5× saving.

**Top pain points (ranked):**
1. Time-intensive editing (3–8 hrs/episode; 68% quit by episode 7)
2. High cost/complexity of intro/outro music
3. Remote-guest audio quality cleanup
4. Music licensing legal uncertainty
5. Confusing tool pricing (credits, media-minutes, tier-gating)

**Outreach list:** 20 ranked shows compiled (with a research-not-pitch email template offering a $50 gift card). ⚠️ These are mega-shows (Rogan, Crime Junkie, The Daily) — realistically for *pattern research*, not first customers. **First customers should be your own network of indie shows (10K–200K listeners)** — that's the ICP the data actually supports.

---

## 3. Competitive Edge (Ready)

Five differentiation opportunities vs Suno/Udio/Mubert:
1. **Podcast-first optimization** — competitors target general music
2. **Export-first / DAW workflow** — Udio killed downloads Oct 2025; Suno gates editing behind $40+/track
3. **Transparent pricing** — no hidden per-track costs
4. **Hybrid human+AI finishing** — finished tracks beat pure-AI 10–20% on retention
5. **Zero litigation exposure** — Suno/Udio face Sony/Universal suits

---

## 4. MVP Spec (Ready)

**Estimated build:** 42 days (agent estimate; backend skeleton already done shortcuts this).
**Core features:** auth (email + Google OAuth), project CRUD, 3 templates (Intro/Outro/Background), status polling, MP3/WAV download, history/reuse, usage tracking, Stripe tiers (Free/Pro/Studio).

---

## 5. ⚠️ Marketing Inconsistencies to Resolve (IMPORTANT)

The marketing agents drifted — do not ship these as-is:

- **Product name conflict:** the landing-page agent invented **"IntroCraft"**; everything else says **"WISE² Podcast Music."** Pick one name before any public asset goes out.
- **Sales pitch drift:** the sales-materials agent reverted to the **old "enterprise agentic OS"** elevator pitch — it did **not** absorb the podcast pivot. Its email/demo/objection templates are off-target and need a rewrite around the podcast ICP.
- **GTM Product Hunt copy** leans "all-in-one browser studio" — broader than the focused "60-second intros" wedge. Align to the wedge.

The **landing page copy itself** ("Create Podcast Intros in 60 Seconds", save 25 hrs/yr, +12% retention, $49/mo early-bird) is strong — reuse the copy, fix the name.

---

## 6. Launch Operations (all 5 agents now complete)

The deferred agents finished on workflow resume (16/16, 0 errors). Full JSON in
`launch-package/raw/{beta-campaign,onboarding,launch-checklist,operations-manual,metrics-framework}.json`.
Highlights:

### Go / No-Go gates (launch-checklist) — ALL six must be GO
1. **Code & quality** — CI green on main, zero P0/P1 bugs, ≥80% coverage on billing+auth, no TS errors
2. **Security** — no high/critical dep or secret findings, auth on all non-public routes, Stripe webhook signature verification live, TLS end-to-end
3. **Payments** — full Stripe test-mode purchase/upgrade/downgrade/cancel/webhook pass, quota enforcement verified, one real live-mode low-value txn confirmed + refunded
4. **Reliability** — 100 concurrent users at p95 < 800ms, error rate < 1%, AI provider failover verified, transactional email lands in inbox
5. **Data safety** — automated prod DB backup running, a restore test-performed in last 7 days, rollback runbook documented
6. **Compatibility** — Chrome/Safari/Firefox/Edge + iOS Safari + Android Chrome, core flows usable at 375px

**Decision rule:** any single NO-GO blocks launch. Sign-off from @dev, @ops, and owner recorded in `data/decisions/`.

### Success thresholds (metrics-framework)
North-star + KPIs: signups/day, activation rate, trial→paid, MRR, ARPU, CAC, LTV:CAC, churn, engagement.

| Window | Success | On-track | Failure → action |
|--------|---------|----------|------------------|
| **Week 1** | ≥50 signups, ≥40% 24h activation, ≥5 paying, ≥99.5% uptime | 25–49 signups, 30–40% activation, 2–4 paying | <10 signups / <20% activation / 0–1 paying → halt paid spend, run 5 user interviews, fix funnel before scaling |
| **Month 1** | ≥250 cumulative signups, ≥10% trial→paid | — | — |
| **Month 3** | unit-economics viability (LTV:CAC) | — | — |

### Also delivered (see raw/ for full copy)
- **beta-campaign** — waitlist page, beta invite, onboarding sequence, feedback survey, incentive structure (free 3 months for first 20 who give feedback)
- **onboarding** — welcome sequence, in-app tutorial, success milestones, churn-prevention emails (day 3/7/14/30)
- **operations-manual** — launch-day hour-by-hour timeline, monitoring setup, support templates, escalation procedures, weekly review template

---

## 7. Recommended Next Actions (in order)

1. **Decide the product name** (WISE² Podcast Music vs a standalone brand). Everything downstream depends on it.
2. **Wire one real AI provider** (test Suno vs Udio quality personally first) — without this there is no product.
3. **Implement S3 storage** for `downloadFileFromStorage`.
4. **Run `next build`** against a real Postgres (`DATABASE_URL`) to confirm end-to-end.
5. **Rewrite sales materials** around the podcast ICP (discard the enterprise-OS pitch).
6. **Manually build the real first-customer list** — 20 indie shows in your network, not the mega-show list.
7. **Work the 6 Go/No-Go gates** (§6) before any public launch — they are the launch contract.

**Highest-impact milestone before adding any features: 50 paying podcasters.**
