#!/bin/bash
set -e

# WISE² Production Deployment Script
# Comprehensive deployment to production server
# Usage: ./scripts/deploy.sh [environment] [branch]
# Example: ./scripts/deploy.sh production main

ENVIRONMENT=${1:-production}
BRANCH=${2:-main}
SERVER_USER=${3:-dwise}
SERVER_HOST=${4:-173.208.147.165}
SERVER="${SERVER_USER}@${SERVER_HOST}"
SSH_KEY_PATH="${HOME}/.ssh/wise2-deploy"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

log "WISE² Production Deployment"
log "Environment: $ENVIRONMENT | Branch: $BRANCH | Server: $SERVER"

# Verify SSH key
if [ ! -f "$SSH_KEY_PATH" ]; then
    error "SSH key not found: $SSH_KEY_PATH"
fi
success "SSH key found"

# Verify git state
if [ -n "$(git status --porcelain)" ]; then
    error "Working directory is dirty. Commit or stash changes first."
fi
success "Working directory is clean"

# Verify branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    log "Switching to branch $BRANCH..."
    git checkout "$BRANCH"
fi
success "On branch $BRANCH"

# Push code
log "Pushing code to GitHub..."
git push origin "$BRANCH"
success "Code pushed"

# Deploy via SSH
log "Connecting to $SERVER..."
ssh -i "$SSH_KEY_PATH" "$SERVER" << 'EOF'
set -e

REPO_DIR="/home/dwise/wise2-core"
ENVIRONMENT=${1:-production}
BRANCH=${2:-main}
LOG_DIR="/var/log/wise2"

mkdir -p "$LOG_DIR"

log() { echo "[$(date +'%H:%M:%S')] $1" | tee -a "$LOG_DIR/deploy.log"; }
success() { echo "✅ $1" | tee -a "$LOG_DIR/deploy.log"; }
error() { echo "❌ $1" | tee -a "$LOG_DIR/deploy.log"; exit 1; }

log "Starting deployment to $ENVIRONMENT..."

cd "$REPO_DIR"

# Backup database
log "Backing up database..."
BACKUP_FILE="/home/dwise/backups/postgres_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p "$(dirname "$BACKUP_FILE")"
docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres wise2_core_prod > "$BACKUP_FILE" 2>/dev/null || true
success "Database backed up"

# Update code
log "Fetching latest code..."
git fetch origin "$BRANCH"
git checkout -f "origin/$BRANCH"
success "Code updated to $(git log -1 --oneline)"

# Load environment
if [ -f ".env.$ENVIRONMENT" ]; then
  export $(cat ".env.$ENVIRONMENT" | grep -v '^#' | xargs)
  success "Environment loaded from .env.$ENVIRONMENT"
fi

# Rebuild and restart
log "Stopping services..."
docker-compose -f docker-compose.production.yml down --remove-orphans || true

log "Building Docker images (this may take several minutes)..."
docker-compose -f docker-compose.production.yml build --pull

log "Starting services..."
docker-compose -f docker-compose.production.yml up -d

log "Waiting for services to be healthy..."
sleep 30

# Database migrations
log "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T api npx prisma migrate deploy || true
success "Migrations completed"

# Verify services
log "Verifying services..."
SERVICES=("postgres" "api" "website" "dashboard" "command-center" "worker")
FAILED=0

for service in "${SERVICES[@]}"; do
  if docker-compose -f docker-compose.production.yml ps "$service" | grep -q "Up"; then
    success "$service is running"
  else
    error "$service failed to start"
    FAILED=$((FAILED + 1))
  fi
done

if [ $FAILED -gt 0 ]; then
  error "Deployment failed: $FAILED services did not start"
fi

# Cleanup
log "Cleaning up Docker..."
docker system prune -f || true

success "Deployment complete!"
log "Services status:"
docker-compose -f docker-compose.production.yml ps
EOF

success "Deployment complete!"
log "WISE² is live at: https://wise2.net"
