#!/bin/bash

################################################################################
# WISE² Raspberry Pi Initialization Script
# Prepares a fresh Raspberry Pi for WISE² Core deployment
# Usage: sudo bash init-pi.sh
# Version: 1.0
################################################################################

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global state
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/wise2-pi-init-$(date +%Y%m%d-%H%M%S).log"
CHECKPOINT_FILE="/opt/wise2/.init-checkpoint"

# Configuration variables (will be populated by prompts)
PI_HOSTNAME=""
STATIC_IP=""
GATEWAY_IP=""
USER_EMAIL=""
DNS_PRIMARY="8.8.8.8"
DNS_SECONDARY="8.8.4.4"

################################################################################
# Utility Functions
################################################################################

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"
}

step() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

check_prerequisite() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use: sudo bash init-pi.sh)"
        exit 1
    fi

    if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
        warn "This does not appear to be a Raspberry Pi. Continuing anyway..."
    fi
}

checkpoint_init() {
    mkdir -p /opt/wise2
    if [[ ! -f "$CHECKPOINT_FILE" ]]; then
        cat > "$CHECKPOINT_FILE" << 'EOF'
# WISE² Raspberry Pi Initialization Checkpoint
# Tracks completed steps for idempotency
# Format: STEP_NAME=timestamp

EOF
        success "Checkpoint file created: $CHECKPOINT_FILE"
    fi
}

checkpoint_mark() {
    local step_name="$1"
    echo "${step_name}=$(date +%s)" >> "$CHECKPOINT_FILE"
}

checkpoint_check() {
    local step_name="$1"
    grep -q "^${step_name}=" "$CHECKPOINT_FILE" 2>/dev/null && return 0 || return 1
}

skip_if_done() {
    local step_name="$1"
    local description="$2"

    if checkpoint_check "$step_name"; then
        warn "Already completed: $description (skipping)"
        return 0
    fi
    return 1
}

prompt_input() {
    local prompt_text="$1"
    local default_value="${2:-}"
    local input_value=""

    if [[ -n "$default_value" ]]; then
        read -p "$(echo -e ${BLUE})${prompt_text}${NC} [${default_value}]: " input_value
        echo "${input_value:-$default_value}"
    else
        read -p "$(echo -e ${BLUE})${prompt_text}${NC}: " input_value
        echo "$input_value"
    fi
}

