#!/bin/bash
# WISE² Git Team Sync Script
# Keeps your local branch in sync with main before pushing
# Usage: ./scripts/git-team-sync.sh [branch-name]

set -e

BRANCH=${1:-$(git rev-parse --abbrev-ref HEAD)}
MAIN_BRANCH="main"

echo "🔄 WISE² Git Team Sync"
echo "======================================"
echo "Branch: $BRANCH"
echo "Target: origin/$MAIN_BRANCH"
echo ""

# Check if on main (shouldn't do this)
if [ "$BRANCH" == "$MAIN_BRANCH" ]; then
    echo "❌ You're on main. Create a feature branch first!"
    echo "   git checkout -b feature/your-feature"
    exit 1
fi

# Fetch latest
echo "📥 Fetching latest changes..."
git fetch origin

# Check if branch exists on remote
if ! git rev-parse origin/$BRANCH > /dev/null 2>&1; then
    echo "✨ New branch (not yet pushed)"
else
    echo "✅ Branch exists on remote"
fi

# Check if we need to sync
MERGE_BASE=$(git merge-base $BRANCH origin/$MAIN_BRANCH)
MAIN_HEAD=$(git rev-parse origin/$MAIN_BRANCH)
BRANCH_HEAD=$(git rev-parse $BRANCH)

if [ "$MERGE_BASE" != "$MAIN_HEAD" ]; then
    echo ""
    echo "⚠️  Your branch is behind main by $(git rev-list --count $MAIN_HEAD..$BRANCH_HEAD) commits"
    echo "🔄 Rebasing onto latest main..."

    git rebase origin/$MAIN_BRANCH

    if [ $? -eq 0 ]; then
        echo "✅ Rebase successful!"
    else
        echo "⚠️  Rebase has conflicts. Resolve and run:"
        echo "   git rebase --continue"
        echo "   git push origin $BRANCH --force-with-lease"
        exit 1
    fi
else
    echo "✅ Your branch is up to date with main"
fi

# Show what would be pushed
echo ""
echo "📊 Changes to push:"
git log origin/$BRANCH..$BRANCH --oneline | wc -l | xargs echo "   Commits:"
git diff --stat origin/$BRANCH | tail -1

echo ""
echo "✅ Ready to push!"
echo "   git push origin $BRANCH"
echo ""
echo "Then create a Pull Request:"
echo "   gh pr create --fill"
