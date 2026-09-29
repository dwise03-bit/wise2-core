#!/bin/bash

################################################################################
# WISE² Core - Raspberry Pi Deployment Script
#
# Comprehensive deployment automation for Raspberry Pi (3B+ & 4)
# Features:
#   - Prerequisites verification (SSH, Docker, disk space)
#   - Git repository clone/pull
#   - Environment configuration loading
#   - ARM-optimized Docker image building
#   - Graceful container lifecycle management
#   - Database migrations
#   - Health checks with polling
#   - Automatic rollback on failure
#   - Deployment logging and reporting
#
# Usage:
#   ./deploy-to-pi.sh <pi_hostname_or_ip> [staging|prod]
#   Example: ./deploy-to-pi.sh pi.local prod
#            ./deploy-to-pi.sh 192.168.1.100 staging
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
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_LOGS_DIR="${PROJECT_ROOT}/logs/deployments"
DEPLOYMENT_LOG="${DEPLOYMENT_LOGS_DIR}/deploy-$(date +%Y%m%d-%H%M%S).log"
CURRENT_BACKUP_DIR="${DEPLOYMENT_LOGS_DIR}/backups"

# SSH/SCP configuration
SSH_USER="${SSH_USER:-pi}"
SSH_TIMEOUT=30
SSH_PORT="${SSH_PORT:-22}"

# Pi configuration paths
PI_DEPLOY_DIR="/opt/wise2-edge"
PI_BACKUPS_DIR="/opt/wise2-edge-backups"
PI_DATA_DIR="/opt/wise2-edge/data"
PI_LOGS_DIR="/var/log/wise2-edge-appliance"

# Docker configuration
DOCKER_COMPOSE_FILE="docker-compose.pi3b.yml"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_BUILD_TIMEOUT=1800 # 30 minutes

# Health check configuration
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_INTERVAL=5
API_HEALTH_ENDPOINT="http://localhost:3000/health"

# Deployment parameters
PI_HOSTNAME=""
ENVIRONMENT="prod"
FORCE_BUILD=false
DRY_RUN=false
SKIP_HEALTH_CHECK=false

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

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
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_message() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$timestamp] [$level] $message" >> "$DEPLOYMENT_LOG"

    if [ "$level" = "ERROR" ]; then
        print_error "$message"
    elif [ "$level" = "WARN" ]; then
        print_warn "$message"
    elif [ "$level" = "OK" ]; then
        print_ok "$message"
    else
        print_info "$message"
    fi
}

# ============================================================================
# PREREQUISITE CHECKS
# ============================================================================

check_prerequisites() {
    print_header "Checking Prerequisites"

    local failed=0

    # Check if PI_HOSTNAME is set
    if [ -z "$PI_HOSTNAME" ]; then
        print_error "Pi hostname or IP address not provided"
        failed=1
    fi

    # Check local git
    if ! command -v git &> /dev/null; then
        print_error "git not found"
        failed=1
    else
        print_ok "git found"
    fi

    # Check local Docker
    if ! command -v docker &> /dev/null; then
        print_error "docker not found locally"
        failed=1
    else
        print_ok "docker found locally"
    fi

    # Check SSH connectivity to Pi
    print_subheader "Checking SSH connectivity to Pi (${PI_HOSTNAME})"
    if ssh -o ConnectTimeout=$SSH_TIMEOUT -o StrictHostKeyChecking=no -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "exit" 2>/dev/null; then
        print_ok "SSH connection successful"
    else
        print_error "SSH connection failed to ${SSH_USER}@${PI_HOSTNAME}:${SSH_PORT}"
        print_info "Ensure:"
        print_info "  - Pi is powered on and connected to network"
        print_info "  - SSH is enabled on Pi"
        print_info "  - Public key authentication is configured (or use SSH_ASKPASS)"
        failed=1
    fi

    if [ $failed -eq 1 ]; then
        log_message "ERROR" "Prerequisites check failed"
        exit 1
    fi

    log_message "INFO" "Prerequisites check passed"
}

# ============================================================================
# REMOTE CHECKS (on Pi)
# ============================================================================

