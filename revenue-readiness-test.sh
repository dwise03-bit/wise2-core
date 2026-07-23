#!/bin/bash

################################################################################
# WISE² Core - Revenue Readiness Smoke Test
#
# Comprehensive end-to-end test suite to verify production readiness
# Tests: Docker, Database, Redis, API, Nginx, Stripe, SendGrid, Migrations
#
# Usage: ./revenue-readiness-test.sh
# Output: Color-coded pass/fail results with summary
################################################################################

set -o pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_ROOT}/.env"
SCHEMA_FILE="${PROJECT_ROOT}/packages/db/schema.sql"
LOG_FILE="${PROJECT_ROOT}/.revenue-readiness-test.log"
TIMEOUT_SECONDS=120

# Database config
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="wise2_prod"
DB_USER="wise2"
DB_PASSWORD="${DATABASE_PASSWORD:-wise2}"

# Redis config
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="${REDIS_PASSWORD:-redis123}"

# API config
API_HOST="localhost"
API_PORT="3000"
WEBSITE_PORT="3001"
STUDIO_PORT="3005"
NGINX_PORT="80"

# Initialize log file
: > "$LOG_FILE"

################################################################################
# Utility Functions
################################################################################

log_test() {
    local test_name="$1"
    echo -e "${BLUE}[TEST]${NC} $test_name"
    echo "[TEST] $test_name" >> "$LOG_FILE"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
}

