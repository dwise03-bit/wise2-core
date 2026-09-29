#!/bin/bash
# WISE² Remote Machine Tagging Deployment Script
# Deploys and executes tagging on all 18 machines via SSH
#
# Prerequisites:
#   - SSH access configured for all machines
#   - Tailscale installed on all machines
#   - Passwordless SSH (key-based auth) recommended
#
# Usage:
#   ./deploy_wise2_tags.sh --dry-run    # Show what will be executed
#   ./deploy_wise2_tags.sh --deploy     # Actually deploy tags
#   ./deploy_wise2_tags.sh --help       # Show this help

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Machine configuration with SSH addresses
declare -A MACHINES=(
    # Infrastructure
    ["gpu-nmls"]="user@gpu-nmls.example.com"
    ["gpu-nmls-1"]="user@gpu-nmls-1.example.com"
    ["vps-0fa5d30a"]="user@vps-0fa5d30a.example.com"
    ["cursor-cloud-iphone-deploy"]="user@cursor-cloud-iphone-deploy.example.com"
    ["wise2-cloud-agent"]="user@wise2-cloud-agent.example.com"

    # Edge
    ["wise2-skorpious"]="d@wise2-skorpious.local"
    ["wisepi"]="user@wisepi.local"

    # Developers
    ["daniels-macbook-pro"]="user@daniels-macbook-pro.local"
    ["dwise-mac"]="dwise@dwise-mac.local"
    ["gl-mt3600be"]="user@gl-mt3600be.local"

    # Field Tech
    ["ipad-9th-gen-wifi"]="user@ipad-9th-gen-wifi.local"
    ["iphone-15-pro-max"]="user@iphone-15-pro-max.local"
    ["iphone175"]="user@iphone175.local"
    ["iphone182"]="user@iphone182.local"
    ["google-pixel-slate"]="user@google-pixel-slate.local"
    ["motorola-razr-2025-xt2553v"]="user@motorola-razr-2025-xt2553v.local"

    # Shared
    ["darrinwisejr"]="user@darrinwisejr.local"
)

declare -A MACHINE_TAGS=(
    # Infrastructure (5 machines)
    ["gpu-nmls"]="tag:infrastructure"
    ["gpu-nmls-1"]="tag:infrastructure"
    ["vps-0fa5d30a"]="tag:infrastructure"
    ["cursor-cloud-iphone-deploy"]="tag:infrastructure"
    ["wise2-cloud-agent"]="tag:infrastructure"

    # Edge Nodes (2 machines)
    ["wise2-skorpious"]="tag:edge"
    ["wisepi"]="tag:edge"

    # Developers (3 machines - 2 also get tag:operators)
    ["daniels-macbook-pro"]="tag:developers,tag:operators"
    ["dwise-mac"]="tag:developers,tag:operators"
    ["gl-mt3600be"]="tag:developers"

    # Field Tech (6 machines)
    ["ipad-9th-gen-wifi"]="tag:field-tech"
    ["iphone-15-pro-max"]="tag:field-tech"
    ["iphone175"]="tag:field-tech"
    ["iphone182"]="tag:field-tech"
    ["google-pixel-slate"]="tag:field-tech"
    ["motorola-razr-2025-xt2553v"]="tag:field-tech"

    # Shared (1 machine)
    ["darrinwisejr"]="tag:shared"
)

# Tagging script to send to each machine
read -r -d '' TAGGING_SCRIPT << 'EOF' || true
#!/bin/bash
set -e
if ! command -v tailscale &> /dev/null; then
    echo "✗ Tailscale not installed"
    exit 1
fi
if tailscale status &>/dev/null; then
    echo "Updating tags: $1"
    sudo tailscale up --tags="$1" || tailscale up --tags="$1"
else
    echo "Not logged in. Run: tailscale up --tags=\"$1\""
fi
EOF

# Function to show help
show_help() {
    echo "WISE² Remote Machine Tagging Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run          Show SSH commands that will be executed"
    echo "  --deploy           Deploy tags to all machines"
    echo "  --list             List all machines and tags"
    echo "  --help             Show this help"
    echo ""
    echo "Prerequisites:"
    echo "  - SSH access to all machines"
    echo "  - Tailscale installed on all machines"
    echo "  - Update SSH addresses in this script before running"
    echo ""
    echo "Examples:"
    echo "  # See what will be executed:"
    echo "  $0 --dry-run"
    echo ""
    echo "  # Deploy tags:"
    echo "  $0 --deploy"
    echo ""
    echo "  # List configuration:"
    echo "  $0 --list"
}

# Function to list machines
list_machines() {
    echo -e "${BLUE}WISE² Machines Configuration:${NC}"
    echo ""

    for machine in "${!MACHINES[@]}"; do
        ssh_addr="${MACHINES[$machine]}"
        tags="${MACHINE_TAGS[$machine]}"
        echo -e "${YELLOW}$machine${NC}"
        echo "  SSH: $ssh_addr"
        echo "  Tags: $tags"
        echo ""
    done
}

# Function to show dry run
dry_run() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}WISE² Machine Tagging - DRY RUN${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "The following SSH commands will be executed:"
    echo ""

    for machine in "${!MACHINES[@]}"; do
        ssh_addr="${MACHINES[$machine]}"
        tags="${MACHINE_TAGS[$machine]}"

        echo -e "${GREEN}# $machine${NC}"
        echo "ssh $ssh_addr \"tailscale up --tags='$tags'\""
        echo ""
    done

    echo -e "${YELLOW}Note: This is a dry run. No changes have been made.${NC}"
    echo "Run with --deploy to actually apply the tags."
}

# Function to deploy tags
deploy_tags() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}WISE² Machine Tagging - DEPLOYING${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""

    local success=0
    local failed=0

    for machine in "${!MACHINES[@]}"; do
        ssh_addr="${MACHINES[$machine]}"
        tags="${MACHINE_TAGS[$machine]}"

        echo -e "${YELLOW}→${NC} Tagging $machine ($ssh_addr)..."

        if ssh -o ConnectTimeout=5 "$ssh_addr" "tailscale up --tags='$tags'" &>/dev/null; then
            echo -e "${GREEN}  ✓ Success${NC}"
            ((success++))
        else
            echo -e "${RED}  ✗ Failed${NC}"
            ((failed++))
        fi
    done

    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Successful: $success${NC}"
    echo -e "${RED}Failed: $failed${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

# Main
case "${1:-}" in
    --dry-run)
        dry_run
        ;;
    --deploy)
        read -p "Deploy tags to all 18 machines? (yes/no): " confirm
        if [[ "$confirm" == "yes" ]]; then
            deploy_tags
        else
            echo "Deployment cancelled."
        fi
        ;;
    --list)
        list_machines
        ;;
    --help|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