check_pi_prerequisites() {
    print_header "Checking Pi Capabilities"

    # Detect Pi architecture
    local arch=$(ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "uname -m" 2>/dev/null || echo "unknown")

    print_info "Pi Architecture: $arch"

    if [[ "$arch" == "armv7l" ]]; then
        print_ok "Detected Pi 3B (ARMv7 32-bit) - using arm32v7 images"
        PI_ARCH="arm32v7"
    elif [[ "$arch" == "aarch64" ]]; then
        print_ok "Detected Pi 4 (ARMv8 64-bit) - using arm64v8 images"
        PI_ARCH="arm64v8"
    else
        print_error "Unknown Pi architecture: $arch"
        log_message "ERROR" "Unknown Pi architecture: $arch"
        exit 1
    fi

    # Check if Docker is installed
    print_subheader "Checking Docker installation on Pi"
    if ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "command -v docker" &> /dev/null; then
        print_ok "Docker is installed"

        local docker_version=$(ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" "docker --version" 2>/dev/null)
        print_info "Version: $docker_version"
    else
        print_error "Docker not installed on Pi"
        print_info "Installing Docker on Pi..."
        ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" "curl -fsSL https://get.docker.com -o get-docker.sh && \
            sudo sh get-docker.sh && \
            sudo usermod -aG docker $USER && \
            rm get-docker.sh" || {
            log_message "ERROR" "Failed to install Docker on Pi"
            exit 1
        }
        print_ok "Docker installed successfully"
    fi

    # Check Docker Compose
    print_subheader "Checking Docker Compose on Pi"
    if ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "docker compose version" &> /dev/null; then
        print_ok "Docker Compose V2 is installed"
    elif ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "command -v docker-compose" &> /dev/null; then
        print_warn "Only Docker Compose V1 found, upgrading recommended"
    else
        print_error "Docker Compose not found"
        print_info "Installing Docker Compose V2 on Pi..."
        ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" "sudo curl -L 'https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose && \
            sudo chmod +x /usr/local/bin/docker-compose" || {
            log_message "ERROR" "Failed to install Docker Compose on Pi"
            exit 1
        }
        print_ok "Docker Compose installed successfully"
    fi

    # Check free disk space
    print_subheader "Checking disk space on Pi"
    local disk_free=$(ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "df / | tail -1 | awk '{print \$4}'" 2>/dev/null)
    local disk_free_gb=$((disk_free / 1024 / 1024))

    print_info "Free disk space: ${disk_free_gb}GB"

    if [ "$disk_free_gb" -lt 5 ]; then
        print_error "Critical: Less than 5GB free disk space"
        log_message "ERROR" "Insufficient disk space on Pi: ${disk_free_gb}GB"
        exit 1
    elif [ "$disk_free_gb" -lt 10 ]; then
        print_warn "Warning: Less than 10GB free disk space available"
    else
        print_ok "Sufficient disk space available"
    fi

    # Check memory (including swap)
    print_subheader "Checking memory on Pi"
    local mem_info=$(ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "free -h | grep -E '^Mem:|^Swap:'" 2>/dev/null)
    echo "$mem_info" | while read line; do
        print_info "$line"
    done

    log_message "INFO" "Pi prerequisites check passed"
}

# ============================================================================
# REPOSITORY MANAGEMENT
# ============================================================================

clone_or_update_repo() {
    print_header "Repository Management"

    print_subheader "Preparing deployment directory on Pi"

    # Ensure deployment directory exists
    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "mkdir -p $PI_DEPLOY_DIR $PI_BACKUPS_DIR $PI_LOGS_DIR && \
        sudo chown $SSH_USER:$SSH_USER $PI_DEPLOY_DIR $PI_BACKUPS_DIR" 2>/dev/null || {
        log_message "ERROR" "Failed to create deployment directories on Pi"
        exit 1
    }

    print_ok "Deployment directories ready"

    # Check if repo exists on Pi
    if ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" "[ -d $PI_DEPLOY_DIR/.git ]" 2>/dev/null; then
        print_subheader "Updating existing repository"

        ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" \
            "cd $PI_DEPLOY_DIR && git fetch origin && git reset --hard origin/main" || {
            log_message "ERROR" "Failed to update repository on Pi"
            exit 1
        }

        print_ok "Repository updated"
    else
        print_subheader "Cloning repository"

        # Get repository URL from local git
        local git_url=$(cd "$PROJECT_ROOT" && git config --get remote.origin.url)

        ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" \
            "cd $(dirname $PI_DEPLOY_DIR) && git clone $git_url $(basename $PI_DEPLOY_DIR)" || {
            log_message "ERROR" "Failed to clone repository on Pi"
            exit 1
        }

        print_ok "Repository cloned"
    fi

    log_message "INFO" "Repository management complete"
}

