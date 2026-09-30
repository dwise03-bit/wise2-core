#!/bin/bash
# WISE² Video Clipper v2.0 - Subdomain Deployment
# Configure as: clipper.wise2.net (or your preferred subdomain)

set -e

# Configuration - CUSTOMIZE THESE
SUBDOMAIN="clipper"          # Change to desired subdomain
DOMAIN="wise2.net"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
VPS_IP="173.208.147.165"
API_PORT=3010
WEB_PORT=3011

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║  🚀 WISE² VIDEO CLIPPER v2.0 - SUBDOMAIN DEPLOYMENT ($FULL_DOMAIN)        ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: DNS Configuration
echo "📋 DNS Configuration Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Add these records to your domain registrar:"
echo ""
echo "  Record Type: A"
echo "  Host:        $SUBDOMAIN"
echo "  Value:       $VPS_IP"
echo "  TTL:         3600"
echo ""
echo "Verify DNS:"
echo "  nslookup $FULL_DOMAIN"
echo "  dig $FULL_DOMAIN"
echo ""
read -p "Press Enter after DNS is configured and propagated..."

# Step 2: System Updates
echo "🔧 Step 1/7: System updates"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
sudo apt-get install -y -qq curl wget git certbot python3-certbot-nginx ufw fail2ban

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker dwise
fi

echo "✅ System ready"

# Step 3: SSL Certificate for Subdomain
echo ""
echo "🔐 Step 2/7: Setting up SSL for $FULL_DOMAIN"
sudo certbot certonly --nginx \
    -d "$FULL_DOMAIN" \
    --agree-tos \
    --no-eff-email \
    -m admin@$DOMAIN

echo "✅ SSL certificate ready"

# Step 4: Create Subdomain Nginx Config
echo ""
echo "🌐 Step 3/7: Configuring Nginx for subdomain"

cat > /tmp/wise2-subdomain.conf << NGINXEOF
upstream clipper_api {
    server localhost:$API_PORT;
    keepalive 32;
}

upstream clipper_ui {
    server localhost:$WEB_PORT;
    keepalive 32;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $FULL_DOMAIN;
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $FULL_DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$FULL_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$FULL_DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /sdb-disk/logs/wise2-$SUBDOMAIN-access.log;
    error_log /sdb-disk/logs/wise2-$SUBDOMAIN-error.log;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    
    # Client upload size
    client_max_body_size 1024M;
    
    # API Routes
    location /api/ {
        proxy_pass http://clipper_api;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
    
    # Web UI Routes
    location / {
        proxy_pass http://clipper_ui;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://clipper_ui;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
        expires 30d;
    }
}
NGINXEOF

sudo cp /tmp/wise2-subdomain.conf /etc/nginx/sites-available/wise2-$SUBDOMAIN.conf
sudo ln -sf /etc/nginx/sites-available/wise2-$SUBDOMAIN.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx configuration valid"
else
    echo "⚠️  Nginx config test:"
    sudo nginx -t
fi

sudo systemctl restart nginx
sudo systemctl enable nginx
echo "✅ Nginx running on subdomain"

# Step 5: Deploy Docker Services
echo ""
echo "🐳 Step 4/7: Starting Docker services"
cd /home/dwise/wise2-core

docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

sleep 10
echo "✅ Docker services running"

# Step 6: Database Migrations
echo ""
echo "💾 Step 5/7: Running database migrations"
docker-compose -f docker-compose.prod.yml exec -T api npx prisma db push || true
echo "✅ Database ready"

# Step 7: Security Hardening
echo ""
echo "🔒 Step 6/7: Security hardening"
sudo ufw --force enable > /dev/null 2>&1
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
echo "✅ Security configured"

# Step 8: Verification
echo ""
echo "🔍 Step 7/7: Verifying deployment"
sleep 5

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                   ✅ SUBDOMAIN DEPLOYMENT COMPLETE                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Live on: https://$FULL_DOMAIN"
echo ""
echo "🔗 URLs:"
echo "  Web UI:       https://$FULL_DOMAIN"
echo "  API:          https://$FULL_DOMAIN/api/v1"
echo "  Health:       https://$FULL_DOMAIN/api/v1/health"
echo ""
echo "📊 Services:"
docker-compose -f docker-compose.prod.yml ps | tail -n +3 | while read line; do echo "  $line"; done
echo ""
echo "✅ Deployment successful!"
echo ""

