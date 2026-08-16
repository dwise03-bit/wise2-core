#!/bin/bash
set -e

cd ~/wise-defense-saas

echo "🚀 FAST DEPLOY START"

docker compose build api

docker compose up -d api

echo "🧪 health check..."
sleep 3

curl -fs http://localhost:3000/health && echo "✅ OK"

