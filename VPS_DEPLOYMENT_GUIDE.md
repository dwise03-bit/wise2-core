# 🚀 WISE² Dashboard VPS Deployment Guide

**Domain:** wise2.net  
**Application:** WISE² Command Center - Ultimate AI Edition  
**Status:** Ready for deployment

---

## 📋 Pre-Deployment Checklist

- [ ] Domain name registered (wise2.net)
- [ ] VPS provisioned (Ubuntu 20.04 LTS or later recommended)
- [ ] SSH access to VPS
- [ ] DNS A record configured pointing to VPS IP
- [ ] Root/sudo access on VPS

---

## 🎯 Quick Start (15 minutes)

### 1. Domain & DNS Setup

**Register Domain:**
- Visit: https://www.namecheap.com, GoDaddy, or your registrar
- Register: `wise2.net`
- Cost: ~$10/year

**Point DNS to VPS:**
1. Get your VPS IP address: `your.vps.ip.address`
2. Go to domain registrar's DNS settings
3. Add A record:
   - Type: `A`
   - Name: `@` (or `wise2.net`)
   - Value: `your.vps.ip.address`
   - TTL: `3600` (1 hour)
4. Save changes (can take 5-48 hours to propagate)

### 2. VPS Setup & Deployment

SSH into your VPS:
```bash
ssh root@your.vps.ip.address
```

**Run Deployment Script:**

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install nginx
apt-get install -y nginx

# Install SSL (Certbot)
apt-get install -y certbot python3-certbot-nginx

# Clone repository (optional, or use SFTP)
cd /var/www
git clone https://github.com/dwise03-bit/wise2-core.git wise2
cd wise2/CommandCenter/Dashboard
```

### 3. Configure Nginx

Create `/etc/nginx/sites-available/wise2`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name wise2.net www.wise2.net;

    root /var/www/wise2/CommandCenter/Dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
        # Cache busting for index.html
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/html text/plain text/css text/javascript 
               application/json application/javascript application/xml+rss 
               application/atom+xml image/svg+xml;
    gzip_min_length 1024;
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/wise2 /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 4. Setup SSL Certificate (HTTPS)

```bash
certbot --nginx -d wise2.net -d www.wise2.net
# Follow prompts, agree to terms
# Choose to redirect HTTP to HTTPS (option 2)
```

Verify SSL:
```bash
curl -I https://wise2.net
# Should show: HTTP/2 200
```

### 5. Upload Dashboard Files

**Option A: Via Git**
```bash
cd /var/www/wise2
git pull origin setup/dave-station
```

**Option B: Via SFTP**
```bash
# From your local machine:
sftp root@your.vps.ip.address
cd /var/www/wise2/CommandCenter/Dashboard
put index.html
put index-ultimate-ai.html
put index-4k-backup.html
exit
```

### 6. Test Your Deployment

```bash
# From anywhere:
curl https://wise2.net
# Should return HTML of dashboard

# Check browser:
# Visit: https://wise2.net
# Should see: WISE² ULTIMATE AI dashboard
```

---

## 🔧 VPS Provider Recommendations

### **DigitalOcean** (Recommended)
- **Cost:** $4-6/month
- **Setup:** Droplet in NYC/SF
- **Pros:** Simple, great for beginners
- **Link:** https://www.digitalocean.com/

Quick start:
```bash
# Create Droplet
# - OS: Ubuntu 20.04 LTS
# - Size: $5/month (512MB RAM, 20GB SSD)
# - Region: NYC3 or SFO3
# - Add SSH key during creation
# - Create Droplet
```

### **Linode**
- **Cost:** $5-10/month
- **Setup:** Linode instance
- **Pros:** Reliable, good performance
- **Link:** https://www.linode.com/

### **AWS Lightsail**
- **Cost:** $3.50-5/month
- **Setup:** Lightsail instance
- **Pros:** Scalable, integrates with AWS
- **Link:** https://lightsail.aws.amazon.com/

### **Vultr**
- **Cost:** $2.50+/month
- **Setup:** Cloud compute
- **Pros:** Cheap, many locations
- **Link:** https://www.vultr.com/

---

## 📦 Complete Deployment Script

Save as `deploy-wise2.sh`:

```bash
#!/bin/bash

# Update system
echo "🔄 Updating system..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
apt-get install -y nodejs npm nginx certbot python3-certbot-nginx git curl wget

# Create web directory
echo "📁 Setting up directories..."
mkdir -p /var/www/wise2/CommandCenter/Dashboard
cd /var/www/wise2

# Clone or download dashboard
echo "📥 Getting dashboard files..."
# Option 1: Clone from GitHub
git clone --branch setup/dave-station https://github.com/dwise03-bit/wise2-core.git .

