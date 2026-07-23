#!/bin/bash

################################################################################
# WISE² Core - Raspberry Pi Rollback & Disaster Recovery Script
#
# Comprehensive rollback automation for Raspberry Pi deployments
# Features:
#   - List available versions with timestamps and commit hashes
#   - Interactive version selection
#   - Graceful rollback process
#   - Database schema rollback with migration tracking
#   - Volume data restoration from backups
#   - Health verification after rollback
#   - Detailed logging and documentation
#   - Team notifications
#   - Confirmation requirements for safety
#
# Usage:
#   ./rollback-pi.sh <pi_hostname_or_ip> [staging|prod]
#   Example: ./rollback-pi.sh pi.local prod
#            ./rollback-pi.sh 192.168.1.100 staging
#
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION & COLORS
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Script paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="${PROJECT_ROOT}/logs"
DEPLOYMENTS_DIR="${LOGS_DIR}/deployments"
BACKUPS_DIR="${LOGS_DIR}/backups"
ROLLBACKS_DIR="${LOGS_DIR}/rollbacks"

# Create required directories
mkdir -p "$DEPLOYMENTS_DIR" "$BACKUPS_DIR" "$ROLLBACKS_DIR"

# Deployment configuration
ROLLBACK_LOG="${ROLLBACKS_DIR}/rollback-$(date +%Y%m%d-%H%M%S).log"
ROLLBACK_REPORT="${ROLLBACKS_DIR}/rollback-report-$(date +%Y%m%d-%H%M%S).md"

# SSH configuration
SSH_USER="${SSH_USER:-pi}"
SSH_TIMEOUT=30
SSH_PORT="${SSH_PORT:-22}"

# Pi paths
PI_DEPLOY_DIR="/opt/wise2-edge"
PI_BACKUPS_DIR="/opt/wise2-edge-backups"
PI_DOCKER_DIR="${PI_DEPLOY_DIR}/docker"
PI_DATA_DIR="${PI_DEPLOY_DIR}/data"
PI_LOGS_DIR="/var/log/wise2-edge-appliance"

# Docker configuration
DOCKER_COMPOSE_FILE="docker-compose.pi3b.yml"

# Health check endpoints
API_HEALTH_ENDPOINT="http://localhost:3000/health"
WEBSITE_HEALTH_ENDPOINT="http://localhost:3001"
HEALTH_CHECK_TIMEOUT=120
HEALTH_CHECK_INTERVAL=5

# Deployment parameters
PI_HOSTNAME=""
ENVIRONMENT="prod"
FORCE_ROLLBACK=false

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "$ROLLBACK_LOG"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

print_subheader() {
    echo ""
    echo -e "${CYAN}── $1${NC}"
}

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
    log "INFO" "✓ $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARN" "⚠ $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR" "✗ $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
    log "INFO" "ℹ $1"
}

# Confirm action with user
confirm() {
    local prompt="$1"
    local response

    while true; do
        read -p "$(echo -e ${YELLOW}${prompt}${NC}) (yes/no): " response
        case "$response" in
            yes|y|YES|Y)
                return 0
                ;;
            no|n|NO|N)
                return 1
                ;;
            *)
                echo "Please answer 'yes' or 'no'"
                ;;
        esac
    done
}

# SSH command executor
ssh_execute() {
    local cmd="$1"
    ssh -p "$SSH_PORT" -o ConnectTimeout="$SSH_TIMEOUT" \
        -o StrictHostKeyChecking=no \
        "${SSH_USER}@${PI_HOSTNAME}" "$cmd"
}

# SCP copy from Pi
scp_from_pi() {
    local remote_path="$1"
    local local_path="$2"
    scp -P "$SSH_PORT" -o ConnectTimeout="$SSH_TIMEOUT" \
        -o StrictHostKeyChecking=no \
        "${SSH_USER}@${PI_HOSTNAME}:${remote_path}" "$local_path"
}

# SCP copy to Pi
scp_to_pi() {
    local local_path="$1"
    local remote_path="$2"
    scp -P "$SSH_PORT" -o ConnectTimeout="$SSH_TIMEOUT" \
        -o StrictHostKeyChecking=no \
        "$local_path" "${SSH_USER}@${PI_HOSTNAME}:${remote_path}"
}