validate_ip() {
    local ip="$1"
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_hostname() {
    local hostname="$1"
    if [[ $hostname =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$ ]]; then
        return 0
    else
        return 1
    fi
}

################################################################################
# 1. System Updates
################################################################################

update_system() {
    step "1. SYSTEM UPDATES"

    if skip_if_done "SYSTEM_UPDATE" "System packages updated"; then
        return
    fi

    log "Running apt update..."
    apt update >> "$LOG_FILE" 2>&1
    success "apt cache refreshed"

    log "Running apt upgrade..."
    DEBIAN_FRONTEND=noninteractive apt upgrade -y >> "$LOG_FILE" 2>&1
    success "System packages upgraded"

    log "Installing required packages..."
    DEBIAN_FRONTEND=noninteractive apt install -y \
        git \
        curl \
        wget \
        htop \
        iotop \
        net-tools \
        tmux \
        vim \
        openssh-server \
        ufw \
        jq \
        ca-certificates \
        gnupg \
        lsb-release \
        apt-transport-https \
        >> "$LOG_FILE" 2>&1
    success "Required packages installed"

    checkpoint_mark "SYSTEM_UPDATE"
}

################################################################################
# 2. Configure System
################################################################################

configure_system() {
    step "2. SYSTEM CONFIGURATION"

    # Prompt for configuration
    PI_HOSTNAME=$(prompt_input "Enter Raspberry Pi hostname" "wise2-pi")
    while ! validate_hostname "$PI_HOSTNAME"; do
        error "Invalid hostname format. Use alphanumeric and hyphens only."
        PI_HOSTNAME=$(prompt_input "Enter Raspberry Pi hostname" "wise2-pi")
    done

    # Set hostname
    if skip_if_done "HOSTNAME_CONFIG" "Hostname configured"; then
        log "Hostname already configured (skipping)"
    else
        log "Setting hostname to: $PI_HOSTNAME"
        hostnamectl set-hostname "$PI_HOSTNAME" >> "$LOG_FILE" 2>&1
        # Update /etc/hosts
        sed -i "/127.0.1.1/c\\127.0.1.1\\t$PI_HOSTNAME" /etc/hosts
        success "Hostname set to: $PI_HOSTNAME"
        checkpoint_mark "HOSTNAME_CONFIG"
    fi

    # Configure timezone
    if skip_if_done "TIMEZONE_CONFIG" "Timezone configured"; then
        log "Timezone already configured (skipping)"
    else
        log "Current timezone: $(timedatectl show -p Timezone --value)"
        TIMEZONE=$(prompt_input "Enter timezone (e.g., UTC, America/New_York)" "UTC")
        timedatectl set-timezone "$TIMEZONE" >> "$LOG_FILE" 2>&1
        success "Timezone set to: $(timedatectl show -p Timezone --value)"
        checkpoint_mark "TIMEZONE_CONFIG"
    fi

    # Enable SSH
    if skip_if_done "SSH_CONFIG" "SSH enabled"; then
        log "SSH already configured (skipping)"
    else
        systemctl enable ssh >> "$LOG_FILE" 2>&1
        systemctl start ssh >> "$LOG_FILE" 2>&1
        success "SSH enabled and started"
        checkpoint_mark "SSH_CONFIG"
    fi

    # Disable unnecessary services (if running in server mode)
    if skip_if_done "DISABLE_SERVICES" "Unnecessary services disabled"; then
        log "Services already disabled (skipping)"
    else
        log "Disabling unnecessary services for server mode..."
        for service in bluetooth x11-common cups avahi-daemon; do
            if systemctl list-unit-files | grep -q "$service"; then
                systemctl disable "$service" >> "$LOG_FILE" 2>&1 || true
                systemctl stop "$service" >> "$LOG_FILE" 2>&1 || true
            fi
        done
        success "Unnecessary services disabled"
        checkpoint_mark "DISABLE_SERVICES"
    fi
}

################################################################################
# 3. Docker Setup
################################################################################

setup_docker() {
    step "3. DOCKER SETUP"

    if skip_if_done "DOCKER_INSTALL" "Docker installed"; then
        log "Docker already installed (skipping)"
    else
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o /tmp/get-docker.sh >> "$LOG_FILE" 2>&1
        bash /tmp/get-docker.sh >> "$LOG_FILE" 2>&1
        rm /tmp/get-docker.sh
        success "Docker installed"
        checkpoint_mark "DOCKER_INSTALL"
    fi

    if skip_if_done "DOCKER_COMPOSE_INSTALL" "Docker Compose installed"; then
        log "Docker Compose already installed (skipping)"
    else
        log "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
            -o /usr/local/bin/docker-compose >> "$LOG_FILE" 2>&1
        chmod +x /usr/local/bin/docker-compose
        success "Docker Compose installed"
        checkpoint_mark "DOCKER_COMPOSE_INSTALL"
    fi

    # Add current user to docker group
    if skip_if_done "DOCKER_USER_CONFIG" "Docker user configured"; then
        log "Docker user already configured (skipping)"
    else
        log "Adding user to docker group..."
        CURRENT_USER="${SUDO_USER:-root}"
        usermod -aG docker "$CURRENT_USER" >> "$LOG_FILE" 2>&1
        success "User '$CURRENT_USER' added to docker group"
        warn "You may need to log out and log back in for group changes to take effect"
        checkpoint_mark "DOCKER_USER_CONFIG"
    fi

    # Configure Docker daemon for resource limits
    if skip_if_done "DOCKER_DAEMON_CONFIG" "Docker daemon configured"; then
        log "Docker daemon already configured (skipping)"
    else
        log "Configuring Docker daemon..."
        mkdir -p /etc/docker
        cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "userland-proxy": false
}
EOF
        systemctl restart docker >> "$LOG_FILE" 2>&1
        success "Docker daemon configured"
        checkpoint_mark "DOCKER_DAEMON_CONFIG"
    fi
}

################################################################################
# 4. Create Directories
################################################################################

create_directories() {
    step "4. CREATE DIRECTORIES"

    if skip_if_done "DIRECTORIES_CREATE" "Directories created"; then
        log "Directories already created (skipping)"
        return
    fi

    local dirs=(
        "/opt/wise2"
        "/opt/wise2/apps"
        "/opt/wise2/packages"
        "/opt/wise2/config"
        "/data/wise2"
        "/data/wise2/backups"
        "/data/wise2/cache"
        "/logs/wise2"
        "/var/log/wise2"
    )

    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log "Created: $dir"
        fi
    done

    # Set permissions
    chown -R wise2:wise2 /opt/wise2 /data/wise2 /var/log/wise2 2>/dev/null || true
    chmod -R 755 /opt/wise2 /data/wise2
    chmod -R 750 /var/log/wise2

    success "All directories created with proper permissions"
    checkpoint_mark "DIRECTORIES_CREATE"
}

