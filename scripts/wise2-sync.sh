#!/usr/bin/env bash
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
mode="${1:---check}"
case "$mode" in
  --check)
    echo "repo: $repo_root"
    echo "branch: $(git branch --show-current)"
    echo "commit: $(git rev-parse --short HEAD)"
    if [[ -n "$(git status --porcelain)" ]]; then echo "worktree: dirty (preserved)"; else echo "worktree: clean"; fi
    git fetch --quiet origin 2>/dev/null || echo "origin: unavailable (local check only)"
    branch="$(git branch --show-current)"
    if [[ -n "$branch" ]] && git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
      echo "origin/$branch: $(git rev-parse --short "origin/$branch")"
      git merge-base --is-ancestor HEAD "origin/$branch" && echo "drift: local is not ahead of origin" || echo "drift: local has commits or diverged"
    fi
    ;;
  --fetch)
    git fetch origin
    echo "Fetched origin. No working files were changed. Review drift with: $0 --check"
    ;;
  *) echo "Usage: $0 [--check|--fetch]" >&2; exit 2;;
esac
