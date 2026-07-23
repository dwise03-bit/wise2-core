#!/bin/bash

################################################################################
# WISE² Backup Installation Script
#
# Automates setup of backup infrastructure on Raspberry Pi
#
# Usage:
#   ./backup-install.sh [--check-only] [--auto-configure]
#
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$*"
    echo "=========================================="
    echo ""
}

# Check if running as root or with sudo
require_sudo() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use: sudo $0)"
        exit 1
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" &>/dev/null
}

# ============================================================================
# PREREQUISITE CHECKS
# ============================================================================

check_prerequisites() {
    print_header "Checking Prerequisites"

    local all_ok=true

    # Check for required commands
    local required_cmds=(tar gzip curl)
    for cmd in "${required_cmds[@]}"; do
        if command_exists "${cmd}"; then
            log_success "Found: ${cmd}"
        else
            log_error "Missing: ${cmd}"
            all_ok=false
        fi
    done

    # Check for PostgreSQL client
    if command_exists psql; then
        local pg_version=$(psql --version | awk '{print $3}')
        log_success "Found: PostgreSQL client (${pg_version})"
    else
        log_warn "PostgreSQL client not found - install with: sudo apt-get install postgresql-client"
        all_ok=false
    fi

    # Check for mail
    if command_exists mail; then
        log_success "Found: mail (for email notifications)"
    else
        log_warn "mail not found - email notifications disabled. Install with: sudo apt-get install mailutils"
    fi

    # Check for AWS CLI (optional)
    if command_exists aws; then
        local aws_version=$(aws --version 2>&1 | awk '{print $1}')
        log_success "Found: AWS CLI (${aws_version})"
    else
        log_warn "AWS CLI not found - S3 backups disabled. Install with: sudo apt-get install awscli"
    fi

    echo ""
    if [ "${all_ok}" = false ]; then
        log_warn "Some prerequisites are missing. Please install them or backups may fail."
    fi
}

# ============================================================================
# DIRECTORY SETUP
# ============================================================================

setup_directories() {
    print_header "Setting Up Directories"

    local backup_user="wise2"
    local backup_group="wise2"

    # Check if user exists
    if ! id "${backup_user}" &>/dev/null; then
        log_error "User '${backup_user}' does not exist"
        return 1
    fi

    # Create directories
    local dirs=(
        "/data/wise2/backups"
        "/data/wise2/backups/daily"
        "/data/wise2/backups/weekly"
        "/data/wise2/backups/monthly"
        "/data/wise2/backups/tmp"
        "/data/wise2/backups/postgres"
        "/var/log/wise2"
    )

    for dir in "${dirs[@]}"; do
        if [ -d "${dir}" ]; then
            log_info "Directory exists: ${dir}"
        else
            log_info "Creating directory: ${dir}"
            mkdir -p "${dir}"
        fi

        # Set permissions
        chmod 700 "${dir}"
        chown "${backup_user}:${backup_group}" "${dir}"
    done

    log_success "Directories configured"
}

# ============================================================================
# CONFIGURATION SETUP
# ============================================================================

setup_configuration() {
    print_header "Setting Up Configuration"

    local config_dir="/etc/wise2"
    local config_file="${config_dir}/backup.env"

    # Create config directory
    if [ ! -d "${config_dir}" ]; then
        log_info "Creating config directory: ${config_dir}"
        mkdir -p "${config_dir}"
    fi

    # Copy example config
    if [ ! -f "${config_file}" ]; then
        log_info "Creating configuration file: ${config_file}"
        cp "${SCRIPT_DIR}/backup.env.example" "${config_file}"
        chmod 600 "${config_file}"
        chown wise2:wise2 "${config_file}"

        log_warn "Configuration file created. Please edit it with your settings:"
        log_warn "  sudo nano ${config_file}"
        return 1
    else
        log_success "Configuration file already exists: ${config_file}"
        log_info "To update, edit with: sudo nano ${config_file}"
    fi
}

# ============================================================================
# SCRIPT INSTALLATION
# ============================================================================

install_script() {
    print_header "Installing Backup Script"

    local source_script="${SCRIPT_DIR}/backup-pi.sh"
    local dest_script="/usr/local/bin/wise2-backup"

    if [ ! -f "${source_script}" ]; then
        log_error "Source script not found: ${source_script}"
        return 1
    fi

    log_info "Installing: ${source_script} → ${dest_script}"
    cp "${source_script}" "${dest_script}"
    chmod 755 "${dest_script}"

    # Verify installation
    if [ -x "${dest_script}" ]; then
        log_success "Script installed: ${dest_script}"
    else
        log_error "Failed to install script"
        return 1
    fi
}

# ============================================================================
# CRON SETUP
# ============================================================================

