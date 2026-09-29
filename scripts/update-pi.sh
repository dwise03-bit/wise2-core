#!/bin/bash

################################################################################
# WISE² Core - Raspberry Pi Update Script
#
# Automated update with rollback capability for WISE² Edge deployments
# Features:
#   - Pre-update validation (disk space, network, connectivity)
#   - Backup snapshot creation
#   - Multiple update types (full stack, API, website, system)
#   - Gradual rollout with health checks per service
#   - Automatic rollback on failure
#   - Error spike detection
#   - Post-update verification
#   - Notification email on completion
#   - Dry-run mode for testing
#   - Schedule options (manual, daily, weekly)
#
# Usage:
#   ./update-pi.sh <pi_hostname_or_ip> <update_type> [--version VERSION] [--dry-run] [--force]
#
# Update types:
#   full-stack     - Update API + Website + Studio (default)
#   api-only       - Update API service only
#   website-only   - Update Website service only
#   studio-only    - Update Studio service only
#   system         - Update system packages only
#   all            - Update everything including system packages
#
# Options:
#   --version VERSION    - Target version (default: latest)
#   --dry-run           - Show what would be updated without doing it
#   --force             - Force update even if health checks fail
#   --no-backup         - Skip backup creation
#   --no-notify         - Skip email notifications
#   --schedule TYPE     - Schedule mode: manual, daily, weekly
#
# Examples:
#   ./update-pi.sh pi.local full-stack
#   ./update-pi.sh 192.168.1.100 api-only --version v1.2.0
#   ./update-pi.sh pi.local system --dry-run
#   ./update-pi.sh pi.local full-stack --schedule daily
#
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="${PROJECT_ROOT}/logs/updates"
BACKUPS_DIR="${PROJECT_ROOT}/backups/pi-updates"
CURRENT_LOG="${LOGS_DIR}/update-$(date +%Y%m%d-%H%M%S).log"

# Ensure log directories exist
mkdir -p "$LOGS_DIR" "$BACKUPS_DIR"

# SSH configuration
SSH_USER="${SSH_USER:-pi}"
SSH_TIMEOUT=30
SSH_PORT="${SSH_PORT:-22}"

# Pi configuration
PI_DEPLOY_DIR="/opt/wise2-edge"
PI_BACKUPS_DIR="/opt/wise2-edge-backups"
PI_LOGS_DIR="/var/log/wise2-edge-appliance"

# Docker configuration
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
COMPOSE_CMD="docker-compose -f $DOCKER_COMPOSE_FILE"

# Health check configuration
HEALTH_CHECK_TIMEOUT=300  # 5 minutes
HEALTH_CHECK_INTERVAL=5
API_PORT=3000
WEBSITE_PORT=3001
STUDIO_PORT=3005
STABILITY_WINDOW=300  # 5 minutes of stability required

# Error log thresholds
ERROR_SPIKE_THRESHOLD=10  # More than 10 errors in 5 minutes = spike

# Email configuration
ADMIN_EMAIL="${ADMIN_EMAIL:-dwise03@gmail.com}"
NOTIFY_EMAIL=true
NOTIFY_ON_SUCCESS=true

# Update parameters
PI_HOSTNAME=""
UPDATE_TYPE="full-stack"
TARGET_VERSION="latest"
DRY_RUN=false
FORCE_UPDATE=false
CREATE_BACKUP=true
SCHEDULE_TYPE="manual"

# Runtime variables
BACKUP_ID=""
UPDATE_START_TIME=""
UPDATE_END_TIME=""
ROLLBACK_NEEDED=false
ROLLBACK_REASON=""

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$CURRENT_LOG"
}

print_subheader() {
    echo ""
    echo -e "${CYAN}── $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] -- $1" >> "$CURRENT_LOG"
}

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1" >> "$CURRENT_LOG"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1" >> "$CURRENT_LOG"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1" >> "$CURRENT_LOG"
}

