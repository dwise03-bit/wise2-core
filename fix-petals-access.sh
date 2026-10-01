#!/bin/bash
# Fix petals-and-potions access by building and starting the command-center service
# Usage: bash fix-petals-access.sh

set -e

echo "🌸 Fixing Petals & Potions access..."
echo ""

# Check if running on VPS or locally
if [[ -d "/home/dwise/wise2-core" ]]; then
  REPO_DIR="/home/dwise/wise2-core"
  IS_VPS=true
  echo "📍 Detected VPS environment"
else
  REPO_DIR="/Users/danielwise/Projects/wise2-core"
  IS_VPS=false
  echo "📍 Detected local environment"
fi

cd "$REPO_DIR"

echo ""
echo "1️⃣  Building wise2-command-center Docker image..."
docker build \
  -f wise2-command-center/Dockerfile \
  -t wise2-core-command-center:latest \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.wise2.net/api}" \
  --build-arg NEXT_PUBLIC_WS_URL="${NEXT_PUBLIC_WS_URL:-wss://api.wise2.net}" \
  --build-arg NEXT_PUBLIC_LOGIN_URL="${NEXT_PUBLIC_LOGIN_URL:-https://command.wise2.net/login}" \
  .

echo ""
echo "2️⃣  Starting command-center container..."
docker run -d \
  --name wise2-command-center \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -e "API_URL=${API_URL:-http://172.17.0.1:3010/api}" \
  -e "API_INTERNAL_URL=${API_INTERNAL_URL:-http://172.17.0.1:3010/api}" \
  -e "APP_URL=${COMMAND_CENTER_URL:-https://command.wise2.net}" \
  -e "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}" \
  -e "GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL_CC:-https://command.wise2.net/api/auth/google/callback}" \
  -p 127.0.0.1:3004:3000 \
  wise2-core-command-center:latest

echo ""
echo "3️⃣  Waiting for container to be healthy..."
for i in {1..30}; do
  if docker exec wise2-command-center node -e "require('http').get('http://localhost:3000/', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))" &>/dev/null; then
    echo "✅ Container is healthy!"
    break
  fi
  echo "   Waiting... ($i/30)"
  sleep 2
done

echo ""
echo "4️⃣  Verifying nginx routing..."
sleep 2
if curl -s http://localhost:3004 | grep -q "command\|petals\|wise2" 2>/dev/null || curl -s -I http://localhost:3004 | head -1 | grep -q "200\|301\|302"; then
  echo "✅ Command center is responding!"
else
  echo "⚠️  Warning: Command center may not be responding yet, please check logs"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Petals & Potions access fixed!"
echo ""
if [ "$IS_VPS" = true ]; then
  echo "🌐 Access the site at: https://command.wise2.net/petals-and-potions"
  echo ""
  echo "📋 Logs:"
  docker logs -n 20 wise2-command-center
else
  echo "🌐 Local access: http://localhost:3004/petals-and-potions"
  echo ""
  echo "📋 Logs:"
  docker logs -n 20 wise2-command-center
fi
echo "════════════════════════════════════════════════════════════════"
