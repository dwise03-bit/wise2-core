# CJAYS Auto Recon Solutions

Native Android application for vehicle scanning, customer records, jobs, checklists, payments, and offline-first field operations.

## Current field workflow

Scan a Code 39/128, QR, or Data Matrix VIN label (or enter it manually), decode new VINs through NHTSA vPIC, find/create the vehicle and customer, start a job, capture before photos, complete the service checklist, add work notes, capture after photos, record payment, and complete the job. Operational records and original photos persist locally when the network is unavailable.

## Build

```bash
./scripts/build-cjays-android.sh debug
```

Artifacts are copied to `release/`. Release signing is configured only through environment variables; no signing secrets belong in Git.

## Release signing

Set `CJAYS_RELEASE_KEYSTORE`, `CJAYS_RELEASE_STORE_PASSWORD`, `CJAYS_RELEASE_KEY_ALIAS`, and `CJAYS_RELEASE_KEY_PASSWORD`, then run:

```bash
./scripts/build-cjays-android.sh release
```

## Install debug APK

```bash
adb install -r release/cjays-debug.apk
```

## Environments

API endpoints are injected with `CJAYS_API_BASE_URL`. Builds default to the Wise² API at `https://wise2.net/api/`; release builds require an HTTPS endpoint.

## Wise² integration

CJAYS authenticates through `POST /v1/auth/login`, refreshes sessions through `POST /v1/auth/refresh`, and synchronizes through the tenant-scoped `POST /v1/cjays/sync` endpoint. Tokens are stored with Android encrypted preferences. The server resolves tenant membership from the authenticated Wise² user and never trusts a tenant ID supplied in record payloads.

Before deploying the API, apply the Prisma migration in `packages/db/prisma/migrations/20260824020000_add_cjays_auto_recon/` and deploy the updated `@wise2/platform-api` package.

## Wise² AI and Google Workspace

Job records can be reviewed by the Wise² Hermes model for summaries, follow-up drafts, checklist suggestions, and quality-control gaps. Prompts are grounded in the tenant-scoped CJAYS record and results are labeled as suggestions requiring human approval.

Google Workspace connects through OAuth with Calendar Events, Drive File, and Gmail Send scopes. Calendar creation, Drive exports, and Gmail sends are blocked unless the user explicitly approves the individual action. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `CJAYS_GOOGLE_REDIRECT_URI` on the Wise² API; never place Google secrets in the APK.
