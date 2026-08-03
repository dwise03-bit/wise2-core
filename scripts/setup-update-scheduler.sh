#!/bin/bash

################################################################################
# WISE² Pi Update Scheduler Setup
#
# Configures automated update scheduling on Raspberry Pi
# Supports crontab and systemd timers
#
# Usage:
#   ./setup-update-scheduler.sh <pi_hostname> [--scheduler cron|systemd] [--time HH:MM] [--day 0-6]
#
# Examples:
#   ./setup-update-scheduler.sh pi.local                    # Interactive setup
#   ./setup-update-scheduler.sh pi.local --scheduler cron   # Use cron
#   ./setup-update-scheduler.sh pi.local --scheduler systemd --time 03:00
#
################################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PI_HOSTNAME=""
SCHEDULER_TYPE=""
UPDATE_TIME="03:00"
UPDATE_DAY="*"
SSH_USER="${SSH_USER:-pi}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# ============================================================================
# INTERACTIVE SETUP
# ============================================================================

interactive_setup() {
    print_header "WISE² Pi Update Scheduler Setup"

    echo ""
    read -p "Enter Pi hostname or IP address: " PI_HOSTNAME

    if ! ping -c 1 -W 2 "$PI_HOSTNAME" &> /dev/null; then
        print_error "Cannot reach $PI_HOSTNAME"
        exit 1
    fi

    echo ""
    echo "Choose scheduler type:"
    echo "1) Crontab (simpler, compatible with all Linux)"
    echo "2) Systemd Timer (modern, better for logging)"
    echo ""
    read -p "Enter choice (1 or 2) [1]: " scheduler_choice
    scheduler_choice=${scheduler_choice:-1}

    case "$scheduler_choice" in
        1)
            SCHEDULER_TYPE="cron"
            ;;
        2)
            SCHEDULER_TYPE="systemd"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac

    echo ""
    read -p "Enter update time (HH:MM) [03:00]: " update_time_input
    UPDATE_TIME=${update_time_input:-03:00}

    if [[ ! "$UPDATE_TIME" =~ ^[0-2][0-9]:[0-5][0-9]$ ]]; then
        print_error "Invalid time format. Use HH:MM (24-hour format)"
        exit 1
    fi

    if [ "$SCHEDULER_TYPE" = "cron" ]; then
        echo ""
        echo "Update frequency:"
        echo "1) Every day"
        echo "2) Weekly (Sunday)"
        echo "3) Weekly (Saturday)"
        echo ""
        read -p "Enter choice (1, 2, or 3) [1]: " freq_choice
        freq_choice=${freq_choice:-1}

        case "$freq_choice" in
            1)
                UPDATE_DAY="*"
                ;;
            2)
                UPDATE_DAY="0"
                ;;
            3)
                UPDATE_DAY="6"
                ;;
            *)
                print_error "Invalid choice"
                exit 1
                ;;
        esac
    fi

    echo ""
    print_info "Configuration Summary:"
    echo "  Pi Hostname:   $PI_HOSTNAME"
    echo "  Scheduler:     $SCHEDULER_TYPE"
    echo "  Update Time:   $UPDATE_TIME"
    if [ "$SCHEDULER_TYPE" = "cron" ]; then
        case "$UPDATE_DAY" in
            "*")
                echo "  Frequency:     Every day"
                ;;
            "0")
                echo "  Frequency:     Every Sunday"
                ;;
            "6")
                echo "  Frequency:     Every Saturday"
                ;;
        esac
    else
        echo "  Frequency:     Every day"
    fi

    echo ""
    read -p "Continue with setup? (y/n) [y]: " confirm
    confirm=${confirm:-y}

    if [ "$confirm" != "y" ]; then
        print_warn "Setup cancelled"
        exit 0
    fi
}

# ============================================================================
# CRONTAB SETUP
# ============================================================================