setup_cron() {
    print_header "Setting Up Cron Jobs"

    local cron_user="wise2"
    local cron_file="/etc/cron.d/wise2-backup"

    cat > "${cron_file}" << 'EOF'
# WISE² Backup Cron Jobs
# Set by backup-install.sh

# Daily backup at 2:00 AM
0 2 * * * wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full >> /var/log/wise2/backup.log 2>&1

# Weekly full backup with S3 upload (Sunday at 2:00 AM)
0 2 * * 0 wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full --upload-s3 >> /var/log/wise2/backup.log 2>&1

# Backup retention cleanup (daily at 3:00 AM)
0 3 * * * wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup cleanup >> /var/log/wise2/backup.log 2>&1
EOF

    chmod 644 "${cron_file}"

    log_success "Cron jobs installed: ${cron_file}"
    log_info "Cron schedule:"
    log_info "  - Daily backup: 02:00 UTC"
    log_info "  - Weekly S3: Sunday 02:00 UTC"
    log_info "  - Cleanup: Daily 03:00 UTC"
}

# ============================================================================
# SYSTEMD SETUP (Alternative to cron)
# ============================================================================

setup_systemd() {
    print_header "Setting Up systemd Timer (Optional)"

    local service_file="/etc/systemd/system/wise2-backup.service"
    local timer_file="/etc/systemd/system/wise2-backup.timer"

    cat > "${service_file}" << 'EOF'
[Unit]
Description=WISE² Backup Service
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/wise2/backup.env
ExecStart=/usr/local/bin/wise2-backup full
User=wise2
StandardOutput=journal
StandardError=journal
EOF

    cat > "${timer_file}" << 'EOF'
[Unit]
Description=WISE² Backup Timer
Requires=wise2-backup.service

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
AccuracySec=1min

[Install]
WantedBy=timers.target
EOF

    chmod 644 "${service_file}" "${timer_file}"

    systemctl daemon-reload
    log_success "systemd files created (not enabled by default)"
    log_info "To use systemd instead of cron:"
    log_info "  sudo systemctl enable wise2-backup.timer"
    log_info "  sudo systemctl start wise2-backup.timer"
}

# ============================================================================
# TEST & VERIFICATION
# ============================================================================

test_backup_script() {
    print_header "Testing Backup Script"

    log_info "Testing database backup..."

    # Source config
    if [ -f "/etc/wise2/backup.env" ]; then
        source /etc/wise2/backup.env
    else
        log_warn "Config file not found, skipping database test"
        return 0
    fi

    # Test database connection
    if command_exists psql; then
        log_info "Testing PostgreSQL connection to ${DB_HOST}:${DB_PORT}/${DB_NAME}..."
        if PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT version();" &>/dev/null; then
            log_success "PostgreSQL connection successful"
        else
            log_warn "PostgreSQL connection failed - check credentials in /etc/wise2/backup.env"
        fi
    else
        log_warn "PostgreSQL client not available - skipping connection test"
    fi

    log_info "To run a full backup test:"
    log_info "  sudo -u wise2 /usr/local/bin/wise2-backup full"
}

# ============================================================================
# STATUS CHECK
# ============================================================================

check_status() {
    print_header "Backup Setup Status"

    echo "Installation Checklist:"
    echo ""

    # Check directories
    echo -n "  Directories: "
    if [ -d "/data/wise2/backups/daily" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    # Check config
    echo -n "  Configuration: "
    if [ -f "/etc/wise2/backup.env" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    # Check script
    echo -n "  Script: "
    if [ -x "/usr/local/bin/wise2-backup" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    # Check cron
    echo -n "  Cron jobs: "
    if [ -f "/etc/cron.d/wise2-backup" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    # Check PostgreSQL
    echo -n "  PostgreSQL client: "
    if command_exists psql; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    echo ""
    echo "Next Steps:"
    echo "  1. Configure backup settings:"
    echo "     sudo nano /etc/wise2/backup.env"
    echo ""
    echo "  2. Test the backup:"
    echo "     sudo -u wise2 /usr/local/bin/wise2-backup full"
    echo ""
    echo "  3. Check backup logs:"
    echo "     tail -f /var/log/wise2/backup-\$(date +%Y-%m-%d).log"
    echo ""
    echo "  4. View recent backups:"
    echo "     ls -lah /data/wise2/backups/daily/"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    local check_only=false
    local auto_configure=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --check-only)
                check_only=true
                shift
                ;;
            --auto-configure)
                auto_configure=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    print_header "WISE² Backup Installation"

    # Require root
    require_sudo

    # Check prerequisites
    check_prerequisites

    if [ "${check_only}" = true ]; then
        check_status
        exit 0
    fi

    # Setup
    if setup_directories && \
       setup_configuration && \
       install_script && \
       setup_cron && \
       setup_systemd && \
       test_backup_script; then
        log_success "Installation completed successfully!"
    else
        log_error "Installation encountered errors"
        exit 1
    fi

    # Final status
    check_status
}

# Run main function
main "$@"
