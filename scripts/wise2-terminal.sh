#!/bin/bash

################################################################################
#
# WISE² Terminal - AI-Native Business OS Command Interface
# Similar to Claude Code, but for WISE² operations
#
# Usage: wise2-terminal [command] [args...]
# Or:    wise2 [command] [args...]
#
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WISE2_HOME="${WISE2_HOME:-$HOME/.wise2}"
WISE2_VERSION="1.0.0"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Initialize directories
mkdir -p "$WISE2_HOME"/{logs,cache,config,data}

################################################################################
# Logging & Output
################################################################################

log() {
    echo -e "${BLUE}[WISE²]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}✓${NC} $*" >&2
}

error() {
    echo -e "${RED}✗${NC} $*" >&2
}

warning() {
    echo -e "${YELLOW}⚠${NC} $*" >&2
}

info() {
    echo -e "${CYAN}ℹ${NC} $*" >&2
}

banner() {
    echo -e "${BOLD}${CYAN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   WISE² Terminal - AI-Native Business Operating System    ║
║   Version: 1.0.0                                          ║
║                                                            ║
║   Building Empires. Changing Culture. Together.           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

################################################################################
# Core Commands
################################################################################

cmd_status() {
    log "WISE² System Status"
    echo ""

    # Check services
    local services=(
        "command-center:3004"
        "local-ai:/api/local-ai/query"
        "ollama:localhost:11434"
    )

    echo -e "${BOLD}Services:${NC}"
    for service in "${services[@]}"; do
        local name="${service%%:*}"
        local endpoint="${service#*:}"

        if [[ "$endpoint" == *"localhost"* ]]; then
            if curl -s "$endpoint/api/tags" > /dev/null 2>&1; then
                success "$name is running"
            else
                error "$name is offline"
            fi
        else
            if curl -s "http://$endpoint" > /dev/null 2>&1; then
                success "$name is running"
            else
                error "$name is offline"
            fi
        fi
    done

    echo ""
    echo -e "${BOLD}Git Status:${NC}"
    cd "$PROJECT_ROOT" && git status --short || true

    echo ""
    echo -e "${BOLD}Recent Commits:${NC}"
    cd "$PROJECT_ROOT" && git log --oneline -3 || true
}

cmd_start() {
    local service="${1:-all}"

    case "$service" in
        command-center|cc)
            log "Starting Command Center..."
            cd "$PROJECT_ROOT"
            npm --prefix apps/command-center run dev > "$WISE2_HOME/logs/command-center.log" 2>&1 &
            echo $! > "$WISE2_HOME/command-center.pid"
            sleep 2
            success "Command Center running on http://localhost:3004"
            ;;

        ollama)
            log "Starting Ollama..."
            if command -v ollama &> /dev/null; then
                /usr/local/bin/ollama serve > "$WISE2_HOME/logs/ollama.log" 2>&1 &
                echo $! > "$WISE2_HOME/ollama.pid"
                sleep 2
                success "Ollama running on http://localhost:11434"
            else
                error "Ollama not installed. Install with: brew install ollama"
                return 1
            fi
            ;;

        all)
            cmd_start ollama
            sleep 2
            cmd_start command-center
            echo ""
            success "All services started"
            cmd_status
            ;;

        *)
            error "Unknown service: $service"
            echo "Available: command-center, ollama, all"
            return 1
            ;;
    esac
}