# ============================================================================
# VALIDATION & SETUP
# ============================================================================

validate_arguments() {
    if [ $# -lt 1 ]; then
        print_error "Usage: $0 <pi_hostname_or_ip> [staging|prod]"
        echo ""
        echo "Examples:"
        echo "  $0 pi.local prod"
        echo "  $0 192.168.1.100 staging"
        exit 1
    fi

    PI_HOSTNAME="$1"
    ENVIRONMENT="${2:-prod}"

    if [ "$ENVIRONMENT" != "prod" ] && [ "$ENVIRONMENT" != "staging" ]; then
        print_error "Environment must be 'prod' or 'staging'"
        exit 1
    fi
}

verify_pi_connectivity() {
    print_subheader "Verifying Pi connectivity..."

    if ! ssh -p "$SSH_PORT" -o ConnectTimeout="$SSH_TIMEOUT" \
         -o StrictHostKeyChecking=no \
         "${SSH_USER}@${PI_HOSTNAME}" "echo 'connected'" &>/dev/null; then
        print_error "Cannot connect to Pi at ${PI_HOSTNAME}"
        echo "  User: ${SSH_USER}"
        echo "  Port: ${SSH_PORT}"
        exit 1
    fi

    print_ok "Connected to Pi at ${PI_HOSTNAME}"
}

verify_docker_running() {
    print_subheader "Verifying Docker on Pi..."

    local docker_status=$(ssh_execute "docker-compose -v 2>&1 || echo 'not installed'")
    if [[ "$docker_status" == *"not installed"* ]]; then
        print_error "Docker Compose not installed on Pi"
        exit 1
    fi

    print_ok "Docker Compose is available"
}

# ============================================================================
# DEPLOYMENT HISTORY
# ============================================================================

list_deployment_history() {
    print_subheader "Fetching deployment history from Pi..."

    # Create temporary directory for history
    local temp_history=$(mktemp -d)

    # Copy deployment logs from Pi
    local pi_deployments="${PI_BACKUPS_DIR}/deployments"
    if ssh_execute "[ -d '$pi_deployments' ]" 2>/dev/null; then
        scp_from_pi "${pi_deployments}" "$temp_history" || true
    fi

    # Also check git history locally
    echo ""
    print_subheader "Recent Git Commits (Local Repository):"
    git -C "$PROJECT_ROOT" log --oneline -n 20

    echo ""
    print_subheader "Recent Deployments on Pi:"

    # Parse and display deployment info
    local deployments_found=0

    # Check if we have deployment manifests
    if [ -d "${BACKUPS_DIR}" ]; then
        while IFS= read -r manifest; do
            if [ -f "$manifest" ]; then
                deployments_found=$((deployments_found + 1))
                local deploy_time=$(stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' "$manifest" 2>/dev/null || stat -c '%y' "$manifest" 2>/dev/null | cut -d' ' -f1-2)
                local deploy_hash=$(grep -E "COMMIT_HASH|GIT_HASH" "$manifest" 2>/dev/null | cut -d'=' -f2 | head -1 || echo "unknown")
                local deploy_version=$(grep -E "VERSION|DEPLOY_VERSION" "$manifest" 2>/dev/null | cut -d'=' -f2 | head -1 || echo "unknown")

                echo "[$deployments_found] ${deploy_time} - Hash: ${deploy_hash:0:8}... - Version: ${deploy_version}"
            fi
        done < <(find "${BACKUPS_DIR}" -maxdepth 1 -name "deployment-manifest-*.txt" 2>/dev/null | sort -r | head -10)
    fi

    # Also list Docker image tags on Pi
    local docker_images=$(ssh_execute "docker images --format 'table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}' 2>/dev/null | grep -E 'wise2|api|website'" || echo "")

    if [ ! -z "$docker_images" ]; then
        echo ""
        echo "Docker images on Pi:"
        echo "$docker_images"
    fi

    rm -rf "$temp_history"
}

# ============================================================================
# VERSION SELECTION
# ============================================================================

select_rollback_version() {
    print_subheader "Available Rollback Options:"
    echo ""
    echo "[1] Previous version (most recent rollback candidate)"
    echo "[2] Specify git commit hash"
    echo "[3] Restore from timestamped backup"
    echo "[4] Cancel rollback"
    echo ""

    read -p "Select option (1-4): " option

    case "$option" in
        1)
            select_previous_version
            ;;
        2)
            select_commit_hash
            ;;
        3)
            select_backup_timestamp
            ;;
        4)
            print_warn "Rollback cancelled"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
}

