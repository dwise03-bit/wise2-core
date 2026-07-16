# WISE² Production Deployment Guide

Complete guide for deploying WISE² Core to production with Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 8GB RAM available
- 50GB+ disk space for data volumes
- Linux/macOS/Windows with Docker Desktop

## Step 1: Prepare Production Environment

### 1.1 Clone and Navigate to Project

```bash
cd /path/to/wise2-core
```

### 1.2 Create Production Environment File

```bash
# Copy the template
cp .env.prod.local .env.production

# Edit with your production values
nano .env.production
```

**Required Changes**:
- `POSTGRES_ADMIN_PASSWORD`: Strong, random password for PostgreSQL admin
- `POSTGRES_APP_PASSWORD`: Strong, random password for application user
- `JWT_SECRET`: Strong, random secret (min 32 characters)
- `REDIS_PASSWORD`: Strong, random password for Redis
- `GRAFANA_PASSWORD`: Password for Grafana admin access
- All OAuth credentials (Google, GitHub)
- Stripe API keys (if payment enabled)
- `CORS_ORIGIN`: Your production domains

### 1.3 Generate Strong Passwords

```bash
# Generate random passwords
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
```

## Step 2: Database Initialization

The database initializes automatically on first startup. The initialization script:

1. Creates `wise2_core_prod` database
2. Creates `wise2_prod_user` application user
3. Creates all 8 required tables with indexes
4. Sets up triggers and views
5. Grants proper permissions

**No manual SQL execution needed!**

## Step 3: Start Production Stack

### 3.1 Pull Latest Images

```bash
# Optional: update base images
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull node:20-alpine
```

### 3.2 Start Services

```bash
# Start in background
docker-compose -f docker-compose.prod.yml up -d

# Watch startup progress
docker-compose -f docker-compose.prod.yml logs -f
```

### 3.3 Wait for Initialization

```bash
# Monitor database initialization (takes 30-60 seconds)
docker-compose -f docker-compose.prod.yml logs postgres

# Watch for "initialization complete" message
# Then check all services are healthy
docker-compose -f docker-compose.prod.yml ps

# Expected output: all services should show "healthy" or "running"
```

## Step 4: Verify Deployment

### 4.1 Health Checks

```bash
# Check database connection
docker exec wise2-postgres-prod pg_isready -U wise2_prod_user -d wise2_core_prod

# Verify database tables exist
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';"

# Expected output: table_count = 8
```

### 4.2 API Endpoint Test

```bash
# Test API health endpoint
curl -f http://localhost:3010/api/health

# Expected output: {"status":"ok"}
```

### 4.3 Website Test

```bash
# Test website
curl -f http://localhost:3000/

# Should return HTML homepage
```

### 4.4 Redis Connection Test

```bash
# Test Redis
docker exec wise2-redis-prod redis-cli -a ${REDIS_PASSWORD} ping

# Expected output: PONG
```

## Step 5: Configure SSL/TLS (HTTPS)

### 5.1 Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d wise2.net -d api.wise2.net

# Certificates stored in /etc/letsencrypt/live/
```

### 5.2 Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/wise2-prod`:

```nginx
server {
    listen 443 ssl http2;
    server_name wise2.net www.wise2.net;

    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.wise2.net;

    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name wise2.net www.wise2.net api.wise2.net;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/wise2-prod /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: Backup Configuration

### 6.1 Automated Daily Backups

Create `/opt/wise2/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/wise2"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec wise2-postgres-prod pg_dump -U wise2_prod_user -d wise2_core_prod | \
  gzip > $BACKUP_DIR/wise2_db_$DATE.sql.gz

# Remove old backups
find $BACKUP_DIR -name "wise2_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: wise2_db_$DATE.sql.gz"
```

Make executable and add to crontab:

```bash
chmod +x /opt/wise2/backup.sh

# Add to root crontab
sudo crontab -e
# Add: 0 2 * * * /opt/wise2/backup.sh
```

### 6.2 Monitor Backups

```bash
# List backups
ls -lh /backups/wise2/

# Test restore (in staging environment only)
gunzip < /backups/wise2/wise2_db_TIMESTAMP.sql.gz | \
  psql -U wise2_prod_user -d wise2_core_prod
