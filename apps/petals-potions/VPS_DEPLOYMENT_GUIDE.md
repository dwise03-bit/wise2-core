# Petals & Potions VPS Deployment Guide

## Quick Deploy

```bash
./deploy.sh claude/petals-potions-build-guu0cb production
```

The script handles everything:
- SSH to 173.208.147.165
- Pulls latest code
- Builds Docker image
- Stops old container
- Starts new container on port 3003
- Health checks
- Reloads nginx

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VPS (173.208.147.165)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐                                    │
│  │  nginx           │                                    │
│  │  (reverse proxy) │                                    │
│  └────────┬─────────┘                                    │
│           │                                              │
│  petals-potions.wise2.io                                │
│           │                                              │
│  ┌────────▼──────────────────────────────────┐         │
│  │  Docker Container (port 3003)             │         │
│  │  ┌─────────────────────────────────────┐  │         │
│  │  │  Petals & Potions Web               │  │         │
│  │  │  (Next.js 14 + React 18)            │  │         │
│  │  │                                      │  │         │
│  │  │  - Home page with hero              │  │         │
│  │  │  - Products & catalog               │  │         │
│  │  │  - Ritual quiz system               │  │         │
│  │  │  - Subscription management          │  │         │
│  │  │  - Customer accounts                │  │         │
│  │  │  - Orders & cart                    │  │         │
│  │  └─────────────────────────────────────┘  │         │
│  │                                            │         │
│  │  Health Check: /health (every 30s)        │         │
│  │  Restart Policy: Always                   │         │
│  └────────────────────────────────────────────┘         │
│           │                                              │
│  ┌────────▼──────────────────────────────────┐         │
│  │  Other Services (if needed)                │         │
│  │  - Port 3000: Main WISE² API              │         │
│  │  - Port 3001: nginx proxy to 3000         │         │
│  │  - Port 3004+: Future services            │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Port Configuration

| Port | Service | Purpose | Status |
|------|---------|---------|--------|
| 80/443 | nginx | HTTP/HTTPS reverse proxy | Active |
| 3000 | WISE² API | Main backend | Reserved |
| 3001 | nginx proxy | Redirects to port 3000 | Reserved |
| 3002 | — | Available | Open |
| **3003** | **Petals & Potions** | **Customer frontend** | **✓ ASSIGNED** |
| 3004+ | — | Available | Open |

⚠️ **Critical**: Always use port 3003 for Petals & Potions. Do not reassign without updating all configurations.

---

## Initial Setup (First Deploy)

### 1. SSH to Server

```bash
ssh dwise@173.208.147.165
```

### 2. Verify Ports Are Available

```bash
# Check if port 3003 is free
lsof -i :3003

# Should show nothing if available
```

### 3. Run Deploy Script

```bash
cd ~/wise2-core
./apps/petals-potions/deploy.sh claude/petals-potions-build-guu0cb production
```

### 4. Verify It's Working

```bash
# Check container
docker ps | grep petals-potions

# Test locally
curl http://localhost:3003/

# Test via nginx
curl -H "Host: petals-potions.wise2.io" http://localhost/
```

---

## Ongoing Deployments

### Quick Update

```bash
./deploy.sh  # Uses default branch and environment
```

### With Specific Options

```bash
./deploy.sh my-feature-branch staging
```

### Manual Steps (if script fails)

```bash
# SSH to server
ssh dwise@173.208.147.165 << 'EOF'
  cd ~/wise2-core
  
  # Pull latest code
  git fetch origin && git checkout claude/petals-potions-build-guu0cb && git pull
  
  # Build image
  docker build -f apps/petals-potions/Dockerfile.prod -t petals-potions:latest .
  
  # Stop old container
  cd apps/petals-potions && docker-compose -f docker-compose.prod.yml down
  
  # Start new container
  docker-compose -f docker-compose.prod.yml up -d
  
  # Verify
  docker logs petals-potions-web -f
EOF
```

---

## Monitoring

### Real-Time Logs

```bash
ssh dwise@173.208.147.165 "docker logs -f petals-potions-web"
```

### Resource Usage

```bash
ssh dwise@173.208.147.165 "docker stats petals-potions-web"
```

### Health Status

```bash
ssh dwise@173.208.147.165 "docker inspect petals-potions-web --format='{{.State.Health.Status}}'"
```

