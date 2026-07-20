#!/bin/bash
# WISE² Revenue Flow Deployment
# Deploy pricing → checkout → success flow to production

set -e

echo "🚀 WISE² Revenue Deployment"
echo "============================"
echo ""

# Step 1: SSH and pull latest
echo "📦 Pulling latest code from GitHub..."
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && git pull origin main" 2>&1 | tail -5

# Step 2: Rebuild website container
echo ""
echo "🔨 Rebuilding website container..."
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && docker-compose -f docker-compose.prod.yml rebuild website 2>&1" | tail -10

# Step 3: Start website
echo ""
echo "▶️  Starting website..."
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && docker-compose -f docker-compose.prod.yml up -d website" 2>&1 | tail -5

# Step 4: Verify it's running
echo ""
echo "✅ Verifying deployment..."
RESULT=$(ssh dwise@173.208.147.165 "curl -s http://localhost:3001/pricing | head -c 200" 2>&1)
if [[ $RESULT == *"Pricing Plans"* ]]; then
  echo "✓ Website is running and pricing page is live!"
else
  echo "⚠️  Warning: Could not verify pricing page. Check with: curl http://173.208.147.165:3001/pricing"
fi

echo ""
echo "============================"
echo "✨ Website deployed to production!"
echo ""
echo "Next steps:"
echo "1. Add Stripe keys to .env.production.local on server"
echo "2. Restart API: docker-compose -f docker-compose.prod.yml restart api"
echo "3. Visit https://wise2.net/pricing to test"
echo ""
echo "See REVENUE_READY_CHECKLIST.md for full setup instructions"