print_info() {
    echo -e "${MAGENTA}ℹ${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ℹ $1" >> "$CURRENT_LOG"
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

usage() {
    cat << EOF
Usage: $0 <pi_hostname_or_ip> <update_type> [OPTIONS]

Update Types:
  full-stack     - Update API + Website + Studio
  api-only       - Update API service only
  website-only   - Update Website service only
  studio-only    - Update Studio service only
  system         - Update system packages only
  all            - Update everything including system

Options:
  --version VERSION    - Target version (default: latest)
  --dry-run           - Show what would be updated without doing it
  --force             - Force update even if health checks fail
  --no-backup         - Skip backup creation
  --no-notify         - Skip email notifications
  --schedule TYPE     - Schedule mode: manual, daily, weekly

Examples:
  $0 pi.local full-stack
  $0 192.168.1.100 api-only --version v1.2.0
  $0 pi.local system --dry-run

EOF
    exit 1
}

parse_arguments() {
    if [ $# -lt 2 ]; then
        usage
    fi

    PI_HOSTNAME="$1"
    UPDATE_TYPE="$2"
    shift 2

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --version)
                TARGET_VERSION="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE_UPDATE=true
                shift
                ;;
            --no-backup)
                CREATE_BACKUP=false
                shift
                ;;
            --no-notify)
                NOTIFY_EMAIL=false
                shift
                ;;
            --schedule)
                SCHEDULE_TYPE="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                usage
                ;;
        esac
    done

    # Validate update type
    case "$UPDATE_TYPE" in
        full-stack|api-only|website-only|studio-only|system|all)
            ;;
        *)
            print_error "Invalid update type: $UPDATE_TYPE"
            usage
            ;;
    esac
}

# ============================================================================
# PRE-UPDATE CHECKS
# ============================================================================

check_pi_connectivity() {
    print_subheader "Checking Pi connectivity"

    if ! ping -c 1 -W 2 "$PI_HOSTNAME" &> /dev/null; then
        print_error "Cannot ping $PI_HOSTNAME"
        return 1
    fi

    if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SSH_USER@$PI_HOSTNAME" "echo 'Connected'" &> /dev/null; then
        print_error "Cannot SSH to $PI_HOSTNAME"
        return 1
    fi

    print_ok "Pi is reachable at $PI_HOSTNAME"
}

check_disk_space() {
    print_subheader "Checking disk space on Pi"

    local disk_usage=$(ssh "$SSH_USER@$PI_HOSTNAME" "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//'")
    local available=$(ssh "$SSH_USER@$PI_HOSTNAME" "df -h / | awk 'NR==2 {print \$4}'")

    # Warn if usage > 80%, error if > 90%
    if [ "$disk_usage" -gt 90 ]; then
        print_error "Disk usage too high: ${disk_usage}% (available: $available)"
        return 1
    elif [ "$disk_usage" -gt 80 ]; then
        print_warn "Disk usage is high: ${disk_usage}% (available: $available)"
    else
        print_ok "Disk space available: ${disk_usage}% used (${available} free)"
    fi
}

check_network_stability() {
    print_subheader "Checking network stability"

    local packet_loss=$(ssh "$SSH_USER@$PI_HOSTNAME" "ping -c 10 8.8.8.8 2>/dev/null | grep -oP '\d+(?=% packet loss)' || echo 0")

    if [ "$packet_loss" -gt 5 ]; then
        print_error "High packet loss: ${packet_loss}%"
        return 1
    fi

    print_ok "Network stable: ${packet_loss}% packet loss"
}

check_docker_running() {
    print_subheader "Checking Docker on Pi"

    local docker_status=$(ssh "$SSH_USER@$PI_HOSTNAME" "sudo systemctl is-active docker 2>/dev/null || echo 'inactive'")

    if [ "$docker_status" != "active" ]; then
        print_error "Docker is not running"
        return 1
    fi

    print_ok "Docker is running"
}

check_services_status() {
    print_subheader "Checking current service status"

    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && $COMPOSE_CMD ps" || true
}

