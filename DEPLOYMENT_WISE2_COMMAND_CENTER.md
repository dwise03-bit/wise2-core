# WISE² Ghostty Command Center - Deployment Guide

## Production Deployment Status: ✅ READY

### Build & Push to Docker Registry

```bash
# Build Docker image
docker build -t wise2-command-center:latest wise2-command-center/

# Tag for registry
docker tag wise2-command-center:latest dwise03/wise2-command-center:latest

# Push to Docker Hub
docker push dwise03/wise2-command-center:latest
```

### Deploy to VPS (173.208.147.165)

```bash
# SSH to VPS
ssh dwise@173.208.147.165

# Pull latest image
docker pull dwise03/wise2-command-center:latest

# Update docker-compose.prod.yml entry:
cat >> docker-compose.prod.yml << 'EOF'
  wise2-command-center-standalone:
    image: dwise03/wise2-command-center:latest
    container_name: wise2-command-center-standalone
    restart: unless-stopped
    ports:
      - "127.0.0.1:3006:3006"
    networks:
      - wise2
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: "https://api.wise2.net"
EOF

# Start/restart service
docker-compose -f docker-compose.prod.yml up -d wise2-command-center-standalone

# Verify
docker logs wise2-command-center-standalone
docker ps | grep command-center
```

### Nginx Reverse Proxy Configuration

Add to `/etc/nginx/conf.d/wise2.conf`:

```nginx
# Command Center - System Status Dashboard
upstream command_center_upstream {
    server 127.0.0.1:3006;
}

server {
    server_name command.wise2.net;
    listen 443 ssl http2;
    
    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;
    
    location / {
        proxy_pass http://command_center_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP redirect
server {
    server_name command.wise2.net;
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

Reload nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## System Requirements

- **Node.js**: 20+ (Alpine)
- **RAM**: 512MB minimum (1GB recommended)
- **Disk**: 500MB for image + 200MB for app data
- **Network**: SSH tunnel to wise2-vps (ControlMaster)

## Environment Variables

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.wise2.net
PORT=3006
```

## Health Checks

```bash
# Health endpoint
curl http://localhost:3006/

# API endpoints
curl http://localhost:3006/api/system/vps-status
curl http://localhost:3006/api/system/gpu-status
curl http://localhost:3006/api/system/tailscale-status

# From VPS
curl https://command.wise2.net/
```

## Real-Time Data Sources

### ✅ Local Monitoring
- **Ollama**: HTTP API at localhost:11434
- **GPU/CUDA**: System detection (Apple Silicon / NVIDIA)
- **Tailscale**: Local `tailscale status` command

### ✅ VPS Integration (via SSH tunnel)
- **Docker**: `docker ps` command on 173.208.147.165
- **Services**: Traefik, PostgreSQL, Redis, wise2.net
- **SSH Protocol**: ControlMaster multiplexing for persistent connection

## Dashboard Features

✅ **Real-time Status Monitoring**
- Ollama model count
- GPU/CUDA availability
- Docker container health (8+ containers)
- VPS service status (online/offline)
- Tailscale VPN connection
- System credit mode

✅ **Auto-Refresh**
- 30-second update cycle
- Graceful error handling
- Service unavailable detection

✅ **Responsive Design**
- Desktop: 3-column layout (1728×960)
- Tablet: 2-column adaptive layout
- Mobile: Single-column stacked layout (375×812)

✅ **Terminal Aesthetic**
- Black OLED background (#020303)
- Chrome silver borders (#c7cdca)
- Neon green status (#65ff00)
- Electric blue accents (#48c8ff)
- Monospace typography

## Monitoring Commands

```bash
# Watch logs in real-time
docker logs -f wise2-command-center-standalone

# Monitor health
docker ps -f name=command-center

# Check resource usage
docker stats wise2-command-center-standalone

# Verify tunnel connectivity
ssh -O check wise2-vps

# Test API endpoints
for endpoint in vps-status gpu-status tailscale-status; do
  echo "Testing $endpoint..."
  curl -s http://localhost:3006/api/system/$endpoint | jq .
done
```

## Rollback Procedure

```bash
# Stop current version
docker stop wise2-command-center-standalone

# Pull previous image tag
docker pull dwise03/wise2-command-center:v1.0.0

# Update docker-compose
docker-compose -f docker-compose.prod.yml down wise2-command-center-standalone
# (modify image tag in docker-compose.prod.yml)

# Restart with previous version
docker-compose -f docker-compose.prod.yml up -d wise2-command-center-standalone
```

## Performance Targets

- **Page Load**: <1s (static + data fetch)
- **Data Refresh**: 30s interval
- **API Response**: <100ms
- **Memory**: <150MB
- **CPU**: <5% idle

## Security Notes

⚠️ **SSH Access**: Requires ControlMaster SSH connection to wise2-vps  
⚠️ **Credentials**: No secrets stored in Docker image  
⚠️ **Network**: Reverse proxy via HTTPS only  
⚠️ **Isolation**: Runs as non-root user (nodejs:1001)

## Deployment Checklist

- [ ] Docker image built and tested locally
- [ ] Image pushed to registry (dwise03/wise2-command-center:latest)
- [ ] SSH tunnel configured with ControlMaster
- [ ] Nginx config updated with reverse proxy
- [ ] SSL certificate valid (Let's Encrypt)
- [ ] Environment variables set on VPS
- [ ] Container starts and health checks pass
- [ ] APIs respond correctly
- [ ] Dashboard displays real data
- [ ] Monitoring/logging configured
- [ ] Rollback plan documented

---

**Last Updated**: 2026-08-30  
**Status**: Production Ready ✅  
**Deployment Path**: wise2-command-center → Docker → VPS → Nginx HTTPS
