# WISE² production deployment

## One canonical path

Use the root command below for production. It validates the local production
Compose file, catches whitespace/errors, builds the HVAC app, deploys the exact
`origin/main` revision, and checks the public customer routes.

```bash
./scripts/deploy-production-safe.sh
```

Optional overrides are environment variables, not edited script values:

```bash
REMOTE_HOST=dwise@host REMOTE_ROOT=/home/dwise/wise2-core \
  ./scripts/deploy-production-safe.sh
```

## Ownership

- `docker-compose.prod.yml` is the production service definition.
- `apps/wise-hvac-demo/Dockerfile` owns the HVAC production image.
- `infrastructure/nginx/` owns versioned nginx snippets and server blocks.
- `/etc/nginx/sites-enabled/wise2.net` on the VPS is live edge configuration;
  changes there must be copied back into `infrastructure/nginx/` in the same
  change so the next deploy does not regress them.
- `.env` and provider credentials remain on the server and are never committed.

## Before accepting paid onboarding

The app can be deployed without provider credentials, but customer provisioning
must remain disabled until production has the 20i API key, the three 20i package
IDs, Stripe Starter/Pro price IDs, and the intended storefront-live setting.
The deploy script does not invent or enable those values.

## Other Compose files

The other `docker-compose.*` files are environment-specific or legacy. They are
not production entry points and should not be used for a Wise2.net deploy.
