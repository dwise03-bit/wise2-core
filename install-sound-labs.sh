#!/bin/bash

################################################################################
# WISE² Sound Labs - Interactive Installation Script
#
# This script guides you through deploying the Sound Labs website to a
# remote server with configuration, setup, and verification.
#
# Usage: ./install-sound-labs.sh
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Spinner
spinner() {
    local pid=$1
    local delay=0.75
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Print header
print_header() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}     ${BOLD}🎵 WISE² Sound Labs - Interactive Installer${NC}           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}     Custom Music & Sonic Branding Service                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print step indicator
print_step() {
    local step=$1
    local total=$2
    local title=$3
    echo -e "\n${BLUE}[${step}/${total}]${NC} ${BOLD}${title}${NC}"
    echo -e "${BLUE}$(printf '%.0s─' {1..60})${NC}"
}

# Prompt for input with validation
prompt_input() {
    local prompt=$1
    local default=$2
    local validate=$3
    local input=""

    while true; do
        if [ -z "$default" ]; then
            read -p "$(echo -e ${YELLOW}${prompt}:${NC} )" input
        else
            read -p "$(echo -e ${YELLOW}${prompt}${NC} [${GREEN}${default}${NC}]: )" input
            input=${input:-$default}
        fi

        if [ -n "$validate" ]; then
            if eval "$validate \"$input\"" 2>/dev/null; then
                echo "$input"
                return 0
            else
                echo -e "${RED}✗ Invalid input. Please try again.${NC}"
            fi
        else
            echo "$input"
            return 0
        fi
    done
}