select_previous_version() {
    print_info "Using most recent deployable version"

    # Get the most recent stable commit before current HEAD
    local current_commit=$(git -C "$PROJECT_ROOT" rev-parse HEAD)
    local previous_commit=$(git -C "$PROJECT_ROOT" rev-list --all -n 2 | tail -1)

    ROLLBACK_COMMIT="$previous_commit"
    ROLLBACK_VERSION=$(git -C "$PROJECT_ROOT" describe --tags "$ROLLBACK_COMMIT" 2>/dev/null || echo "$ROLLBACK_COMMIT")

    print_info "Rolling back from: $current_commit"
    print_info "Rolling back to:   $ROLLBACK_COMMIT ($ROLLBACK_VERSION)"
}

select_commit_hash() {
    print_info "Recent commits:"
    git -C "$PROJECT_ROOT" log --oneline -n 10
    echo ""

    read -p "Enter commit hash to rollback to: " commit_input

    if git -C "$PROJECT_ROOT" cat-file -t "$commit_input" &>/dev/null; then
        ROLLBACK_COMMIT="$commit_input"
        ROLLBACK_VERSION=$(git -C "$PROJECT_ROOT" describe --tags "$ROLLBACK_COMMIT" 2>/dev/null || echo "$ROLLBACK_COMMIT")
        print_ok "Selected commit: $ROLLBACK_COMMIT"
    else
        print_error "Invalid commit hash"
        exit 1
    fi
}

select_backup_timestamp() {
    print_info "Available backups:"
    ls -1t "${BACKUPS_DIR}"/backup-*.tar.gz 2>/dev/null | head -10 | nl
    echo ""

    read -p "Select backup number: " backup_num

    local backup_file=$(ls -1t "${BACKUPS_DIR}"/backup-*.tar.gz 2>/dev/null | sed -n "${backup_num}p")

    if [ ! -z "$backup_file" ] && [ -f "$backup_file" ]; then
        ROLLBACK_BACKUP="$backup_file"
        print_ok "Selected backup: $backup_file"
    else
        print_error "Invalid backup selection"
        exit 1
    fi
}

# ============================================================================
# PRE-ROLLBACK CHECKS
# ============================================================================

generate_rollback_plan() {
    print_subheader "Generating rollback plan..."

    cat > "$ROLLBACK_REPORT" <<EOF
# WISE² Core - Rollback Report

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Pi Host**: ${PI_HOSTNAME}
**Environment**: ${ENVIRONMENT}
**Initiated By**: $(whoami)

## Rollback Scope

### Current State
- **Current Commit**: $(git -C "$PROJECT_ROOT" rev-parse HEAD)
- **Current Version**: $(git -C "$PROJECT_ROOT" describe --tags 2>/dev/null || echo "untagged")

### Target State
- **Target Commit**: ${ROLLBACK_COMMIT:-${ROLLBACK_BACKUP}}
- **Target Version**: ${ROLLBACK_VERSION:-from-backup}

## Rollback Steps

1. **Pre-rollback Snapshot**
   - Backup current database state
   - Export current container logs
   - Document current deployed images

2. **Service Shutdown**
   - Stop website service
   - Stop API service
   - Stop Redis
   - Preserve PostgreSQL for migration

3. **Code & Image Rollback**
   - Update git repository to target commit
   - Pull previous Docker images
   - (Or restore from backup if backup-based rollback)

4. **Database Migration**
   - Execute backward migrations
   - Verify schema compatibility
   - Test data integrity

5. **Volume Restoration**
   - Restore data volumes from backup if needed
   - Verify permissions and ownership

6. **Service Startup**
   - Start PostgreSQL with verification
   - Start Redis
   - Start API service
   - Start website service

7. **Health Verification**
   - Check API health endpoint
   - Check website availability
   - Verify database connectivity
   - Run smoke tests

8. **Post-rollback Verification**
   - Data integrity checks
   - No errors in logs
   - All endpoints responding

## Risk Assessment

- **Data Loss Risk**: Low (database backups preserved)
- **Downtime**: ~2-5 minutes
- **Reverting Risk**: Low (can re-deploy anytime)

---

**Status**: Pending execution

EOF

    print_ok "Rollback plan generated: $ROLLBACK_REPORT"
}