setup_crontab() {
    print_header "Setting up Crontab Scheduler"

    local hour="${UPDATE_TIME%:*}"
    local minute="${UPDATE_TIME#*:}"

    # Remove leading zeros for cron format
    hour=$((10#$hour))
    minute=$((10#$minute))

    local cron_entry="$minute $hour * * $UPDATE_DAY cd /opt/wise2-edge && /opt/wise2-edge-scripts/update-pi.sh pi.local full-stack >> /var/log/wise2-edge-appliance/auto-update.log 2>&1"

    print_info "Adding cron job to Pi..."

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH
        # Create log directory if needed
        mkdir -p /var/log/wise2-edge-appliance

        # Get current crontab (or empty if doesn't exist)
        crontab -l 2>/dev/null > /tmp/crontab.tmp || true

        # Check if entry already exists
        if grep -q "update-pi.sh" /tmp/crontab.tmp; then
            echo "Cron job already exists, skipping..."
            cat /tmp/crontab.tmp
            exit 0
        fi

        # Add new entry
        echo "$cron_entry" >> /tmp/crontab.tmp

        # Install updated crontab
        crontab /tmp/crontab.tmp
        rm /tmp/crontab.tmp

        # Show result
        echo "Cron job installed:"
        crontab -l | grep update-pi.sh
EOSSH

    if [ $? -eq 0 ]; then
        print_ok "Crontab scheduler configured"
        print_info "Next update scheduled at: $UPDATE_TIME"

        echo ""
        echo "To view cron logs:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'grep CRON /var/log/syslog | tail -20'"
        echo ""
        echo "To remove/edit cron job:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'crontab -e'"
    else
        print_error "Failed to set up crontab"
        exit 1
    fi
}

# ============================================================================
# SYSTEMD TIMER SETUP
# ============================================================================

setup_systemd_timer() {
    print_header "Setting up Systemd Timer Scheduler"

    local hour="${UPDATE_TIME%:*}"
    local minute="${UPDATE_TIME#*:}"

    print_info "Copying systemd files to Pi..."

    # Copy service and timer files
    scp "$SCRIPT_DIR/systemd-wise2-update.service" "$SSH_USER@$PI_HOSTNAME:/tmp/" || {
        print_error "Failed to copy service file"
        exit 1
    }

    scp "$SCRIPT_DIR/systemd-wise2-update.timer" "$SSH_USER@$PI_HOSTNAME:/tmp/" || {
        print_error "Failed to copy timer file"
        exit 1
    }

    print_info "Installing systemd files on Pi..."

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH
        # Create log directory
        mkdir -p /var/log/wise2-edge-appliance

        # Copy files to systemd directory
        sudo cp /tmp/systemd-wise2-update.service /etc/systemd/system/wise2-update.service
        sudo cp /tmp/systemd-wise2-update.timer /etc/systemd/system/wise2-update.timer

        # Reload systemd daemon
        sudo systemctl daemon-reload

        # Enable timer (starts automatically on boot)
        sudo systemctl enable wise2-update.timer

        # Start timer
        sudo systemctl start wise2-update.timer

        # Show status
        sudo systemctl status wise2-update.timer --no-pager || true
EOSSH

    if [ $? -eq 0 ]; then
        print_ok "Systemd timer configured"
        print_info "Timer will run daily at $UPDATE_TIME"

        echo ""
        echo "To view timer status:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl status wise2-update.timer'"
        echo ""
        echo "To view scheduled runs:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl list-timers wise2-update.timer'"
        echo ""
        echo "To view logs:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo journalctl -u wise2-update -n 50'"
        echo ""
        echo "To stop/restart timer:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl stop wise2-update.timer'"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl start wise2-update.timer'"
    else
        print_error "Failed to set up systemd timer"
        exit 1
    fi
}

# ============================================================================
# VERIFICATION
# ============================================================================

verify_scheduler() {
    print_header "Verifying Scheduler Setup"

    if [ "$SCHEDULER_TYPE" = "cron" ]; then
        print_info "Checking crontab..."
        ssh "$SSH_USER@$PI_HOSTNAME" "crontab -l | grep update-pi.sh" && print_ok "Cron job found" || print_error "Cron job not found"
    else
        print_info "Checking systemd timer..."
        ssh "$SSH_USER@$PI_HOSTNAME" "sudo systemctl status wise2-update.timer --no-pager | grep active" && print_ok "Timer is active" || print_error "Timer not active"
    fi

    # Test connectivity
    print_info "Testing Pi connectivity..."
    if ping -c 1 -W 2 "$PI_HOSTNAME" &> /dev/null; then
        print_ok "Pi is reachable"
    else
        print_error "Cannot reach Pi"
    fi

    # Verify update script exists
    print_info "Checking update script..."
    if ssh "$SSH_USER@$PI_HOSTNAME" "test -x /opt/wise2-edge-scripts/update-pi.sh"; then
        print_ok "Update script found and executable"
    else
        print_error "Update script not found or not executable"
    fi
}

# ============================================================================
# MANAGEMENT COMMANDS
# ============================================================================

show_management_commands() {
    echo ""
    print_info "Management Commands:"
    echo ""
    echo "Check scheduler status:"
    if [ "$SCHEDULER_TYPE" = "cron" ]; then
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'crontab -l'"
        echo ""
        echo "Edit scheduler:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'crontab -e'"
        echo ""
        echo "View update logs:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'tail -50 /var/log/wise2-edge-appliance/auto-update.log'"
    else
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl status wise2-update.timer'"
        echo ""
        echo "View next scheduled run:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl list-timers wise2-update.timer'"
        echo ""
        echo "View timer logs:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo journalctl -u wise2-update -n 100'"
        echo ""
        echo "Stop timer temporarily:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl stop wise2-update.timer'"
        echo ""
        echo "Restart timer:"
        echo "  ssh $SSH_USER@$PI_HOSTNAME 'sudo systemctl start wise2-update.timer'"
    fi
    echo ""
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

parse_arguments() {
    if [ $# -lt 1 ]; then
        interactive_setup
        return
    fi

    PI_HOSTNAME="$1"
    shift

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --scheduler)
                SCHEDULER_TYPE="$2"
                shift 2
                ;;
            --time)
                UPDATE_TIME="$2"
                shift 2
                ;;
            --day)
                UPDATE_DAY="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Validate arguments
    if [ -z "$SCHEDULER_TYPE" ]; then
        SCHEDULER_TYPE="systemd"  # Default
    fi

    if [[ ! "$SCHEDULER_TYPE" =~ ^(cron|systemd)$ ]]; then
        print_error "Invalid scheduler type: $SCHEDULER_TYPE (must be 'cron' or 'systemd')"
        exit 1
    fi

    if [[ ! "$UPDATE_TIME" =~ ^[0-2][0-9]:[0-5][0-9]$ ]]; then
        print_error "Invalid time format: $UPDATE_TIME (use HH:MM)"
        exit 1
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    parse_arguments "$@"

    # Verify Pi connectivity
    if ! ping -c 1 -W 2 "$PI_HOSTNAME" &> /dev/null; then
        print_error "Cannot reach $PI_HOSTNAME"
        exit 1
    fi

    # Verify SSH works
    if ! ssh -o ConnectTimeout=5 "$SSH_USER@$PI_HOSTNAME" "echo 'Connected'" &> /dev/null; then
        print_error "Cannot SSH to $PI_HOSTNAME"
        exit 1
    fi

    # Run appropriate setup
    if [ "$SCHEDULER_TYPE" = "cron" ]; then
        setup_crontab
    else
        setup_systemd_timer
    fi

    # Verify the setup
    verify_scheduler

    # Show management commands
    show_management_commands

    print_header "Setup Complete!"
    print_ok "Scheduler is now configured and active"
}

main "$@"