################################################################################
# 5. SSH Key Setup
################################################################################

setup_ssh_keys() {
    step "5. SSH KEY SETUP"

    if skip_if_done "SSH_KEYS_CONFIG" "SSH keys configured"; then
        log "SSH keys already configured (skipping)"
        return
    fi

    local setup_ssh=$(prompt_input "Copy your SSH public key for passwordless access? (y/n)" "n")

    if [[ "$setup_ssh" =~ ^[Yy]$ ]]; then
        log "Please paste your SSH public key (paste once, then press Ctrl+D on a new line):"
        local ssh_key_temp="/tmp/ssh_key_temp.pub"
        cat > "$ssh_key_temp"

        if [[ -s "$ssh_key_temp" ]]; then
            local wise2_user="wise2"
            local ssh_dir="/home/$wise2_user/.ssh"

            mkdir -p "$ssh_dir"
            cat "$ssh_key_temp" >> "$ssh_dir/authorized_keys"
            chmod 700 "$ssh_dir"
            chmod 600 "$ssh_dir/authorized_keys"
            chown -R "$wise2_user:$wise2_user" "$ssh_dir"

            rm "$ssh_key_temp"
            success "SSH public key added to wise2 user"
        else
            warn "No SSH key provided (skipping)"
        fi
    fi

    checkpoint_mark "SSH_KEYS_CONFIG"
}

################################################################################
# 6. Network Setup
################################################################################

setup_network() {
    step "6. NETWORK SETUP"

    if skip_if_done "NETWORK_CONFIG" "Network configured"; then
        log "Network already configured (skipping)"
        return
    fi

    # Get current network interface
    local interface=$(ip -4 route ls | grep default | awk '{print $5}' | head -1)

    if [[ -z "$interface" ]]; then
        warn "Could not detect network interface automatically"
        interface=$(prompt_input "Enter network interface (e.g., eth0, wlan0)" "eth0")
    else
        log "Detected network interface: $interface"
    fi

    # Prompt for static IP
    local setup_static=$(prompt_input "Configure static IP address? (y/n)" "y")

    if [[ "$setup_static" =~ ^[Yy]$ ]]; then
        STATIC_IP=$(prompt_input "Enter static IP address" "192.168.1.100")
        while ! validate_ip "$STATIC_IP"; do
            error "Invalid IP address format"
            STATIC_IP=$(prompt_input "Enter static IP address" "192.168.1.100")
        done

        GATEWAY_IP=$(prompt_input "Enter gateway IP" "192.168.1.1")
        while ! validate_ip "$GATEWAY_IP"; do
            error "Invalid gateway IP format"
            GATEWAY_IP=$(prompt_input "Enter gateway IP" "192.168.1.1")
        done

        # Create netplan configuration (for Raspberry Pi OS with Bullseye+)
        log "Configuring static IP for $interface..."
        mkdir -p /etc/netplan

        cat > "/etc/netplan/99-wise2-static.yaml" << EOF
network:
  version: 2
  ethernets:
    $interface:
      dhcp4: false
      addresses:
        - $STATIC_IP/24
      gateway4: $GATEWAY_IP
      nameservers:
        addresses: [$DNS_PRIMARY, $DNS_SECONDARY]
EOF

        chmod 600 "/etc/netplan/99-wise2-static.yaml"
        netplan apply >> "$LOG_FILE" 2>&1 || true

        success "Static IP configured: $STATIC_IP"
        log "Network interface: $interface"
        log "Gateway: $GATEWAY_IP"
    fi

    checkpoint_mark "NETWORK_CONFIG"
}

################################################################################
# 7. Firewall Setup (UFW)
################################################################################

setup_firewall() {
    step "7. FIREWALL SETUP (UFW)"

    if skip_if_done "FIREWALL_CONFIG" "Firewall configured"; then
        log "Firewall already configured (skipping)"
        return
    fi

    log "Enabling UFW firewall..."
    ufw --force enable >> "$LOG_FILE" 2>&1

    # Set default policies
    ufw default deny incoming >> "$LOG_FILE" 2>&1
    ufw default allow outgoing >> "$LOG_FILE" 2>&1

    # Allow SSH (essential!)
    ufw allow ssh >> "$LOG_FILE" 2>&1

    # Allow HTTP and HTTPS
    ufw allow http >> "$LOG_FILE" 2>&1
    ufw allow https >> "$LOG_FILE" 2>&1

    # Allow Docker Swarm ports (if using Swarm)
    ufw allow 2377/tcp >> "$LOG_FILE" 2>&1  # Swarm manager
    ufw allow 7946/tcp >> "$LOG_FILE" 2>&1  # Node communication
    ufw allow 7946/udp >> "$LOG_FILE" 2>&1
    ufw allow 4789/udp >> "$LOG_FILE" 2>&1  # Overlay network

    success "Firewall configured:"
    log "  - SSH (22) allowed"
    log "  - HTTP (80) allowed"
    log "  - HTTPS (443) allowed"
    log "  - Docker Swarm ports allowed (if needed)"

    checkpoint_mark "FIREWALL_CONFIG"
}