cmd_stop() {
    log "Stopping WISE² services..."

    for pid_file in "$WISE2_HOME"/*.pid; do
        if [[ -f "$pid_file" ]]; then
            local pid=$(cat "$pid_file")
            local name=$(basename "$pid_file" .pid)
            if kill "$pid" 2>/dev/null; then
                success "Stopped $name (PID: $pid)"
            fi
            rm -f "$pid_file"
        fi
    done
}

cmd_logs() {
    local service="${1:-all}"

    case "$service" in
        command-center|cc)
            tail -f "$WISE2_HOME/logs/command-center.log"
            ;;

        ollama)
            tail -f "$WISE2_HOME/logs/ollama.log"
            ;;

        all)
            log "Showing all logs (press Ctrl+C to exit)..."
            tail -f "$WISE2_HOME/logs"/* 2>/dev/null || true
            ;;

        *)
            error "Unknown service: $service"
            return 1
            ;;
    esac
}

cmd_ai() {
    local query="$*"

    if [[ -z "$query" ]]; then
        error "No query provided"
        return 1
    fi

    log "Querying Local AI Router..."

    local response=$(curl -s -X POST "http://localhost:3004/api/local-ai/query" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\", \"route\": \"auto\"}")

    if [[ $? -eq 0 ]]; then
        echo ""
        echo -e "${BOLD}Response:${NC}"
        echo "$response" | jq -r '.response' 2>/dev/null || echo "$response"
        echo ""
        info "Route: $(echo "$response" | jq -r '.routeUsed' 2>/dev/null)"
        info "Model: $(echo "$response" | jq -r '.model' 2>/dev/null)"
        info "Tokens: $(echo "$response" | jq -r '.tokensUsed' 2>/dev/null)"
    else
        error "Failed to query Local AI Router"
        return 1
    fi
}

cmd_models() {
    log "Checking available Ollama models..."

    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        curl -s http://localhost:11434/api/tags | jq -r '.models[] | "\(.name) (\(.details.parameter_size // "unknown"))"' || true
    else
        error "Ollama is not running. Start with: wise2 start ollama"
        return 1
    fi
}

cmd_dashboard() {
    log "Opening WISE² Dashboard..."

    if command -v open &> /dev/null; then
        open "http://localhost:3004/local-ai"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3004/local-ai"
    else
        error "Could not open browser. Visit: http://localhost:3004/local-ai"
    fi
}

cmd_doctor() {
    banner

    log "Running system diagnostics..."
    echo ""

    # Check Node.js
    echo -e "${BOLD}Node.js:${NC}"
    if command -v node &> /dev/null; then
        success "Installed: $(node --version)"
    else
        error "Node.js not found"
    fi

    # Check npm
    echo ""
    echo -e "${BOLD}npm:${NC}"
    if command -v npm &> /dev/null; then
        success "Installed: $(npm --version)"
    else
        error "npm not found"
    fi

    # Check pnpm
    echo ""
    echo -e "${BOLD}pnpm:${NC}"
    if command -v pnpm &> /dev/null; then
        success "Installed: $(pnpm --version)"
    else
        error "pnpm not found"
    fi

    # Check Git
    echo ""
    echo -e "${BOLD}Git:${NC}"
    if command -v git &> /dev/null; then
        success "Installed: $(git --version)"
    else
        error "Git not found"
    fi

    # Check Ollama
    echo ""
    echo -e "${BOLD}Ollama:${NC}"
    if command -v ollama &> /dev/null; then
        success "Installed at $(which ollama)"
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            local count=$(curl -s http://localhost:11434/api/tags | jq '.models | length')
            success "Running with $count models"
        else
            warning "Installed but not running"
        fi
    else
        error "Ollama not found. Install with: brew install ollama"
    fi

    # Check WISE² setup
    echo ""
    echo -e "${BOLD}WISE² Setup:${NC}"
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        success "Git repository found"
    else
        error "Not a git repository"
    fi

    if [[ -d "$PROJECT_ROOT/apps/command-center" ]]; then
        success "Command Center app found"
    else
        error "Command Center app not found"
    fi

    if [[ -d "$PROJECT_ROOT/docs" ]]; then
        success "Documentation found"
    else
        error "Documentation not found"
    fi

    echo ""
    success "Diagnostics complete"
}

cmd_help() {
    cat << EOF
${BOLD}WISE² Terminal - Commands${NC}

${BOLD}Core Commands:${NC}
  status              Show WISE² system status
  start [service]     Start services (all, command-center, ollama)
  stop                Stop all services
  logs [service]      View service logs
  doctor              Run system diagnostics

${BOLD}AI Operations:${NC}
  ai <query>          Query the Local AI Router
  models              List available Ollama models
  dashboard           Open WISE² dashboard in browser

${BOLD}Development:${NC}
  dev [app]           Start development server
  test [app]          Run tests
  build [app]         Build production bundle

${BOLD}Git:${NC}
  commit <msg>        Create a git commit
  push                Push changes to origin
  pull                Pull latest changes

${BOLD}Utilities:${NC}
  version             Show WISE² version
  help                Show this help message

${BOLD}Examples:${NC}
  wise2 start all                    Start all services
  wise2 ai "What is Node.js?"       Query AI Router
  wise2 status                       Check system status
  wise2 dashboard                    Open dashboard
  wise2 doctor                       Run diagnostics

EOF
}

cmd_version() {
    echo "WISE² Terminal v$WISE2_VERSION"
    cd "$PROJECT_ROOT" && git describe --tags --always 2>/dev/null || echo "unknown"
}

################################################################################
# Main Router
################################################################################

main() {
    local command="${1:-help}"
    shift || true

    # Handle empty terminal (show welcome)
    if [[ -t 0 ]] && [[ "$command" == "help" ]] && [[ $# -eq 0 ]]; then
        banner
        cmd_help
        return 0
    fi

    case "$command" in
        status)         cmd_status "$@" ;;
        start)          cmd_start "$@" ;;
        stop)           cmd_stop "$@" ;;
        logs)           cmd_logs "$@" ;;
        ai)             cmd_ai "$@" ;;
        models)         cmd_models "$@" ;;
        dashboard)      cmd_dashboard "$@" ;;
        doctor)         cmd_doctor "$@" ;;
        version)        cmd_version "$@" ;;
        help|--help|-h) cmd_help "$@" ;;
        *)              error "Unknown command: $command"; cmd_help; exit 1 ;;
    esac
}

# Run main
main "$@"
