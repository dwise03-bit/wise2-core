# SoundLabs Live Studio - Docker Production Deployment Guide

## ✅ Production Status (2026-07-14)
- **Studio (Audio Engine)**: 100% Production Ready ✅
- **Clip Editor & Playback**: Complete ✅
- **Recording & Metering**: Full Web Audio API support ✅
- **Docker Stack**: Multi-service ready ✅
- **All Systems**: Build passing, optimized for deployment ✅

## Quick Start - Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM, 20GB+ disk space

### 1. Clone & Configure

```bash
# Clone repository
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core

# Copy production environment template
cp .env.production.example .env.production

# Edit with your production values
# CRITICAL: Change these values!
# - DB_PASSWORD
# - REDIS_PASSWORD  
# - JWT_SECRET
# - NEXT_PUBLIC_API_URL
nano .env.production
```

### 2. Build & Deploy

```bash
# Build Docker image
docker build -t wise2-soundlabs:latest .

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Monitor startup logs
docker-compose logs -f studio
```

### 3. Access Application

```
Studio (Audio Production):  http://localhost:3003
Dashboard:                   http://localhost:3002
Admin:                       http://localhost:3004
Website:                     http://localhost:3001
```

## Production Services

| Service | Port | Technology | Status |
|---------|------|-----------|--------|
| **Studio** | 3003 | Next.js 14 + Web Audio API | ✅ Ready |
| **Dashboard** | 3002 | Next.js 14 | ✅ Ready |
| **Admin** | 3004 | Next.js 14 | ✅ Ready |
| **Website** | 3001 | Next.js 14 | ✅ Ready |
| **API** | 3005 | Node.js | Ready for Phase 3 |
| **PostgreSQL** | 5432 | Database | ✅ Ready |
| **Redis** | 6379 | Cache | ✅ Ready |
| **Nginx** | 80/443 | Reverse Proxy | ✅ Ready |

## Advanced Configuration

### Security Settings for Production

```bash
# In .env.production - REQUIRED for security
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)

# Update these critical values
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://user:password@postgres:5432/wise2
```

### Performance Optimization

```bash
# Node.js settings (in Dockerfile or docker-compose)
NODE_OPTIONS=--max-old-space-size=2048

# Database connection pooling
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis settings
REDIS_POOL_SIZE=10
```

## Monitoring & Maintenance

### View Real-time Logs

```bash
# Studio application
docker-compose logs -f studio

# All services
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail=50
```

### Service Health Check

```bash
# Check if studio is responding
curl http://localhost:3003

# Check all ports
docker-compose ps

# Check resource usage
docker stats
```

### Database Backup & Restore

```bash
# Backup
docker-compose exec -T postgres pg_dump -U wise2_user wise2_core > backup.sql

# Restore
docker-compose exec -T postgres psql -U wise2_user wise2_core < backup.sql
```

## VPS Deployment (DigitalOcean/AWS/Linode)

### 1. SSH into Server
```bash
ssh root@your-server-ip
```

### 2. Install Docker & Docker Compose
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3. Clone & Deploy
```bash
cd /opt
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core

# Configure production environment
cp .env.production.example .env.production
# Edit .env.production with real values

# Deploy
docker-compose up -d

# Verify
docker-compose ps
```

### 4. Configure Nginx (included in docker-compose)
The docker-compose.yml includes Nginx reverse proxy on ports 80/443.

For SSL certificates, use Let's Encrypt:
```bash
docker run --rm --name certbot \
  -v /opt/wise2-core/ssl:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com \
  --agree-tos -m your-email@example.com
```

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Persistent volumes available
- Docker image pushed to registry

### Deploy

```bash
# Create namespace
kubectl create namespace soundlabs

# Create secrets
kubectl create secret generic wise2-secrets \
  --from-literal=db-password=YOUR_DB_PASSWORD \
  --from-literal=redis-password=YOUR_REDIS_PASSWORD \
  --from-literal=jwt-secret=YOUR_JWT_SECRET \
  -n soundlabs

# Apply manifests (create k8s/ directory with YAML files)
kubectl apply -f k8s/ -n soundlabs

# Check deployment
kubectl get pods -n soundlabs
kubectl get svc -n soundlabs
```

## Troubleshooting

### Studio Won't Start

```bash
# Check logs
docker-compose logs studio

# Verify build
docker build --no-cache -t wise2-soundlabs:latest .

# Restart container
docker-compose restart studio
```

### Database Connection Errors

```bash
# Test connection
docker-compose exec postgres psql -U wise2_user -d wise2_core -c "SELECT 1"

# Check network
docker network inspect wise2-network
```

### Performance Issues

```bash
# Monitor resources
docker stats

# Check database connections
docker-compose exec postgres psql -U wise2_user -d wise2_core -c "SELECT COUNT(*) FROM pg_stat_activity"

# Increase resources in docker-compose.yml
```

## Scaling for Production

### Recommended Setup
- **Server**: 4+ CPU cores, 8GB+ RAM, SSD
- **Database**: Separate managed PostgreSQL instance
- **Cache**: Managed Redis service
- **Storage**: S3 or similar for audio files
- **CDN**: CloudFront for static assets

### Load Balancing (Optional)

If running multiple instances:

```yaml
# docker-compose.yml addition
studio-1:
  image: wise2-soundlabs:latest
  # ... config

studio-2:
  image: wise2-soundlabs:latest
  # ... config

# Route through Nginx upstream
```

---

## Support & Documentation

- **GitHub**: https://github.com/yourusername/wise2-core
- **Issues**: Report bugs and feature requests
- **Wiki**: Detailed documentation
- **Slack**: Community support channel

**Status**: ✅ Ready for Production Deployment
**Last Updated**: July 14, 2026
**Version**: 1.0.0
