# Production Deployment Guide - WISE² Ultimate Hub

## Automatic Deployment (GitHub Actions)

The Ultimate Hub automatically deploys to production when:
1. Code is pushed to `main` branch
2. Changes are in `apps/ultimate-hub/` directory
3. Deployment workflow is triggered manually

**Workflow:** `.github/workflows/deploy-ultimate-hub.yml`

### Deployment Process

1. **Build:** Node.js dependencies installed, Docker image built
2. **Deploy:** Docker container pushed to production server
3. **Configure:** Nginx routing updated to `/hive` endpoint
4. **Verify:** Health check confirms deployment success

### Manual Trigger

```bash
# Trigger deployment via GitHub Actions
gh workflow run deploy-ultimate-hub.yml
```

## Manual Deployment

### Prerequisites

- SSH access to production server (DEPLOY_HOST, DEPLOY_USER, DEPLOY_KEY)
- Docker & Docker Compose installed on server
- Nginx configured for reverse proxy

### Secrets Required (GitHub)

```
DEPLOY_HOST      # Production server IP/hostname
DEPLOY_USER      # SSH user on production server
DEPLOY_KEY       # SSH private key (ed25519)
```

### Steps

1. **Copy code to server:**
```bash
scp -r apps/ultimate-hub deploy_user@wise2.net:/opt/wise2-ultimate-hub/
```

2. **Deploy with Docker Compose:**
```bash
ssh deploy_user@wise2.net
cd /opt/wise2-ultimate-hub
docker-compose up -d ultimate-hub
```

3. **Configure Nginx:**
```bash
sudo tee -a /etc/nginx/sites-enabled/wise2.net.conf << 'EOF'
location = /hive {
    return 301 /hive/;
}

location ^~ /hive/ {
    proxy_pass http://localhost:8765/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

4. **Verify:**
```bash
curl https://wise2.net/hive/api/health
```

## Production URLs

- **Main Interface:** https://wise2.net/hive
- **Health Check:** https://wise2.net/hive/api/health
- **System Status:** https://wise2.net/hive/api/status
- **AI Status:** https://wise2.net/hive/api/ai
- **WebSocket:** wss://wise2.net/hive (via Nginx upgrade)

## Monitoring

### Health Check
```bash
curl https://wise2.net/hive/api/health
```

### View Logs
```bash
docker-compose logs -f ultimate-hub
```

### Monitor Performance
```bash
docker stats ultimate-hub
```

## Rollback

### Quick Rollback
```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout HEAD~1

# Rebuild and restart
docker-compose up -d --build ultimate-hub
```

### Database/State

The Ultimate Hub is stateless - no data to migrate on rollback.

## Scaling

### Multiple Instances
```bash
docker-compose up -d --scale ultimate-hub=3
```

### Load Balancing
Update Nginx to round-robin across instances:
```nginx
upstream ultimate-hub {
    server localhost:8765;
    server localhost:8766;
    server localhost:8767;
}

location ^~ /hive/ {
    proxy_pass http://ultimate-hub;
    # ... rest of config
}
```

## SSL/TLS

Nginx handles SSL termination with Let's Encrypt certificates at:
- `/etc/letsencrypt/live/wise2.net/fullchain.pem`
- `/etc/letsencrypt/live/wise2.net/privkey.pem`

Automatic renewal via certbot cron job.

## Environment Variables

Production variables set in `apps/ultimate-hub/.env.production`:
```
NODE_ENV=production
PORT=8765
HOST=127.0.0.1
CORS_ORIGIN=*
RATE_LIMIT=100
LOG_LEVEL=info
```

## Backup Strategy

1. **Code:** Git repository (main branch)
2. **Configuration:** Nginx config backups in `/etc/nginx/backups/`
3. **Logs:** Docker logs retained for 3 files, 10MB each
4. **State:** None required (stateless application)

## Support

For issues:
1. Check `docker-compose logs -f ultimate-hub`
2. Verify `curl https://wise2.net/hive/api/health`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/access.log`
4. Restart service: `docker-compose restart ultimate-hub`
