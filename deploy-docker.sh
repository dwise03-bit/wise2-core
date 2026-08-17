#!/bin/bash
set -e

echo "🚀 WISE² Genesis v1.0 - Docker Compose Deployment"
echo "=================================================="

# Check if running on production server
if [ ! -f .env.prod ]; then
    echo "❌ Error: .env.prod not found"
    echo "Please create .env.prod with production secrets"
    echo "Reference: .env.prod.example"
    exit 1
fi

echo "✓ .env.prod found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed"
    exit 1
fi

echo "✓ Docker available: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed"
    exit 1
fi

echo "✓ Docker Compose available: $(docker-compose --version)"

# Create SSL certificate directory
if [ ! -d certs ]; then
    echo "📝 Creating SSL certificate directory"
    mkdir -p certs
    echo "⚠️  WARNING: Please add SSL certificates to certs/ directory"
    echo "   - certs/wise2.net.crt (certificate)"
    echo "   - certs/wise2.net.key (private key)"
fi

echo ""
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo ""
echo "🟢 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Service URLs:"
echo "  - Website: http://localhost:3000 (nginx)"
echo "  - API: http://localhost:3010 (api)"
echo "  - Prompt Shop: http://localhost:3002"
echo ""
echo "Management commands:"
echo "  docker-compose -f docker-compose.prod.yml logs -f       # View logs"
echo "  docker-compose -f docker-compose.prod.yml down          # Stop services"
echo "  docker-compose -f docker-compose.prod.yml ps            # Check status"