### Nginx Access Logs

```bash
ssh dwise@173.208.147.165 "tail -f /var/log/nginx/petals-potions-access.log"
```

---

## Troubleshooting

### Service Won't Start

```bash
ssh dwise@173.208.147.165
docker logs petals-potions-web
# Look for error messages and fix accordingly
```

### Port 3003 Already in Use

```bash
ssh dwise@173.208.147.165
lsof -i :3003
# Kill the process if it's not the correct service
kill -9 <PID>
```

### Nginx Routing Not Working

```bash
ssh dwise@173.208.147.165

# Test nginx config
sudo nginx -t

# Reload if OK
sudo systemctl reload nginx

# Check if service is reachable
curl http://localhost:3003/
```

### Health Check Failing

```bash
ssh dwise@173.208.147.165

# Check logs
docker logs petals-potions-web

# Manual health check
curl http://localhost:3003/health
```

---

## SSL/TLS Setup (Production)

### 1. Obtain Certificate

```bash
ssh dwise@173.208.147.165

# Using Let's Encrypt
sudo certbot certonly --standalone \
  -d petals-potions.wise2.io \
  --non-interactive \
  --agree-tos \
  -m dwise03@gmail.com
```

### 2. Update Nginx Config

Uncomment HTTPS section in `infrastructure/nginx/conf.d/petals-potions.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name petals-potions.wise2.io;

    ssl_certificate /etc/letsencrypt/live/petals-potions.wise2.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/petals-potions.wise2.io/privkey.pem;
    
    # ... rest of config
}
```

### 3. Reload Nginx

```bash
sudo systemctl reload nginx
```

### 4. Test HTTPS

```bash
curl https://petals-potions.wise2.io/
```

---

## Rollback Procedure

### If New Deployment Breaks Something

```bash
ssh dwise@173.208.147.165 << 'EOF'
  cd ~/wise2-core/apps/petals-potions
  
  # Stop current container
  docker stop petals-potions-web
  
  # Use previous image (if available)
  docker run -d --name petals-potions-web \
    -p 3003:3003 \
    -e NODE_ENV=production \
    petals-potions:previous
  
  # Verify health
  sleep 5
  curl http://localhost:3003/health
  
  # If OK, reload nginx
  sudo systemctl reload nginx
EOF
```

---

## Performance Optimization

### Caching Headers (Already in Nginx)

Static assets are cached for 30 days. No additional configuration needed.

### Database Optimization

When connecting to databases, ensure:
- Connection pooling is enabled
- Indexes on frequently queried columns
- Query optimization (see API documentation)

### Container Resources

Current settings in docker-compose.prod.yml:
- No explicit memory limit (uses system memory)
- Restart policy: always
- Health check: every 30s with 40s startup grace period

### Monitoring Performance

```bash
# Real-time stats
docker stats petals-potions-web

# Memory usage
docker inspect petals-potions-web --format='{{.HostConfig.Memory}}'

# Nginx request rate
tail -f /var/log/nginx/petals-potions-access.log | wc -l
```

---

## Disaster Recovery

### Backup Strategy

```bash
ssh dwise@173.208.147.165 << 'EOF'
  # Backup container data
  docker cp petals-potions-web:/app ./backups/petals-potions-$(date +%Y%m%d)
  
  # Backup nginx config
  cp -r /etc/nginx/conf.d ./backups/nginx-$(date +%Y%m%d)
  
  # Save image
  docker save petals-potions:latest | gzip > backups/petals-potions-image-$(date +%Y%m%d).tar.gz
EOF
```

### Quick Restore

```bash
ssh dwise@173.208.147.165 << 'EOF'
  # Load image from backup
  docker load < backups/petals-potions-image-YYYYMMDD.tar.gz
  
  # Restart service
  docker run -d --name petals-potions-web \
    -p 3003:3003 \
    petals-potions:latest
EOF
```

---

## Maintenance Schedule

- **Daily**: Monitor logs and health checks
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Full system health audit and backup verification

---

## Support Contacts

- **VPS Admin**: dwise (dwise03@gmail.com)
- **Server**: 173.208.147.165
- **Service Port**: 3003
- **Domain**: petals-potions.wise2.io

---

**Last Updated**: 2026-08-20  
**Deployment Status**: ✓ Ready for Production  
**Verified On**: VPS 173.208.147.165
