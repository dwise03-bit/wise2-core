# CC Craft & Create - Deployment Guide

**Target**: 2026-08-28  
**Current Status**: Code ready for deployment  

---

## Quick Start (5 minutes)

### Prerequisites
- SSH access to VPS (173.208.147.165)
- PostgreSQL 14+
- Docker installed
- Nginx configured

### 1. Set up Database

```bash
ssh dwise@173.208.147.165

# Create database
createdb cc_craft_create

# Load schema
psql cc_craft_create < /path/to/config/db-schema.sql

# Verify
psql cc_craft_create -c "SELECT COUNT(*) FROM products;"
```

### 2. Configure Environment

```bash
cd /home/dwise/wise2-core/clients/cc-craft-create/website

# Copy template
cp .env.example .env.local

# Edit with real values
nano .env.local
```

**Required values:**
- `DATABASE_URL`: PostgreSQL connection
- `STRIPE_SECRET_KEY`: From Stripe dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: From Stripe dashboard
- `RESEND_API_KEY`: From Resend (email service)

### 3. Build & Deploy

```bash
# Build Docker image
docker build -t cc-website:latest .

# Run container
docker run -d \
  --name cc-website \
  -p 3011:3011 \
  --env-file .env.local \
  -v /var/log/cc-website:/app/logs \
  cc-website:latest

# Verify
curl http://localhost:3011
```

### 4. Configure Nginx

Add to `/etc/nginx/sites-available/cc.wise2.net`:

```nginx
upstream cc_website {
  server localhost:3011;
}

server {
  listen 80;
  server_name cc.wise2.net;

  location / {
    proxy_pass http://cc_website;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cc.wise2.net /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### 5. Set up SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d cc.wise2.net
```

### 6. Test the Site

```
https://cc.wise2.net
```

---

## Full Deployment Checklist

- [ ] Database created and populated
- [ ] Environment variables configured
- [ ] Docker image built
- [ ] Container running and accessible
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Homepage renders correctly
- [ ] Shop page loads products
- [ ] Cart functionality works
- [ ] Checkout form submits
- [ ] Email notifications working (optional - Phase 2)
- [ ] Stripe test charge successful
- [ ] Mobile responsive (test at 375px)
- [ ] Lighthouse score > 80
- [ ] No console errors

---

## Troubleshooting

### Container won't start
```bash
docker logs cc-website
```

### Database connection error
```bash
psql -h localhost -U postgres -d cc_craft_create
```

### Nginx errors
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Post-Launch (First 7 Days)

### Day 1
- [ ] Monitor error logs
- [ ] Test payment flow
- [ ] Verify email confirmations
- [ ] Get CC approval

### Days 2-3
- [ ] Process first orders
- [ ] Document any issues
- [ ] Optimize images/assets

### Days 4-7
- [ ] Gather feedback
- [ ] Make small improvements
- [ ] Plan Phase 2 (Dashboard)

---

## Phase 2 (Week 2)

After launch approval, implement:
- Admin dashboard (port 3012)
- Order management interface
- Email notifications
- Customer portal
- Analytics

---

## Support

**Email**: dwise03@gmail.com  
**Slack**: #cc-craft-create-support  
**Status**: www.173.208.147.165/status
