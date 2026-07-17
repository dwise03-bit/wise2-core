# GitHub Actions Deployment Setup

## Required Secrets

To enable automated deployment to wise2.net, configure the following secrets in your GitHub repository settings:

### 1. DEPLOY_HOST
- **Value:** `wise2.net`
- **Purpose:** SSH host for deployment
- **Location:** Settings → Secrets and variables → Actions → New repository secret

### 2. DEPLOY_USER
- **Value:** `dwise`
- **Purpose:** SSH username for deployment
- **Location:** Settings → Secrets and variables → Actions → New repository secret

### 3. DEPLOY_KEY
- **Value:** Your SSH private key (from `~/.ssh/id_rsa` or equivalent)
- **Purpose:** SSH authentication for remote deployment
- **Location:** Settings → Secrets and variables → Actions → New repository secret
- **Security Note:** Use a dedicated deploy key, not your personal SSH key. Consider using a key with restricted file permissions.

## Deployment Path

The workflow deploys to `/home/dwise/wise2-core` on the remote host.

**Verification:**
```bash
ssh dwise@wise2.net "ls -la /home/dwise/wise2-core"
```

## Docker Compose Configuration

The deployment uses `docker-compose.prod.yml`. Ensure this file exists and is configured to:
1. Pull latest images
2. Rebuild services
3. Start services with `-d` (detached mode)

**Current workflow steps:**
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## Health Checks

After deployment, the workflow runs health checks on:
- `http://localhost:3000` — Main application
- `http://localhost:3010/api/health` — API health endpoint

Both must return HTTP 200 within 30 attempts (60 seconds total) for deployment to succeed.

## Triggering Deployment

The workflow automatically triggers on pushes to `main` that touch:
- `apps/website/**`
- `apps/dashboard/**`
- `apps/admin/**`
- `packages/api/**`
- `docker-compose.prod.yml`
- `.github/workflows/deploy-production.yml`

## Monitoring Deployment

1. **GitHub UI:** Actions tab → Deploy to Production → Latest run
2. **Remote logs:** `ssh dwise@wise2.net "docker-compose -f /home/dwise/wise2-core/docker-compose.prod.yml logs --tail 50"`
3. **Health status:** `curl http://wise2.net/api/health`

## Troubleshooting

### Deployment fails at "Deploy via SSH"
- Check DEPLOY_HOST, DEPLOY_USER, DEPLOY_KEY are configured in GitHub Secrets
- Verify SSH key has proper permissions (`chmod 600`)
- Test SSH connection manually: `ssh -i <key> dwise@wise2.net "echo OK"`

### Health check timeout
- Verify Docker Compose services are starting: `ssh dwise@wise2.net "docker ps"`
- Check logs: `ssh dwise@wise2.net "docker-compose -f /home/dwise/wise2-core/docker-compose.prod.yml logs --tail 50"`
- Ensure health endpoints are responding: `curl -v http://wise2.net:3000` and `curl -v http://wise2.net:3010/api/health`

### Services stay offline
- Check port availability on remote host
- Verify Docker Compose file references correct ports and services
- Review docker-compose.prod.yml health check configuration

## Next Steps

1. ✅ Fixed: Deploy path updated to `/home/dwise/wise2-core`
2. ✅ Fixed: DEPLOY_USER variable added to workflow
3. **TODO:** Configure DEPLOY_HOST, DEPLOY_USER, DEPLOY_KEY in GitHub Secrets UI
4. **TODO:** Test deployment by pushing to main with one of the trigger paths

---

**Date Updated:** July 17, 2026  
**Status:** Ready for GitHub Secrets configuration
