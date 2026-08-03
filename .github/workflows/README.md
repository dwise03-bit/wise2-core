# GitHub Actions CI/CD Workflows

Active workflows for WISE² Enterprise production system.

## Active Workflows

### `ci.yml` - Continuous Integration (Type-check & Build)
- **Trigger**: Push to `main`/`develop`, pull requests
- **Steps**:
  - Install dependencies (pnpm monorepo)
  - Generate Prisma client
  - Type-check podcast-music (blocking)
  - Type-check workspace (informational)
  - Lint & test workspace (informational)
- **Status**: ✅ Essential - runs on every push

### `ci-security.yml` - Security Scanning
- **Trigger**: Push to `main`/`develop`, PRs, daily at 2 AM UTC
- **Steps**:
  - Trivy filesystem scan (dependencies & vulnerabilities)
  - Gitleaks scan (secrets detection)
- **Status**: ✅ Essential - automated security audit

### `deploy.yml` - Production Deployment
- **Trigger**: Push to `main` branch only
- **Steps**:
  - SSH into production server (173.208.147.165)
  - Pull latest code from GitHub
  - Build Docker images (Dockerfile.api, Dockerfile.website)
  - Start services via docker-compose.minimal.yml
  - Health check database, Redis, website
- **Requires secrets**: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`
- **Status**: ✅ Live - auto-deploys on main push

## Archived Workflows

Old/broken workflows moved to `.archived/` for reference:
- `ci-build.yml` - Used wrong Dockerfile path (packages/api/Dockerfile)
- `ci-pr-checks.yml` - Referenced non-existent workflows
- `deploy-production.yml` - Used old docker-compose.prod.yml

## Secrets Configuration

Required GitHub repository secrets:

| Secret | Purpose |
|--------|---------|
| `DEPLOY_HOST` | Server IP: 173.208.147.165 |
| `DEPLOY_USER` | SSH user: dwise |
| `DEPLOY_KEY` | Private SSH key (for GitHub Actions) |

**To configure:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add each secret with the exact names above

## Deployment Flow

```
Push to main
    ↓
GitHub Actions `deploy.yml` triggered
    ↓
SSH into server (173.208.147.165)
    ↓
Pull latest code from main
    ↓
Build Docker images:
  - Dockerfile.api → wise2-core_api:latest
  - Dockerfile.website → wise2-core_website:latest
    ↓
Start services via docker-compose.minimal.yml:
  - PostgreSQL (port 5432)
  - Redis (port 6379)
  - API (port 3010)
  - Website (port 3000)
    ↓
Health check all services
    ↓
✅ https://wise2.net live with latest code
```

## Adding New Workflows

To add a new CI workflow:

1. Create `.github/workflows/my-check.yml`
2. Add trigger (push, pull_request, etc.)
3. Define jobs with steps
4. Test on feature branch before merging to main

Example structure:
```yaml
name: My New Check

on:
  push:
    branches: [main]
  pull_request:

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run check
        run: echo "Hello from CI"
```

## Troubleshooting

### Deployment not triggered
- Check: Push is to `main` branch (not develop)
- Check: GitHub secrets are configured (Settings → Secrets)
- Check: Workflow file exists and has no syntax errors
- View: https://github.com/dwise03-bit/wise2-core/actions

### Deployment failed on server
- SSH to server: `ssh dwise@173.208.147.165`
- Check logs: `docker logs wise2-api-prod`
- Check services: `docker ps`
- Manually deploy: `cd /home/dwise/wise2-core && bash FINAL_DEPLOYMENT.sh`

### CI checks failing
- Type-check: Most are informational (non-blocking)
- Blocking: Only podcast-music must type-check
- Fix locally: `pnpm run type-check`
- Generate Prisma: `cd packages/db && npx prisma generate`

## Status

✅ **All systems operational**
- CI checks: Running on every push
- Security scans: Automated
- Deployments: Auto-deploy on main push to https://wise2.net

Monitor at: https://github.com/dwise03-bit/wise2-core/actions