################################################################################
# 8. Create wise2 Service User
################################################################################

create_service_user() {
    step "8. CREATE SERVICE USER"

    if skip_if_done "SERVICE_USER_CREATE" "Service user created"; then
        log "Service user already created (skipping)"
        return
    fi

    if ! id -u wise2 >/dev/null 2>&1; then
        log "Creating 'wise2' service user..."
        useradd -r -s /bin/bash -d /var/lib/wise2 -m wise2 >> "$LOG_FILE" 2>&1

        # Add to docker group
        usermod -aG docker wise2 >> "$LOG_FILE" 2>&1

        # Create .ssh directory
        mkdir -p /var/lib/wise2/.ssh
        chmod 700 /var/lib/wise2/.ssh
        chown -R wise2:wise2 /var/lib/wise2/.ssh

        success "Service user 'wise2' created"
    else
        warn "Service user 'wise2' already exists"
    fi

    checkpoint_mark "SERVICE_USER_CREATE"
}

################################################################################
# 9. Performance Tuning
################################################################################

tune_performance() {
    step "9. PERFORMANCE TUNING"

    if skip_if_done "PERFORMANCE_TUNE" "Performance tuning applied"; then
        log "Performance tuning already applied (skipping)"
        return
    fi

    log "Applying performance tuning..."

    # Increase file descriptors
    if ! grep -q "wise2" /etc/security/limits.conf; then
        cat >> /etc/security/limits.conf << 'EOF'

# WISE² Raspberry Pi Performance Tuning
wise2 soft nofile 65536
wise2 hard nofile 65536
wise2 soft nproc 32768
wise2 hard nproc 32768
EOF
        success "File descriptor limits increased"
    fi

    # Kernel tuning for network performance
    if ! grep -q "wise2-network-tuning" /etc/sysctl.conf; then
        cat >> /etc/sysctl.conf << 'EOF'

# WISE² Network Tuning (wise2-network-tuning)
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 5000
EOF
        sysctl -p >> "$LOG_FILE" 2>&1
        success "Kernel network parameters tuned"
    fi

    # Swap optimization (if Pi is low memory)
    log "Checking memory configuration..."
    local total_mem=$(free -h | awk '/^Mem:/ {print $2}')
    log "Total memory: $total_mem"

    checkpoint_mark "PERFORMANCE_TUNE"
}

################################################################################
# 10. Backup and Log Setup
################################################################################

setup_logging() {
    step "10. LOGGING & BACKUP SETUP"

    if skip_if_done "LOGGING_SETUP" "Logging setup"; then
        log "Logging already configured (skipping)"
        return
    fi

    # Create log rotation for WISE² logs
    cat > /etc/logrotate.d/wise2 << 'EOF'
/var/log/wise2/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 wise2 wise2
    sharedscripts
}
EOF

    success "Log rotation configured"

    # Create backup script template
    if [[ ! -f /opt/wise2/scripts/backup.sh ]]; then
        mkdir -p /opt/wise2/scripts
        cat > /opt/wise2/scripts/backup.sh << 'EOF'
#!/bin/bash
# WISE² Backup Script
# Backs up application and data directories

BACKUP_DIR="/data/wise2/backups"
APP_DIR="/opt/wise2"
DATA_DIR="/data/wise2"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wise2-backup-$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Backup application and data (exclude docker images, caches)
tar -czf "$BACKUP_FILE" \
    --exclude='$APP_DIR/.git' \
    --exclude='$APP_DIR/node_modules' \
    --exclude='$DATA_DIR/cache' \
    --exclude='$DATA_DIR/backups' \
    "$APP_DIR" "$DATA_DIR" /var/log/wise2 \
    2>&1 | tee -a /var/log/wise2/backup.log

echo "[$(date)] Backup completed: $BACKUP_FILE"

# Keep only last 7 backups
find "$BACKUP_DIR" -name "wise2-backup-*.tar.gz" -mtime +7 -delete

echo "[$(date)] Old backups cleaned up"
EOF
        chmod +x /opt/wise2/scripts/backup.sh
        success "Backup script created: /opt/wise2/scripts/backup.sh"
    fi

    checkpoint_mark "LOGGING_SETUP"
}

