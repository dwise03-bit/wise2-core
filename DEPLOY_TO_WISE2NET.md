# WISE² Video Clipper v2.0 - Deployment to wise2.net

## 🎯 Overview

Complete production deployment guide for hosting WISE² Video Clipper on **wise2.net** domain running on VPS at **173.208.147.165**.

**Timeline:** ~15-20 minutes  
**Downtime:** None (new deployment)  
**Rollback:** Docker image rollback to previous version

---

## 📋 Prerequisites

- [ ] Domain wise2.net registered
- [ ] VPS at 173.208.147.165 provisioned (Ubuntu/Debian)
- [ ] SSH access as `dwise` user
- [ ] Docker installed on VPS
- [ ] DNS control panel access (for A record configuration)

---

## 🚀 Deployment Steps

### Step 1: Configure DNS (5 minutes)

**In your domain registrar:**

```
Record Type: A
Host: wise2.net
Value: 173.208.147.165
TTL: 3600

Record Type: CNAME
Host: www
Value: wise2.net
TTL: 3600
```

**Verify DNS propagation:**
```bash
nslookup wise2.net
dig wise2.net
```

### Step 2: SSH into VPS

```bash
ssh dwise@173.208.147.165
```

### Step 3: Download & Run Deployment Script

```bash
cd /home/dwise/wise2-core
git pull origin main
bash deploy-wise2-net.sh
```

**This automated script will:**
- ✅ Update system packages
- ✅ Install Docker & Docker Compose
- ✅ Setup SSL certificate (Let's Encrypt)
- ✅ Configure Nginx reverse proxy
- ✅ Start Docker services (API + Web UI + DB)
- ✅ Run database migrations
- ✅ Enable firewall & DDoS protection
- ✅ Verify deployment

**Estimated time: 10-15 minutes**

### Step 4: Verify Live Deployment

After script completes, verify:

```bash
# Check services running
docker-compose -f docker-compose.prod.yml ps

# Test API
curl https://wise2.net/api/v1/health

# Test Web UI
curl -I https://wise2.net

# Check SSL certificate
openssl x509 -enddate -noout -in /etc/letsencrypt/live/wise2.net/cert.pem
```

Open browser: **https://wise2.net**

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Website loads at https://wise2.net
- [ ] All 5 tabs work (Research, Upload, Create, Suggest, Publish)
- [ ] SSL certificate is valid (green lock)
- [ ] API responds at https://wise2.net/api/v1/health
- [ ] Dashboard animations play smoothly
- [ ] Mobile responsive (test on mobile device)
- [ ] Form inputs work
- [ ] Platform badges display

**Run verification script:**
```bash
bash verify-deployment.sh
```

---

## 📊 Live URLs

| Service | URL |
|---------|-----|
| **Web UI** | https://wise2.net |
| **API** | https://wise2.net/api/v1 |
| **Health Check** | https://wise2.net/api/v1/health |
| **WebSocket** | wss://wise2.net (via Nginx) |

---

## 🔐 Security Configuration

The deployment script automatically sets up:

✅ **SSL/TLS**
- Let's Encrypt certificate (auto-renewable)
- TLS 1.2 + 1.3
- Strong cipher suites

✅ **Firewall**
- UFW enabled
- Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- DDoS protection (Fail2Ban)

✅ **Nginx Security Headers**
- HSTS (Strict-Transport-Security)
- X-Frame-Options (SAMEORIGIN)
- X-Content-Type-Options (nosniff)
- CSP headers
- Rate limiting (10 req/sec per IP)

✅ **Application Security**
- JWT authentication
- Input validation
- CSRF protection
- XSS prevention

---

## 📈 Monitoring & Maintenance

### Daily Tasks

```bash
# Check service health
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Check disk space
df -h / /sdb-disk
```

### Weekly Tasks

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U wise2 wise2 > /sdb-disk/backups/wise2-$(date +%Y%m%d).sql

# Check SSL certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/wise2.net/cert.pem
```

### Monthly Tasks

```bash
# Full system check
ufw status
fail2ban-client status
docker stats
```

---

## 🔄 Updates & Redeployment

To update code and redeploy:

```bash
# On your local machine
cd /home/user/wise2-core
git add .
git commit -m "update: deployment changes"
git push origin main

# On VPS
cd /home/dwise/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec -T api npx prisma db push
```

---

## 🆘 Troubleshooting

### Issue: "Connection refused" on port 443

**Solution:**
```bash
sudo nginx -t  # Test config
sudo systemctl restart nginx
curl -I https://wise2.net
```

### Issue: SSL certificate not found

**Solution:**
```bash
sudo certbot certonly --nginx -d wise2.net -d www.wise2.net
sudo systemctl restart nginx
```

### Issue: Docker services not running

**Solution:**
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml up -d
```

### Issue: Database connection error

**Solution:**
```bash
docker-compose -f docker-compose.prod.yml exec db psql -U wise2 -c "SELECT 1"
docker-compose -f docker-compose.prod.yml exec -T api npx prisma db push
```

### Issue: Out of disk space

**Solution:**
```bash
df -h / /sdb-disk
# Move large files to /sdb-disk
docker system prune -a  # Clean up Docker images
```

---

## 💾 Backup & Disaster Recovery

### Automated Daily Backups

```bash
# Add to crontab
crontab -e

# Add this line:
0 2 * * * docker-compose -f /home/dwise/wise2-core/docker-compose.prod.yml exec db pg_dump -U wise2 wise2 > /sdb-disk/backups/wise2-$(date +\%Y\%m\%d).sql
```

### Restore from Backup

```bash
# List backups
ls /sdb-disk/backups/

# Restore
docker-compose -f docker-compose.prod.yml exec -T db psql -U wise2 wise2 < /sdb-disk/backups/wise2-20260929.sql
```

### Rollback to Previous Version

```bash
git log --oneline
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support

### Logs & Debugging

```bash
# API logs
docker-compose -f docker-compose.prod.yml logs api

# Web UI logs
docker-compose -f docker-compose.prod.yml logs website

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Health Check

```bash
# Service status
docker-compose -f docker-compose.prod.yml ps

# API response time
curl -w "Time: %{time_total}s\n" https://wise2.net/api/v1/health

# SSL expiration
sudo certbot certificates
```

---

## ✅ Final Status

After successful deployment:

```
🎉 WISE² Video Clipper v2.0 is LIVE on wise2.net

✅ Web UI:        https://wise2.net
✅ API:           https://wise2.net/api/v1
✅ SSL:           Let's Encrypt (auto-renewal)
✅ Firewall:      UFW + Fail2Ban
✅ Monitoring:    Docker logs + backups
✅ Uptime SLA:    99.9%

Domain:  wise2.net
VPS:     173.208.147.165
Status:  Production Ready
```

---

**Generated:** September 29, 2026  
**Version:** 2.0  
**Deployment Method:** Automated Docker + Nginx  
**Time to Deploy:** ~15 minutes

