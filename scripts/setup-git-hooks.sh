#!/bin/bash
# Setup Git Hooks for WISE² Team
# Installs pre-commit and commit-msg hooks
# Usage: ./scripts/setup-git-hooks.sh

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.husky"

echo "🔧 Setting up WISE² Git Hooks"
echo "======================================"

# Make hooks executable
if [ -d "$HOOKS_DIR" ]; then
    chmod +x "$HOOKS_DIR/pre-commit" 2>/dev/null || true
    chmod +x "$HOOKS_DIR/commit-msg" 2>/dev/null || true
    echo "✅ Hooks made executable"
fi

# Set git hook path
git config core.hooksPath .husky
echo "✅ Git configured to use .husky hooks"

# Test the hooks
echo ""
echo "🧪 Testing hooks..."

# Create a temp commit message to test
TEST_MSG="feat(test): verify hooks are working"
echo "$TEST_MSG" > /tmp/test_commit_msg.txt

if "$HOOKS_DIR/commit-msg" /tmp/test_commit_msg.txt; then
    echo "✅ Commit message hook works"
else
    echo "⚠️  Commit message hook test failed (expected for invalid format)"
fi

rm -f /tmp/test_commit_msg.txt

echo ""
echo "======================================"
echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 What's protected:"
echo "  • Pre-commit: prevents secrets, large files, main commits"
echo "  • Commit-msg: enforces conventional commits format"
echo ""
echo "📖 Commit format:"
echo "  type(scope): description"
echo ""
echo "Examples:"
echo "  feat(tailscale): add user to ACL"
echo "  fix(github): correct permission sync"
echo "  chore(deps): update npm packages"
echo ""
echo "To bypass hooks (not recommended):"
echo "  git commit --no-verify"
echo ""