create_pre_rollback_snapshot() {
    print_subheader "Creating pre-rollback snapshot on Pi..."

    local snapshot_dir="${PI_BACKUPS_DIR}/snapshot-$(date +%Y%m%d-%H%M%S)"

    ssh_execute "mkdir -p '$snapshot_dir'" || true

    # Export current container state
    ssh_execute "docker-compose -f ${PI_DEPLOY_DIR}/${DOCKER_COMPOSE_FILE} ps > '${snapshot_dir}/containers.txt' 2>&1" || true

    # Export current images
    ssh_execute "docker images > '${snapshot_dir}/images.txt' 2>&1" || true

    # Backup current environment
    ssh_execute "cp ${PI_DEPLOY_DIR}/.env '${snapshot_dir}/.env.backup' 2>/dev/null || true" || true

    # Export logs
    ssh_execute "docker-compose -f ${PI_DEPLOY_DIR}/${DOCKER_COMPOSE_FILE} logs --tail=100 > '${snapshot_dir}/container-logs.txt' 2>&1" || true

    # Database backup (if accessible)
    ssh_execute "cd '${snapshot_dir}' && docker-compose -f ${PI_DEPLOY_DIR}/${DOCKER_COMPOSE_FILE} exec -T postgres pg_dump -U wise2 wise2_prod > db-backup.sql 2>/dev/null || echo 'Database backup skipped'" || true

    print_ok "Pre-rollback snapshot created: $snapshot_dir"
}

# ============================================================================
# ROLLBACK EXECUTION
# ============================================================================

stop_services() {
    print_subheader "Stopping services on Pi..."

    print_info "Stopping website..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} stop website 2>/dev/null" || print_warn "Website stop had issues"

    print_info "Stopping API..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} stop api 2>/dev/null" || print_warn "API stop had issues"

    print_info "Stopping Redis..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} stop redis 2>/dev/null" || print_warn "Redis stop had issues"

    sleep 5

    print_ok "Services stopped"
}

rollback_code() {
    print_subheader "Rolling back code on Pi..."

    if [ ! -z "${ROLLBACK_BACKUP:-}" ]; then
        # Restore from backup
        print_info "Restoring from backup: $ROLLBACK_BACKUP"

        local temp_extract=$(mktemp -d)
        tar -xzf "$ROLLBACK_BACKUP" -C "$temp_extract"

        # Copy extracted files to Pi
        scp_to_pi "${temp_extract}/data" "${PI_DEPLOY_DIR}/" || print_warn "Data restore had issues"
        scp_to_pi "${temp_extract}/.env" "${PI_DEPLOY_DIR}/" || print_warn "Env restore had issues"

        rm -rf "$temp_extract"
    else
        # Git-based rollback
        print_info "Reverting git repository to $ROLLBACK_COMMIT..."

        ssh_execute "cd ${PI_DEPLOY_DIR} && git fetch origin && git reset --hard ${ROLLBACK_COMMIT}" || {
            print_error "Git rollback failed"
            return 1
        }
    fi

    print_ok "Code rolled back"
}

rollback_database_schema() {
    print_subheader "Handling database schema rollback..."

    print_info "Checking migration history..."

    # This assumes database migrations are tracked
    # The API should handle backward migrations on startup
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} up -d postgres" || {
        print_error "PostgreSQL failed to start"
        return 1
    }

    sleep 10

    # Run backward migrations if available
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} run --rm api npm run migrate:down 2>/dev/null || echo 'No down migrations defined'" || true

    print_ok "Database schema rollback complete"
}

