#!/bin/bash
# Troubleshoot and fix Petals & Potions access issue

set -e

echo "🔍 Diagnosing Petals & Potions access issue..."
echo ""

cd /home/dwise/wise2-core

# 1. Check Docker status
echo "1️⃣ Checking Docker containers..."
sudo docker-compose -f docker-compose.prod.yml ps
echo ""

# 2. Check if port 3001 is listening
echo "2️⃣ Checking if port 3001 is listening..."
if sudo lsof -i :3001 2>/dev/null | grep LISTEN; then
    echo "   ✅ Port 3001 is listening"
else
    echo "   ❌ Port 3001 is NOT listening - service not running"
fi
echo ""

# 3. Check service logs
echo "3️⃣ Checking service logs (last 20 lines)..."
sudo docker-compose -f docker-compose.prod.yml logs --tail 20
echo ""

# 4. If containers aren't running, restart
echo "4️⃣ Restarting services..."
echo "   Stopping..."
sudo docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "   Pulling latest code..."
git fetch origin
git checkout main
git pull origin main

echo "   Starting..."
sudo docker-compose -f docker-compose.prod.yml up -d --build

echo "   Waiting 30 seconds..."
sleep 30

echo ""
echo "5️⃣ Final verification..."
echo ""

# 5. Test the endpoint
echo "Testing endpoint locally..."
if curl -s http://localhost:3001/petals-and-potions | head -20; then
    echo ""
    echo "✅ SUCCESS! Petals & Potions is now LIVE"
    echo ""
    echo "📍 Access at:"
    echo "   http://173.208.147.165:3001/petals-and-potions"
    echo "   http://173.208.147.165:3001/petals-and-potions/ritual"
else
    echo "⚠️ Endpoint returned no content - checking Docker status again..."
    sudo docker-compose -f docker-compose.prod.yml ps
fi
