#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_dir="${TMPDIR:-/tmp}/wise2-local"
api_url="http://127.0.0.1:3010/api/health"
website_url="http://127.0.0.1:3001"
comfyui_url="${COMFYUI_API_URL:-http://100.68.145.5:8188}/system_stats"
musicgen_url="${MUSICGEN_API_URL:-http://100.68.145.5:4900}/health"

mkdir -p "$runtime_dir"

is_up() {
  curl --fail --silent --max-time 3 "$1" >/dev/null 2>&1
}

start_service() {
  local formula="$1"
  if ! brew services list | awk -v name="$formula" '$1 == name && $2 == "started" { found=1 } END { exit !found }'; then
    brew services start "$formula"
  fi
}

start_stack() {
  start_service "postgresql@18"
  start_service "redis"

  if ! is_up "$api_url"; then
    if [[ ! -f "$repo_root/packages/api/dist/main.js" ]]; then
      echo "API build missing. Run: pnpm --filter @wise2/platform-api build" >&2
      exit 1
    fi
    (
      cd "$repo_root/packages/api"
      nohup node dist/main.js >"$runtime_dir/api.log" 2>&1 &
      echo "$!" >"$runtime_dir/api.pid"
    )
  fi

  if ! is_up "$website_url"; then
    local standalone_server="$repo_root/apps/website/.next/standalone/apps/website/server.js"
    if [[ ! -f "$standalone_server" ]]; then
      echo "Website build missing. Run: pnpm --filter @wise2/website build" >&2
      exit 1
    fi
    (
      cd "$repo_root/apps/website"
      PORT=3001 HOSTNAME=127.0.0.1 nohup node "$standalone_server" >"$runtime_dir/website.log" 2>&1 &
      echo "$!" >"$runtime_dir/website.pid"
    )
  fi

  for _ in {1..20}; do
    if is_up "$api_url" && is_up "$website_url"; then
      status_stack
      return 0
    fi
    sleep 1
  done

  echo "WISE² did not become healthy. Logs: $runtime_dir" >&2
  return 1
}

stop_pid() {
  local name="$1"
  local pid_file="$runtime_dir/$name.pid"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(<"$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
    fi
    rm -f "$pid_file"
  fi
}

stop_stack() {
  stop_pid "website"
  stop_pid "api"
  echo "Stopped WISE² app processes started by this launcher."
  echo "PostgreSQL and Redis remain available as shared Homebrew services."
}

status_line() {
  local label="$1"
  local url="$2"
  if is_up "$url"; then
    printf '✓ %-12s %s\n' "$label" "$url"
  else
    printf '✗ %-12s %s\n' "$label" "$url"
  fi
}

status_stack() {
  status_line "API" "$api_url"
  status_line "Website" "$website_url"
  status_line "GPU Images" "$comfyui_url"
  status_line "GPU Music" "$musicgen_url"
  redis-cli ping >/dev/null 2>&1 && printf '✓ Redis       localhost:6379\n' || printf '✗ Redis       localhost:6379\n'
  pg_isready -q -h 127.0.0.1 -p 5432 && printf '✓ PostgreSQL  localhost:5432\n' || printf '✗ PostgreSQL  localhost:5432\n'
  echo "Paid integrations: disabled unless credentials are explicitly configured."
}

case "${1:-status}" in
  start) start_stack ;;
  stop) stop_stack ;;
  restart) stop_stack; start_stack ;;
  status) status_stack ;;
  logs)
    echo "$runtime_dir"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}" >&2
    exit 2
    ;;
esac
