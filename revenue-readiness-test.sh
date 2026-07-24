#!/bin/bash
echo "Testing docker compose..."
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Testing database..."
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT version();" 2>/dev/null || echo "DB check failed"
echo ""
echo "Testing API health..."
curl -s http://localhost:3000/health || echo "API check failed"
echo ""
echo "Testing .env.production..."
if [ -f .env.production ]; then
  echo "✓ .env.production exists"
  grep -c "^[^#]" .env.production && echo "  Variables configured"
else
  echo "✗ .env.production missing"
fi