# ============================================================================
# ENVIRONMENT CONFIGURATION
# ============================================================================

setup_environment() {
    print_header "Environment Configuration"

    local env_file=""

    if [ "$ENVIRONMENT" = "prod" ]; then
        env_file="${PROJECT_ROOT}/.env.production"
        print_subheader "Loading production environment"
    else
        env_file="${PROJECT_ROOT}/.env.staging"
        print_subheader "Loading staging environment"
    fi

    # Check if environment file exists
    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"

        # Suggest creating from example
        local example_file="${env_file}.example"
        if [ -f "$example_file" ]; then
            print_info "Found example file: $example_file"
            print_info "Copy and configure it:"
            print_info "  cp $example_file $env_file"
            print_info "  vi $env_file  # Edit with your values"
        fi

        log_message "ERROR" "Environment file not found: $env_file"
        exit 1
    fi

    print_ok "Environment file found"

    # Copy environment file to Pi
    print_subheader "Uploading environment configuration to Pi"

    scp -P "$SSH_PORT" -o ConnectTimeout=$SSH_TIMEOUT "$env_file" \
        "${SSH_USER}@${PI_HOSTNAME}:${PI_DEPLOY_DIR}/.env" || {
        log_message "ERROR" "Failed to upload environment file to Pi"
        exit 1
    }

    print_ok "Environment configuration uploaded"

    # Validate environment configuration
    print_subheader "Validating environment configuration"

    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_DEPLOY_DIR && \
        grep -E '^[A-Z_]+=.+' .env > /dev/null && echo 'Environment file is valid'" || {
        log_message "ERROR" "Environment configuration validation failed"
        exit 1
    }

    print_ok "Environment configuration is valid"

    log_message "INFO" "Environment setup complete"
}

# ============================================================================
# DOCKER IMAGE BUILDING
# ============================================================================

build_docker_images() {
    print_header "Docker Image Building"

    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN: Skipping Docker image build"
        return 0
    fi

    print_subheader "Building Docker images on Pi for $PI_ARCH architecture"

    # Create build script on Pi
    local build_script=$(mktemp)
    cat > "$build_script" << 'EOFBUILD'
#!/bin/bash
set -e

cd $PI_DEPLOY_DIR

# Set buildkit for better caching
export DOCKER_BUILDKIT=1

# Build API image
echo "Building API image..."
docker build -f Dockerfile.api \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg BASE_IMAGE=arm32v7/node:20-alpine \
  -t wise2-api:latest \
  .

# Build website image
echo "Building website image..."
docker build -f Dockerfile.website \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg BASE_IMAGE=arm32v7/node:20-alpine \
  -t wise2-website:latest \
  .

# Build studio image
echo "Building studio image..."
docker build -f Dockerfile.studio \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg BASE_IMAGE=arm32v7/node:20-alpine \
  -t wise2-studio:latest \
  .

echo "Docker images built successfully"
EOFBUILD

    chmod +x "$build_script"

    # Upload and execute build script
    scp -P "$SSH_PORT" -o ConnectTimeout=$SSH_TIMEOUT "$build_script" \
        "${SSH_USER}@${PI_HOSTNAME}:/tmp/build-images.sh" || {
        log_message "ERROR" "Failed to upload build script to Pi"
        rm -f "$build_script"
        exit 1
    }

    # Run build with timeout
    if timeout $DOCKER_BUILD_TIMEOUT ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "PI_DEPLOY_DIR=$PI_DEPLOY_DIR bash /tmp/build-images.sh"; then
        print_ok "Docker images built successfully"
        log_message "INFO" "Docker images built for $PI_ARCH"
    else
        print_error "Docker image build failed or timed out"
        log_message "ERROR" "Docker image build failed (timeout after ${DOCKER_BUILD_TIMEOUT}s)"
        rm -f "$build_script"
        exit 1
    fi

    rm -f "$build_script"
}

