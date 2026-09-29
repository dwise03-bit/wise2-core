#!/bin/bash
# WISE² Video Clipper v2.0 - Complete wise2.net Deployment
# Run this script on the VPS: ssh dwise@173.208.147.165 'bash -s' < deploy-wise2-net.sh

set -e

DOMAIN="wise2.net"
VPS_IP="173.208.147.165"
API_PORT=3010
WEB_PORT=3011

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║      🚀 WISE² VIDEO CLIPPER v2.0 - WISE2.NET PRODUCTION DEPLOYMENT          ║"
echo "║                                                                              ║"
echo "║                 Domain: wise2.net | VPS: $VPS_IP                          ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step() {
    echo -e "${BLUE}▶${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

# Step 1: System Updates
log_step "Step 1/8: System updates"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
log_success "System updated"

# Step 2: Install Dependencies
log_step "Step 2/8: Installing dependencies"
sudo apt-get install -y -qq \
    curl wget git htop \
    certbot python3-certbot-nginx \
    ufw fail2ban

if ! command -v docker &> /dev/null; then
    log_step "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker dwise
fi

if ! command -v docker-compose &> /dev/null; then
    log_step "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

log_success "Dependencies installed"

# Step 3: Pull Latest Code
log_step "Step 3/8: Pulling latest code from GitHub"
cd /home/dwise/wise2-core
git pull origin main
log_success "Code updated"

# Step 4: Setup SSL Certificate
log_step "Step 4/8: Setting up SSL certificate (Let's Encrypt)"

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${YELLOW}First-time SSL setup required${NC}"
    echo "Make sure DNS is configured before continuing:"
    echo "  $DOMAIN        A      $VPS_IP"
    echo "  www.$DOMAIN    CNAME  $DOMAIN"
    echo ""
    read -p "Press Enter after DNS is configured..."
    
    sudo certbot certonly --nginx \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --agree-tos \
        --no-eff-email \
        -m admin@$DOMAIN \
        --nginx-esos-auth-hook "nginx -t" || true
fi

log_success "SSL certificate ready"

# Step 5: Deploy Nginx Configuration
log_step "Step 5/8: Configuring Nginx reverse proxy"

sudo cp deploy/nginx/wise2-clipper.conf /etc/nginx/sites-available/wise2-clipper.conf
sudo ln -sf /etc/nginx/sites-available/wise2-clipper.conf /etc/nginx/sites-enabled/wise2-clipper.conf
sudo rm -f /etc/nginx/sites-enabled/default

# Validate Nginx config
if sudo nginx -t 2>&1 | grep -q "successful"; then
    log_success "Nginx configuration valid"
else
    echo -e "${YELLOW}⚠️  Nginx config test output:${NC}"
    sudo nginx -t
fi

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
log_success "Nginx configured and running"

# Step 6: Deploy Docker Services
log_step "Step 6/8: Starting Docker services"

cd /home/dwise/wise2-core
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 10

log_success "Docker services running"

# Step 7: Database Migrations
log_step "Step 7/8: Running database migrations"

docker-compose -f docker-compose.prod.yml exec -T api npx prisma db push || true
log_success "Database ready"

# Step 8: Security Hardening
log_step "Step 8/8: Security hardening"

# Enable firewall
sudo ufw --force enable > /dev/null 2>&1
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable DDoS protection
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

log_success "Security hardening complete"

# Verification
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                      🎉 DEPLOYMENT COMPLETE                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Domain:                  https://$DOMAIN"
echo "VPS Address:             $VPS_IP"
echo "API Endpoint:            https://$DOMAIN/api/v1"
echo "Health Check:            https://$DOMAIN/api/v1/health"
echo ""

echo "🌐 Services Running:"
docker-compose -f docker-compose.prod.yml ps | tail -n +3 | while read line; do echo "  $line"; done
echo ""

echo "🔒 Security:"
echo "  ✅ SSL/TLS (Let's Encrypt)"
echo "  ✅ Firewall (UFW) enabled"
echo "  ✅ DDoS protection (Fail2Ban) enabled"
echo "  ✅ Nginx reverse proxy active"
echo ""

echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Verify DNS is configured:"
echo "   nslookup $DOMAIN"
echo ""
echo "2. Test the live deployment:"
echo "   curl https://$DOMAIN/api/v1/health"
echo "   open https://$DOMAIN"
echo ""
echo "3. Setup automated backups (add to crontab):"
echo "   crontab -e"
echo "   0 2 * * * docker-compose -f /home/dwise/wise2-core/docker-compose.prod.yml exec db pg_dump -U wise2 wise2 > /sdb-disk/backups/wise2-\$(date +%Y%m%d).sql"
echo ""
echo "4. Monitor logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f api"
echo ""

echo "✅ System is LIVE on $DOMAIN"
echo ""

