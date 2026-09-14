#!/bin/bash

# WISE² Port Policy Verification
# Enforces immutable port governance for production services
#
# Critical rule: Do not change existing port mappings
# All service ports are documented and used by nginx routing
#
# Usage: ./scripts/verify-port-policy.sh
# Exit: 0 if valid, 1 if policy violated

set -e

echo "🔍 WISE² Port Policy Verification"
echo "===================================="
echo ""

# Define immutable port mappings
declare -A IMMUTABLE_PORTS=(
  ["3001"]="website (Next.js landing page)"
  ["3010"]="api (NestJS backend)"
  ["5432"]="postgres (database, localhost only)"
  ["6379"]="redis (cache, if enabled)"
)

# ============================================================================
# Check 1: Verify docker-compose.prod.yml has correct ports
# ============================================================================
echo "1️⃣  Checking docker-compose.prod.yml..."

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Cannot find $COMPOSE_FILE"
  exit 1
fi

violations=0

for port in "${!IMMUTABLE_PORTS[@]}"; do
  service_desc="${IMMUTABLE_PORTS[$port]}"
  service_name=$(echo "$service_desc" | cut -d' ' -f1)

  # Check if port appears in compose file
  if grep -q ":$port:" "$COMPOSE_FILE"; then
    echo "   ✓ Port $port ($service_desc) configured"
  else
    echo "   ❌ Port $port ($service_desc) NOT found in docker-compose.prod.yml"
    violations=$((violations + 1))
  fi
done

if [ $violations -gt 0 ]; then
  echo ""
  echo "❌ Port policy violations detected"
  exit 1
fi

echo ""

# ============================================================================
# Check 2: Verify no duplicate ports in compose file
# ============================================================================
echo "2️⃣  Checking for duplicate port mappings..."

# Extract all port mappings
PORTS=$(grep -oE '"[0-9]+:[0-9]+"' "$COMPOSE_FILE" | sort)

if [ -z "$PORTS" ]; then
  echo "   ⚠️  No explicit port mappings found in $COMPOSE_FILE"
else
  # Count unique vs total ports
  unique_count=$(echo "$PORTS" | sort -u | wc -l)
  total_count=$(echo "$PORTS" | wc -l)

  if [ "$unique_count" != "$total_count" ]; then
    echo "   ❌ Duplicate port mappings detected!"
    echo "$PORTS" | sort | uniq -d
    exit 1
  fi

  echo "   ✓ No duplicate ports ($unique_count unique mappings)"
fi

echo ""

# ============================================================================
# Check 3: Verify nginx routing to correct ports
# ============================================================================
echo "3️⃣  Checking nginx configuration (if present)..."

if [ -f "nginx.conf" ]; then
  if grep -q "upstream.*3001" nginx.conf && grep -q "upstream.*3010" nginx.conf; then
    echo "   ✓ Nginx routing configured"
  else
    echo "   ⚠️  Nginx routing may need verification"
  fi
else
  echo "   ℹ️  No nginx.conf found (may be in container)"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "✅ Port policy verification complete"
echo ""
echo "Immutable Port Mappings:"
for port in "${!IMMUTABLE_PORTS[@]}"; do
  echo "  Port $port → ${IMMUTABLE_PORTS[$port]}"
done
echo ""
echo "These ports are documented and immutable."
echo "Do not change them without updating nginx routing rules."
echo ""

exit 0