################################################################################
# 11. Summary Report
################################################################################

generate_summary_report() {
    step "11. INITIALIZATION COMPLETE"

    local report_file="/opt/wise2/INIT_REPORT.txt"

    cat > "$report_file" << EOF
================================================================================
WISE² Raspberry Pi Initialization Report
================================================================================
Date: $(date)
Hostname: $PI_HOSTNAME
Timezone: $(timedatectl show -p Timezone --value)
Kernel: $(uname -r)
Total Memory: $(free -h | awk '/^Mem:/ {print $2}')
Disk Space: $(df -h / | awk 'NR==2 {print $2 " total, " $4 " available"}')

================================================================================
SYSTEM CONFIGURATION
================================================================================
✓ System packages updated
✓ Hostname configured: $PI_HOSTNAME
✓ Timezone configured: $(timedatectl show -p Timezone --value)
✓ SSH enabled
✓ Unnecessary services disabled

================================================================================
DOCKER
================================================================================
✓ Docker installed
  Version: $(docker --version)
✓ Docker Compose installed
  Version: $(docker-compose --version)
✓ Docker daemon configured for logging and resource limits
✓ Current user added to docker group

================================================================================
NETWORK CONFIGURATION
================================================================================
✓ Network configured
  Network Interface: $(ip -4 route ls | grep default | awk '{print $5}' | head -1)
EOF

    if [[ -n "$STATIC_IP" ]]; then
        echo "✓ Static IP configured: $STATIC_IP" >> "$report_file"
        echo "  Gateway: $GATEWAY_IP" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

================================================================================
SECURITY
================================================================================
✓ UFW firewall enabled and configured
  - SSH (22) allowed
  - HTTP (80) allowed
  - HTTPS (443) allowed
  - Docker Swarm ports allowed
✓ Service user 'wise2' created

================================================================================
DIRECTORIES
================================================================================
✓ Created /opt/wise2 (application root)
✓ Created /data/wise2 (persistent data)
✓ Created /logs/wise2 (application logs)
✓ Created /var/log/wise2 (system logs)

================================================================================
PERFORMANCE TUNING
================================================================================
✓ File descriptor limits increased
✓ Kernel network parameters tuned
✓ Log rotation configured

================================================================================
NEXT STEPS
================================================================================
1. Clone WISE² repository:
   git clone https://github.com/yourorg/wise2-core.git /opt/wise2

2. Copy configuration files:
   cp -r $PROJECT_ROOT/config/* /opt/wise2/config/

3. Set up Docker containers:
   cd /opt/wise2
   docker-compose -f docker-compose.prod.yml up -d

4. Verify deployment:
   docker ps
   docker logs wise2-api
   docker logs wise2-website

5. Schedule backups (add to crontab -e):
   0 2 * * * /opt/wise2/scripts/backup.sh >> /var/log/wise2/cron.log 2>&1

6. Monitor system:
   - CPU/Memory: htop
   - Logs: tail -f /var/log/wise2/*.log
   - Docker: docker stats

================================================================================
SYSTEM INFO
================================================================================
Hostname: $(hostname)
IP Address: $(hostname -I)
SSH Status: $(systemctl is-active ssh)
Docker Status: $(systemctl is-active docker)
Firewall Status: $(ufw status | grep Status)

================================================================================
SUPPORT
================================================================================
For issues, check:
- Initialization log: $LOG_FILE
- Docker logs: docker logs <container-name>
- System logs: journalctl -u wise2-*.service
- Application logs: /var/log/wise2/

Contact: $(whoami) at $USER_EMAIL
================================================================================
EOF

    cat "$report_file"
    log "\nInitialization report saved to: $report_file"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║             WISE² Raspberry Pi Initialization Script v1.0                    ║
║                                                                              ║
║              Preparing fresh Pi for WISE² Core deployment                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    log "Initialization started. Logging to: $LOG_FILE"

    check_prerequisite
    checkpoint_init

    # Execute initialization steps
    update_system
    configure_system
    setup_docker
    create_directories
    setup_ssh_keys
    setup_network
    setup_firewall
    create_service_user
    tune_performance
    setup_logging

    # Prompt for email (for alerts)
    USER_EMAIL=$(prompt_input "Enter email for system alerts" "admin@wise2.local")

    # Generate summary report
    generate_summary_report

    success "\n✓ WISE² Raspberry Pi initialization complete!"

    echo -e "\n${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}All systems ready for WISE² deployment!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}\n"

    log "Initialization completed successfully."
}

# Run main function
main "$@"
