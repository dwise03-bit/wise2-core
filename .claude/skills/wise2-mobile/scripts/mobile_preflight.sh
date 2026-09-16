#!/usr/bin/env bash
set -u
ROOT="${1:-.}"
cd "$ROOT" || exit 2
printf 'WISE2 mobile preflight\n'
printf 'path: %s\n' "$PWD"

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf '\n[git]\n'
  printf 'branch: '; git branch --show-current 2>/dev/null || true
  git status --short 2>/dev/null || true
else
  printf '\n[git]\nnot a git worktree\n'
fi

printf '\n[project]\n'
find . -maxdepth 3 \( -name '*.xcodeproj' -o -name '*.xcworkspace' -o -name 'Package.swift' -o -name 'build.gradle' -o -name 'build.gradle.kts' -o -name 'settings.gradle' -o -name 'settings.gradle.kts' -o -name 'AndroidManifest.xml' \) -print 2>/dev/null | head -80

printf '\n[tooling]\n'
for c in xcodebuild swift adb java ./gradlew; do
  if [ "$c" = './gradlew' ]; then
    [ -x ./gradlew ] && printf 'gradlew: present\n' || true
  elif command -v "$c" >/dev/null 2>&1; then
    printf '%s: ' "$c"; command -v "$c"
  fi
done

if command -v adb >/dev/null 2>&1; then
  printf '\n[android devices]\n'
  adb devices -l 2>/dev/null || true
fi

printf '\nPreflight complete. No secrets printed and no project files modified.\n'
