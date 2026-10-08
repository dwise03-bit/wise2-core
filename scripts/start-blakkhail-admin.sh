#!/usr/bin/env bash
# Blakkhail Admin Server Startup Script
# Starts the admin authentication service on port 3014

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADMIN_SERVER="$SCRIPT_DIR/services/blakkhail-admin.js"
PORT="${BLAKKHAIL_ADMIN_PORT:-3014}"
LOG_FILE="/tmp/blakkhail-admin.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Blakkhail Admin Server...${NC}"

# Check if server is already running
if lsof -i :$PORT > /dev/null 2>&1; then
  echo -e "${YELLOW}Port $PORT is already in use${NC}"
  echo "Checking if it's the admin server..."
  PID=$(lsof -ti :$PORT | head -n 1)
  if ps -p $PID | grep -q "blakkhail-admin.js"; then
    echo -e "${GREEN}Admin server already running (PID: $PID)${NC}"
    echo "Login page: http://localhost:$PORT/../blakkhail-admin-login.html"
    exit 0
  else
    echo -e "${RED}Error: Port $PORT is in use by another service${NC}"
    exit 1
  fi
fi

# Start the server
if [ ! -f "$ADMIN_SERVER" ]; then
  echo -e "${RED}Error: Admin server file not found at $ADMIN_SERVER${NC}"
  exit 1
fi

chmod +x "$ADMIN_SERVER"

# Start in background and redirect output to log
nohup node "$ADMIN_SERVER" > "$LOG_FILE" 2>&1 &
PID=$!

# Wait a bit for the server to start
sleep 1

# Check if process is still running
if ! kill -0 $PID 2>/dev/null; then
  echo -e "${RED}Error: Server failed to start${NC}"
  echo "Log output:"
  cat "$LOG_FILE"
  exit 1
fi

echo -e "${GREEN}✓ Admin server started successfully (PID: $PID)${NC}"
echo -e "${GREEN}✓ Service running on port $PORT${NC}"
echo ""
echo "Login Details:"
echo "  Email:    blakkhail@gmail.com"
echo "  Password: Piffcity"
echo ""
echo "Access Admin:"
echo "  Login:     http://localhost:3011/blakkhail-admin-login.html"
echo "  Dashboard: http://localhost:3011/blakkhail-admin-dashboard.html"
echo ""
echo "API Health Check:"
echo "  curl http://localhost:$PORT/api/health"
echo ""
echo "Logs: $LOG_FILE"