```

## Step 7: Monitoring & Alerts

### 7.1 Access Prometheus

```
http://localhost:9090
```

Metrics available:
- PostgreSQL query performance
- Redis memory usage
- API response times
- Container resource usage

### 7.2 Access Grafana

```
http://localhost:3100
```

Default credentials:
- Username: `admin`
- Password: From `GRAFANA_PASSWORD` in `.env.production`

### 7.3 Setup Email Alerts (Optional)

Update Grafana notification channels for email alerts.

## Step 8: Ongoing Maintenance

### 8.1 Daily Tasks

```bash
# Monitor logs
docker-compose -f docker-compose.prod.yml logs --tail=100 -f

# Check health
docker-compose -f docker-compose.prod.yml ps
```

### 8.2 Weekly Tasks

```bash
# Analyze database
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "ANALYZE;"

# Check slow queries
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### 8.3 Monthly Tasks

```bash
# Vacuum full
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "VACUUM FULL ANALYZE;"

# Review audit logs
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 month';"
```

### 8.4 Update PostgreSQL

```bash
# Check current version
docker exec wise2-postgres-prod psql --version

# Update image in docker-compose.prod.yml
# Then recreate container:
docker-compose -f docker-compose.prod.yml down postgres
docker-compose -f docker-compose.prod.yml up -d postgres
```

## Troubleshooting

### PostgreSQL Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs postgres

# Check disk space
df -h /var/lib/docker/volumes/

# Check permissions
docker volume inspect wise2-core_postgres_data
```

### API Can't Connect to Database

```bash
# Test connection from API container
docker exec wise2-api-prod psql -h postgres -U wise2_prod_user -d wise2_core_prod \
  -c "SELECT version();"

# Check API logs
docker-compose -f docker-compose.prod.yml logs api
```

### High Memory/CPU Usage

```bash
# Check container stats
docker stats wise2-postgres-prod wise2-api-prod

# Review slow queries
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "SELECT query, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 20;"

# Add indexes if needed
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod \
  -c "CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);"
```

## Disaster Recovery

### Complete Database Restore

```bash
# Stop API to prevent connections
docker-compose -f docker-compose.prod.yml stop api

# Restore database
gunzip < /backups/wise2/wise2_db_TIMESTAMP.sql.gz | \
  docker exec -i wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod

# Restart API
docker-compose -f docker-compose.prod.yml up -d api

# Verify
docker exec wise2-api-prod curl -f http://localhost:3001/api/health
```

### Complete System Rebuild

```bash
# Stop everything
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: Data loss!)
docker volume rm wise2-core_postgres_data wise2-core_postgres_wal wise2-core_redis_data

# Start fresh
docker-compose -f docker-compose.prod.yml up -d

# Restore database backup
gunzip < /backups/wise2/wise2_db_TIMESTAMP.sql.gz | \
  docker exec -i wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod
```

## Security Checklist

- [ ] All default passwords changed
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (port 443, 80 only public)
- [ ] SSH keys configured for server access
- [ ] Backups tested and verified
- [ ] Monitoring and alerts configured
- [ ] Audit logs reviewed
- [ ] Database permissions verified
- [ ] Docker images scanned for vulnerabilities
- [ ] Container restart policies set to `unless-stopped`

## Performance Tuning

### PostgreSQL

Edit docker-compose.prod.yml PostgreSQL environment:

```yaml
POSTGRES_INITDB_ARGS: >-
  -c max_connections=200
  -c shared_buffers=256MB
  -c effective_cache_size=1GB
  -c work_mem=32MB
```

### Nginx (if using reverse proxy)

```nginx
worker_processes auto;
worker_connections 10000;
keepalive_timeout 65;
sendfile on;
tcp_nopush on;
gzip on;
```

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Let's Encrypt](https://letsencrypt.org/)
- [WISE² Database Schema](./infrastructure/database/SCHEMA_DESIGN.md)
- [Docker Infrastructure Guide](./infrastructure/docker/README.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose -f docker-compose.prod.yml logs`
3. Verify environment variables: `docker-compose -f docker-compose.prod.yml config`
4. Test database connection manually
5. Contact DevOps team with logs and configuration details