# Set permissions
chmod -R 755 /var/www/wise2
chown -R www-data:www-data /var/www/wise2

# Configure Nginx
echo "⚙️  Configuring Nginx..."
cat > /etc/nginx/sites-available/wise2 << 'EOF'
server {
    listen 80;
    server_name wise2.net www.wise2.net;
    root /var/www/wise2/CommandCenter/Dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/plain text/css text/javascript application/json;
}
EOF

ln -s /etc/nginx/sites-available/wise2 /etc/nginx/sites-enabled/wise2
rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
nginx -t
systemctl restart nginx

# Setup SSL
echo "🔐 Setting up SSL..."
certbot --nginx -d wise2.net -d www.wise2.net --non-interactive --agree-tos -m admin@wise2.net

# Create cron job for SSL renewal
echo "📅 Setting up automatic SSL renewal..."
echo "0 3 * * * certbot renew --quiet" | crontab -

# Test
echo "✅ Deployment complete!"
echo "🌐 Visit: https://wise2.net"
curl -I https://wise2.net
```

Run it:
```bash
chmod +x deploy-wise2.sh
./deploy-wise2.sh
```

---

## 🛡️ Security Hardening

### Update Firewall
```bash
# UFW (Uncomplicated Firewall)
apt-get install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### Add Fail2Ban (Prevent Brute Force)
```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Disable Root Login
```bash
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd
```

---

## 📊 Monitoring & Maintenance

### Check Nginx Status
```bash
systemctl status nginx
nginx -t
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitor SSL Certificate
```bash
certbot certificates
# Auto-renewal runs daily via cron
```

### Check Disk Space
```bash
df -h
du -sh /var/www/wise2
```

### View System Logs
```bash
journalctl -u nginx -f
```

---

## 🔄 Update Dashboard (Pull New Changes)

```bash
cd /var/www/wise2
git pull origin setup/dave-station
# Files auto-refresh in browser (Nginx serves latest)
```

Or via SFTP:
```bash
sftp root@your.vps.ip.address
cd /var/www/wise2/CommandCenter/Dashboard
put index.html
exit
```

---

## ✅ Verification Checklist

- [ ] Domain registered (wise2.net)
- [ ] DNS A record configured
- [ ] VPS provisioned and accessible
- [ ] Nginx installed and running
- [ ] Dashboard files uploaded
- [ ] SSL certificate installed
- [ ] HTTPS working: `https://wise2.net`
- [ ] Dashboard displays correctly
- [ ] Firewall configured
- [ ] Automatic SSL renewal enabled

---

## 🎯 Final Status

**After deployment:**
```
Dashboard URL: https://wise2.net ✅
Status: Live & Public ✅
Security: HTTPS/SSL ✅
Darrin Access: https://wise2.net (from anywhere) ✅
Performance: Cached & Optimized ✅
Uptime Monitoring: (Optional - see below)
```

---

## 📈 Optional Enhancements

### Add Uptime Monitoring
```bash
# Use UptimeRobot.com (free tier)
1. Visit https://uptimerobot.com
2. Sign up
3. Add monitor: https://wise2.net
4. Get alerts if site goes down
```

### Add Analytics
```html
<!-- Add to index.html before </body> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Add CDN (Optional)
Use Cloudflare (free):
1. Visit https://cloudflare.com
2. Add site: wise2.net
3. Update nameservers at registrar
4. Enable caching & DDoS protection

---

## 💰 Total Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| Domain (wise2.net) | $10/year | Namecheap, GoDaddy, etc. |
| VPS Hosting | $60/year | DigitalOcean $5/month |
| SSL Certificate | FREE | LetsEncrypt via Certbot |
| **Total** | **$70/year** | ~$6/month |

---

## 🚨 Troubleshooting

### Domain not resolving
```bash
# Wait 24-48 hours for DNS propagation
nslookup wise2.net
dig wise2.net
```

### Nginx not starting
```bash
nginx -t  # Check for syntax errors
systemctl status nginx
journalctl -u nginx -n 20
```

### SSL certificate issues
```bash
certbot certificates
certbot renew --dry-run  # Test renewal
```

### Dashboard not showing
```bash
curl https://wise2.net
# Check file permissions:
ls -la /var/www/wise2/CommandCenter/Dashboard/index.html
```

---

## 📞 Support Resources

- **Nginx Docs:** https://nginx.org/en/docs/
- **Certbot Docs:** https://certbot.eff.org/
- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials

---

**Ready to go live!** 🎉

Next steps:
1. Choose a VPS provider
2. Register wise2.net domain
3. Run deployment script
4. Access https://wise2.net

---

*Generated: 2026-09-29*  
*WISE² Command Center VPS Deployment*
