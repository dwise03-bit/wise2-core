# Petals & Potions Deployment Guide

## Overview

Petals & Potions is deployed to **173.208.147.165** (dwise VPS) as a containerized Next.js application running on **port 3003**.

- **Application Port**: 3003
- **Service Name**: `petals-potions-web`
- **Domain**: petals-potions.wise2.io (routed via nginx)
- **Environment**: Production-ready with health checks

## Port Allocation

⚠️ **Port Conflict Prevention**:

```
Port 3000 → Main WISE² API (reserved)
Port 3001 → WISE² nginx expects API here (nginx proxy)
Port 3002 → (Available for future services)
Port 3003 → Petals & Potions Frontend ✓ ASSIGNED
Port 3004 → (Available for future services)
```

**Never use ports 3000 or 3001** for new services to avoid conflicts.

## Deployment Steps

### 1. Build the Production Image

```bash
cd /path/to/wise2-core

docker build \
  -f apps/petals-potions/Dockerfile.prod \
  -t petals-potions:latest \
  .
```

### 2. Deploy with Docker Compose

```bash
cd apps/petals-potions

# Start the service
docker-compose -f docker-compose.prod.yml up -d

# Verify it's running
docker ps | grep petals-potions

# Check logs
docker logs petals-potions-web -f
```

### 3. Configure Nginx

The nginx configuration is located at:
```
infrastructure/nginx/conf.d/petals-potions.conf
```

Include it in your main nginx config:
```nginx
# In /etc/nginx/nginx.conf or main config
include /path/to/wise2-core/infrastructure/nginx/conf.d/petals-potions.conf;
```

Then reload nginx:
```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

### 4. Verify Deployment

```bash
# Check if service is healthy
curl http://localhost:3003/health

# Test via nginx proxy
curl http://petals-potions.wise2.io/

# Check container logs
docker logs petals-potions-web
```

## Environment Variables

Set these in your deployment environment:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://petals-potions.wise2.io/api
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxx
PORT=3003
```

Store sensitive variables in a `.env.production` file (not committed to git).

## Health Checks

The container includes a health check that verifies the service is running:

```bash
docker inspect petals-potions-web --format='{{.State.Health.Status}}'
# Output: healthy
```

If unhealthy:
```bash
docker logs petals-potions-web
```

## SSL/TLS Setup

For production, configure SSL:

1. Obtain certificate (Let's Encrypt recommended):
```bash
sudo certbot certonly --standalone -d petals-potions.wise2.io
```

2. Uncomment HTTPS section in `petals-potions.conf`

3. Update paths:
```nginx
ssl_certificate /etc/ssl/certs/petals-potions.crt;
ssl_certificate_key /etc/ssl/private/petals-potions.key;
```

4. Reload nginx:
```bash
sudo systemctl reload nginx
```

## Monitoring

### Container Status
```bash
docker stats petals-potions-web
```

### Logs
```bash
# Real-time logs
docker logs -f petals-potions-web

# Last 100 lines
docker logs --tail 100 petals-potions-web

# Filter by timestamp
docker logs --since 2h petals-potions-web
```

### Nginx Access Logs
```bash
tail -f /var/log/nginx/petals-potions-access.log
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3003
lsof -i :3003

# Kill the process (if needed)
kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs
docker logs petals-potions-web

# Verify image exists
docker images | grep petals-potions

# Rebuild if necessary
docker build -f apps/petals-potions/Dockerfile.prod -t petals-potions:latest .
```

### Nginx Routing Issues
```bash
# Test nginx config
sudo nginx -t

# Reload after fixes
sudo systemctl reload nginx

# Check if upstream is reachable
curl http://localhost:3003/

# Test full domain
curl -H "Host: petals-potions.wise2.io" http://localhost/
```

### Health Check Failing
1. Verify app is running: `docker ps`
2. Check logs: `docker logs petals-potions-web`
3. Test endpoint: `curl http://localhost:3003/health`
4. Increase startup time if needed in docker-compose.prod.yml

## Updates & Rollback

### Update to New Version

```bash
# Pull latest code
git pull origin claude/petals-potions-build-guu0cb

# Rebuild image
docker build -f apps/petals-potions/Dockerfile.prod -t petals-potions:latest .

# Stop old container
docker stop petals-potions-web

# Start new container
docker-compose -f docker-compose.prod.yml up -d
```

### Rollback

```bash
# Keep old image tagged
docker tag petals-potions:latest petals-potions:v1.0.0

# Restart from previous image
docker run -d --name petals-potions-web -p 3003:3003 petals-potions:v1.0.0
```

## Maintenance

### Regular Tasks

- **Weekly**: Review logs for errors
- **Monthly**: Update dependencies (`npm audit`)
- **Quarterly**: Test backup/restore procedures
- **As needed**: Apply security patches

### Cleanup

```bash
# Remove unused images
docker image prune

# Remove stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

## Support

For issues, check:
1. Container logs: `docker logs petals-potions-web`
2. Nginx config: `sudo nginx -t`
3. Port availability: `lsof -i :3003`
4. Network connectivity: `curl http://localhost:3003/health`

---

**Last Updated**: 2026-08-20  
**Deployed to**: 173.208.147.165  
**Service Port**: 3003  
**Status**: ✓ Ready for production