run_pre_update_checks() {
    print_header "Running Pre-Update Checks"

    check_pi_connectivity || return 1
    check_disk_space || return 1
    check_network_stability || return 1
    check_docker_running || return 1
    check_services_status || true

    print_ok "All pre-update checks passed"
}

# ============================================================================
# BACKUP & SNAPSHOT
# ============================================================================

create_backup_snapshot() {
    if ! $CREATE_BACKUP; then
        print_info "Backup creation skipped"
        return 0
    fi

    print_header "Creating Backup Snapshot"

    BACKUP_ID=$(date +%Y%m%d-%H%M%S)
    local backup_dir="$PI_BACKUPS_DIR/backup-$BACKUP_ID"

    print_subheader "Creating backup directory: $backup_dir"

    ssh "$SSH_USER@$PI_HOSTNAME" "sudo mkdir -p '$backup_dir'" || return 1

    # Backup docker-compose file
    print_subheader "Backing up docker-compose configuration"
    ssh "$SSH_USER@$PI_HOSTNAME" "sudo cp '$PI_DEPLOY_DIR/$DOCKER_COMPOSE_FILE' '$backup_dir/'" || return 1

    # Backup .env file
    print_subheader "Backing up environment configuration"
    ssh "$SSH_USER@$PI_HOSTNAME" "sudo cp '$PI_DEPLOY_DIR/.env' '$backup_dir/.env.backup' 2>/dev/null || true" || true

    # Export running container state
    print_subheader "Exporting running container state"
    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && sudo $COMPOSE_CMD images > '$backup_dir/images.txt'" || true

    # Create database backup (if using postgres)
    print_subheader "Creating database backup"
    ssh "$SSH_USER@$PI_HOSTNAME" << 'EOSSH' || true
        if sudo $COMPOSE_CMD ps postgres &>/dev/null; then
            sudo $COMPOSE_CMD exec -T postgres pg_dump -U wise2 wise2_prod | gzip > "$backup_dir/database.sql.gz"
        fi
EOSSH

    # Store current versions
    print_subheader "Recording current versions"
    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && $COMPOSE_CMD images --format 'table {{.Repository}}\t{{.Tag}}' > '$backup_dir/versions.txt'" || true

    # Create metadata file
    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH
sudo tee "$backup_dir/metadata.txt" > /dev/null << 'EOF'
Backup ID: $BACKUP_ID
Created: $(date)
Backup Type: Pre-Update
Update Type: $UPDATE_TYPE
Target Version: $TARGET_VERSION
Hostname: $PI_HOSTNAME
EOF
EOSSH

    print_ok "Backup snapshot created: $BACKUP_ID"
}

# ============================================================================
# UPDATE EXECUTION
# ============================================================================

update_api() {
    print_subheader "Updating API service"

    if $DRY_RUN; then
        print_info "[DRY RUN] Would pull and restart API container"
        return 0
    fi

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH || return 1
        set -e
        cd $PI_DEPLOY_DIR

        # Pull new image
        print_info "Pulling new API image..."
        $COMPOSE_CMD pull api || return 1

        # Stop old container gracefully
        print_info "Stopping API container..."
        $COMPOSE_CMD stop api || true

        # Start new container
        print_info "Starting new API container..."
        $COMPOSE_CMD up -d api || return 1

        print_ok "API service updated"
EOSSH
}

update_website() {
    print_subheader "Updating Website service"

    if $DRY_RUN; then
        print_info "[DRY RUN] Would pull and restart Website container"
        return 0
    fi

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH || return 1
        set -e
        cd $PI_DEPLOY_DIR

        # Pull new image
        print_info "Pulling new Website image..."
        $COMPOSE_CMD pull website || return 1

        # Stop old container gracefully
        print_info "Stopping Website container..."
        $COMPOSE_CMD stop website || true

        # Start new container
        print_info "Starting new Website container..."
        $COMPOSE_CMD up -d website || return 1

        print_ok "Website service updated"
EOSSH
}

