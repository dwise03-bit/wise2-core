# Wise² Core Deployment Guide

**Server:** 173.208.147.165 (Ubuntu 22.04)  
**Domain:** wise2.net  
**Status:** Production Ready  

---

## Pre-Deployment Checklist

- [ ] SSH access to 173.208.147.165 as root or sudo user
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Git repository cloned to server
- [ ] wise2.net domain DNS configured (A record → 173.208.147.165)
- [ ] SSL certificates ready (or Let's Encrypt setup)
- [ ] All secrets generated (.env.prod file ready)

---

## Step 1: Prepare the Server

SSH into the server:
```bash
ssh root@173.208.147.165
```

Clone the repository:
```bash
cd /opt
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core
```

Create production environment file:
```bash
cp .env.prod.example .env.prod
nano .env.prod  # Edit with your secrets
```

**Required secrets to generate:**
- `DB_PASSWORD` — Strong PostgreSQL password
- `JWT_SECRET` — Random string (openssl rand -base64 32)
- `RESEND_API_KEY` — From Resend.com dashboard
- `DISCORD_TOKEN` — From Discord Developer Portal
- `GRAFANA_PASSWORD` — Strong password for Grafana admin

---

## Step 2: Set Up SSL Certificates

Using Let's Encrypt with Certbot:

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot certonly --standalone -d wise2.net -d www.wise2.net -d api.wise2.net -d admin.wise2.net
```

Certificate will be stored at `/etc/letsencrypt/live/wise2.net/`

---

## Step 3: Create Docker Directories

```bash
mkdir -p config/grafana/provisioning/{dashboards,datasources}
```

---

## Step 4: Build and Start Services

Build Docker images:
```bash
docker-compose -f docker-compose.prod.yml build
```

Start all services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Verify services are running:
```bash
docker-compose -f docker-compose.prod.yml ps
```

All should show `Up` status.

---

## Step 5: Configure Nginx

Copy Nginx config:
```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/wise2
sudo ln -s /etc/nginx/sites-available/wise2 /etc/nginx/sites-enabled/wise2
```

Remove default site:
```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test Nginx config:
```bash
sudo nginx -t
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## Step 6: Initialize Database

Run migrations (if needed):
```bash
docker-compose -f docker-compose.prod.yml exec api npm run migrate
```

---

## Step 7: Verify Deployment

**Landing page:**
```bash
curl https://wise2.net
```

**API health:**
```bash
curl https://api.wise2.net/api/health
```

**Admin dashboard:**
```bash
curl https://admin.wise2.net
```

**Grafana:**
```bash
curl https://grafana.wise2.net
```

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api
```

### Database Backup

```bash
# Manual backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U wise2_user wise2 > backup_$(date +%Y%m%d).sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U wise2_user wise2 < backup_20260707.sql
```

### SSL Certificate Renewal

Certbot auto-renews every 60 days. To manually renew:
```bash
sudo certbot renew --dry-run  # Test
sudo certbot renew             # Actual renewal
```

### Monitor Uptime

**Prometheus** (metrics collection):
```
http://173.208.147.165:9090
```

**Grafana** (dashboards):
```
http://173.208.147.165:3001
```

Login with:
- Username: admin
- Password: (from .env.prod GRAFANA_PASSWORD)

---

## Troubleshooting

### Service won't start
```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
```

### Database connection error
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U wise2_user -d wise2
```

### Nginx SSL issues
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

### Clear all containers (WARNING: destructive)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

---

## Auto-Restart on Reboot

Ensure Docker services restart:
```bash
sudo systemctl enable docker
docker-compose -f docker-compose.prod.yml up -d
```

Add to crontab to ensure services restart on server reboot:
```bash
sudo crontab -e
# Add: @reboot cd /opt/wise2-core && docker-compose -f docker-compose.prod.yml up -d
```

---

## Performance Tuning

### Nginx Rate Limiting
- General: 50 req/s, burst 100
- API: 20 req/s, burst 50
- Admin: 10 req/s, burst 30

Adjust in `/etc/nginx/sites-available/wise2` if needed.

### PostgreSQL
- Default: 256MB shared_buffers
- Adjust in docker-compose.prod.yml environment if database grows

### Redis
- Default: in-memory with AOF persistence
- Suitable for deployments up to 1M requests/day

---

## Security Checklist

- [ ] SSH keys configured (no password auth)
- [ ] Firewall enabled (ufw)
- [ ] UFW rules: allow 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] SSL certificates auto-renewing
- [ ] Database password complex (20+ chars)
- [ ] API secrets rotated quarterly
- [ ] Backups automated and tested
- [ ] Monitoring alerts configured

---

## Support

For issues or updates:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Review Grafana dashboards for anomalies
3. Check SSL certificate status: `sudo certbot certificates`

---

**Deployed:** 2026-07-07  
**Last Updated:** 2026-07-07  
**Status:** 🟢 Production Ready
