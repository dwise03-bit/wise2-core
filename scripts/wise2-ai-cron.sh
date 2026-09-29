#!/bin/bash
# WISE² AI Cron Job — Periodic health checks and auto-restart
# Add to crontab: */15 * * * * /path/to/wise2-ai-cron.sh

VPS_HOST="173.208.147.165"
VPS_USER="dwise"
BACKEND_PORT=3020
LOG_FILE="/tmp/wise-ai-cron.log"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check backend health
check_backend() {
  if ! curl -s --connect-timeout 3 "http://$VPS_HOST:$BACKEND_PORT/status" > /dev/null 2>&1; then
    log "⚠️  Backend not responding, attempting restart..."
    ssh "$VPS_USER@$VPS_HOST" "
      pkill -f 'node.*dist/server.js' || true
      sleep 1
      cd /home/dwise/wise2-core/apps/wise-ai-assistant/backend
      PORT=$BACKEND_PORT nohup node dist/server.js > /tmp/wise-ai-backend.log 2>&1 &
    " 2>/dev/null
    log "✅ Backend restarted"
  else
    log "✅ Backend healthy"
  fi
}

# Check local M4
check_m4() {
  if ! ollama ps > /dev/null 2>&1; then
    log "⚠️  M4 Ollama not running"
  else
    log "✅ M4 healthy"
  fi
}

# Check VPS GPU
check_vps() {
  if ssh -o ConnectTimeout=3 "$VPS_USER@$VPS_HOST" "ollama ps > /dev/null 2>&1" 2>/dev/null; then
    log "✅ VPS healthy"
  else
    log "⚠️  VPS Ollama not responding"
  fi
}

# Check disk space
check_disk() {
  local free_gb=$(ssh "$VPS_USER@$VPS_HOST" "df /sdb-disk 2>/dev/null | tail -1 | awk '{print \$4}'" 2>/dev/null || echo "0")
  if [[ "$free_gb" -lt 50000 ]]; then
    log "❌ CRITICAL: VPS disk low ($((free_gb/1024))GB free)"
  else
    log "✅ Disk space healthy: $((free_gb/1024))GB"
  fi
}

# Run all checks
log "🔍 WISE² AI Health Check"
check_m4
check_vps
check_backend
check_disk
log "✅ Health check complete"

# Keep last 100 lines of log
tail -100 "$LOG_FILE" > "$LOG_FILE.tmp"
mv "$LOG_FILE.tmp" "$LOG_FILE"