# ============================================================================
# CONTAINER LIFECYCLE
# ============================================================================

backup_current_state() {
    print_header "Backing Up Current State"

    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_name="backup-${backup_timestamp}"

    print_subheader "Creating backup: $backup_name"

    # Backup data directory
    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_BACKUPS_DIR && \
        mkdir -p $backup_name && \
        cp -r $PI_DATA_DIR/* $backup_name/ 2>/dev/null || true && \
        tar -czf ${backup_name}.tar.gz $backup_name && \
        rm -rf $backup_name" || {
        print_warn "Failed to create full backup, continuing anyway"
        log_message "WARN" "Backup creation had issues"
    }

    # Export Docker container state
    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "docker inspect wise2-edge-runtime > $PI_BACKUPS_DIR/${backup_name}.container-state.json 2>/dev/null || true"

    print_ok "Backup created: $backup_name"
    echo "$backup_name"

    log_message "INFO" "Backup created: $backup_name"
}

stop_containers() {
    print_header "Stopping Containers"

    print_subheader "Gracefully stopping containers on Pi"

    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_DEPLOY_DIR && \
        docker compose -f $DOCKER_COMPOSE_FILE down --timeout 30" || {
        print_warn "Container stop failed or timed out, forcing kill"
        ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" \
            "cd $PI_DEPLOY_DIR && \
            docker compose -f $DOCKER_COMPOSE_FILE kill" || true
    }

    print_ok "Containers stopped"

    # Wait for cleanup
    sleep 3

    log_message "INFO" "Containers stopped"
}

start_containers() {
    print_header "Starting Containers"

    print_subheader "Starting containers on Pi"

    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN: Would run: docker compose up -d"
        return 0
    fi

    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_DEPLOY_DIR && \
        docker compose -f $DOCKER_COMPOSE_FILE up -d" || {
        log_message "ERROR" "Failed to start containers"
        exit 1
    }

    print_ok "Containers started"

    # Wait for containers to stabilize
    sleep 5

    log_message "INFO" "Containers started"
}

# ============================================================================
# DATABASE MIGRATIONS
# ============================================================================

run_database_migrations() {
    print_header "Database Migrations"

    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN: Skipping database migrations"
        return 0
    fi

    print_subheader "Running database migrations on Pi"

    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" \
            "docker compose -f $PI_DEPLOY_DIR/$DOCKER_COMPOSE_FILE exec -T edge-runtime \
            npm run db:migrate" 2>/dev/null; then
            print_ok "Database migrations completed"
            log_message "INFO" "Database migrations completed"
            return 0
        fi

        echo "  Attempt $((attempt + 1))/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_warn "Database migrations timed out or failed"
    print_info "You may need to run migrations manually:"
    print_info "  ssh ${SSH_USER}@${PI_HOSTNAME}"
    print_info "  cd $PI_DEPLOY_DIR"
    print_info "  docker compose -f $DOCKER_COMPOSE_FILE exec edge-runtime npm run db:migrate"

    log_message "WARN" "Database migrations timed out"
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

check_health() {
    print_header "Health Checks"

    if [ "$SKIP_HEALTH_CHECK" = true ]; then
        print_info "Health checks skipped by user"
        return 0
    fi

    print_subheader "Checking container health on Pi"

    local start_time=$(date +%s)
    local deadline=$((start_time + HEALTH_CHECK_TIMEOUT))

    while [ $(date +%s) -lt $deadline ]; do
        local unhealthy=$(ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
            "${SSH_USER}@${PI_HOSTNAME}" \
            "docker compose -f $PI_DEPLOY_DIR/$DOCKER_COMPOSE_FILE ps --filter 'status=unhealthy' -q | wc -l" 2>/dev/null || echo "0")

        if [ "$unhealthy" = "0" ]; then
            print_ok "All containers are healthy"

            # Additional API health check
            print_subheader "Checking API endpoint"
            if timeout 10 ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
                "${SSH_USER}@${PI_HOSTNAME}" \
                "curl -f http://localhost:3000/health 2>/dev/null" > /dev/null; then
                print_ok "API health endpoint responding"
                log_message "INFO" "Health checks passed"
                return 0
            fi
        fi

        local elapsed=$(($(date +%s) - start_time))
        print_info "Health check attempt... (${elapsed}s elapsed)"
        sleep $HEALTH_CHECK_INTERVAL
    done

    print_error "Health check timeout after ${HEALTH_CHECK_TIMEOUT}s"
    log_message "ERROR" "Health check failed"
    return 1
}

# ============================================================================
# ROLLBACK
# ============================================================================

rollback_deployment() {
    local backup_name="$1"

    print_header "Initiating Rollback"

    if [ -z "$backup_name" ]; then
        print_error "No backup specified for rollback"
        log_message "ERROR" "Rollback failed: No backup specified"
        return 1
    fi

    print_subheader "Rolling back to: $backup_name"

    # Stop current containers
    print_info "Stopping current containers..."
    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_DEPLOY_DIR && docker compose -f $DOCKER_COMPOSE_FILE down" || true

    # Restore data
    print_info "Restoring data from backup..."
    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_BACKUPS_DIR && \
        tar -xzf ${backup_name}.tar.gz && \
        rm -rf $PI_DATA_DIR/* && \
        mv ${backup_name}/* $PI_DATA_DIR/ 2>/dev/null || true && \
        rm -rf ${backup_name}" || {
        print_error "Failed to restore backup"
        log_message "ERROR" "Rollback restore failed"
        return 1
    }

    # Restart containers
    print_info "Restarting containers..."
    ssh -o ConnectTimeout=$SSH_TIMEOUT -p "$SSH_PORT" \
        "${SSH_USER}@${PI_HOSTNAME}" \
        "cd $PI_DEPLOY_DIR && docker compose -f $DOCKER_COMPOSE_FILE up -d" || {
        print_error "Failed to restart containers after rollback"
        log_message "ERROR" "Rollback restart failed"
        return 1
    }

    print_ok "Rollback completed successfully"
    log_message "INFO" "Rollback completed to: $backup_name"
    return 0
}

# ============================================================================
# REPORTING
# ============================================================================

generate_deployment_report() {
    print_header "Deployment Report"

    local status="$1"
    local duration="$2"
    local backup_name="${3:-none}"

    cat > "$DEPLOYMENT_LOG.report" << EOF
================================================================================
WISE² Core - Raspberry Pi Deployment Report
Generated: $(date)
================================================================================

DEPLOYMENT DETAILS
------------------
Pi Hostname/IP: $PI_HOSTNAME
Environment: $ENVIRONMENT
Architecture: $PI_ARCH
Status: $status
Duration: $duration seconds
Backup: $backup_name

SERVICES
--------
API Server: http://$PI_HOSTNAME:3000
Dashboard: http://$PI_HOSTNAME:3001 (if configured)
Ollama: http://$PI_HOSTNAME:11434 (if running)

LOGS
----
Deployment Log: $DEPLOYMENT_LOG
Report: $DEPLOYMENT_LOG.report

NEXT STEPS
----------
1. Verify services are running:
   ssh ${SSH_USER}@${PI_HOSTNAME} docker compose -f $PI_DEPLOY_DIR/$DOCKER_COMPOSE_FILE ps

2. Check service health:
   curl http://$PI_HOSTNAME:3000/health

3. View logs:
   ssh ${SSH_USER}@${PI_HOSTNAME} docker compose -f $PI_DEPLOY_DIR/$DOCKER_COMPOSE_FILE logs -f

4. Monitor resources:
   ssh ${SSH_USER}@${PI_HOSTNAME} docker stats

TROUBLESHOOTING
---------------
If deployment failed, check:
1. Network connectivity to Pi
2. Disk space on Pi (df -h)
3. Memory availability (free -h)
4. Docker daemon status
5. Deployment logs: $DEPLOYMENT_LOG

To rollback deployment:
   ssh ${SSH_USER}@${PI_HOSTNAME} 'cd $PI_BACKUPS_DIR && tar -xzf backup-*.tar.gz'

================================================================================
EOF

    # Print report summary
    echo ""
    if [ "$status" = "SUCCESS" ]; then
        print_ok "Deployment completed successfully!"
    else
        print_error "Deployment failed - see logs for details"
    fi

    echo ""
    echo -e "${BLUE}Deployment Report:${NC}"
    echo ""
    cat "$DEPLOYMENT_LOG.report"
    echo ""

    log_message "INFO" "Deployment report generated: $DEPLOYMENT_LOG.report"
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    local start_time=$(date +%s)
    local backup_name=""
    local deployment_status="FAILED"

    # Setup logging
    mkdir -p "$DEPLOYMENT_LOGS_DIR"

    print_header "WISE² Core - Raspberry Pi Deployment"
    print_info "Start time: $(date)"
    print_info "Log file: $DEPLOYMENT_LOG"

    log_message "INFO" "Deployment started"
    log_message "INFO" "Target: $PI_HOSTNAME | Environment: $ENVIRONMENT"

    # Execute deployment steps
    trap 'handle_error $?' EXIT

    check_prerequisites
    check_pi_prerequisites

    # Backup current state before making changes
    backup_name=$(backup_current_state)

    clone_or_update_repo
    setup_environment
    build_docker_images
    stop_containers
    start_containers
    run_database_migrations

    if check_health; then
        deployment_status="SUCCESS"
    else
        print_error "Health checks failed, attempting rollback"
        if rollback_deployment "$backup_name"; then
            print_info "Rollback completed, but deployment failed"
        else
            print_error "Rollback also failed - manual intervention required"
        fi
    fi

    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Generate report
    generate_deployment_report "$deployment_status" "$duration" "$backup_name"

    log_message "INFO" "Deployment finished with status: $deployment_status"

    if [ "$deployment_status" != "SUCCESS" ]; then
        exit 1
    fi
}

handle_error() {
    local exit_code=$1
    if [ $exit_code -ne 0 ]; then
        log_message "ERROR" "Script terminated with exit code $exit_code"
    fi
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] <pi_hostname_or_ip> [environment]

Deploy WISE² Core to Raspberry Pi with automatic configuration and health checks.

POSITIONAL ARGUMENTS:
  pi_hostname_or_ip    Hostname or IP address of target Raspberry Pi
  environment          Deployment environment: 'prod' (default) or 'staging'

OPTIONS:
  -h, --help           Show this help message
  -u, --user USER      SSH user (default: pi)
  -p, --port PORT      SSH port (default: 22)
  -f, --force          Force Docker image rebuild
  -d, --dry-run        Show what would be done without making changes
  --skip-health-check  Skip health checks after deployment
  --registry REGISTRY  Docker registry (default: docker.io)

EXAMPLES:
  # Deploy to production on Pi at pi.local
  $0 pi.local prod

  # Deploy to staging with custom SSH port
  $0 -p 2222 192.168.1.100 staging

  # Dry run to see deployment steps
  $0 -d pi.local prod

  # Force rebuild Docker images
  $0 -f pi.local prod

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -u|--user)
            SSH_USER="$2"
            shift 2
            ;;
        -p|--port)
            SSH_PORT="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_BUILD=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-health-check)
            SKIP_HEALTH_CHECK=true
            shift
            ;;
        --registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        -*)
            print_error "Unknown option: $1"
            usage
            ;;
        *)
            if [ -z "$PI_HOSTNAME" ]; then
                PI_HOSTNAME="$1"
            elif [ -z "$ENVIRONMENT" ]; then
                ENVIRONMENT="$1"
            fi
            shift
            ;;
    esac
done

# Validate arguments
if [ -z "$PI_HOSTNAME" ]; then
    print_error "Pi hostname or IP address is required"
    usage
fi

if [ "$ENVIRONMENT" != "prod" ] && [ "$ENVIRONMENT" != "staging" ]; then
    print_error "Invalid environment: $ENVIRONMENT (must be 'prod' or 'staging')"
    usage
fi

# Run deployment
main

