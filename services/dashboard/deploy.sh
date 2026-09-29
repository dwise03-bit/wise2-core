#!/bin/bash

set -e

echo "🚀 Wise² Core Deployment Script"
echo "================================"
echo ""

# Check if running on Linux
if [[ ! "$OSTYPE" == "linux"* ]]; then
    echo "❌ This script must run on a Linux server"
    exit 1
fi

# Check if root or sudo
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must run as root or with sudo"
    exit 1
fi

echo "✓ Deployment environment verified"
echo ""

# Step 1: Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y
echo "✓ System updated"
echo ""

# Step 2: Install Docker & Certbot
echo "🐳 Installing Docker and dependencies..."
apt-get install -y docker.io docker-compose certbot git curl
systemctl enable docker
systemctl start docker
echo "✓ Docker installed and enabled"
echo ""

# Step 3: Clone repository
if [ ! -d "/opt/wise2-core" ]; then
    echo "📥 Cloning repository to /opt/wise2-core..."
    cd /opt
    git clone https://github.com/yourusername/wise2-core.git
    cd wise2-core
else
    echo "📥 Repository already exists, pulling latest..."
    cd /opt/wise2-core
    git pull origin main
fi
echo "✓ Repository ready"
echo ""

# Step 4: Setup environment
if [ ! -f ".env.prod" ]; then
    echo "⚙️  Creating .env.prod file..."
    cp .env.prod.example .env.prod
    echo "⚠️  IMPORTANT: Edit .env.prod with your secrets before continuing!"
    echo "   nano .env.prod"
    echo ""
    exit 1
fi
echo "✓ .env.prod loaded"
echo ""

# Step 5: Create directories
echo "📂 Creating config directories..."
mkdir -p config/grafana/provisioning/{dashboards,datasources}
mkdir -p data/{postgres,redis,prometheus,grafana}
echo "✓ Directories created"
echo ""

# Step 6: Setup SSL
if [ ! -f "/etc/letsencrypt/live/wise2.net/fullchain.pem" ]; then
    echo "🔒 Setting up SSL certificates with Let's Encrypt..."
    apt-get install -y python3-certbot-standalone
    certbot certonly --standalone \
        -d wise2.net \
        -d www.wise2.net \
        -d api.wise2.net \
        -d admin.wise2.net \
        --email dwise03@gmail.com \
        --agree-tos \
        --non-interactive
    echo "✓ SSL certificates generated"
else
    echo "✓ SSL certificates already exist"
fi
echo ""

# Step 7: Configure Nginx
echo "⚙️  Configuring Nginx..."
cp config/nginx.conf /etc/nginx/sites-available/wise2
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/wise2 /etc/nginx/sites-enabled/wise2
nginx -t
systemctl reload nginx
echo "✓ Nginx configured"
echo ""

# Step 8: Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build
echo "✓ Images built"
echo ""

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d
echo "✓ Services started"
echo ""

# Step 9: Wait for services to be healthy
echo "⏳ Waiting for services to become healthy..."
sleep 10
echo ""

# Step 10: Verify deployment
echo "✅ Verifying deployment..."
echo ""

if curl -s -o /dev/null -w "%{http_code}" https://wise2.net | grep -q "200\|301\|302"; then
    echo "✓ wise2.net is accessible"
else
    echo "⚠️  wise2.net may not be accessible yet (DNS propagation can take time)"
fi

if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✓ Docker services are running"
else
    echo "❌ Some Docker services are not running"
    docker-compose -f docker-compose.prod.yml ps
fi

echo ""
echo "================================"
echo "🎉 Deployment Complete!"
echo ""
echo "📊 Monitoring:"
echo "   Prometheus: http://173.208.147.165:9090"
echo "   Grafana: http://173.208.147.165:3001"
echo ""
echo "🌐 Services:"
echo "   Landing Page: https://wise2.net"
echo "   API: https://api.wise2.net"
echo "   Admin: https://admin.wise2.net"
echo ""
echo "📝 Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "================================"