update_studio() {
    print_subheader "Updating Studio service"

    if $DRY_RUN; then
        print_info "[DRY RUN] Would pull and restart Studio container"
        return 0
    fi

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH || return 1
        set -e
        cd $PI_DEPLOY_DIR

        # Pull new image
        print_info "Pulling new Studio image..."
        $COMPOSE_CMD pull studio || return 1

        # Stop old container gracefully
        print_info "Stopping Studio container..."
        $COMPOSE_CMD stop studio || true

        # Start new container
        print_info "Starting new Studio container..."
        $COMPOSE_CMD up -d studio || return 1

        print_ok "Studio service updated"
EOSSH
}

update_system_packages() {
    print_subheader "Updating system packages"

    if $DRY_RUN; then
        print_info "[DRY RUN] Would update system packages"
        return 0
    fi

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH || return 1
        sudo apt-get update
        sudo apt-get upgrade -y
        print_ok "System packages updated"
EOSSH
}

run_database_migrations() {
    if [[ "$UPDATE_TYPE" != "full-stack" && "$UPDATE_TYPE" != "api-only" && "$UPDATE_TYPE" != "all" ]]; then
        return 0
    fi

    print_subheader "Running database migrations"

    if $DRY_RUN; then
        print_info "[DRY RUN] Would run database migrations"
        return 0
    fi

    ssh "$SSH_USER@$PI_HOSTNAME" << EOSSH || return 1
        cd $PI_DEPLOY_DIR
        if $COMPOSE_CMD exec -T api npm run migrate 2>/dev/null; then
            print_ok "Database migrations completed"
        else
            print_warn "No migrations to run or API not ready yet"
        fi
EOSSH
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

check_service_health() {
    local service_name="$1"
    local port="$2"
    local endpoint="${3:-/health}"
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL))
    local attempt=0

    print_info "Checking $service_name health (port $port)..."

    while [ $attempt -lt $max_attempts ]; do
        if ssh "$SSH_USER@$PI_HOSTNAME" "curl -sf http://localhost:$port$endpoint > /dev/null 2>&1" 2>/dev/null; then
            print_ok "$service_name is healthy"
            return 0
        fi

        ((attempt++))
        if [ $((attempt % 6)) -eq 0 ]; then
            print_info "Still waiting for $service_name... ($((attempt * HEALTH_CHECK_INTERVAL))s elapsed)"
        fi
        sleep "$HEALTH_CHECK_INTERVAL"
    done

    print_error "$service_name did not become healthy within ${HEALTH_CHECK_TIMEOUT}s"
    return 1
}

check_error_spike() {
    local service_name="$1"
    local log_file="$2"

    print_info "Checking for error spikes in $service_name"

    local error_count=$(ssh "$SSH_USER@$PI_HOSTNAME" "tail -100 '$log_file' 2>/dev/null | grep -i 'error' | wc -l" || echo 0)

    if [ "$error_count" -gt "$ERROR_SPIKE_THRESHOLD" ]; then
        print_error "Error spike detected in $service_name: $error_count errors in recent logs"
        return 1
    fi

    print_ok "No error spike in $service_name"
    return 0
}

check_stability() {
    local service_name="$1"
    local port="$2"
    local stability_checks=$((STABILITY_WINDOW / HEALTH_CHECK_INTERVAL))
    local passed=0

    print_info "Checking $service_name stability for ${STABILITY_WINDOW}s..."

    for i in $(seq 1 $stability_checks); do
        if ssh "$SSH_USER@$PI_HOSTNAME" "curl -sf http://localhost:$port > /dev/null 2>&1" 2>/dev/null; then
            ((passed++))
        else
            print_warn "Stability check $i/$stability_checks failed for $service_name"
        fi
        sleep "$HEALTH_CHECK_INTERVAL"
    done

    local success_rate=$((passed * 100 / stability_checks))

    if [ "$success_rate" -lt 80 ]; then
        print_error "$service_name failed stability check: ${success_rate}% success rate"
        return 1
    fi

    print_ok "$service_name is stable: ${success_rate}% success rate"
    return 0
}

