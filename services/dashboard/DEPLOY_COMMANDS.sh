#!/bin/bash
# WISE² Landing Page Deployment Commands
# Run these commands to deploy to wise2.net (173.208.147.165)

set -e  # Exit on error

echo "🚀 Starting WISE² Landing Page Deployment..."
echo "Server: 173.208.147.165"
echo ""

# Step 1: Connect and navigate
echo "Step 1️⃣  Connecting to server..."
ssh administrator@173.208.147.165 "cd /opt/wise2-core/services/dashboard && pwd"

echo ""
echo "Step 2️⃣  Pulling latest code from main branch..."
ssh administrator@173.208.147.165 "cd /opt/wise2-core/services/dashboard && git pull origin main"

echo ""
echo "Step 3️⃣  Building Next.js production build..."
ssh administrator@173.208.147.165 "cd /opt/wise2-core/services/dashboard && npm run build"

echo ""
echo "Step 4️⃣  Restarting dashboard container..."
ssh administrator@173.208.147.165 "cd /opt/wise2-core/services/dashboard && docker-compose -f docker-compose.prod.yml restart dashboard"

echo ""
echo "Step 5️⃣  Verifying deployment..."
sleep 5
ssh administrator@173.208.147.165 "docker ps | grep dashboard"

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Verify at: https://wise2.net"
echo "Expected to see:"
echo "  • Hero section with founder images"
echo "  • Neon blue text: 'ONE SEES THE POSSIBILITIES'"
echo "  • Email capture form"
echo "  • Six feature boxes"
echo ""
