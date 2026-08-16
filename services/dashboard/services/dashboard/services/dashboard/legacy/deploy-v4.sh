#!/bin/bash

echo "🚀 ENTERPRISE V4 DEPLOY START"

# stop everything clean
docker compose down

# remove stale network issues
docker network prune -f

# rebuild fresh
docker compose build --no-cache

# start stack
docker compose up -d

# health check
sleep 5
curl -f http://localhost:3000/health || exit 1

echo "✅ V4 DEPLOY SUCCESS"