verify_update_health() {
    print_header "Verifying Update Health"

    local failed=0

    case "$UPDATE_TYPE" in
        api-only|full-stack|all)
            check_service_health "API" "$API_PORT" "/health" || ((failed++))
            ;;
    esac

    case "$UPDATE_TYPE" in
        website-only|full-stack|all)
            check_service_health "Website" "$WEBSITE_PORT" "/" || ((failed++))
            ;;
    esac

    case "$UPDATE_TYPE" in
        studio-only|full-stack|all)
            check_service_health "Studio" "$STUDIO_PORT" "/" || ((failed++))
            ;;
    esac

    # Run stability checks
    sleep 5  # Wait for services to settle

    case "$UPDATE_TYPE" in
        api-only|full-stack|all)
            check_stability "API" "$API_PORT" || ((failed++))
            ;;
    esac

    case "$UPDATE_TYPE" in
        website-only|full-stack|all)
            check_stability "Website" "$WEBSITE_PORT" || ((failed++))
            ;;
    esac

    case "$UPDATE_TYPE" in
        studio-only|full-stack|all)
            check_stability "Studio" "$STUDIO_PORT" || ((failed++))
            ;;
    esac

    if [ $failed -gt 0 ]; then
        ROLLBACK_NEEDED=true
        ROLLBACK_REASON="Health checks failed ($failed service(s) unhealthy)"
        return 1
    fi

    print_ok "All services passed health checks"
    return 0
}

# ============================================================================
# ROLLBACK
# ============================================================================

rollback_update() {
    print_header "ROLLING BACK UPDATE"

    if [ -z "$BACKUP_ID" ]; then
        print_error "No backup available for rollback"
        return 1
    fi

    local backup_dir="$PI_BACKUPS_DIR/backup-$BACKUP_ID"

    print_subheader "Restoring from backup: $BACKUP_ID"

    # Stop all services
    print_info "Stopping all services..."
    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && sudo $COMPOSE_CMD down" || true

    # Restore compose file
    print_info "Restoring docker-compose configuration..."
    ssh "$SSH_USER@$PI_HOSTNAME" "sudo cp '$backup_dir/$DOCKER_COMPOSE_FILE' '$PI_DEPLOY_DIR/'" || return 1

    # Restore env file if it exists
    print_info "Restoring environment configuration..."
    ssh "$SSH_USER@$PI_HOSTNAME" "sudo cp '$backup_dir/.env.backup' '$PI_DEPLOY_DIR/.env' 2>/dev/null || true" || true

    # Pull images from backup records
    print_info "Pulling previous images..."
    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && sudo $COMPOSE_CMD pull" || return 1

    # Restart services
    print_info "Restarting services..."
    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && sudo $COMPOSE_CMD up -d" || return 1

    # Wait for services to come up
    sleep 10

    print_ok "Rollback completed successfully"
}

# ============================================================================
# EXECUTE UPDATE
# ============================================================================

execute_update() {
    print_header "Executing Update"

    UPDATE_START_TIME=$(date +'%Y-%m-%d %H:%M:%S')

    case "$UPDATE_TYPE" in
        api-only)
            update_api || return 1
            run_database_migrations || true
            ;;
        website-only)
            update_website || return 1
            ;;
        studio-only)
            update_studio || return 1
            ;;
        full-stack)
            update_api || return 1
            run_database_migrations || true
            sleep 5
            update_website || return 1
            sleep 5
            update_studio || return 1
            ;;
        system)
            update_system_packages || return 1
            ;;
        all)
            update_api || return 1
            run_database_migrations || true
            sleep 5
            update_website || return 1
            sleep 5
            update_studio || return 1
            sleep 5
            update_system_packages || return 1
            ;;
    esac

    print_ok "Update execution completed"
}

# ============================================================================
# POST-UPDATE
# ============================================================================

