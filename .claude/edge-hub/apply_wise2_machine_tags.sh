#!/bin/bash
# WISE² Tailscale Machine Tagging Script
# Assigns tags to all 18 machines according to WISE² network organization
#
# Usage:
#   Local: Run this script on each machine to tag it with its designated tags
#   Remote: Execute via SSH to each machine
#
# Example:
#   ssh user@machine "bash -c '$(cat apply_wise2_machine_tags.sh)' -- <machine-name>"

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}WISE² Tailscale Machine Tagging${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Machine configuration - maps hostname to tags
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

# Function to get current machine hostname
get_current_hostname() {
    hostname -s 2>/dev/null || hostname
}

# Function to tag current machine
tag_current_machine() {
    local current_host=$(get_current_hostname)

    if [[ -z "${MACHINE_TAGS[$current_host]}" ]]; then
        echo -e "${RED}✗ Machine '$current_host' not found in WISE² network configuration${NC}"
        echo ""
        echo "Available machines:"
        for machine in "${!MACHINE_TAGS[@]}"; do
            echo "  - $machine: ${MACHINE_TAGS[$machine]}"
        done
        return 1
    fi

    local tags="${MACHINE_TAGS[$current_host]}"

    echo -e "${YELLOW}Current machine:${NC} $current_host"
    echo -e "${YELLOW}Assigned tags:${NC} $tags"
    echo ""

    # Check if tailscale is installed
    if ! command -v tailscale &> /dev/null; then
        echo -e "${RED}✗ Tailscale CLI not found on this machine${NC}"
        echo -e "${YELLOW}Install Tailscale first:${NC} https://tailscale.com/download"
        return 1
    fi

    # Check if user is already logged in
    if tailscale status &>/dev/null; then
        echo -e "${YELLOW}Tailscale is already logged in${NC}"
        echo -e "${GREEN}Updating tags...${NC}"
        echo ""

        # Use tailscale up to update tags (preserves existing auth, just updates flags)
        if sudo tailscale up --auth-key="" --tags="$tags" 2>/dev/null || tailscale up --tags="$tags" 2>/dev/null; then
            echo -e "${GREEN}✓ Tags applied successfully${NC}"
            echo ""
            echo "Verifying tags:"
            tailscale status | grep -i tag || echo "  (tags will appear in admin console within moments)"
            return 0
        else
            echo -e "${RED}✗ Failed to apply tags${NC}"
            echo -e "${YELLOW}Try logging in again with:${NC}"
            echo "  tailscale logout"
            echo "  tailscale up --tags=\"$tags\""
            return 1
        fi
    else
        echo -e "${YELLOW}Tailscale is not logged in${NC}"
        echo -e "${GREEN}Next steps:${NC}"
        echo ""
        echo "1. Run: tailscale up --tags=\"$tags\""
        echo ""
        echo "   Or if using a control server:"
        echo "   tailscale up --login-server=https://your-control-server --auth-key=<key> --tags=\"$tags\""
        echo ""
        echo "2. Approve the login in the Tailscale admin console"
        echo "3. Tags will be applied and visible in the network"
        return 0
    fi
}

# Function to show all machines and tags
show_all_machines() {
    echo -e "${YELLOW}WISE² Network Organization (18 machines):${NC}"
    echo ""

    echo -e "${BLUE}Infrastructure (5 machines):${NC}"
    for machine in gpu-nmls gpu-nmls-1 vps-0fa5d30a cursor-cloud-iphone-deploy wise2-cloud-agent; do
        echo "  • $machine → ${MACHINE_TAGS[$machine]}"
    done
    echo ""

    echo -e "${BLUE}Edge Nodes (2 machines):${NC}"
    for machine in wise2-skorpious wisepi; do
        echo "  • $machine → ${MACHINE_TAGS[$machine]}"
    done
    echo ""

    echo -e "${BLUE}Developers (3 machines):${NC}"
    for machine in daniels-macbook-pro dwise-mac gl-mt3600be; do
        echo "  • $machine → ${MACHINE_TAGS[$machine]}"
    done
    echo ""

    echo -e "${BLUE}Field Tech (6 machines):${NC}"
    for machine in ipad-9th-gen-wifi iphone-15-pro-max iphone175 iphone182 google-pixel-slate motorola-razr-2025-xt2553v; do
        echo "  • $machine → ${MACHINE_TAGS[$machine]}"
    done
    echo ""

    echo -e "${BLUE}Shared (1 machine):${NC}"
    echo "  • darrinwisejr → ${MACHINE_TAGS[darrinwisejr]}"
    echo ""
}

# Function to generate tag commands for all machines
generate_all_commands() {
    echo -e "${YELLOW}Commands to tag all machines:${NC}"
    echo ""

    for machine in "${!MACHINE_TAGS[@]}"; do
        tags="${MACHINE_TAGS[$machine]}"
        echo "# $machine"
        echo "ssh user@$machine 'tailscale up --tags=\"$tags\"'"
        echo ""
    done
}

# Main logic
case "${1:-}" in
    --show-all)
        show_all_machines
        ;;
    --generate-commands)
        generate_all_commands
        ;;
    --help)
        echo "WISE² Machine Tagging Script"
        echo ""
        echo "Usage:"
        echo "  $0                  # Tag current machine"
        echo "  $0 --show-all       # Show all machines and their tags"
        echo "  $0 --generate-commands  # Generate SSH commands for all machines"
        echo "  $0 --help          # Show this help"
        echo ""
        echo "Examples:"
        echo ""
        echo "  # On each machine, run:"
        echo "  $ bash apply_wise2_machine_tags.sh"
        echo ""
        echo "  # Or copy and run this line on each machine:"
        echo "  $ curl -s https://your-server/apply_wise2_machine_tags.sh | bash"
        echo ""
        echo "  # Or via SSH from central server:"
        echo "  $ for host in machine1 machine2 machine3; do"
        echo "      ssh user@\$host 'bash -c \"\$(cat apply_wise2_machine_tags.sh)\"'"
        echo "    done"
        ;;
    *)
        # Tag current machine
        tag_current_machine
        exit $?
        ;;
esac
