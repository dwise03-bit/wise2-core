#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
required=(
  ".claude/skills/wise2-mobile-development/SKILL.md"
  ".claude/skills/wise2-mobile-development/IOS.md"
  ".claude/skills/wise2-mobile-development/ANDROID.md"
  ".claude/skills/wise2-mobile-development/EXPO.md"
  "scripts/mobile/verify.sh"
  "docs/mobile/CLAUDE_MOBILE_STACK.md"
)
for file in "${required[@]}"; do
  test -s "$root/$file" || { echo "MISSING: $file"; exit 1; }
done
grep -q 'AUTO' "$root/.claude/skills/wise2-mobile-development/SKILL.md"
grep -q 'LOCAL' "$root/.claude/skills/wise2-mobile-development/SKILL.md"
grep -q 'CLOUD' "$root/.claude/skills/wise2-mobile-development/SKILL.md"
grep -q 'xcodebuild' "$root/.claude/skills/wise2-mobile-development/IOS.md"
grep -q 'adb' "$root/.claude/skills/wise2-mobile-development/ANDROID.md"
grep -q 'expo' "$root/.claude/skills/wise2-mobile-development/EXPO.md"
echo 'WISE2 mobile Claude stack: PASS'
