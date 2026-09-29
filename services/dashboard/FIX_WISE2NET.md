# Fix wise2.net 404 Error — Nginx Reverse Proxy Setup

## The Problem

- **DNS is correct**: wise2.net → 173.208.147.165 ✓
- **Website is running**: Port 3001 is active ✓
- **404 error**: Browser tries port 80, nginx routes to wrong location ✗

**Solution**: Configure nginx to reverse-proxy wise2.net → localhost:3001

---

## Quick Setup (Copy & Paste)

SSH to your server and run these commands:

```bash
ssh dwise@173.208.147.165

# Create nginx config
sudo tee /etc/nginx/sites-available/wise2-sound-labs > /dev/null << 'EOF'
server {
    listen 80;
    server_name wise2.net www.wise2.net;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/wise2-sound-labs /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
sudo systemctl enable nginx

# Verify
curl -H 'Host: wise2.net' http://localhost | grep -o '<title>.*</title>'
```

---

## Step-by-Step

### Step 1: Create Nginx Config File

```bash
sudo nano /etc/nginx/sites-available/wise2-sound-labs
```

Paste this content:

```nginx
server {
    listen 80;
    server_name wise2.net www.wise2.net;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X` → `Y` → `Enter`

### Step 2: Enable the Site

```bash
# Create symlink
sudo ln -sf /etc/nginx/sites-available/wise2-sound-labs /etc/nginx/sites-enabled/

# Remove default site (optional, if it interferes)
sudo rm -f /etc/nginx/sites-enabled/default
```

### Step 3: Test Configuration

```bash
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx

```bash
sudo systemctl reload nginx
sudo systemctl enable nginx  # Enable on boot
```

### Step 5: Verify It Works

```bash
# Test locally
curl -H 'Host: wise2.net' http://localhost/sound-labs | grep -o '<title>.*</title>'
```

Expected:
```
<title>WISE² Sound Labs - Custom Music &amp; Sonic Branding</title>
```

---

## Test from Your Computer

```bash
# Check DNS
nslookup wise2.net

# Check website
curl -I http://wise2.net
curl http://wise2.net/sound-labs | grep '<title>'
```

---

## Multiple Domains

To serve multiple domains (wise2.net, wisedefensellc.com, etc.):

```nginx
server {
    listen 80;
    server_name wise2.net www.wise2.net wisedefensellc.com www.wisedefensellc.com;

    location / {
        proxy_pass http://localhost:3001;
        # ... (rest of config)
    }
}
```

---

## HTTPS Setup (Let's Encrypt)

Once HTTP is working:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d wise2.net -d www.wise2.net

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

Certbot will auto-update your nginx config with HTTPS.

---

## Troubleshooting

### Port 80/443 Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80
sudo netstat -tuln | grep :80

# If another service uses it, either:
# 1. Stop that service: sudo systemctl stop service_name
# 2. Change nginx port to 8080: listen 8080;
```

### Nginx Won't Reload

```bash
# Check error log
sudo tail -50 /var/log/nginx/error.log

# Debug config
sudo nginx -T

# Check syntax
sudo nginx -t -c /etc/nginx/nginx.conf
```

### Getting "Connection Refused"

```bash
# Verify website container is running
docker ps | grep wise2

# Check port 3001 is listening
netstat -tuln | grep 3001

# Test direct connection
curl http://localhost:3001
```

### Still 404 After Setup

```bash
# Check nginx is actually running
sudo systemctl status nginx

# Restart it
sudo systemctl restart nginx

# Check access log
sudo tail -20 /var/log/nginx/access.log
```

---

## Verify Deployment

```bash
# 1. Check nginx status
sudo systemctl status nginx

# 2. Check website container
docker ps | grep wise2

# 3. Test via domain
curl -v http://wise2.net/

# 4. Test Sound Labs page
curl http://wise2.net/sound-labs | head -100
```

---

## Config Locations

- **Nginx config:** `/etc/nginx/sites-available/wise2-sound-labs`
- **Enabled sites:** `/etc/nginx/sites-enabled/`
- **Main config:** `/etc/nginx/nginx.conf`
- **Error log:** `/var/log/nginx/error.log`
- **Access log:** `/var/log/nginx/access.log`

---

## Next Steps

1. ✅ Deploy nginx reverse proxy (this guide)
2. ⬜ Test HTTP access
3. ⬜ Setup HTTPS/SSL (Let's Encrypt)
4. ⬜ Configure CDN/CloudFlare (optional)
5. ⬜ Add API proxy if needed

Once HTTP is working, return here for HTTPS setup.
