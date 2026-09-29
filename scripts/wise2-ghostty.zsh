#!/usr/bin/env zsh

# Wise² Ghostty helper for macOS.
#
# Source this in a Ghostty shell to get:
# - zsh glob safety for pasted transcripts
# - a safe TERM fallback for SSH sessions
# - convenience commands for the core Wise² workflow
#
# Usage:
#   source ./scripts/wise2-ghostty.zsh
#   wise2 dev
#   wise2 models
#   wise2 update-pi pi.local full-stack
#   wise2 ssh dwise@192.168.8.137
#

if [[ -n "${ZSH_VERSION:-}" ]]; then
  emulate -L zsh
fi

if [[ -o interactive ]]; then
  # Makes pasted literals like `key(s)` stay literal instead of raising a glob error.
  setopt nonomatch 2>/dev/null || true
fi

wise2::repo_root() {
  if [[ -n "${WISE2_ROOT:-}" && -d "${WISE2_ROOT:-}" ]]; then
    print -r -- "$WISE2_ROOT"
    return 0
  fi

  local root=""
  root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  if [[ -n "$root" ]]; then
    print -r -- "$root"
  else
    print -r -- "$PWD"
  fi
}

wise2::enter_repo() {
  local root
  root="$(wise2::repo_root)"
  if [[ ! -d "$root" ]]; then
    print -u2 -- "WISE2 root not found."
    return 1
  fi
  cd "$root" || return 1
}

wise2::safe_terminal() {
  # Ghostty advertises xterm-ghostty; keep child commands on a broadly supported TERM.
  if [[ "${TERM:-}" == xterm-ghostty* || "${TERM_PROGRAM:-}" == "Ghostty" ]]; then
    export TERM="xterm-256color"
  elif [[ -z "${TERM:-}" ]]; then
    export TERM="xterm-256color"
  fi

  export COLORTERM="${COLORTERM:-truecolor}"
}

wise2::usage() {
  cat <<'EOF'
Wise² Ghostty commands:
  wise2 dev             Start the full local dev stack
  wise2 models          Configure Ollama + local model wiring
  wise2 update-pi ...   Run the Pi update workflow
  wise2 rollback-pi ... Run the Pi rollback workflow
  wise2 ssh ...         SSH with TERM=xterm-256color
  wise2 status          Quick local repo status

Tip: if you still want raw SSH, use `command ssh ...` to bypass the wrapper.
EOF
}

wise2::run_repo_script() {
  local script_name="$1"
  shift || true

  wise2::enter_repo || return 1
  wise2::safe_terminal
  "./scripts/${script_name}" "$@"
}

wise2() {
  local command_name="${1:-help}"
  shift || true

  case "$command_name" in
    dev|start)
      wise2::enter_repo || return 1
      wise2::safe_terminal
      command pnpm dev "$@"
      ;;
    models)
      wise2::run_repo_script "setup-mac-local-models.sh" "$@"
      ;;
    update-pi)
      wise2::run_repo_script "update-pi.sh" "$@"
      ;;
    rollback-pi)
      wise2::run_repo_script "rollback-pi.sh" "$@"
      ;;
    ssh)
      wise2::safe_terminal
      command ssh "$@"
      ;;
    status)
      wise2::enter_repo || return 1
      command git status --short
      print
      command git branch --show-current 2>/dev/null || true
      ;;
    help|-h|--help|"")
      wise2::usage
      ;;
    *)
      wise2::enter_repo || return 1
      wise2::safe_terminal
      "$command_name" "$@"
      ;;
  esac
}

# Make manual SSH sessions Ghostty-safe in the current shell.
ssh() {
  wise2::safe_terminal
  command ssh "$@"
}

