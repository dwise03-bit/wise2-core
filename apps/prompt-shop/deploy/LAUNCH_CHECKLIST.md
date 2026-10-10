# WISE TOUCH // Prompt Shop Launch Checklist

## Product readiness

- [x] Production build completes.
- [x] Automated test suite passes.
- [x] Static cinematic fallback is bundled in `public/assets/build-district-hero-v1.png`.
- [ ] Add an approved, compressed cinematic loop at `public/assets/build-district-loop.mp4` only after rights and performance review. The static hero remains the required fallback and reduced-motion experience.
- [ ] Populate production environment values from `deploy/env.production.example`.
- [ ] Configure provider keys only for services being enabled at launch.

## Safe VPS release

1. Create an off-host PostgreSQL backup using `deploy/backup.sh`.
2. Validate environment configuration with `node deploy/validate-env.mjs .env.production`.
3. Inspect the resolved Docker configuration with `docker compose --env-file .env.production config` without sharing its output.
4. Deploy with `docker compose --env-file .env.production up -d --build`.
5. Confirm `docker compose ps`, `GET /api/ready`, and `GET /api/health` before routing public traffic.
6. Monitor Caddy and application logs through the first release window.

## Explicit launch boundaries

- Do not present AI generation as live until a provider is configured and tested.
- Do not accept payment until Stripe price, webhook, and production keys are configured.
- Keep the database and secrets private to the Docker network.