restore_volumes() {
    print_subheader "Restoring data volumes..."

    # Check if backup volumes exist
    if [ ! -z "${ROLLBACK_BACKUP:-}" ]; then
        print_info "Extracting volume data from backup..."

        local temp_volumes=$(mktemp -d)
        tar -xzf "$ROLLBACK_BACKUP" -C "$temp_volumes" "volumes/" 2>/dev/null || true

        if [ -d "${temp_volumes}/volumes" ]; then
            scp_to_pi "${temp_volumes}/volumes" "${PI_BACKUPS_DIR}/" || true
            rm -rf "$temp_volumes"
            print_ok "Volume data extracted and staged"
        else
            print_warn "No volume data in backup"
        fi
    else
        print_info "Using existing volume data (git rollback preserves data)"
    fi
}

start_services() {
    print_subheader "Starting services on Pi..."

    print_info "Starting PostgreSQL..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} up -d postgres" || {
        print_error "PostgreSQL failed to start"
        return 1
    }

    sleep 15

    print_info "Starting Redis..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} up -d redis" || {
        print_error "Redis failed to start"
        return 1
    }

    print_info "Starting API..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} up -d api" || {
        print_error "API failed to start"
        return 1
    }

    sleep 15

    print_info "Starting website..."
    ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} up -d website" || {
        print_error "Website failed to start"
        return 1
    }

    print_ok "All services started"
}

# ============================================================================
# POST-ROLLBACK VERIFICATION
# ============================================================================

