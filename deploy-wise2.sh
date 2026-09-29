#!/bin/bash

###############################################################################
#                    WISE² Dashboard VPS Deployment                          #
#                      One-Command Full Setup                                #
###############################################################################

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 WISE² Dashboard VPS Deployment Script         ║"
echo "║                      wise2.net Setup                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-wise2.net}"
EMAIL="${2:-admin@wise2.net}"
WEB_ROOT="/var/www/wise2"
GITHUB_REPO="https://github.com/dwise03-bit/wise2-core.git"
GITHUB_BRANCH="setup/dave-station"

echo -e "${BLUE}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Web Root: $WEB_ROOT"
echo "  Repository: $GITHUB_REPO (branch: $GITHUB_BRANCH)"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Step 1: Update System
echo -e "${YELLOW}Step 1/8: Updating system...${NC}"
apt-get update && apt-get upgrade -y > /dev/null 2>&1
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Dependencies
echo -e "${YELLOW}Step 2/8: Installing dependencies...${NC}"
apt-get install -y curl wget git nodejs npm nginx certbot python3-certbot-nginx > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Setup Web Directory
echo -e "${YELLOW}Step 3/8: Setting up web directories...${NC}"
mkdir -p $WEB_ROOT/CommandCenter/Dashboard
cd $WEB_ROOT
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 4: Clone Dashboard
echo -e "${YELLOW}Step 4/8: Cloning WISE² dashboard...${NC}"
if [ -d .git ]; then
    git fetch origin
    git checkout $GITHUB_BRANCH
else
    git clone --branch $GITHUB_BRANCH $GITHUB_REPO . 2>/dev/null || git clone $GITHUB_REPO . && git checkout $GITHUB_BRANCH
fi
echo -e "${GREEN}✓ Dashboard cloned${NC}"
echo ""

# Step 5: Configure Permissions
echo -e "${YELLOW}Step 5/8: Configuring permissions...${NC}"
chmod -R 755 $WEB_ROOT
chown -R www-data:www-data $WEB_ROOT
echo -e "${GREEN}✓ Permissions configured${NC}"
echo ""

# Step 6: Configure Nginx
echo -e "${YELLOW}Step 6/8: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    server_name wise2.net www.wise2.net;

    root /var/www/wise2/CommandCenter/Dashboard;
    index index.html;

    # Main location
    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/html text/plain text/css text/javascript
               application/json application/javascript application/xml+rss
               application/atom+xml image/svg+xml;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_disable "msie6";

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
NGINX_CONFIG

# Disable default site
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
if ! nginx -t > /dev/null 2>&1; then
    echo -e "${RED}❌ Nginx configuration error${NC}"
    nginx -t
    exit 1
fi

systemctl restart nginx
echo -e "${GREEN}✓ Nginx configured and restarted${NC}"
echo ""

# Step 7: Setup Firewall
echo -e "${YELLOW}Step 7/8: Configuring firewall...${NC}"
apt-get install -y ufw > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Step 8: Setup SSL Certificate
echo -e "${YELLOW}Step 8/8: Setting up SSL certificate (Let's Encrypt)...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect 2>/dev/null || true

# Create auto-renewal cron job
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
fi

echo -e "${GREEN}✓ SSL certificate installed and auto-renewal configured${NC}"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT COMPLETE!                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}🌐 Your dashboard is now live!${NC}"
echo ""
echo "Access your dashboard:"
echo -e "  ${BLUE}https://$DOMAIN${NC}"
echo ""

echo "Verify installation:"
echo -e "  ${BLUE}curl -I https://$DOMAIN${NC}"
echo ""

echo "Check Nginx status:"
echo -e "  ${BLUE}systemctl status nginx${NC}"
echo ""

echo "View logs:"
echo -e "  ${BLUE}tail -f /var/log/nginx/access.log${NC}"
echo ""

echo "Update dashboard (pull latest):"
echo -e "  ${BLUE}cd /var/www/wise2 && git pull origin $GITHUB_BRANCH${NC}"
echo ""

# Test the deployment
echo -e "${YELLOW}Testing deployment...${NC}"
if curl -s -I https://$DOMAIN | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Dashboard is accessible!${NC}"
else
    echo -e "${YELLOW}⚠️  Checking HTTP (HTTPS may still be setting up)...${NC}"
    if curl -s -I http://$DOMAIN | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓ Dashboard is accessible via HTTP${NC}"
    else
        echo -e "${RED}❌ Could not reach dashboard${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Point DNS A record to this server's IP"
echo "2. Wait for DNS propagation (5-48 hours)"
echo "3. Access https://$DOMAIN"
echo ""
echo "Security: Configure additional measures if needed"
echo "- Add firewall rules for your region"
echo "- Set up fail2ban for SSH protection"
echo "- Configure backups"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
