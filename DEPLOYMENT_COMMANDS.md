# WISE TOUCH Prompt Shop — VPS Deployment Commands

**Status**: Ready to Deploy  
**Date**: 2026-08-17 00:00 UTC  
**PR**: Merged to main (PR #23)  
**VPS**: 173.208.147.165  
**User**: dwise

## Quick Deploy

From your local machine, run the deployment script:

```bash
cd ~/wise2-core
./scripts/deploy-prompt-shop.sh production
```

This script will:
1. Verify you're on main or claude/create-34p9dm
2. Push to remote
3. SSH into VPS and pull latest code
4. Build Docker image for prompt-shop
5. Stop old container
6. Start new container
7. Reload nginx
8. Verify deployment

## Manual Deployment (If Script Fails)

### Step 1: SSH to VPS
```bash
ssh -p 22 dwise@173.208.147.165
```

### Step 2: Navigate to Project
```bash
cd /home/dwise/wise2-core
```

### Step 3: Pull Latest Code
```bash
git fetch origin
git checkout main
git pull origin main
```

### Step 4: Build Docker Image
```bash
docker-compose -f docker-compose.prod.yml build prompt-shop
```

### Step 5: Stop Old Container (if running)
```bash
docker-compose -f docker-compose.prod.yml stop prompt-shop
```

### Step 6: Start New Container
```bash
docker-compose -f docker-compose.prod.yml up -d prompt-shop
```

### Step 7: Verify Container Health
```bash
# Check if container is running
docker ps | grep prompt-shop

# View logs
docker-compose -f docker-compose.prod.yml logs prompt-shop

# Check health status
docker ps --filter "name=wise2-prompt-shop" --format "table {{.Names}}\t{{.Status}}"
```

### Step 8: Reload Nginx
```bash
docker-compose -f docker-compose.prod.yml exec -T nginx nginx -s reload

# Or if that fails:
docker exec wise2-nginx nginx -s reload
```

### Step 9: Verify Deployment
```bash
# Check all WISE² services
docker ps --filter "name=wise2" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test the endpoint
curl -s https://wise2.net/prompt-shop | head -20
```

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs prompt-shop | tail -50
docker-compose -f docker-compose.prod.yml ps prompt-shop
```

### Port already in use
```bash
lsof -i :3002
# Kill the process if needed
kill -9 <PID>
```

### Nginx routing not working
```bash
# Verify upstream server in nginx.conf
docker exec wise2-nginx cat /etc/nginx/nginx.conf | grep -A5 prompt_shop

# Test nginx config
docker exec wise2-nginx nginx -t

# Reload nginx with force
docker exec wise2-nginx nginx -s reload
```

### Docker build fails
```bash
# Clean up unused images
docker system prune -a

# Try build again with no cache
docker-compose -f docker-compose.prod.yml build --no-cache prompt-shop
```

## Post-Deployment Verification

Visit in browser:
```
https://wise2.net/prompt-shop
```

Verify:
- ✓ Page loads without errors
- ✓ System Bays page works
- ✓ Mixer page loads with sliders
- ✓ Foreman mascot appears (bottom-right)
- ✓ Responsive design on mobile
- ✓ No console errors (F12 DevTools)

## Monitoring

Watch logs in real-time:
```bash
docker-compose -f docker-compose.prod.yml logs -f prompt-shop
```

Check health every 30s:
```bash
while true; do
  echo "$(date): $(docker ps --filter 'name=wise2-prompt-shop' --format '{{.Status}}')"
  sleep 30
done
```

## Rollback (If Needed)

If deployment fails and you need to rollback:

```bash
# Stop prompt-shop container
docker-compose -f docker-compose.prod.yml stop prompt-shop

# Optionally remove it
docker-compose -f docker-compose.prod.yml down prompt-shop

# Verify other services still running
docker ps | grep wise2

# Reload nginx
docker exec wise2-nginx nginx -s reload
```

## Success Indicators

Deployment is successful when:
1. ✅ `docker ps` shows `wise2-prompt-shop` with status "Up X seconds"
2. ✅ `https://wise2.net/prompt-shop` loads (no 502 Bad Gateway)
3. ✅ All pages load: `/`, `/systems`, `/mixer`, `/builds`, `/blueprints`
4. ✅ Browser console has no errors
5. ✅ Foreman mascot appears in bottom-right corner
6. ✅ Influence mixer sliders work and validate to 100%

## Architecture

```
Client Request
    ↓
https://wise2.net/prompt-shop
    ↓
Nginx (reverse proxy)
    ↓
prompt_shop_server upstream
    ↓
Docker Container: wise2-prompt-shop
    ↓
Next.js App (port 3002 internal)
```

## Support

For issues, check:
- Docker logs: `docker-compose logs prompt-shop`
- Nginx logs: `docker exec wise2-nginx cat /var/log/nginx/access.log`
- System resources: `docker stats`
- Network: `docker network inspect wise2`

---

**Deployed by**: Claude Code  
**Time**: $(date)  
**Status**: Ready for VPS Deployment