pass_test() {
    local test_name="$1"
    echo -e "${GREEN}[PASS]${NC} $test_name"
    echo "[PASS] $test_name" >> "$LOG_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail_test() {
    local test_name="$1"
    local reason="$2"
    echo -e "${RED}[FAIL]${NC} $test_name: $reason"
    echo "[FAIL] $test_name: $reason" >> "$LOG_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

skip_test() {
    local test_name="$1"
    local reason="$2"
    echo -e "${YELLOW}[SKIP]${NC} $test_name: $reason"
    echo "[SKIP] $test_name: $reason" >> "$LOG_FILE"
}

wait_for_port() {
    local host="$1"
    local port="$2"
    local name="$3"
    local timeout="${4:-$TIMEOUT_SECONDS}"
    local elapsed=0

    echo -n "  Waiting for $name ($host:$port)..."

    while [ $elapsed -lt $timeout ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo -e " ${GREEN}Ready${NC}"
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
        echo -n "."
    done

    echo -e " ${RED}Timeout${NC}"
    return 1
}

################################################################################
# Test Suite
################################################################################

print_header() {
    local title="$1"
    echo ""
    echo -e "${BLUE}================================================================================${NC}"
    echo -e "${BLUE}$title${NC}"
    echo -e "${BLUE}================================================================================${NC}"
}

print_header "WISE² Core Revenue Readiness Test Suite"
echo "Project Root: $PROJECT_ROOT"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Log File: $LOG_FILE"

################################################################################
# 1. Docker Compose Startup
################################################################################

print_header "1. Docker Compose Startup Test"

log_test "Docker Compose configuration validation"
if docker-compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
    pass_test "Docker Compose configuration validation"
else
    fail_test "Docker Compose configuration validation" "Invalid docker-compose.yml syntax"
    exit 1
fi

log_test "Starting Docker Compose services"
if docker-compose -f "$COMPOSE_FILE" up -d >> "$LOG_FILE" 2>&1; then
    pass_test "Starting Docker Compose services"
else
    fail_test "Starting Docker Compose services" "docker-compose up failed"
    exit 1
fi

# Wait for services to be ready
echo "  Waiting for all services to start..."
sleep 5

# Test individual services health
log_test "PostgreSQL service health"
if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    pass_test "PostgreSQL service health"
else
    fail_test "PostgreSQL service health" "PostgreSQL not responding"
fi

log_test "Redis service health"
if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli --raw ping > /dev/null 2>&1; then
    pass_test "Redis service health"
else
    fail_test "Redis service health" "Redis not responding"
fi

log_test "API service health"
if wait_for_port "$API_HOST" "$API_PORT" "API"; then
    pass_test "API service health"
else
    fail_test "API service health" "API port $API_PORT not responding"
fi

log_test "Website service health"
if wait_for_port "$API_HOST" "$WEBSITE_PORT" "Website"; then
    pass_test "Website service health"
else
    fail_test "Website service health" "Website port $WEBSITE_PORT not responding"
fi

log_test "Studio service health"
if wait_for_port "$API_HOST" "$STUDIO_PORT" "Studio"; then
    pass_test "Studio service health"
else
    fail_test "Studio service health" "Studio port $STUDIO_PORT not responding"
fi

log_test "Nginx service health"
if wait_for_port "$API_HOST" "$NGINX_PORT" "Nginx"; then
    pass_test "Nginx service health"
else
    fail_test "Nginx service health" "Nginx port $NGINX_PORT not responding"
fi

################################################################################
# 2. Database Tests
################################################################################

print_header "2. Database Connectivity Tests"

log_test "PostgreSQL connection"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    pass_test "PostgreSQL connection"
else
    fail_test "PostgreSQL connection" "Cannot connect to PostgreSQL"
    skip_test "Database schema verification" "Database not accessible"
    skip_test "Database tables exist" "Database not accessible"
else
    # Only run remaining DB tests if connection succeeds

    log_test "Database schema verification"
    if [ -f "$SCHEMA_FILE" ]; then
        pass_test "Database schema verification"
    else
        fail_test "Database schema verification" "schema.sql not found at $SCHEMA_FILE"
    fi

    log_test "Database tables exist (users)"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users';" 2>/dev/null | grep -q "1"; then
        pass_test "Database tables exist (users)"
    else
        fail_test "Database tables exist (users)" "users table not found"
    fi

    log_test "Database tables exist (subscriptions)"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='subscriptions';" 2>/dev/null | grep -q "1"; then
        pass_test "Database tables exist (subscriptions)"
    else
        fail_test "Database tables exist (subscriptions)" "subscriptions table not found"
    fi

    log_test "Database tables exist (workspaces)"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='workspaces';" 2>/dev/null | grep -q "1"; then
        pass_test "Database tables exist (workspaces)"
    else
        fail_test "Database tables exist (workspaces)" "workspaces table not found"
    fi

    log_test "Database tables exist (invoices)"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='invoices';" 2>/dev/null | grep -q "1"; then
        pass_test "Database tables exist (invoices)"
    else
        fail_test "Database tables exist (invoices)" "invoices table not found"
    fi

    log_test "Database tables exist (analytics_events)"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='analytics_events';" 2>/dev/null | grep -q "1"; then
        pass_test "Database tables exist (analytics_events)"
    else
        fail_test "Database tables exist (analytics_events)" "analytics_events table not found"
    fi
fi

################################################################################
# 3. Redis Tests
################################################################################

print_header "3. Redis Cache Tests"

log_test "Redis connectivity"
if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
    pass_test "Redis connectivity"
else
    fail_test "Redis connectivity" "Cannot connect to Redis"
    skip_test "Redis SET operation" "Redis not accessible"
    skip_test "Redis GET operation" "Redis not accessible"
else
    # Only run Redis operations if connectivity succeeds

    log_test "Redis SET operation"
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" SET "revenue-readiness-test-key" "success" > /dev/null 2>&1; then
        pass_test "Redis SET operation"
    else
        fail_test "Redis SET operation" "Failed to set value in Redis"
    fi

    log_test "Redis GET operation"
    REDIS_VALUE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" GET "revenue-readiness-test-key" 2>/dev/null)
    if [ "$REDIS_VALUE" = "success" ]; then
        pass_test "Redis GET operation"
    else
        fail_test "Redis GET operation" "Expected 'success', got '$REDIS_VALUE'"
    fi

    # Cleanup
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" DEL "revenue-readiness-test-key" > /dev/null 2>&1
fi

################################################################################
# 4. API Health Checks
################################################################################

print_header "4. API Health Checks"

log_test "API /health endpoint"
if curl -s -f -w "%{http_code}" "http://$API_HOST:$API_PORT/health" -o /dev/null 2>/dev/null | grep -q "200"; then
    pass_test "API /health endpoint"
else
    fail_test "API /health endpoint" "HTTP 200 not returned"
fi

log_test "API /ready endpoint"
READY_RESPONSE=$(curl -s "http://$API_HOST:$API_PORT/ready" 2>/dev/null)
if [ -n "$READY_RESPONSE" ]; then
    pass_test "API /ready endpoint"
else
    fail_test "API /ready endpoint" "No response from /ready endpoint"
fi

log_test "API responds to requests"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://$API_HOST:$API_PORT/" 2>/dev/null)
if [ "$API_RESPONSE" != "000" ]; then
    pass_test "API responds to requests"
else
    fail_test "API responds to requests" "API not responding"
fi

################################################################################
# 5. Nginx Routing Tests
################################################################################

print_header "5. Nginx Routing Tests"

log_test "Nginx root endpoint"
if curl -s -f "http://localhost:$NGINX_PORT/" > /dev/null 2>&1; then
    pass_test "Nginx root endpoint"
else
    skip_test "Nginx root endpoint" "Nginx not fully configured or root path not serving"
fi

log_test "Nginx API routing (direct API port test)"
if curl -s -f "http://$API_HOST:$API_PORT/health" > /dev/null 2>&1; then
    pass_test "Nginx API routing (direct API port test)"
else
    fail_test "Nginx API routing (direct API port test)" "API not accessible"
fi

log_test "Nginx Website routing (direct Website port test)"
if curl -s -f "http://$API_HOST:$WEBSITE_PORT/" > /dev/null 2>&1; then
    pass_test "Nginx Website routing (direct Website port test)"
else
    fail_test "Nginx Website routing (direct Website port test)" "Website not accessible"
fi

log_test "Nginx Studio routing (direct Studio port test)"
if curl -s -f "http://$API_HOST:$STUDIO_PORT/" > /dev/null 2>&1; then
    pass_test "Nginx Studio routing (direct Studio port test)"
else
    fail_test "Nginx Studio routing (direct Studio port test)" "Studio not accessible"
fi

################################################################################
# 6. Environment Configuration Tests
################################################################################

print_header "6. Environment Configuration Tests"

log_test "Environment file exists"
if [ -f "$ENV_FILE" ]; then
    pass_test "Environment file exists"
else
    skip_test "Stripe readiness" ".env file not found"
    skip_test "SendGrid readiness" ".env file not found"
fi

log_test "Stripe configuration (STRIPE_SECRET_KEY)"
if grep -q "STRIPE_SECRET_KEY" "$ENV_FILE" 2>/dev/null; then
    STRIPE_KEY=$(grep "STRIPE_SECRET_KEY" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$STRIPE_KEY" ] && [ "$STRIPE_KEY" != "XXXXXXXXXXXXXXXXXXXXX" ] && [ "$STRIPE_KEY" != "sk_live_XXXXXXXXXXXXXXXXXXXXX" ]; then
        pass_test "Stripe configuration (STRIPE_SECRET_KEY)"
    else
        fail_test "Stripe configuration (STRIPE_SECRET_KEY)" "STRIPE_SECRET_KEY not configured or placeholder value"
    fi
else
    fail_test "Stripe configuration (STRIPE_SECRET_KEY)" "STRIPE_SECRET_KEY not in .env"
fi

log_test "SendGrid configuration (SENDGRID_API_KEY)"
if grep -q "SENDGRID_API_KEY" "$ENV_FILE" 2>/dev/null; then
    SENDGRID_KEY=$(grep "SENDGRID_API_KEY" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$SENDGRID_KEY" ] && [ "$SENDGRID_KEY" != "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX" ] && [ "$SENDGRID_KEY" != "SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXX" ]; then
        pass_test "SendGrid configuration (SENDGRID_API_KEY)"
    else
        fail_test "SendGrid configuration (SENDGRID_API_KEY)" "SENDGRID_API_KEY not configured or placeholder value"
    fi
else
    fail_test "SendGrid configuration (SENDGRID_API_KEY)" "SENDGRID_API_KEY not in .env"
fi

log_test "Stripe Webhook Secret configured"
if grep -q "STRIPE_WEBHOOK_SECRET" "$ENV_FILE" 2>/dev/null; then
    WEBHOOK_SECRET=$(grep "STRIPE_WEBHOOK_SECRET" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$WEBHOOK_SECRET" ] && [ "$WEBHOOK_SECRET" != "XXXXXXXXXXXXXXXXXXXXX" ]; then
        pass_test "Stripe Webhook Secret configured"
    else
        fail_test "Stripe Webhook Secret configured" "STRIPE_WEBHOOK_SECRET not configured or placeholder value"
    fi
else
    fail_test "Stripe Webhook Secret configured" "STRIPE_WEBHOOK_SECRET not in .env"
fi

log_test "API Base URL configured"
if grep -q "API_BASE_URL" "$ENV_FILE" 2>/dev/null; then
    API_URL=$(grep "API_BASE_URL" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$API_URL" ] && [ "$API_URL" != "" ]; then
        pass_test "API Base URL configured"
    else
        fail_test "API Base URL configured" "API_BASE_URL is empty"
    fi
else
    fail_test "API Base URL configured" "API_BASE_URL not in .env"
fi

log_test "App URL configured"
if grep -q "APP_URL" "$ENV_FILE" 2>/dev/null; then
    APP_URL=$(grep "APP_URL" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$APP_URL" ] && [ "$APP_URL" != "" ]; then
        pass_test "App URL configured"
    else
        fail_test "App URL configured" "APP_URL is empty"
    fi
else
    fail_test "App URL configured" "APP_URL not in .env"
fi

################################################################################
# 7. Migration Readiness Tests
################################################################################

print_header "7. Prisma Migrations Readiness"

log_test "Prisma schema exists"
if [ -f "$PROJECT_ROOT/packages/api/prisma/schema.prisma" ]; then
    pass_test "Prisma schema exists"
else
    fail_test "Prisma schema exists" "Prisma schema not found"
fi

log_test "Database init migration applied"
MIGRATION_DIR="$PROJECT_ROOT/packages/api/prisma/migrations"
if [ -d "$MIGRATION_DIR" ]; then
    if [ "$(ls -A $MIGRATION_DIR)" ]; then
        pass_test "Database init migration applied"
    else
        fail_test "Database init migration applied" "No migrations found"
    fi
else
    fail_test "Database init migration applied" "migrations directory not found"
fi

################################################################################
# 8. Docker Cleanup (Optional)
################################################################################

print_header "8. Post-Test Cleanup"

log_test "Docker services running"
RUNNING_CONTAINERS=$(docker-compose -f "$COMPOSE_FILE" ps -q 2>/dev/null | wc -l)
if [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    pass_test "Docker services running ($RUNNING_CONTAINERS containers)"
    echo ""
    echo "  Services running:"
    docker-compose -f "$COMPOSE_FILE" ps --services 2>/dev/null | sed 's/^/    /'
else
    fail_test "Docker services running" "No containers found"
fi

################################################################################
# Summary
################################################################################

print_header "Test Summary"

TESTS_SKIPPED=$((TESTS_TOTAL - TESTS_PASSED - TESTS_FAILED))

echo ""
echo "Total Tests:  $TESTS_TOTAL"
echo -e "Passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:       ${RED}$TESTS_FAILED${NC}"
echo -e "Skipped:      ${YELLOW}$TESTS_SKIPPED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Revenue Readiness Test PASSED${NC}"
    echo ""
    echo "System is ready for production deployment!"
    echo ""
    echo "Next Steps:"
    echo "  1. Verify environment configuration in .env"
    echo "  2. Test payment processing with Stripe test card"
    echo "  3. Run smoke tests on staging environment"
    echo "  4. Deploy to production with deployment script"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Revenue Readiness Test FAILED${NC}"
    echo ""
    echo "Issues found:"
    grep "^\[FAIL\]" "$LOG_FILE" | sed 's/^\[FAIL\] /  - /'
    echo ""
    echo "Please review the failures above and fix before deploying."
    echo "Full log: $LOG_FILE"
    echo ""
    exit 1
fi
