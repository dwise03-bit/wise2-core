# WISE² Deployment Guide

## Production Deployment

### Docker Compose (Recommended)

```bash
cd infrastructure
docker-compose up -d
```

This starts:
- **Ultimate Hub**: http://localhost:8765 (WISE² command center)
- **Web App**: http://localhost:3000 (Main portal)
- **API Gateway**: http://localhost:8000
- **PostgreSQL**: Database
- **Redis**: Caching

### With Nginx Reverse Proxy

```bash
# Add nginx service to docker-compose.yml
docker-compose up -d
```

Access via:
- `http://localhost/` - Main web app
- `http://localhost/hive` - Ultimate Hub
- `http://localhost/api` - API Gateway

## Production URLs

- **WISE² Ultimate Hub**: https://wise2.net/hive
- **Main Portal**: https://wise2.net
- **API Gateway**: https://api.wise2.net
- **Health Check**: https://wise2.net/hive/api/health

## System Status

Check system health:
```bash
curl https://wise2.net/hive/api/health
curl https://wise2.net/hive/api/status
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS certificates installed
- [ ] Nginx reverse proxy configured
- [ ] Health checks passing
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Log aggregation active

## Scaling

For high traffic:
1. Use load balancer (AWS ELB, nginx, etc.)
2. Scale container instances
3. Use managed PostgreSQL
4. Add Redis cluster
5. Enable CDN for static assets

## Rollback

```bash
# Rollback to previous version
docker-compose down
git revert <commit>
docker-compose up -d
```

## Monitoring

Monitor with:
- `docker stats` - Container resource usage
- `docker logs <container>` - Application logs
- `/api/health` - Service health
- `/api/status` - System metrics