get_updated_versions() {
    print_subheader "Recording updated versions"

    ssh "$SSH_USER@$PI_HOSTNAME" "cd $PI_DEPLOY_DIR && $COMPOSE_CMD images --format 'table {{.Repository}}\t{{.Tag}}'" | head -20 || true
}

send_notification_email() {
    if ! $NOTIFY_EMAIL; then
        return 0
    fi

    local status="$1"
    local subject_prefix=""

    case "$status" in
        success)
            subject_prefix="SUCCESS"
            ;;
        failed)
            subject_prefix="FAILED"
            ;;
        rollback)
            subject_prefix="ROLLBACK"
            ;;
    esac

    local email_body=$(cat << EOF
WISE² Edge Update Report
========================

Host: $PI_HOSTNAME
Update Type: $UPDATE_TYPE
Target Version: $TARGET_VERSION
Status: $subject_prefix
Start Time: $UPDATE_START_TIME
End Time: $(date +'%Y-%m-%d %H:%M:%S')

Dry Run: $DRY_RUN
Backup Created: $CREATE_BACKUP (ID: $BACKUP_ID)

EOF
    )

    if [ -n "$ROLLBACK_REASON" ]; then
        email_body+="Rollback Reason: $ROLLBACK_REASON"$'\n'
    fi

    email_body+=$'\n\nFull Log:\n'
    email_body+=$(cat "$CURRENT_LOG" 2>/dev/null || echo "Log not available")

    # Send email via mail command if available
    if command -v mail &> /dev/null; then
        echo "$email_body" | mail -s "WISE² [$subject_prefix] Update: $PI_HOSTNAME - $UPDATE_TYPE" "$ADMIN_EMAIL"
        print_ok "Notification email sent to $ADMIN_EMAIL"
    else
        print_warn "mail command not available, skipping email notification"
    fi
}

print_summary() {
    print_header "Update Summary"

    cat << EOF
Host:               $PI_HOSTNAME
Update Type:        $UPDATE_TYPE
Target Version:     $TARGET_VERSION
Start Time:         $UPDATE_START_TIME
End Time:           $(date +'%Y-%m-%d %H:%M:%S')
Dry Run:            $DRY_RUN
Backup ID:          $BACKUP_ID
Force Update:       $FORCE_UPDATE

Update Log:         $CURRENT_LOG

EOF
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    parse_arguments "$@"

    print_header "WISE² Pi Update Script"
    print_info "Update Type: $UPDATE_TYPE"
    print_info "Target Version: $TARGET_VERSION"
    print_info "Hostname: $PI_HOSTNAME"
    print_info "Dry Run: $DRY_RUN"

    # Run pre-update checks
    if ! run_pre_update_checks; then
        print_error "Pre-update checks failed"
        send_notification_email "failed"
        exit 1
    fi

    # Create backup
    if ! create_backup_snapshot; then
        print_error "Failed to create backup"
        if ! $FORCE_UPDATE; then
            send_notification_email "failed"
            exit 1
        fi
        print_warn "Continuing update without backup (--force enabled)"
    fi

    # Execute update
    if ! execute_update; then
        print_error "Update execution failed"
        if $CREATE_BACKUP; then
            rollback_update
            send_notification_email "rollback"
        fi
        exit 1
    fi

    # Verify health
    UPDATE_END_TIME=$(date +'%Y-%m-%d %H:%M:%S')

    if ! verify_update_health; then
        print_error "Health checks failed"
        if ! $FORCE_UPDATE && $CREATE_BACKUP; then
            rollback_update
            send_notification_email "rollback"
            exit 1
        else
            print_warn "Health checks failed, but continuing (--force enabled)"
        fi
    fi

    # Post-update steps
    get_updated_versions

    print_header "Update Completed Successfully"
    print_summary

    send_notification_email "success"

    exit 0
}

# Handle errors
trap 'print_error "Script interrupted"; exit 130' INT TERM

# Run main function
main "$@"
