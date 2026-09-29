#!/bin/bash
set -e

# WISE² Ray-Ban Integration — Local Mac Development Setup
# Usage: bash scripts/rayban-dev-setup.sh

echo "🚀 WISE² Ray-Ban Local Development Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Create local environment file
echo "📝 Creating .env.local for Ray-Ban service..."
cat > packages/api/.env.rayban << 'EOF'
# Ray-Ban Integration Configuration
RAYBAN_PORT=3040
RAYBAN_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wise2_rayban

# Hermes Integration
HERMES_API_URL=http://localhost:3012/api
HERMES_API_KEY=dev-key

# Redis for analytics
REDIS_URL=redis://localhost:6379

# File storage (local development)
STORAGE_PATH=./rayban-captures

# Feature flags
ENABLE_VIDEO_ANALYSIS=true
ENABLE_VOICE_COMMANDS=true
ENABLE_MULTI_USER=true
EOF

# 2. Create local database
echo "🗄️  Setting up local PostgreSQL..."
docker run -d \
  --name postgres-rayban \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=wise2_rayban \
  -p 5432:5432 \
  postgres:16-alpine || echo "PostgreSQL already running"

# 3. Create storage directory
echo "📂 Creating capture storage directory..."
mkdir -p rayban-captures
chmod 755 rayban-captures

# 4. Install dependencies
echo "📦 Installing Ray-Ban service dependencies..."
cd packages/api
pnpm install
cd ../..

# 5. Start Ray-Ban service locally
echo "🔧 Starting Ray-Ban service on port 3040..."
cat > /tmp/rayban-local.sh << 'EOF'
#!/bin/bash
cd /Users/danielwise/Projects/wise2-core/packages/api
pnpm dev:rayban
EOF

chmod +x /tmp/rayban-local.sh

# 6. VPS SSH tunnel (automatic)
echo "🌍 Setting up VPS SSH tunnel..."
cat > /tmp/rayban-vps-tunnel.sh << 'EOF'
#!/bin/bash
# Auto-syncs local Ray-Ban changes to VPS
ssh -i ~/.ssh/wise2_vps -L 3040:localhost:3040 dwise@173.208.147.165
EOF

chmod +x /tmp/rayban-vps-tunnel.sh

# 7. Create tmux session for monitoring
echo "📊 Creating development session..."
cat > /tmp/rayban-monitor.sh << 'EOF'
#!/bin/bash
tmux new-session -d -s rayban-dev \
  -c /Users/danielwise/Projects/wise2-core \
  -x 200 -y 50

# Window 1: Ray-Ban Service
tmux new-window -t rayban-dev -n service -c /Users/danielwise/Projects/wise2-core/packages/api
tmux send-keys -t rayban-dev:service "pnpm dev:rayban" Enter

# Window 2: Hermes Integration Bridge
tmux new-window -t rayban-dev -n bridge -c /Users/danielwise/Projects/wise2-core
tmux send-keys -t rayban-dev:bridge "echo 'Ray-Ban ↔ Hermes Bridge (manual sync) - Ready'" Enter

# Window 3: VPS Monitor
tmux new-window -t rayban-dev -n vps -c /Users/danielwise/Projects/wise2-core
tmux send-keys -t rayban-dev:vps "echo 'VPS Status Monitor - Use: ssh dwise@173.208.147.165'" Enter

# Window 4: Logs
tmux new-window -t rayban-dev -n logs -c /Users/danielwise/Projects/wise2-core
tmux send-keys -t rayban-dev:logs "tail -f rayban-captures/debug.log" Enter

# Display
tmux attach-session -t rayban-dev
EOF

chmod +x /tmp/rayban-monitor.sh

# 8. Create package.json script
echo "📝 Adding Ray-Ban dev scripts to package.json..."
cat >> packages/api/package.json << 'EOF'
  "dev:rayban": "nest start --watch src/rayban",
  "build:rayban": "nest build src/rayban",
  "start:rayban": "node dist/rayban/main.js",
  "test:rayban": "jest --testPathPattern='rayban'"
EOF

echo ""
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Quick Start:"
echo ""
echo "  Option 1: Run in current shell"
echo "    cd packages/api && pnpm dev:rayban"
echo ""
echo "  Option 2: Use tmux session"
echo "    bash /tmp/rayban-monitor.sh"
echo ""
echo "  Option 3: VPS tunnel + local dev"
echo "    Terminal 1: bash /tmp/rayban-vps-tunnel.sh"
echo "    Terminal 2: pnpm dev:rayban"
echo ""
echo "📊 API Endpoints:"
echo "  Devices:  http://localhost:3040/rayban/devices"
echo "  Captures: http://localhost:3040/rayban/captures"
echo "  Commands: http://localhost:3040/rayban/commands"
echo "  Health:   http://localhost:3040/rayban/health"
echo ""
echo "🔗 Test Integration:"
echo "  curl -X GET http://localhost:3040/rayban/health"
echo ""
echo "📚 Next Steps:"
echo "  1. Start Ray-Ban service (see above)"
echo "  2. Start Hermes service on :3012 (separate terminal)"
echo "  3. Navigate to http://localhost:3000/hermes-control"
echo "  4. Click Ray-Ban tab to test"
echo ""
