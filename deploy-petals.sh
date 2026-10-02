#!/bin/bash
# Deploy Petals & Potions to production

set -e

echo "🚀 Deploying Petals & Potions..."

# 1. Navigate to project
cd /home/dwise/wise2-core

# 2. Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git checkout main
git pull origin main

# 3. Stop existing services
echo "🛑 Stopping existing containers..."
sudo docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 4. Clean up
echo "🧹 Cleaning up old containers..."
sudo docker system prune -f --volumes 2>/dev/null || true

# 5. Build and start
echo "🏗️  Building and starting services..."
sudo docker-compose -f docker-compose.prod.yml up -d --build

# 6. Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# 7. Verify
echo "✅ Verifying deployment..."
sudo docker-compose -f docker-compose.prod.yml ps

# 8. Test the endpoint
echo ""
echo "🧪 Testing Petals & Potions..."
if curl -s http://localhost:3001/petals-and-potions | grep -q "petals"; then
    echo "✅ SUCCESS! Petals & Potions is now LIVE"
    echo ""
    echo "📍 Access at:"
    echo "   Main site: http://173.208.147.165:3001/petals-and-potions"
    echo "   Ritual builder: http://173.208.147.165:3001/petals-and-potions/ritual"
else
    echo "⚠️  WARNING: Endpoint responding but content may not be loaded yet"
    echo "   Check: http://173.208.147.165:3001/petals-and-potions"
fi

echo ""
echo "✨ Deployment complete!"
