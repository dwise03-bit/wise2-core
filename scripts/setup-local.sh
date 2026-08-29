#!/bin/bash
# WISE² Local Development Setup Script
# Automatically sets up all services for local development

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         WISE² Local Development Setup                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  log_error "Docker is not installed"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  log_error "Docker Compose is not installed"
  exit 1
fi

if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
  log_error "Node.js/npm/pnpm is not installed"
  exit 1
fi

log_info "All prerequisites met"

# Setup .env.local
echo ""
log_info "Setting up environment configuration..."

if [ ! -f .env.local ]; then
  log_warn ".env.local not found, creating from .env.example"
  if [ -f .env.example ]; then
    cp .env.example .env.local
    log_info "Created .env.local"
  else
    log_error ".env.example not found"
    exit 1
  fi
fi

# Ensure .env is using local settings
if [ -f .env.local ] && [ ! -L .env ]; then
  cp .env.local .env
  log_info "Using .env.local configuration"
fi

# Start Docker containers
echo ""
log_info "Starting Docker services..."

if docker-compose ps | grep -q "Up"; then
  log_warn "Some services already running"
else
  log_info "Starting infrastructure (postgres, redis, mongodb, ollama)..."
  docker-compose up -d postgres redis mongodb ollama

  # Wait for services to be healthy
  log_info "Waiting for services to become healthy..."
  for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U wise2_local &>/dev/null; then
      log_info "PostgreSQL is ready"
      break
    fi
    echo -n "."
    sleep 2
  done
fi

# Initialize database
echo ""
log_info "Initializing database..."

if [ -d packages/db ]; then
  cd packages/db
  log_info "Running Prisma migrations..."
  pnpm prisma migrate deploy --skip-generate || true
  cd "$PROJECT_ROOT"
else
  log_warn "packages/db directory not found, skipping migrations"
fi

# Install dependencies
echo ""
log_info "Installing dependencies..."
pnpm install --frozen-lockfile || npm install

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            ✓ Local Setup Complete!                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Start backend services (run in separate terminals):"
echo "   cd packages/api && pnpm dev            # API on :3001"
echo "   cd services/worker && npm start        # Worker"
echo "   cd second-brain && npm start           # Brain API on :3012"
echo ""
echo "2. Start frontend apps (run in separate terminals):"
echo "   cd apps/website && pnpm dev            # Website"
echo "   cd apps/dashboard && pnpm dev          # Dashboard on :3002"
echo "   cd apps/command-center && pnpm dev    # Command Center on :3004"
echo "   cd apps/studio && pnpm dev             # Studio on :3005"
echo ""
echo "3. Monitor services:"
echo "   docker-compose logs -f"
echo ""
echo "4. Database UI:"
echo "   cd packages/db && pnpm prisma studio  # Prisma Studio on :5555"
echo ""
echo "📚 Full guide: WISE2_SETUP_GUIDE.md"
echo ""
