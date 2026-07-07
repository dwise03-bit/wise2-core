#!/bin/bash

set -e

echo "🚀 V5 DEPLOY START"

ACTIVE=$(docker ps --format "{{.Names}}" | grep api || true)

echo "Current active: $ACTIVE"

# Build new version
docker compose build --no-cache

# Start new stack (green)
docker compose up -d

echo "⏳ Health check..."

sleep 8

curl -f http://localhost:3000/health || (
  echo "❌ HEALTH FAILED → ROLLBACK"

  docker compose down
  docker compose up -d

  exit 1
)

echo "✅ DEPLOY SUCCESS"
