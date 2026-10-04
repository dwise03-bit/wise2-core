#!/bin/bash
# Verify petals-and-potions access is working
# Usage: bash verify-petals-access.sh

echo "🔍 Verifying Petals & Potions access..."
echo ""

# Try to connect to VPS
echo "1️⃣  Checking VPS connectivity..."
if ping -c 1 -W 2 173.208.147.165 &>/dev/null; then
  echo "✅ VPS is responding to ping"
else
  echo "⚠️  VPS not responding to ping yet"
fi

echo ""
echo "2️⃣  Checking if command-center container is running..."
if ssh -o ConnectTimeout=5 dwise@173.208.147.165 "docker ps | grep -q wise2-command-center" 2>/dev/null; then
  echo "✅ Container is running"
  echo ""
  echo "3️⃣  Checking container health..."
  ssh dwise@173.208.147.165 "docker inspect --format='{{.State.Status}}' wise2-command-center"
  echo ""
  echo "4️⃣  Testing localhost endpoint..."
  ssh dwise@173.208.147.165 "curl -s -I http://localhost:3004/petals-and-potions | head -3" || echo "   (Connection may still be initializing)"
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "✅ Petals & Potions should be accessible at:"
  echo "   🌐 https://command.wise2.net/petals-and-potions"
  echo "════════════════════════════════════════════════════════════════"
else
  echo "⏳ Container not yet visible - may still be starting"
  echo ""
  echo "Try again in 30 seconds with:"
  echo "  bash verify-petals-access.sh"
fi
