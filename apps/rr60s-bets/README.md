# RR 60s Bets — phase 1 foundation

## Current architecture

WISE² is a pnpm monorepo. Its public Next.js website lives in `apps/website`, API services in `packages/api` and `services/api`, and Prisma data packages in `packages/db`. The public website's root layout injects global rules that hide headers and navigation. RR 60s Bets therefore starts as an isolated Next.js app at `apps/rr60s-bets` on local port 3016, with no production routing or database migration yet.

## What works now

- Responsive landing page preserving the supplied Hodge-left / Eazy-right composite unchanged.
- Seven-sport simulated scanner, timestamped FanDuel and DraftKings quotes, best-price comparison, and explanatory signal panel.
- Shareable demo play text, saved demo plays, local bet tracking with result entry, and analytics calculated from all locally tracked settled bets.
- Configurable local stake limits and responsible-play messaging.
- `OddsProvider` contract with `getSports`, `getEvents`, `getMarkets`, `getOdds`, and `getEventOdds`; `DemoOddsProvider` is explicitly separate from any future live provider.

All product data is **simulated**. Browser local storage is used only for the demo. No sportsbook credentials, provider calls, wager placement, authentication, verified performance data, or actual AI model calls exist.

## Run and verify

With workspace dependencies installed:

```sh
pnpm --filter @wise2/rr60s-bets dev
pnpm --filter @wise2/rr60s-bets type-check
pnpm --filter @wise2/rr60s-bets test
pnpm --filter @wise2/rr60s-bets build
```

Open `http://localhost:3016`.

## Implementation plan and exact services

1. **Identity and permissions:** add auth and profiles in `apps/rr60s-bets/app`, plus dedicated RR account tables/migrations in `packages/db`. Define age/jurisdiction and access controls before real accounts.
2. **Provider integration:** implement a server-only adapter in `apps/rr60s-bets/lib/odds.ts` or a dedicated RR API package. Add licensed provider credentials only as server environment variables. Normalize timestamps, event IDs, markets, odds formats, and source provenance. Keep the demo provider behind an explicit environment mode.
3. **Persistent product model:** add sports, leagues, teams, players, events, markets, odds snapshots, plays and legs, slips, bets and results, strategies and rules, alerts, shared plays, comments, notifications, bankroll entries, analytics snapshots, and uploaded evidence to `packages/db`; index event, market, book, and capture time. Design migrations against a copy of production data.
4. **API and realtime:** expose validated RR endpoints through a dedicated service or scoped module in `packages/api`; workers fetch provider data into Redis/PostgreSQL and publish SSE/WebSocket updates. Browsers never poll sportsbooks directly.
5. **Product workflows:** replace local state in `apps/rr60s-bets/components/Experience.tsx` with account-backed scanner, shared-play delivery, strategy lifecycle, bet entry and result reconciliation, complete analytics, community discussion, and evidence-grounded RR AI. Split the current foundation screen into route-level components as backend contracts stabilize.
6. **Security and launch:** enforce rate limits, data retention, audit logs, age/jurisdiction rules, responsible-play controls, provider terms, and deployment checks. Do not enable real-money wager placement unless a supported lawful integration is approved and built.

## Current gaps

The separate app has no signup/login, persistent cross-device storage, live odds, actual scan engine, real-time notifications, functional community discussion, actual AI assistant, or production analytics. The supplied art is one flattened page image; independent canonical portraits and logo files would allow a more faithful responsive composition without duplicated text in crops. The demo event names and signal scores are illustrative, not historical outcomes or betting advice.

## Dedicated subdomain deployment

`rr60sbets.wise2.net` uses a separate `wise2-rr60s-bets` container on VPS loopback port 3017 and a dedicated nginx virtual host. Build the Linux image from this app source with `Dockerfile.release`, then start `docker-compose.yml` on the VPS. The HTTPS virtual host is defined in `infrastructure/nginx/rr60sbets.wise2.net.conf`. The app remains demo-only at this public endpoint.

## Android APK

The Android WebView shell source and build instructions are in `android/README.md`. The signed 0.1.0 APK is on the VPS at `/home/dwise/rr60s-bets/releases/android/RR60s-Bets-0.1.0.apk`. It loads the public demo site over HTTPS and requires connectivity. Android build, lint, package metadata, and signature checks passed; device launch remains unverified because no Android device or emulator was connected.

### Deployment status — 2026-10-04

- VPS image `wise2-rr60s-bets:20261004b` built from source at `/home/dwise/rr60s-bets/releases/20261004-source`.
- Container `wise2-rr60s-bets` is healthy, bound only to `127.0.0.1:3017`; it does not share or recreate the WISE² website/API/database containers.
- Dedicated nginx HTTPS host in `/etc/nginx/sites-enabled/rr60sbets.wise2.net` proxies to port 3017. Its Let's Encrypt certificate expires 2027-01-02.
- Cloudflare has a proxied A record for `rr60sbets` pointing to `173.208.147.165`. A hostname-scoped Configuration Rule sets origin SSL mode to Strict so the zone's Flexible default does not cause a redirect loop.
- Cloudflare edge and direct origin HTTPS requests return HTTP 200. Desktop and mobile Chrome renders passed against the public URL using an isolated hostname mapping while the local home router still cached NXDOMAIN; the scanner interaction also responded. Public DNS answers correctly from Cloudflare's resolver.

Required DNS record: `A rr60sbets → 173.208.147.165` in the Cloudflare `wise2.net` zone. After propagation, issue a Let's Encrypt certificate with the configured HTTP challenge directory, install the final nginx config, test and reload nginx, then verify the public URL, port mapping, container health, and rendered UI.
