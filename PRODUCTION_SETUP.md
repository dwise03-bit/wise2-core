# WISE² Production Setup Guide

## 🚀 Quick Start

### 1. Deploy Complete Stack
```bash
bash scripts/deploy-production.sh
```

### 2. Check Deployment Status
```bash
bash scripts/check-deployment.sh
```

### 3. Access Services
- **Website**: https://wise2.net
- **Dashboard**: https://dashboard.wise2.net
- **Admin Panel**: https://admin.wise2.net
- **Studio**: https://studio.wise2.net
- **API**: https://api.wise2.net
- **Monitoring**: https://grafana.wise2.net

---

## 💰 Revenue Configuration

### Enable Stripe Payments
1. Get API keys from https://dashboard.stripe.com
2. Set environment variables:
```bash
export STRIPE_SECRET_KEY="sk_live_..."
export STRIPE_PUBLISHABLE_KEY="pk_live_..."
```
3. Update `.env.production`:
```bash
STRIPE_SECRET_KEY=sk_live_...
```
4. Restart API:
```bash
docker-compose -f docker-compose.production.yml restart api
```

### Setup Email Notifications
1. Configure SendGrid: https://sendgrid.com
2. Get API key
3. Set in `.env.production`:
```bash
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@wise2.net
```

### Configure OAuth (Google & GitHub)
```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://api.wise2.net/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=https://api.wise2.net/auth/github/callback
```

### Enable Analytics
```bash
POSTHOG_API_KEY=xxx
POSTHOG_API_HOST=https://api.posthog.com
```

---

## 📊 Monitoring & Observability

### Grafana Dashboards
- Admin: https://grafana.wise2.net
- Default credentials: admin / (check .env for password)

### Key Metrics
- API Response Times
- Database Performance
- Cache Hit Rate
- Error Rates
- User Activity

### Prometheus
- Raw metrics: https://wise2.net:9090

---

## 🔧 Service Management

### View Logs
```bash
# API logs
docker logs wise2-api-prod -f

# Website logs
docker logs wise2-website-prod -f

# Dashboard logs
docker logs wise2-dashboard-prod -f

# Admin logs
docker logs wise2-admin-prod -f

# Studio logs
docker logs wise2-studio-prod -f
```

### Restart Services
```bash
# Restart specific service
docker-compose -f docker-compose.production.yml restart api

# Restart all services
docker-compose -f docker-compose.production.yml restart

# View service status
docker ps -a --format "table {{.Names}}\t{{.Status}}"
```

### Update Deployment
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

---

## 🛡️ Security

### SSL/TLS Certificates
Managed by Let's Encrypt (auto-renewal via cron)

### Nginx Hardening
- HSTS headers enabled
- Security headers configured
- CORS properly scoped
- Rate limiting ready (add to nginx config)

### Database Security
- Postgres running with encrypted passwords
- Redis password protected
- Network isolation via Docker network

### Secrets Management
- Use `.env.production` (git-ignored)
- Never commit secrets
- Rotate API keys regularly

---

## 💾 Backup & Recovery

### Database Backups
```bash
# Manual backup
docker exec wise2-postgres-prod pg_dump -U wise2_prod_user wise2_core_prod > backup.sql

# Restore
docker exec -i wise2-postgres-prod psql -U wise2_prod_user wise2_core_prod < backup.sql
```

### Automated Backups
Configure cron job:
```bash
0 2 * * * /home/dwise/wise2-core/scripts/backup-production.sh
```

---

## 📈 Scaling

### Increase Resource Limits
Edit `docker-compose.production.yml`:
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 4G
```

### Add Load Balancing
Configure nginx upstream:
```nginx
upstream api_backend {
    server 127.0.0.1:3010;
    server 127.0.0.1:3011;  # Second instance
}
```

---

## 🚨 Troubleshooting

### Services not starting
```bash
docker-compose -f docker-compose.production.yml logs
docker ps -a  # See all containers including failed ones
```

### High memory usage
```bash
docker stats  # Monitor resource usage
docker system prune  # Clean up unused images/volumes
```

### Database connection issues
```bash
# Check database is running
docker ps | grep postgres

# Test connection
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c "SELECT 1"
```

### API not responding
```bash
curl http://localhost:3010/api/health
docker logs wise2-api-prod --tail 50
```

---

## 💡 Best Practices

1. **Always backup before updates**
   ```bash
   bash scripts/backup-production.sh
   ```

2. **Monitor error rates**
   - Check Grafana dashboards daily
   - Set up alerts for > 1% error rate

3. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

4. **Test changes on staging first**
   - Use `docker-compose.dev.yml` locally
   - Verify before deploying to production

5. **Document infrastructure changes**
   - Update this file when making changes
   - Commit infrastructure code to git

---

## 📞 Support

### Emergency Contacts
- DevOps: dwise@wise2.net
- API Issues: Check logs first, then escalate

### Common Issues & Solutions
See TROUBLESHOOTING.md for detailed guides

---

## 🎯 Ready to Make Money

Your WISE² platform is now production-ready!

**Next Steps:**
1. ✅ All services running and healthy
2. ✅ SSL/TLS configured (HTTPS)
3. ✅ Monitoring in place (Grafana)
4. ✅ Backup strategy defined
5. 🔲 **Stripe integration (for payments)**
6. 🔲 **Email setup (for notifications)**
7. 🔲 **OAuth providers (for login)**
8. 🔲 **Analytics tracking (for insights)**

Configure items 5-8 above and you're ready to accept payments!
