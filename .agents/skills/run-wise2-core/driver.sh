#!/bin/bash
# Wise² Core Driver Script
# Launches Docker stack + API server for automated testing

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../../../" && pwd)"
DRIVER_DIR="$PROJECT_ROOT/.claude/skills/run-wise2-core"
API_DIR="$PROJECT_ROOT/services/api"
STATUS_FILE="$DRIVER_DIR/status.txt"
PID_FILE="$DRIVER_DIR/api.pid"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

# Check Docker
check_docker() {
  if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker."
    return 1
  fi

  if ! docker ps &> /dev/null; then
    log_error "Docker daemon not running or not accessible."
    return 1
  fi

  log_success "Docker is running"
}

# Start Docker stack
start_docker_stack() {
  log_info "Starting Docker services (PostgreSQL, Redis, Prometheus, Grafana)..."

  cd "$PROJECT_ROOT"
  docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

  log_success "Docker services started"

  # Wait for services to be healthy
  log_info "Waiting for services to be healthy..."
  sleep 5

  # Check PostgreSQL
  if ! docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U postgres &> /dev/null; then
    log_error "PostgreSQL failed to start"
    return 1
  fi
  log_success "PostgreSQL is healthy"

  # Check Redis
  if ! docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping &> /dev/null; then
    log_error "Redis failed to start"
    return 1
  fi
  log_success "Redis is healthy"
}

# Install dependencies
install_deps() {
  log_info "Installing dependencies..."

  cd "$API_DIR"
  if [ ! -d "node_modules" ]; then
    npm install --quiet
    log_success "Dependencies installed"
  else
    log_success "Dependencies already installed"
  fi
}

# Setup environment
setup_env() {
  if [ ! -f "$API_DIR/.env" ]; then
    log_info "Creating .env from .env.example..."
    cp "$API_DIR/.env.example" "$API_DIR/.env"
    log_success ".env created"
  else
    log_success ".env already exists"
  fi
}

# Build TypeScript
build_ts() {
  log_info "Building TypeScript..."
  cd "$API_DIR"
  npm run build --silent
  log_success "TypeScript built"
}

# Start API server
start_api() {
  log_info "Starting API server..."

  cd "$API_DIR"

  # Start in background
  node dist/index.js > "$DRIVER_DIR/api.log" 2>&1 &
  API_PID=$!
  echo $API_PID > "$PID_FILE"

  log_success "API server started (PID: $API_PID)"
}

# Health check with retries
health_check() {
  log_info "Checking API health..."

  local max_attempts=30
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3000/health &> /dev/null; then
      log_success "API is healthy"
      return 0
    fi

    if [ $((attempt % 5)) -eq 0 ]; then
      log_info "Waiting for API... (attempt $attempt/$max_attempts)"
    fi

    sleep 1
    ((attempt++))
  done

  log_error "API health check failed after 30 seconds"
  log_info "Check logs: cat $DRIVER_DIR/api.log"
  return 1
}

# Stop everything
stop_all() {
  log_info "Stopping API server and Docker stack..."

  # Stop API if running
  if [ -f "$PID_FILE" ]; then
    API_PID=$(cat "$PID_FILE")
    if kill -0 "$API_PID" 2>/dev/null; then
      kill "$API_PID" || true
      log_success "API server stopped"
    fi
    rm -f "$PID_FILE"
  fi

  # Stop Docker stack
  cd "$PROJECT_ROOT"
  docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans

  log_success "Docker services stopped"
  log_success "Cleanup complete"
}

# Show status
show_status() {
  {
    echo "=== Wise² Core Status ==="
    echo ""

    echo "Docker Stack:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps 2>/dev/null || echo "Docker not running"
    echo ""

    echo "API Server:"
    if [ -f "$PID_FILE" ]; then
      API_PID=$(cat "$PID_FILE")
      if kill -0 "$API_PID" 2>/dev/null; then
        echo "✓ Running (PID: $API_PID)"
        echo "  Health: $(curl -s http://localhost:3000/health | head -c 100 || echo 'Unreachable')"
        echo "  Status: $(curl -s http://localhost:3000/status | head -c 100 || echo 'Unreachable')"
      else
        echo "✗ Process stopped"
      fi
    else
      echo "✗ Not running"
    fi
    echo ""

    echo "Useful Commands:"
    echo "  - Health check:   curl http://localhost:3000/health"
    echo "  - Run tests:      cd services/api && npm test"
    echo "  - View API logs:  tail -f $DRIVER_DIR/api.log"
    echo "  - Stop all:       bash $DRIVER_DIR/driver.sh stop"
    echo ""

  } | tee "$STATUS_FILE"

  log_success "Status written to $STATUS_FILE"
}

# Main commands
case "${1:-}" in
  start)
    log_info "Starting Wise² Core..."
    check_docker || exit 1
    start_docker_stack || exit 1
    setup_env || exit 1
    install_deps || exit 1
    build_ts || exit 1
    start_api || exit 1
    health_check || exit 1
    show_status
    echo ""
    log_success "Wise² Core is running!"
    echo "Next steps:"
    echo "  1. Run tests:  cd services/api && npm test"
    echo "  2. Check API:  curl http://localhost:3000/health"
    echo "  3. View logs:  tail -f $DRIVER_DIR/api.log"
    ;;

  stop)
    stop_all
    ;;

  health-check)
    health_check
    ;;

  status)
    show_status
    ;;

  restart)
    log_info "Restarting..."
    stop_all || true
    sleep 2
    "$0" start
    ;;

  logs)
    if [ -f "$DRIVER_DIR/api.log" ]; then
      tail -f "$DRIVER_DIR/api.log"
    else
      log_error "API log not found"
      exit 1
    fi
    ;;

  *)
    echo "Wise² Core Driver"
    echo ""
    echo "Usage: $0 {start|stop|status|health-check|restart|logs}"
    echo ""
    echo "Commands:"
    echo "  start         - Start Docker stack and API server"
    echo "  stop          - Stop API server and Docker stack"
    echo "  status        - Show current status"
    echo "  health-check  - Verify API is responding"
    echo "  restart       - Restart everything"
    echo "  logs          - Tail API logs"
    exit 1
    ;;
esac
