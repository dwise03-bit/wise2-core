# WISE TOUCH // PROMPT SHOP — Claude Engineering Handoff

## Your role and operating rule

Continue this existing production website incrementally. Inspect before editing, preserve working behavior and visual identity, and do not replace functioning features with a new scaffold. The product is WISE TOUCH™, branded **CONTROL. CONNECT. COMMAND.** It will run on the same Linux VPS/server as WISE2.

Start by running:

```bash
npm install
npm test
npm run build
```

Current verified baseline: **72/72 tests pass**, Vite production build passes, Docker image builds, and Docker Compose configuration validates when required production variables are supplied.

## Stack and entry points

- React 18 + Vite 6 + Tailwind CSS
- Node.js + Express 5
- PostgreSQL through `pg`
- Docker Compose with PostgreSQL, application container, and Caddy HTTPS edge proxy
- Frontend entry: `src/main.jsx`
- Primary application shell: `src/components/WiseTouchDirectoryCleanRebuild.jsx`
- API entry: `server/index.js`
- Express composition: `server/app.js`
- Catalog data/normalization: `src/data/`
- Website route manifest: `src/routes/routeManifest.js`
- Tests: `tests/*.test.js`

## Completed product surface

- Dashboard / Build Floor
- System Bays with first-class Systems and Subsystems
- WT Docs, search, filters, Favorites, and Blueprint Vault
- Hybrid Mixer supporting System/System, System/Subsystem, and Subsystem/Subsystem blends totaling exactly 100%
- Production Prompt Engine and protected optional Claude enhancement route
- Preview Build and My Builds asset library
- Free Images studio with direct PNG/JPEG/WebP upload, text-to-image, img2img, treatment presets, automatic same-page results, and My Builds filing
- Low-Cost Video architecture with Replicate/fal adapters, asynchronous jobs, current operator-supplied pricing, cost ceilings, and prepaid-credit gating; paid video generation is disabled by default
- Supply Depot, Blueprints Marketplace, cart/wishlist, and honest staged checkout boundary
- Resources / Learn & Grow
- Account / Settings
- Shareable URL-backed routes and mobile navigation

## Image generation and W² entitlement boundary

Images use a private AUTOMATIC1111-compatible Stable Diffusion endpoint configured by `LOCAL_IMAGE_API_URL`. This avoids a per-image provider fee; electricity, storage, and server operations still cost money. Conservative P1000 4GB defaults are 512×512, 640×384, or 384×640.

`server/image/LocalImageAdapter.js` stores each clean original privately under `GENERATED_IMAGE_DIR/clean`. Free users receive a separate PNG with the official W² logo baked repeatedly into the pixels. Paid Pro users receive an owner-bound authenticated clean route. Never expose the clean path in a free response and never let frontend state decide entitlement.

Official logo asset:

`server/assets/w2-signature-primary.png`

## Stripe Pro subscription implementation

Stripe integration is implemented but intentionally inert until credentials are configured.

- Billing service: `server/billing/StripeBillingService.js`
- Billing routes: `server/routes/billing.js`
- Raw webhook mounted before `express.json()` in `server/app.js`
- Hosted subscription Checkout uses only server-owned `STRIPE_PRO_PRICE_ID`
- Customer portal is available to linked authenticated customers
- Verified webhook events activate/revoke entitlement on Checkout completion, paid/failed invoices, subscription updates, and deletion
- PostgreSQL entitlement records store Stripe customer/subscription/status mapping
- The browser cannot submit a price or self-activate Pro
- Missing billing configuration leaves the website safely free and watermarked

Do not hard-code a subscription price and do not make a live Stripe call during development or testing.

## Required production configuration

Copy `.env.example` to a protected `.env.production` and supply real values only on the server:

```text
DATABASE_URL=
AUTH_SECRET=
APP_URL=https://your-domain.example
LOCAL_IMAGE_API_URL=http://host.docker.internal:7860
GENERATED_IMAGE_DIR=/app/generated

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

VIDEO_GENERATION_ENABLED=false
VIDEO_GLOBAL_MAX_JOB_COST_USD=2.00
REPLICATE_API_TOKEN=
REPLICATE_VIDEO_MODEL=
REPLICATE_VIDEO_VERSION=
REPLICATE_VIDEO_COST_PER_SECOND_USD=
FAL_KEY=
FAL_VIDEO_MODEL=
FAL_VIDEO_COST_PER_SECOND_USD=
FAL_VIDEO_FLAT_COST_USD=
```

Also provide Compose values including `POSTGRES_PASSWORD` and `DOMAIN`. Never commit `.env.production` or provider secrets.

Stripe webhook destination:

```text
https://YOUR_DOMAIN/api/billing/webhook
```

## Cost and safety rules

1. Keep local image generation free to the user, with the official W² watermark for non-paying users.
2. Only verified server-side payment events may remove the watermark entitlement requirement.
3. Keep video generation disabled until users can purchase/reconcile credits safely.
4. Never call a paid provider without authenticated credit reservation and operator-set cost metadata.
5. Never accept provider credentials, prices, entitlement flags, or ownership identifiers from the browser.
6. Preserve raw-body Stripe signature verification and same-origin protections.
7. Do not delete or normalize the catalog casually; duplicate subsystem names are intentionally parent-scoped.

## Immediate next work, in order

1. Merge the owner's incoming final graphics without changing the application architecture.
2. Configure/test the private AUTOMATIC1111 image service on the shared WISE2 host using a non-production sample image.
3. Create the Stripe Product/recurring Price in the owner's Stripe dashboard, add production variables, register the webhook, and test only in Stripe test mode.
4. Run an end-to-end test-mode flow: register → free watermarked image → subscribe → webhook activates Pro → clean owner-bound image → portal cancellation → webhook restores watermark requirement.
5. Deploy to the shared VPS with backup/restore verification, HTTPS, persistent PostgreSQL, and persistent generated-image storage.
6. Leave paid video disabled until credit purchasing, ledger reconciliation, and refund behavior are fully verified.

## Important known state

- No live payment was made.
- No paid image/video provider request was made.
- Stripe credentials and subscription price were not supplied.
- The local image engine must be running separately before generation becomes ready.
- The latest automated browser runner was unavailable, but unit/integration tests, production compilation, Docker build, and Compose validation passed.
- Owner is preparing final graphics now; use supplied assets rather than inventing replacements.

## Useful documentation

- `README.md`
- `docs/FINAL_PRODUCTION_AUDIT.md`
- `docs/DESIGN_HANDOFF_MERGE.md`
- `docs/COST_CONTROL.md`
- `.env.example`
- `compose.yaml`

## First response to the owner

Briefly confirm that you found the existing website and will continue it rather than rebuild it. Then report the result of `npm test` and `npm run build`, identify any missing deployment variables, and proceed with the highest-priority safe task that does not require a live credential or paid request.