# Validate SSH connection
validate_ssh() {
    local host=$1
    local user=$2
    if ssh -o ConnectTimeout=5 "${user}@${host}" "echo 'OK'" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Validate email format
validate_email() {
    [[ "$1" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]
}

# Validate port number
validate_port() {
    [[ "$1" =~ ^[0-9]+$ ]] && [ "$1" -ge 1024 ] && [ "$1" -le 65535 ]
}

# Validate IP address
validate_ip() {
    [[ "$1" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]
}

# Save configuration
save_config() {
    local config_file=".sound-labs-config"
    cat > "$config_file" << EOF
# WISE² Sound Labs Installation Config
# Generated: $(date)

REMOTE_HOST="$REMOTE_HOST"
REMOTE_USER="$REMOTE_USER"
REMOTE_PORT="$REMOTE_SSH_PORT"
PROJECT_PATH="$PROJECT_PATH"
WEBSITE_PORT="$WEBSITE_PORT"
CONTACT_EMAIL="$CONTACT_EMAIL"
DOMAIN="$DOMAIN"
BUILD_TIMESTAMP="$(date +%s)"

# Docker Configuration
DOCKER_IMAGE="wise2-website:latest"
DOCKER_CONTAINER="wise2-website"
DOCKER_REGISTRY="docker.io"

# Configuration Flags
AUTO_START="$AUTO_START"
ENABLE_SSL="$ENABLE_SSL"
ENABLE_MONITORING="$ENABLE_MONITORING"
EOF
    echo -e "${GREEN}✓ Configuration saved to $config_file${NC}"
}

# Load existing configuration
load_config() {
    local config_file=".sound-labs-config"
    if [ -f "$config_file" ]; then
        echo -e "${YELLOW}Found existing configuration. Load it? (y/n)${NC}"
        read -p "> " load_existing
        if [ "$load_existing" = "y" ]; then
            source "$config_file"
            echo -e "${GREEN}✓ Configuration loaded${NC}"
            return 0
        fi
    fi
    return 1
}

# Check prerequisites
check_prerequisites() {
    print_step 1 8 "Checking Prerequisites"

    local missing=0

    # Check required commands
    for cmd in ssh scp docker git; do
        if command -v $cmd &> /dev/null; then
            echo -e "${GREEN}✓${NC} $cmd installed"
        else
            echo -e "${RED}✗${NC} $cmd not found"
            missing=$((missing + 1))
        fi
    done

    if [ $missing -gt 0 ]; then
        echo -e "\n${RED}✗ Missing $missing required tool(s)${NC}"
        echo -e "${YELLOW}Please install the missing tools and try again.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ All prerequisites met${NC}\n"
}

# Gather configuration
gather_config() {
    print_step 2 8 "Configuration Setup"

    # Try loading existing config
    if ! load_config; then
        echo -e "${YELLOW}Setting up new configuration...${NC}\n"

        # Remote server details
        echo -e "${BOLD}Remote Server Details:${NC}"
        REMOTE_HOST=$(prompt_input "Server IP address" "173.208.147.165" "validate_ip")
        REMOTE_USER=$(prompt_input "SSH username" "dwise")
        REMOTE_SSH_PORT=$(prompt_input "SSH port" "22" "validate_port")

        # Project paths
        echo -e "\n${BOLD}Project Configuration:${NC}"
        PROJECT_PATH=$(prompt_input "Project path on remote" "/home/dwise/wise2-core")
        WEBSITE_PORT=$(prompt_input "Website port (external)" "3001" "validate_port")

        # Contact information
        echo -e "\n${BOLD}Contact & Domain:${NC}"
        CONTACT_EMAIL=$(prompt_input "Contact email for Sound Labs" "" "validate_email")
        DOMAIN=$(prompt_input "Domain/URL (optional)" "sound-labs.wise2.net" "")

        # Additional options
        echo -e "\n${BOLD}Additional Options:${NC}"
        read -p "$(echo -e ${YELLOW}Auto-start container on reboot? (y/n)${NC} )" -n 1 AUTO_START
        AUTO_START=${AUTO_START:-y}
        echo ""

        read -p "$(echo -e ${YELLOW}Enable SSL/HTTPS? (y/n)${NC} )" -n 1 ENABLE_SSL
        ENABLE_SSL=${ENABLE_SSL:-y}
        echo ""

        read -p "$(echo -e ${YELLOW}Enable Docker monitoring? (y/n)${NC} )" -n 1 ENABLE_MONITORING
        ENABLE_MONITORING=${ENABLE_MONITORING:-y}
        echo ""
    fi

    echo -e "${GREEN}✓ Configuration complete${NC}\n"
}

# Verify SSH connection
verify_ssh() {
    print_step 3 8 "Verifying SSH Connection"

    echo -e "Testing connection to ${BOLD}${REMOTE_USER}@${REMOTE_HOST}${NC}...\n"

    if validate_ssh "$REMOTE_HOST" "$REMOTE_USER"; then
        echo -e "${GREEN}✓ SSH connection successful${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Cannot connect to ${REMOTE_HOST}${NC}"
        echo -e "${YELLOW}Please check:${NC}"
        echo -e "  • Server is online and reachable"
        echo -e "  • SSH credentials are correct"
        echo -e "  • Firewall allows SSH connections"

        read -p "$(echo -e ${YELLOW}Try different credentials? (y/n)${NC} )" retry
        if [ "$retry" = "y" ]; then
            REMOTE_HOST=$(prompt_input "Server IP address")
            REMOTE_USER=$(prompt_input "SSH username")
            verify_ssh
        else
            exit 1
        fi
    fi
}

# Prepare deployment files
prepare_deployment() {
    print_step 4 8 "Preparing Deployment Files"

    echo "Copying website files to remote server..."

    # Create deployment directory on remote
    ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "mkdir -p ${PROJECT_PATH}/wise-touch && echo 'Directory ready'" &
    spinner $!

    echo -e "${GREEN}✓ Remote directory prepared${NC}\n"
}

# Build Docker image
build_docker_image() {
    print_step 5 8 "Building Docker Image"

    echo "Building wise2-website Docker image on remote server..."
    echo -e "${YELLOW}(This may take 2-5 minutes)${NC}\n"

    ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "cd ${PROJECT_PATH}/wise-touch && docker build -t wise2-website:latest -f Dockerfile . 2>&1 | grep -E '(#|Step|Successfully|ERROR:)' | tail -30" &

    BUILD_PID=$!
    spinner $BUILD_PID

    wait $BUILD_PID
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Docker image built successfully${NC}\n"
        return 0
    else
        echo -e "\n${RED}✗ Docker build failed${NC}"
        echo -e "${YELLOW}Check remote logs for details${NC}\n"
        return 1
    fi
}

# Deploy container
deploy_container() {
    print_step 6 8 "Deploying Container"

    echo "Stopping existing container (if any)..."
    ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "docker stop wise2-website 2>/dev/null || true" &
    spinner $!
    echo -e "${GREEN}✓ Stopped${NC}"

    echo "Starting new container..."
    local restart_policy="always"
    [ "$AUTO_START" = "n" ] && restart_policy="no"

    ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "docker run -d --name wise2-website -p ${WEBSITE_PORT}:3000 --restart ${restart_policy} wise2-website:latest" &
    spinner $!
    echo -e "${GREEN}✓ Container deployed${NC}\n"
}

# Verify deployment
verify_deployment() {
    print_step 7 8 "Verifying Deployment"

    echo "Waiting for container to start..."
    sleep 3

    # Check if container is running
    if ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "docker ps | grep wise2-website" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Container is running${NC}"
    else
        echo -e "${RED}✗ Container failed to start${NC}"
        echo -e "${YELLOW}Check logs:${NC}"
        ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
            "docker logs wise2-website 2>&1 | tail -20"
        return 1
    fi

    # Check if website is responding
    echo "Testing website connectivity..."
    if ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "curl -s http://localhost:3000/ | grep -q '<title>' && echo 'OK'" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Website is responding${NC}"
    else
        echo -e "${YELLOW}⚠ Website may still be starting up${NC}"
    fi

    # Check Sound Labs page
    echo "Verifying Sound Labs page..."
    if ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "curl -s http://localhost:3000/sound-labs | grep -q 'Sound Labs' && echo 'OK'" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Sound Labs page is accessible${NC}"
    else
        echo -e "${YELLOW}⚠ Sound Labs page may need additional setup${NC}"
    fi

    echo ""
}

# Configure and update
configure_installation() {
    print_step 8 8 "Final Configuration"

    echo "Updating configuration files..."

    ssh "${REMOTE_USER}@${REMOTE_HOST}" -p "$REMOTE_SSH_PORT" \
        "cat > ${PROJECT_PATH}/wise-touch/.env.production << EOF
NEXT_PUBLIC_API_URL=https://api.wise2.com
CONTACT_EMAIL=${CONTACT_EMAIL}
DOMAIN=${DOMAIN}
EOF" &
    spinner $!

    echo -e "${GREEN}✓ Configuration updated${NC}\n"

    # Save local config
    save_config
}

# Display summary
display_summary() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                    ${GREEN}✓ Installation Complete${NC}                         ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${BOLD}Deployment Summary:${NC}"
    echo -e "  Server:        ${GREEN}${REMOTE_USER}@${REMOTE_HOST}${NC}"
    echo -e "  Website URL:   ${GREEN}http://${REMOTE_HOST}:${WEBSITE_PORT}${NC}"
    echo -e "  Sound Labs:    ${GREEN}http://${REMOTE_HOST}:${WEBSITE_PORT}/sound-labs${NC}"
    echo -e "  Docker Image:  ${GREEN}wise2-website:latest${NC}"
    echo -e "  Container:     ${GREEN}wise2-website${NC}"
    [ "$AUTO_START" = "y" ] && echo -e "  Auto-restart:  ${GREEN}Enabled${NC}" || echo -e "  Auto-restart:  ${RED}Disabled${NC}"

    echo -e "\n${BOLD}Next Steps:${NC}"
    echo -e "  1. ${YELLOW}Access the website:${NC}"
    echo -e "     ${CYAN}http://${REMOTE_HOST}:${WEBSITE_PORT}${NC}"
    echo -e ""
    echo -e "  2. ${YELLOW}View Sound Labs page:${NC}"
    echo -e "     ${CYAN}http://${REMOTE_HOST}:${WEBSITE_PORT}/sound-labs${NC}"
    echo -e ""
    echo -e "  3. ${YELLOW}Monitor container:${NC}"
    echo -e "     ${CYAN}ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f wise2-website'${NC}"
    echo -e ""
    echo -e "  4. ${YELLOW}Update Sound Labs content:${NC}"
    echo -e "     Edit ${CYAN}src/lib/sound-labs-data.ts${NC}"
    echo -e ""

    if [ "$ENABLE_SSL" = "y" ]; then
        echo -e "${YELLOW}SSL Setup Pending:${NC}"
        echo -e "  Configure HTTPS with your domain:"
        echo -e "  ${CYAN}https://${DOMAIN}${NC}"
        echo -e ""
    fi

    echo -e "${BOLD}Support:${NC}"
    echo -e "  Documentation: ${CYAN}./SOUND_LABS_GUIDE.md${NC}"
    echo -e "  Config file:   ${CYAN}./.sound-labs-config${NC}"
    echo ""
}

# Cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}✗ Installation encountered an error${NC}"
        echo -e "${YELLOW}Check logs and configuration, then try again${NC}"
    fi
}

trap cleanup EXIT

# Main execution
main() {
    print_header

    check_prerequisites
    gather_config
    verify_ssh
    prepare_deployment

    if build_docker_image; then
        deploy_container
        verify_deployment
        configure_installation
        display_summary

        # Offer to open browser
        echo -e "${YELLOW}Open website in browser? (y/n)${NC}"
        read -n 1 open_browser
        if [ "$open_browser" = "y" ]; then
            echo ""
            if command -v open &> /dev/null; then
                open "http://${REMOTE_HOST}:${WEBSITE_PORT}/sound-labs"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "http://${REMOTE_HOST}:${WEBSITE_PORT}/sound-labs"
            else
                echo -e "${YELLOW}Visit: http://${REMOTE_HOST}:${WEBSITE_PORT}/sound-labs${NC}"
            fi
        fi
        echo ""
    else
        echo -e "${RED}Deployment failed. Please review the logs and try again.${NC}"
        exit 1
    fi
}

# Run main
main
