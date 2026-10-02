# WISE² Clipper mobile deployment

Use GitHub Actions from mobile to deploy only the Clipper service.

## One-time requirement
Configure the repository or production-environment secret `VPS_SSH_KEY` with the authorized VPS deployment key. Never commit the key.

## Deploy
Open Actions → Deploy Clipper → Run workflow. Leave ref as `main` for production or provide a known branch/tag.

The workflow rebuilds only the `clipper` Docker Compose service, checks localhost port 3015, then verifies https://clipper.wise2.net.

## Rollback
Run the workflow with rollback enabled. The VPS records the commit active immediately before the last deployment.

## Safety
This workflow does not run database migrations and does not restart Postgres, Redis, Hermes, Command Center, or other WISE² services. A failed local Clipper health check automatically restores the previous commit.
