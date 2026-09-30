# WISE² Video Clipper - wise2.net Hosting Setup Guide

## Overview
Complete guide to host WISE² Video Clipper on wise2.net domain with SSL/TLS, security hardening, and production optimization.

## Prerequisites
- Domain: wise2.net (registered and DNS configured)
- VPS: 173.208.147.165 (Ubuntu/Debian)
- Docker & Docker Compose installed
- Nginx installed
- Root or sudo access

## Step 1: DNS Configuration

### A Records (Point to VPS)
```
wise2.net          A      173.208.147.165
www.wise2.net      CNAME  wise2.net
```

### Verify DNS Propagation
```bash
nslookup wise2.net
dig wise2.net
```

## Step 2: SSL Certificate Setup

### Install Certbot
```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Generate Certificate
```bash
sudo certbot certonly --nginx -d wise2.net -d www.wise2.net
```

### Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo certbot renew --dry-run
```

## Step 3: Nginx Configuration

### Install Nginx Configuration
```bash
sudo cp deploy/nginx/wise2-clipper.conf /etc/nginx/sites-available/wise2-clipper
sudo ln -s /etc/nginx/sites-available/wise2-clipper /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### Test & Enable
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 4: Environment Variables Update

### Update .env File
```bash
# Create/update production .env
cat > /home/dwise/wise2-core/.env.production << 'EOF'
# Domain Configuration
APP_URL=https://wise2.net
API_BASE_URL=https://wise2.net/api
NEXT_PUBLIC_API_URL=https://wise2.net

# Database
DATABASE_URL=postgresql://wise2:PASSWORD@localhost:5432/wise2

# API Configuration
NODE_ENV=production
DEBUG=false

# JWT Secret (use strong random value)
JWT_SECRET=$(openssl rand -base64 32)

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# SendGrid (Email)
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@wise2.net

# OpenAI (Whisper API)
OPENAI_API_KEY=...

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_DIR=/sdb-disk/logs

# Monitoring
SENTRY_DSN=...
EOF
```

## Step 5: Deploy to wise2.net

### Push Latest Code
```bash
cd /home/dwise/wise2-core
git pull origin main
git checkout main
```

### Update Docker Compose
```bash
# Update docker-compose.prod.yml to use wise2.net domain
sed -i 's/173.208.147.165/wise2.net/g' docker-compose.prod.yml
```

### Deploy Services
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma db push

# Health check
curl -s https://wise2.net/api/v1/health | jq
```

## Step 6: Verify Live Deployment

### Test URLs
```bash
# API Health
curl https://wise2.net/api/v1/health

# Web UI
curl -I https://wise2.net

# Check SSL Certificate
curl -vI https://wise2.net 2>&1 | grep -i certificate
```

### Monitor Services
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f website
```

## Step 7: Security Hardening

### Firewall Configuration
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### Fail2Ban (DDoS Protection)
```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Rate Limiting
Already configured in Nginx - limits 10 req/sec per IP for /api/

### Security Headers Verification
```bash
curl -I https://wise2.net | grep -i "Strict-Transport-Security\|X-Content-Type\|X-Frame-Options"
```

## Step 8: Monitoring & Logging

### Log Locations
```
Access Log:     /sdb-disk/logs/wise2-clipper-access.log
Error Log:      /sdb-disk/logs/wise2-clipper-error.log
Container Log:  docker-compose logs [service]
```

### Monitor Disk Space
```bash
df -h / /sdb-disk
```

### Monitor Services
```bash
watch -n 5 'docker-compose -f docker-compose.prod.yml ps'
```

## Step 9: Backup Strategy

### Daily Backups
```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U wise2 wise2 > /sdb-disk/backups/wise2-$(date +%Y%m%d).sql

# Uploaded files
tar -czf /sdb-disk/backups/uploads-$(date +%Y%m%d).tar.gz /sdb-disk/uploads
```

### Automated Backup Cron
```bash
# Add to crontab
0 2 * * * cd /home/dwise/wise2-core && docker-compose -f docker-compose.prod.yml exec db pg_dump -U wise2 wise2 > /sdb-disk/backups/wise2-$(date +\%Y\%m\%d).sql && tar -czf /sdb-disk/backups/uploads-$(date +\%Y\%m\%d).tar.gz /sdb-disk/uploads
```

## Step 10: Performance Optimization

### Enable Gzip Compression
✓ Already configured in Nginx

### Enable HTTP/2
✓ Already configured in Nginx

### Browser Caching
✓ Already configured for static assets (30-day cache)

### Database Optimization
```bash
# Run vacuum on PostgreSQL
docker-compose -f docker-compose.prod.yml exec db psql -U wise2 wise2 -c "VACUUM ANALYZE;"
```

## Production URLs

| Service | URL |
|---------|-----|
| **Web UI** | https://wise2.net |
| **API** | https://wise2.net/api |
| **Health Check** | https://wise2.net/api/v1/health |
| **WebSocket** | wss://wise2.net (via Nginx upgrade) |

## Troubleshooting

### Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/wise2.net/cert.pem
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# View error log
sudo tail -f /var/log/nginx/error.log
```

### Docker Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache

# Full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Database Connection Issues
```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec api psql $DATABASE_URL -c "SELECT 1"
```

## Performance Monitoring

### Check Response Times
```bash
curl -w "Time taken: %{time_total}s\n" -o /dev/null -s https://wise2.net
```

### Monitor CPU & Memory
```bash
docker stats

# Or use system monitor
top
```

### Check Network
```bash
# Monitor bandwidth
iftop

# Check connections
netstat -an | grep ESTABLISHED | wc -l
```

## Maintenance Schedule

### Daily
- Monitor logs for errors
- Check disk space
- Verify services are running

### Weekly
- Review performance metrics
- Check security logs
- Backup verification

### Monthly
- SSL certificate validation
- Database optimization
- Security updates

### Quarterly
- Full security audit
- Performance optimization
- Disaster recovery drill

## Support Contacts

- SSL Issues: Let's Encrypt Support
- DNS Issues: Domain registrar support
- VPS Issues: VPS provider (173.208.147.165)
- Application Issues: support@wise2.net

## Documentation

- **API Docs**: https://wise2.net/api/docs
- **Architecture**: docs/ARCHITECTURE.md
- **Deployment**: DEPLOYMENT_SUMMARY_FINAL.md
- **Security**: docs/SECURITY.md

---

**Generated**: September 29, 2026  
**Status**: ✅ Production Ready  
**Domain**: wise2.net  
**VPS**: 173.208.147.165
