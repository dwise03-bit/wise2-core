#!/bin/bash

# WISE² Mac ↔ VPS Sync Verification Script
# Ensures Mac and VPS checkouts are always at the same commit
#
# Usage: ./scripts/sync-check.sh
# Exit codes:
#   0 = Synced
#   1 = Out of sync or error

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( dirname "$SCRIPT_DIR" )"
VPS_HOST="${VPS_HOST:-173.208.147.165}"
VPS_USER="${VPS_USER:-dwise}"
VPS_PATH="/home/dwise/wise2-core"

echo "🔄 WISE² Sync Verification"
echo "================================"
echo ""

# ============================================================================
# Step 1: Get local (Mac) commit hash
# ============================================================================
echo "📍 Local (Mac) status:"
cd "$REPO_ROOT"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not in a git repository"
  exit 1
fi

LOCAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LOCAL_COMMIT=$(git rev-parse HEAD)
LOCAL_REMOTE=$(git config branch."$LOCAL_BRANCH".remote)
LOCAL_REMOTE=${LOCAL_REMOTE:-origin}

echo "  Branch: $LOCAL_BRANCH"
echo "  Commit: $LOCAL_COMMIT"
echo "  Remote: $LOCAL_REMOTE"

if [ -n "$(git status --porcelain)" ]; then
  echo "  ⚠️  Uncommitted changes detected!"
  git status --short | head -10
  echo ""
fi

echo ""

# ============================================================================
# Step 2: Get remote (VPS) commit hash
# ============================================================================
echo "📍 Remote (VPS) status:"
echo "  Host: $VPS_HOST"
echo "  Path: $VPS_PATH"
echo ""

# Try SSH connection
if ! ssh -q "$VPS_USER@$VPS_HOST" exit 2>/dev/null; then
  echo "❌ Cannot connect to VPS at $VPS_USER@$VPS_HOST"
  echo ""
  echo "   Check:"
  echo "   1. VPS is reachable"
  echo "   2. SSH key is configured: ssh-add ~/.ssh/id_ed25519"
  echo "   3. VPS_HOST env var is correct (currently: $VPS_HOST)"
  exit 1
fi

# Get VPS info
VPS_BRANCH=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git rev-parse --abbrev-ref HEAD" 2>/dev/null)
VPS_COMMIT=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git rev-parse HEAD" 2>/dev/null)
VPS_UNCOMMITTED=$(ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && git status --porcelain" 2>/dev/null | wc -l)

echo "  Branch: $VPS_BRANCH"
echo "  Commit: $VPS_COMMIT"
echo "  Uncommitted changes: $VPS_UNCOMMITTED"

if [ "$VPS_UNCOMMITTED" -gt 0 ]; then
  echo "  ⚠️  Uncommitted changes on VPS!"
fi

echo ""

# ============================================================================
# Step 3: Compare commits
# ============================================================================
echo "🔍 Sync Status:"
echo ""

if [ "$LOCAL_COMMIT" = "$VPS_COMMIT" ]; then
  echo "✅ SYNCED"
  echo "   Both Mac and VPS are at commit: $LOCAL_COMMIT"
  echo ""
  exit 0
else
  echo "❌ OUT OF SYNC"
  echo ""
  echo "   Mac commit: $LOCAL_COMMIT"
  echo "   VPS commit: $VPS_COMMIT"
  echo ""
  echo "Recovery:"
  echo "  1. On Mac:"
  echo "     git fetch origin"
  echo "     git reset --hard origin/$LOCAL_BRANCH"
  echo ""
  echo "  2. On VPS:"
  echo "     ssh $VPS_USER@$VPS_HOST"
  echo "     cd $VPS_PATH"
  echo "     git fetch origin"
  echo "     git reset --hard origin/$VPS_BRANCH"
  echo ""
  echo "  3. Verify sync:"
  echo "     ./scripts/sync-check.sh"
  echo ""
  exit 1
fi