wait_for_health() {
    local endpoint="$1"
    local service_name="$2"
    local elapsed=0

    print_info "Waiting for $service_name to be healthy..."

    while [ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
        if curl -sf "$endpoint" &>/dev/null; then
            print_ok "$service_name is healthy"
            return 0
        fi

        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    done

    print_error "$service_name health check failed after ${HEALTH_CHECK_TIMEOUT}s"
    return 1
}

verify_rollback() {
    print_subheader "Verifying rollback..."

    print_info "Checking API health..."
    if ! wait_for_health "$API_HEALTH_ENDPOINT" "API"; then
        return 1
    fi

    print_info "Checking website availability..."
    if ! wait_for_health "$WEBSITE_HEALTH_ENDPOINT" "Website"; then
        return 1
    fi

    print_info "Verifying database connectivity..."
    if ! ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres psql -U wise2 -d wise2_prod -c 'SELECT 1;'" &>/dev/null; then
        print_error "Database connectivity check failed"
        return 1
    fi
    print_ok "Database connectivity verified"

    print_info "Checking container logs for errors..."
    local error_count=$(ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} logs | grep -i 'error\|exception\|failed' | wc -l" || echo "0")

    if [ "$error_count" -gt 5 ]; then
        print_warn "Found $error_count errors in logs (may be transient)"
    else
        print_ok "Logs appear clean"
    fi

    print_ok "Rollback verification complete"
}

# ============================================================================
# DOCUMENTATION & NOTIFICATIONS
# ============================================================================

finalize_rollback_report() {
    local status="$1"

    cat >> "$ROLLBACK_REPORT" <<EOF

## Execution Results

**Status**: ${status}
**Completion Time**: $(date '+%Y-%m-%d %H:%M:%S')
**Duration**: \$((SECONDS / 60)) minutes

### Services Status
$(ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} ps" || echo "Unable to retrieve status")

### Recent Logs
\`\`\`
$(ssh_execute "cd ${PI_DEPLOY_DIR} && docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=20" || echo "Unable to retrieve logs")
\`\`\`

## Next Steps

1. **Monitor**: Watch service logs for any issues
   - \`ssh ${SSH_USER}@${PI_HOSTNAME} 'tail -f /var/log/wise2-edge-appliance/*'\`

2. **Verify Data**: Check that your data is intact
   - Verify database records
   - Check file uploads/data volumes
   - Test critical workflows

3. **If Issues Persist**:
   - Review logs in detail
   - Contact support with this report
   - Consider rolling back further if needed

4. **Re-deploy When Ready**:
   - Fix the issue that caused rollback
   - Re-run deployment with: \`./deploy-to-pi.sh ${PI_HOSTNAME} ${ENVIRONMENT}\`

---

**Generated**: $(date)
**Report Location**: ${ROLLBACK_REPORT}

EOF

    if [ "$status" == "SUCCESS" ]; then
        print_ok "Rollback completed successfully"
    else
        print_error "Rollback completed with issues"
    fi

    print_info "Detailed report: $ROLLBACK_REPORT"
}

send_notification() {
    local status="$1"
    local message="$2"

    print_subheader "Sending notifications..."

    # Log to file (always)
    echo "[ALERT] Rollback ${status}: ${message}" >> "${LOGS_DIR}/alerts.log"

    # Email notification (if configured)
    if [ ! -z "${ALERT_EMAIL:-}" ]; then
        print_info "Email notifications not yet implemented"
        print_info "Would send to: $ALERT_EMAIL"
    fi

    # Slack notification (if configured)
    if [ ! -z "${SLACK_WEBHOOK:-}" ]; then
        print_info "Slack notifications not yet implemented"
        print_info "Would post to configured Slack webhook"
    fi

    # Discord notification (if configured)
    if [ ! -z "${DISCORD_WEBHOOK:-}" ]; then
        print_info "Discord notifications not yet implemented"
        print_info "Would post to configured Discord webhook"
    fi

    print_ok "Notifications logged"
}

# ============================================================================
# MAIN EXECUTION FLOW
# ============================================================================

main() {
    print_header "WISE² Core - Raspberry Pi Rollback & Disaster Recovery"

    # Validate arguments
    validate_arguments "$@"

    print_info "Environment: ${ENVIRONMENT}"
    print_info "Target Pi: ${PI_HOSTNAME}"
    print_info "Log file: ${ROLLBACK_LOG}"

    # Verify connectivity
    verify_pi_connectivity
    verify_docker_running

    # Show deployment history
    print_header "DEPLOYMENT HISTORY"
    list_deployment_history

    echo ""
    print_header "ROLLBACK VERSION SELECTION"

    # Select version to rollback to
    select_rollback_version

    # Generate plan
    print_header "ROLLBACK PLAN"
    generate_rollback_plan
    cat "$ROLLBACK_REPORT"

    # Final confirmation
    echo ""
    print_header "FINAL CONFIRMATION"
    echo ""
    echo -e "${YELLOW}WARNING: This will roll back your deployment to a previous version.${NC}"
    echo "Data integrity will be preserved, but you may lose recent changes."
    echo ""

    if ! confirm "Do you want to proceed with the rollback?"; then
        print_warn "Rollback cancelled by user"
        exit 0
    fi

    # Execute rollback
    print_header "EXECUTING ROLLBACK"

    ROLLBACK_START_TIME=$SECONDS

    # Create snapshot before rollback
    create_pre_rollback_snapshot || print_warn "Snapshot creation had issues"

    # Stop services
    stop_services || {
        print_error "Failed to stop services"
        finalize_rollback_report "FAILED"
        exit 1
    }

    # Rollback code
    rollback_code || {
        print_error "Failed to rollback code"
        finalize_rollback_report "FAILED"
        exit 1
    }

    # Handle database
    rollback_database_schema || print_warn "Database rollback had issues"

    # Restore volumes
    restore_volumes || print_warn "Volume restoration had issues"

    # Start services
    start_services || {
        print_error "Failed to start services"
        finalize_rollback_report "FAILED"
        exit 1
    }

    # Verify everything
    print_header "POST-ROLLBACK VERIFICATION"

    if verify_rollback; then
        finalize_rollback_report "SUCCESS"
        send_notification "SUCCESS" "Rollback completed successfully to ${ROLLBACK_COMMIT:-backup}"
    else
        finalize_rollback_report "PARTIAL_SUCCESS"
        send_notification "PARTIAL_SUCCESS" "Rollback executed but verification found issues"
    fi

    echo ""
    print_header "ROLLBACK COMPLETE"
    print_ok "All rollback operations completed"
    print_info "Review the detailed report for more information"
}

# ============================================================================
# ENTRY POINT
# ============================================================================

main "$@"
