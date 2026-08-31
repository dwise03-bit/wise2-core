#!/bin/bash
# Quick deployment script for wise2.net VPS
# Run this from your local machine

set -e

VPS="173.208.147.165"
USER="dwise"

echo "🚀 Deploying WISE² AI Phone to $VPS"
echo ""

# Step 1: Copy deployment script
echo "[1/3] Copying deployment script to VPS..."
scp -o StrictHostKeyChecking=no deploy-vps.sh $USER@$VPS:/tmp/
echo "✅ Script copied"
echo ""

# Step 2: Execute deployment
echo "[2/3] Running deployment on VPS (5-10 minutes)..."
ssh -t -o StrictHostKeyChecking=no $USER@$VPS "cd wise2-core && sudo bash /tmp/deploy-vps.sh"
DEPLOY_STATUS=$?
echo ""

# Step 3: Verify
if [ $DEPLOY_STATUS -eq 0 ]; then
  echo "[3/3] Verifying deployment..."
  HEALTH=$(ssh -o StrictHostKeyChecking=no $USER@$VPS "curl -s http://localhost:3001/health" 2>/dev/null)
  
  if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    echo "✅ Deployment successful"
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║   WISE² AI Phone Live! 🎉                  ║"
    echo "║   Number: (336) 485-8421                   ║"
    echo "║   VPS: $VPS"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Configure Telnyx SIP routing"
    echo "2. Enable Google Voice forwarding"
    echo "3. Call (336) 485-8421 to test"
  else
    echo "⚠ Health check returned:"
    echo "$HEALTH"
  fi
else
  echo "❌ Deployment failed"
  echo "SSH to VPS and check logs:"
  echo "  ssh $USER@$VPS"
  echo "  docker-compose logs --tail=50 phone-gateway"
  exit 1
fi
