# WISE² Genesis v1.0 - Deployment Guide

## Quick Start (Docker Compose)

### Prerequisites
- Docker and Docker Compose installed on server (173.208.147.165)
- User: `dwise` with SSH access
- Production secrets configured

### Step 1: Clone Repository
```bash
ssh dwise@173.208.147.165
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
```

### Step 2: Configure Production Secrets
```bash
cp .env.prod.example .env.prod
# Edit .env.prod with actual production values
nano .env.prod
```

Required secrets:
- DATABASE_PASSWORD
- JWT_SECRET
- REDIS_PASSWORD
- STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
- SENDGRID_API_KEY
- Google OAuth credentials
- Discord Bot token (optional)

### Step 3: SSL Certificates
```bash
mkdir -p certs
# Add your SSL certificates:
# - certs/wise2.net.crt (certificate)
# - certs/wise2.net.key (private key)
```

### Step 4: Deploy
```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### Step 5: Verify Deployment
```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000  # Should see website
curl http://localhost:3010  # Should see API health check
```

## Services

| Service | Port (Internal) | Port (External) | Container |
|---------|-----------------|-----------------|-----------|
| Nginx Reverse Proxy | 80, 443 | 80, 443 | wise2-nginx |
| API (NestJS) | 3000 | 3010 | wise2-api |
| Website (Next.js) | 3001 | 3000 | wise2-website |
| Prompt Shop | 3002 | 3002 | wise2-prompt-shop |
| Studio | 3005 | 3005 | wise2-studio |
| PostgreSQL | 5432 | 5432 | wise2-db |
| Redis | 6379 | 6379 | wise2-redis |

## Management

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f website
```

### Restart Service
```bash
docker compose -f docker-compose.prod.yml restart api
```

### Stop All Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Update Deployment
```bash
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Database Connection Failed
- Check DATABASE_PASSWORD in .env.prod
- Verify postgres container is healthy: `docker compose -f docker-compose.prod.yml logs postgres`

### API Not Responding
- Check JWT_SECRET is set
- Verify database is running: `docker compose -f docker-compose.prod.yml ps postgres`
- View API logs: `docker compose -f docker-compose.prod.yml logs api`

### Port Already in Use
- Check running containers: `docker ps`
- Kill conflicting processes: `sudo lsof -i :8080`

### SSL Certificate Issues
- Verify certs directory exists with proper permissions
- Ensure certificate files are named correctly
- Check nginx logs: `docker compose -f docker-compose.prod.yml logs nginx`

## GitHub Actions Auto-Deployment

The repository is configured to automatically deploy via GitHub Actions when pushing to main branch.

**Required GitHub Secrets:**
- DOCKER_USERNAME
- DOCKER_PASSWORD
- DEPLOY_HOST (173.208.147.165)
- DEPLOY_USER (dwise)
- DEPLOY_KEY (SSH private key)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SENDGRID_API_KEY
- DATABASE_URL

Once secrets are configured, deployments happen automatically on push to main.

## Monitoring

### Health Checks
All services have health checks configured. View status:
```bash
docker compose -f docker-compose.prod.yml ps
# Look for "(healthy)" status
```

### Database Backups
PostgreSQL data is stored in named volume `postgres_data`.

Backup:
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U wise2 wise2_prod > backup.sql
```

Restore:
```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U wise2 wise2_prod < backup.sql
```

## Production Checklist

- [ ] SSL certificates in certs/ directory
- [ ] .env.prod configured with all secrets
- [ ] Database password changed from default
- [ ] Redis password changed from default
- [ ] JWT_SECRET is a strong, random string
- [ ] STRIPE credentials configured
- [ ] SendGrid API key configured
- [ ] Google OAuth credentials configured
- [ ] Domain DNS pointing to server (173.208.147.165)
- [ ] Firewall allowing ports 80, 443, 3000-3010
- [ ] Monitoring and alerting configured
- [ ] Backup strategy in place

## Support

For issues or questions:
1. Check logs: `docker compose -f docker-compose.prod.yml logs -f`
2. Review GitHub Issues: https://github.com/dwise03-bit/wise2-core/issues
3. Contact: dwise03@gmail.com
