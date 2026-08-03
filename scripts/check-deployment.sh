#!/bin/bash

echo "🔍 WISE² Deployment Status Check"
echo "================================="
echo ""

# Check containers
echo "📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep wise2

echo ""
echo "🌐 Endpoint Status:"

check_health() {
    local port=$1
    local name=$2
    local path=${3:-/}

    if timeout 5 curl -sf "http://localhost:$port$path" > /dev/null 2>&1; then
        echo "  ✅ $name (http://localhost:$port$path)"
        return 0
    else
        echo "  ⏳ $name (http://localhost:$port$path) - Not ready"
        return 1
    fi
}

check_health 3011 "Website" "/"
check_health 3002 "Dashboard" "/"
check_health 3003 "Admin" "/"
check_health 3005 "Studio" "/"
check_health 3010 "API" "/api/health"
check_health 3100 "Grafana" "/api/health"

echo ""
echo "💾 Database Status:"
docker exec wise2-postgres-prod pg_isready -U postgres >/dev/null 2>&1 && echo "  ✅ PostgreSQL" || echo "  ⏳ PostgreSQL"

echo ""
echo "🔴 Cache Status:"
docker exec wise2-core_redis_1 redis-cli ping >/dev/null 2>&1 && echo "  ✅ Redis" || echo "  ⏳ Redis"

echo ""
echo "📊 Monitoring:"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3100"

echo ""
echo "🔒 HTTPS Endpoints (via nginx):"
echo "  Website: https://wise2.net"
echo "  Dashboard: https://dashboard.wise2.net"
echo "  Admin: https://admin.wise2.net"
echo "  Studio: https://studio.wise2.net"
echo "  API: https://api.wise2.net"
echo "  Grafana: https://grafana.wise2.net"

echo ""
echo "💰 Revenue Features to Enable:"
echo "  [ ] Stripe integration (API_STRIPE_SECRET_KEY)"
echo "  [ ] Email notifications (SENDGRID_API_KEY)"
echo "  [ ] OAuth providers (GOOGLE/GITHUB)"
echo "  [ ] Analytics tracking (POSTHOG_API_KEY)"

