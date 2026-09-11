# WISE² SoundLabs Live — Customer Onboarding Runbook

## Required environment

- `DATABASE_URL` — production PostgreSQL connection string.
- `JWT_SECRET` — the same 32+ character secret used by the WISE² login issuer.
- `CORS_ORIGIN` — comma-separated allowed HTTPS origins, e.g. `https://studio.wise2.net,https://wise2.net`.
- `PORT` — optional, defaults to `3045`.

Never commit real values.

## Database

Apply once before starting the service:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_onboarding.sql
```

The migration is additive: it creates Live Session, participant and message tables and does not drop existing SoundLabs tables.

## Build and verify

```bash
npm install --no-audit --no-fund
npm test
npm run build
docker build -t wise2-soundlabs-live .
```

All commands must exit 0 before deployment.

## Deploy

Run the container behind the existing WISE² TLS reverse proxy. Do not expose PostgreSQL or JWT secrets to the browser.

Verify:

```bash
curl -fsS https://<soundlabs-live-host>/health
```

Expected:

```json
{"service":"soundlabs-live","status":"healthy","database":"connected"}
```

## First customer onboarding smoke test

1. Create/sign in the customer through the existing WISE² account flow.
2. Obtain the WISE² access token.
3. `POST /v1/onboarding` with `Authorization: Bearer <token>` and JSON:

```json
{"projectName":"Customer Studio","roomTitle":"First Live Session","crowdMode":"GUIDED"}
```

4. Confirm HTTP 201 and record the returned session id.
5. `GET /v1/sessions/<sessionId>` with the same token.
6. Confirm the customer appears as `OWNER`.
7. Send one test message to `POST /v1/sessions/<sessionId>/messages`.
8. Confirm another account without session membership receives 403 for that room.

## Rollback

If the service fails after deployment, remove it from the reverse proxy and roll back the container image. Leave the additive tables in place so customer room data is preserved. Do not drop tables as an application rollback.
