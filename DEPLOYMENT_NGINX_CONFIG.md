# JO CREDIT OS™ - Nginx Deployment Configuration

## Status
- ✅ Application built and deployed to VPS (173.208.147.165)
- ✅ PM2 running jo-credit-os-demo on port 3000
- ⏳ Nginx proxy configuration (pending VPS setup)

## Nginx Configuration for /jo-credit-os/ Route

### Step 1: SSH into VPS
```bash
ssh dwise@173.208.147.165
```

### Step 2: Create nginx configuration file
```bash
sudo tee /etc/nginx/sites-available/jo-credit-os > /dev/null << 'EOF'
server {
    listen 443 ssl http2;
    server_name wise2.net;
    
    ssl_certificate /etc/ssl/certs/wise2.net.crt;
    ssl_certificate_key /etc/ssl/private/wise2.net.key;
    
    location /jo-credit-os/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect / /jo-credit-os/;
    }
}
EOF
```

### Step 3: Enable the site
```bash
sudo ln -sf /etc/nginx/sites-available/jo-credit-os /etc/nginx/sites-enabled/jo-credit-os
```

### Step 4: Test nginx configuration
```bash
sudo nginx -t
```
Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 5: Reload nginx
```bash
sudo systemctl reload nginx
```

### Step 6: Verify app accessibility
```bash
# Test locally on VPS
curl -H "Host: wise2.net" http://localhost/jo-credit-os/

# From remote (after DNS update if needed)
curl https://wise2.net/jo-credit-os/
```

## DNS Configuration
Ensure `wise2.net` points to VPS IP `173.208.147.165`:
```bash
# Check current DNS
nslookup wise2.net
```

## Troubleshooting

### If port 3000 is not responding:
```bash
# Check PM2 status
pm2 status

# Check if process is running
ps aux | grep pnpm

# Verify port 3000 is listening
sudo netstat -tlnp | grep 3000
```

### If nginx fails to reload:
```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Check syntax
sudo nginx -t
```

### To view app logs:
```bash
# PM2 logs
pm2 logs jo-credit-os-demo

# Nginx access logs
sudo tail -f /var/log/nginx/access.log | grep jo-credit-os
```

## Application URLs

- **Local VPS**: http://localhost:3000/ (direct PM2 port)
- **Production**: https://wise2.net/jo-credit-os/ (via nginx proxy)

## Pages Available
1. Dashboard - Credit journey progress and metrics
2. Credit Audit - Bureau reports and tradeline review
3. Cases - Dispute workflow and status tracking
4. Action Plan - Client improvement tasks and priorities
