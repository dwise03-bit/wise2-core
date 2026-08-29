#!/usr/bin/env bash

set -u

REPO="${REPO:-dwise03-bit/wise2-core}"
REMOTE_USER="${REMOTE_USER:-dwise}"
REMOTE_HOST="${REMOTE_HOST:-173.208.147.165}"
REMOTE_DIR="${REMOTE_DIR:-/home/dwise/wise2-core}"

required_commands=(git ssh gh)
required_secrets=(
  DEPLOY_HOST
  DEPLOY_USER
  DEPLOY_KEY
  STRIPE_PUBLIC_KEY
  STRIPE_SECRET_KEY
  STRIPE_STARTER_PRICE_ID
  STRIPE_PRO_PRICE_ID
  STRIPE_WEBHOOK_SECRET
  DATABASE_URL
  APP_URL
  API_BASE_URL
)

optional_secrets=(
  SENDGRID_API_KEY
  SENDGRID_FROM_EMAIL
)

pass() {
  printf "OK   %s\n" "$1"
}

warn() {
  printf "WARN %s\n" "$1"
}

fail() {
  printf "FAIL %s\n" "$1"
}

section() {
  printf "\n== %s ==\n" "$1"
}

missing=0

section "Local tooling"
for cmd in "${required_commands[@]}"; do
  if command -v "$cmd" >/dev/null 2>&1; then
    pass "$cmd: $(command -v "$cmd")"
  else
    fail "$cmd is not installed or not on PATH"
    missing=$((missing + 1))
  fi
done

if command -v docker >/dev/null 2>&1; then
  pass "docker: $(docker --version 2>/dev/null)"
else
  warn "docker is not on PATH locally; remote deploy can still work through GitHub Actions"
fi

if command -v pnpm >/dev/null 2>&1; then
  pass "pnpm: $(pnpm --version 2>/dev/null)"
else
  warn "pnpm is not on PATH locally; local builds/tests will be limited"
fi

section "GitHub access"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  pass "gh authenticated"
else
  fail "gh is not authenticated; run gh auth login"
  missing=$((missing + 1))
fi

if command -v gh >/dev/null 2>&1 && gh repo view "$REPO" >/dev/null 2>&1; then
  pass "repository reachable: $REPO"
else
  fail "repository is not reachable through gh: $REPO"
  missing=$((missing + 1))
fi

section "GitHub Actions secrets"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  secret_names="$(gh secret list -R "$REPO" 2>/dev/null | awk '{print $1}')"
  for secret in "${required_secrets[@]}"; do
    if printf "%s\n" "$secret_names" | grep -qx "$secret"; then
      pass "$secret"
    else
      fail "$secret is missing"
      missing=$((missing + 1))
    fi
  done
  for secret in "${optional_secrets[@]}"; do
    if printf "%s\n" "$secret_names" | grep -qx "$secret"; then
      pass "$secret"
    else
      warn "$secret is missing; transactional email will stay disabled"
    fi
  done
else
  warn "skipping secret check because gh is unavailable or unauthenticated"
fi

section "Remote SSH"
remote_probe='
set -u
printf "user=%s\n" "$(whoami)"
printf "host=%s\n" "$(hostname)"
test -d "$REMOTE_DIR" && printf "repo=present\n" || printf "repo=missing\n"
command -v git >/dev/null 2>&1 && printf "git=present\n" || printf "git=missing\n"
command -v docker >/dev/null 2>&1 && printf "docker=present\n" || printf "docker=missing\n"
(docker compose version || docker-compose --version) 2>/dev/null | head -1 | sed "s/^/compose=/"
'

if output="$(ssh -o BatchMode=yes -o ConnectTimeout=8 "$REMOTE_USER@$REMOTE_HOST" "REMOTE_DIR='$REMOTE_DIR' bash -s" <<< "$remote_probe" 2>&1)"; then
  printf "%s\n" "$output"
  if printf "%s\n" "$output" | grep -q "repo=present"; then
    pass "remote repo present: $REMOTE_DIR"
  else
    fail "remote repo missing: $REMOTE_DIR"
    missing=$((missing + 1))
  fi
else
  fail "cannot SSH non-interactively to $REMOTE_USER@$REMOTE_HOST"
  printf "%s\n" "$output"
  missing=$((missing + 1))
fi

section "Remote deployment commands"
cat <<EOF
GitHub Actions deploy:
  git push origin main

Manual remote status:
  ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml ps'

Manual remote logs:
  ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs -n 80'
EOF

section "Result"
if [ "$missing" -eq 0 ]; then
  pass "Codex remote setup is ready"
  exit 0
fi

fail "$missing required remote-readiness check(s) need attention"
exit 1
