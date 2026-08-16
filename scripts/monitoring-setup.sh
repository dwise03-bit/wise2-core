#!/bin/bash

##############################################################################
# WISE² Raspberry Pi Monitoring Setup
#
# Installs and configures lightweight monitoring stack:
# - Prometheus (metrics collection)
# - Node Exporter (system metrics)
# - cAdvisor (container metrics)
# - Grafana (visualization, optional)
# - Alerting (Slack, email, HTTP webhooks)
# - CSV archival (cron job)
#
# Usage: sudo bash monitoring-setup.sh [--with-grafana] [--slack-webhook URL] [--email EMAIL]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROMETHEUS_VERSION="2.45.0"
NODE_EXPORTER_VERSION="1.6.1"
CADVISOR_VERSION="0.47.0"
GRAFANA_VERSION="10.0.0"
PROMETHEUS_USER="prometheus"
PROMETHEUS_GROUP="prometheus"
PROMETHEUS_HOME="/opt/prometheus"
NODE_EXPORTER_HOME="/opt/node_exporter"
PROMETHEUS_CONFIG="/etc/prometheus/prometheus.yml"
PROMETHEUS_RULES="/etc/prometheus/alert_rules.yml"
PROMETHEUS_DATA="/var/lib/prometheus"
METRICS_ARCHIVE="/var/lib/prometheus/archive"
ALERT_CONFIG="/etc/prometheus/alert_config.json"

# Parse arguments
WITH_GRAFANA=false
SLACK_WEBHOOK=""
ALERT_EMAIL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --with-grafana)
      WITH_GRAFANA=true
      shift
      ;;
    --slack-webhook)
      SLACK_WEBHOOK="$2"
      shift 2
      ;;
    --email)
      ALERT_EMAIL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

##############################################################################
# Helper Functions
##############################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
  if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (use: sudo bash monitoring-setup.sh)"
    exit 1
  fi
}

detect_arch() {
  ARCH=$(uname -m)
  case $ARCH in
    armv7l)
      PROMETHEUS_ARCH="armv7"
      NODE_EXPORTER_ARCH="armv7"
      CADVISOR_ARCH="arm"
      log_success "Detected ARM v7 (Pi 2/3/Zero)"
      ;;
    aarch64)
      PROMETHEUS_ARCH="arm64"
      NODE_EXPORTER_ARCH="arm64"
      CADVISOR_ARCH="arm64"
      log_success "Detected ARM 64-bit (Pi 4/5)"
      ;;
    x86_64)
      PROMETHEUS_ARCH="amd64"
      NODE_EXPORTER_ARCH="amd64"
      CADVISOR_ARCH="amd64"
      log_success "Detected x86_64 (for testing)"
      ;;
    *)
      log_error "Unsupported architecture: $ARCH"
      exit 1
      ;;
  esac
}

##############################################################################
# 1. Install Dependencies
##############################################################################

install_dependencies() {
  log_info "Installing dependencies..."

  apt-get update -qq
  apt-get install -y -qq \
    curl wget git jq unzip \
    systemd python3-pip \
    mailutils \
    2>/dev/null || true

  log_success "Dependencies installed"
}

##############################################################################
# 2. Create Prometheus User & Directories
##############################################################################

setup_prometheus_user() {
  log_info "Setting up Prometheus user and directories..."

  if ! id -u "$PROMETHEUS_USER" >/dev/null 2>&1; then
    useradd --system --home /var/lib/prometheus --shell /bin/false "$PROMETHEUS_USER"
    log_success "Created prometheus user"
  fi

  mkdir -p "$PROMETHEUS_HOME"
  mkdir -p "$PROMETHEUS_DATA"
  mkdir -p "$METRICS_ARCHIVE"
  mkdir -p "$(dirname $PROMETHEUS_CONFIG)"
  mkdir -p "$(dirname $PROMETHEUS_RULES)"

  chown -R "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$PROMETHEUS_HOME"
  chown -R "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$PROMETHEUS_DATA"
  chown -R "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$METRICS_ARCHIVE"

  chmod -R 755 "$PROMETHEUS_HOME"
  chmod -R 755 "$PROMETHEUS_DATA"

  log_success "Created directories and set permissions"
}

##############################################################################
# 3. Install Prometheus
##############################################################################

install_prometheus() {
  log_info "Installing Prometheus $PROMETHEUS_VERSION..."

  cd /tmp

  FILENAME="prometheus-${PROMETHEUS_VERSION}.linux-${PROMETHEUS_ARCH}.tar.gz"
  DOWNLOAD_URL="https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/${FILENAME}"

  if ! wget -q "$DOWNLOAD_URL" -O "$FILENAME"; then
    log_error "Failed to download Prometheus"
    return 1
  fi

  tar xzf "$FILENAME"

  cp "prometheus-${PROMETHEUS_VERSION}.linux-${PROMETHEUS_ARCH}/prometheus" "$PROMETHEUS_HOME/"
  cp "prometheus-${PROMETHEUS_VERSION}.linux-${PROMETHEUS_ARCH}/promtool" "$PROMETHEUS_HOME/"

  chown "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$PROMETHEUS_HOME/prometheus"
  chown "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$PROMETHEUS_HOME/promtool"
  chmod 755 "$PROMETHEUS_HOME/prometheus"
  chmod 755 "$PROMETHEUS_HOME/promtool"

  rm -rf "prometheus-${PROMETHEUS_VERSION}.linux-${PROMETHEUS_ARCH}" "$FILENAME"

  log_success "Prometheus installed to $PROMETHEUS_HOME"
}

##############################################################################
# 4. Install Node Exporter
##############################################################################

install_node_exporter() {
  log_info "Installing Node Exporter $NODE_EXPORTER_VERSION..."

  cd /tmp

  FILENAME="node_exporter-${NODE_EXPORTER_VERSION}.linux-${NODE_EXPORTER_ARCH}.tar.gz"
  DOWNLOAD_URL="https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/${FILENAME}"

  if ! wget -q "$DOWNLOAD_URL" -O "$FILENAME"; then
    log_error "Failed to download Node Exporter"
    return 1
  fi

  tar xzf "$FILENAME"

  mkdir -p "$NODE_EXPORTER_HOME"
  cp "node_exporter-${NODE_EXPORTER_VERSION}.linux-${NODE_EXPORTER_ARCH}/node_exporter" "$NODE_EXPORTER_HOME/"

  chown root:root "$NODE_EXPORTER_HOME/node_exporter"
  chmod 755 "$NODE_EXPORTER_HOME/node_exporter"

  rm -rf "node_exporter-${NODE_EXPORTER_VERSION}.linux-${NODE_EXPORTER_ARCH}" "$FILENAME"

  log_success "Node Exporter installed to $NODE_EXPORTER_HOME"
}

##############################################################################
# 5. Configure Prometheus
##############################################################################

configure_prometheus() {
  log_info "Configuring Prometheus..."

  cat > "$PROMETHEUS_CONFIG" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'wise2-pi-monitor'
    instance: 'raspberry-pi'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

rule_files:
  - /etc/prometheus/alert_rules.yml

scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'pi-system'

  # cAdvisor (container metrics)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['localhost:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'pi-containers'
    scrape_interval: 5s
EOF

  chown "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$PROMETHEUS_CONFIG"
  chmod 644 "$PROMETHEUS_CONFIG"

  log_success "Prometheus config created at $PROMETHEUS_CONFIG"
}

##############################################################################
# 6. Configure Alert Rules
##############################################################################

configure_alert_rules() {
  log_info "Configuring alert rules..."

  cat > "$PROMETHEUS_RULES" << 'EOF'
groups:
  - name: system_alerts
    interval: 30s
    rules:
      # CPU alert
      - alert: HighCPUUsage
        expr: |
          (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value | humanize }}% on {{ $labels.instance }}"

      # Memory alert
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value | humanize }}% on {{ $labels.instance }}"

      # Disk space alert
      - alert: HighDiskUsage
        expr: |
          (1 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lowerfs|squashfs|vfat"} / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lowerfs|squashfs|vfat"})) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High disk usage on {{ $labels.instance }}"
          description: "Disk {{ $labels.device }} is {{ $value | humanize }}% full on {{ $labels.instance }}"

      # Temperature alert (if available)
      - alert: HighTemperature
        expr: |
          node_thermal_zone_temp > 80000
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High temperature on {{ $labels.instance }}"
          description: "Temperature is {{ $value | humanize }}°C on {{ $labels.instance }}"

      # Filesystem readonly alert
      - alert: FilesystemReadonly
        expr: |
          node_filesystem_readonly > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Filesystem read-only on {{ $labels.instance }}"
          description: "Filesystem {{ $labels.device }} is read-only on {{ $labels.instance }}"

  - name: container_alerts
    interval: 30s
    rules:
      # Container restart alert
      - alert: ContainerRestarting
        expr: |
          rate(container_last_seen{name!=""}[5m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} is restarting"
          description: "Container {{ $labels.name }} has restarted on {{ $labels.instance }}"
EOF

  chown "$PROMETHEUS_USER:$PROMETHEUS_GROUP" "$PROMETHEUS_RULES"
  chmod 644 "$PROMETHEUS_RULES"

  log_success "Alert rules created at $PROMETHEUS_RULES"
}

##############################################################################
# 7. Create Alert Handling Script
##############################################################################

create_alert_handler() {
  log_info "Creating alert handler script..."

  cat > /usr/local/bin/wise2-alert-handler << 'ALERTSCRIPT'
#!/bin/bash

# Alert handler for WISE² monitoring
# Called by alert hooks to send notifications

ALERT_CONFIG="/etc/prometheus/alert_config.json"

send_slack() {
  local webhook="$1"
  local message="$2"
  local severity="$3"

  if [ -z "$webhook" ]; then
    return
  fi

  local color="warning"
  [[ "$severity" == "critical" ]] && color="danger"
  [[ "$severity" == "resolved" ]] && color="good"

  curl -s -X POST "$webhook" \
    -H 'Content-Type: application/json' \
    -d @- << EOF
{
  "attachments": [
    {
      "color": "$color",
      "title": "WISE² Alert",
      "text": "$message",
      "footer": "Raspberry Pi Monitor",
      "ts": $(date +%s)
    }
  ]
}
EOF
}

send_email() {
  local email="$1"
  local subject="$2"
  local message="$3"

  if [ -z "$email" ] || ! command -v mail >/dev/null 2>&1; then
    return
  fi

  echo "$message" | mail -s "$subject" "$email"
}

# Main alert handler
if [ $# -lt 3 ]; then
  echo "Usage: $0 <alert_name> <severity> <message>"
  exit 1
fi

ALERT_NAME="$1"
SEVERITY="$2"
MESSAGE="$3"

# Load configuration
if [ -f "$ALERT_CONFIG" ]; then
  SLACK_WEBHOOK=$(jq -r '.slack_webhook // empty' "$ALERT_CONFIG")
  ALERT_EMAIL=$(jq -r '.alert_email // empty' "$ALERT_CONFIG")
fi

# Send alerts
send_slack "$SLACK_WEBHOOK" "[$ALERT_NAME] $MESSAGE" "$SEVERITY"
send_email "$ALERT_EMAIL" "WISE² Alert: $ALERT_NAME" "Severity: $SEVERITY\n\n$MESSAGE"

echo "Alert handled: $ALERT_NAME ($SEVERITY)"
ALERTSCRIPT

  chmod 755 /usr/local/bin/wise2-alert-handler
  log_success "Alert handler created at /usr/local/bin/wise2-alert-handler"
}

##############################################################################
# 8. Create Systemd Services
##############################################################################

create_prometheus_service() {
  log_info "Creating Prometheus systemd service..."

  cat > /etc/systemd/system/prometheus.service << EOF
[Unit]
Description=Prometheus Monitoring System
Wants=network-online.target
After=network-online.target

[Service]
User=$PROMETHEUS_USER
Group=$PROMETHEUS_GROUP
Type=simple
ExecStart=$PROMETHEUS_HOME/prometheus \\
  --config.file=$PROMETHEUS_CONFIG \\
  --storage.tsdb.path=$PROMETHEUS_DATA \\
  --storage.tsdb.retention.time=15d \\
  --web.listen-address=0.0.0.0:9090 \\
  --web.enable-lifecycle

SyslogIdentifier=prometheus
Restart=always
RestartSec=5

# Resource limits for Raspberry Pi
MemoryLimit=512M
CPUQuota=80%

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  log_success "Prometheus service created"
}

create_node_exporter_service() {
  log_info "Creating Node Exporter systemd service..."

  cat > /etc/systemd/system/node-exporter.service << EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=root
Type=simple
ExecStart=$NODE_EXPORTER_HOME/node_exporter \\
  --collector.textfile.directory=/var/lib/node_exporter/textfile_collector \\
  --web.listen-address=:9100

SyslogIdentifier=node-exporter
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  mkdir -p /var/lib/node_exporter/textfile_collector
  chmod 755 /var/lib/node_exporter/textfile_collector

  systemctl daemon-reload
  log_success "Node Exporter service created"
}

create_cadvisor_service() {
  log_info "Creating cAdvisor systemd service..."

  # Check if Docker is installed
  if ! command -v docker >/dev/null 2>&1; then
    log_warn "Docker not found, skipping cAdvisor setup"
    return
  fi

  cat > /etc/systemd/system/cadvisor.service << 'EOF'
[Unit]
Description=cAdvisor Container Monitoring
Wants=network-online.target
After=network-online.target docker.service
Requires=docker.service

[Service]
Type=simple
ExecStart=/usr/bin/docker run \
  --rm \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:rw \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --name=cadvisor \
  gcr.io/cadvisor/cadvisor:v0.47.0

SyslogIdentifier=cadvisor
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  log_success "cAdvisor service created (requires Docker)"
}

##############################################################################
# 9. Install Grafana (optional)
##############################################################################

install_grafana() {
  if [ "$WITH_GRAFANA" != "true" ]; then
    log_warn "Skipping Grafana installation (use --with-grafana to enable)"
    return
  fi

  log_info "Installing Grafana $GRAFANA_VERSION..."

  # Add Grafana repo
  apt-get install -y software-properties-common
  add-apt-repository -y "deb https://packages.grafana.com/oss/deb stable main" 2>/dev/null || true
  wget -q -O - https://packages.grafana.com/gpg.key | apt-key add - 2>/dev/null || true

  apt-get update -qq
  apt-get install -y -qq grafana-server 2>/dev/null || true

  # Configure Grafana
  mkdir -p /etc/grafana/provisioning/dashboards
  mkdir -p /etc/grafana/provisioning/datasources

  # Add Prometheus datasource
  cat > /etc/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    isDefault: true
    editable: true
EOF

  systemctl daemon-reload
  systemctl enable grafana-server

  log_success "Grafana installed and configured"
}

##############################################################################
# 10. Create Metrics Archival Script
##############################################################################

create_archival_script() {
  log_info "Creating metrics archival script..."

  cat > /usr/local/bin/wise2-metrics-archive << 'ARCHIVESCRIPT'
#!/bin/bash

# Archive Prometheus metrics to CSV for long-term storage
# Run via cron: 0 2 * * * /usr/local/bin/wise2-metrics-archive

PROMETHEUS_HOME="/opt/prometheus"
PROMETHEUS_ADDR="http://localhost:9090"
ARCHIVE_DIR="/var/lib/prometheus/archive"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_FILE="$ARCHIVE_DIR/metrics_$TIMESTAMP.csv"

# Metrics to archive
METRICS=(
  "node_cpu_seconds_total"
  "node_memory_MemTotal_bytes"
  "node_memory_MemAvailable_bytes"
  "node_filesystem_size_bytes"
  "node_filesystem_avail_bytes"
  "container_cpu_usage_seconds_total"
  "container_memory_usage_bytes"
  "node_network_receive_bytes_total"
  "node_network_transmit_bytes_total"
)

mkdir -p "$ARCHIVE_DIR"

# CSV header
echo "timestamp,metric,value,instance,job" > "$ARCHIVE_FILE"

# Query each metric
for metric in "${METRICS[@]}"; do
  curl -s "${PROMETHEUS_ADDR}/api/v1/query?query=${metric}" | \
    jq -r ".data.result[] | \"${TIMESTAMP},${metric},\(.value[1]),\(.labels.instance),\(.labels.job)\"" \
    >> "$ARCHIVE_FILE" 2>/dev/null || true
done

# Compress if file is not empty
if [ -s "$ARCHIVE_FILE" ]; then
  gzip "$ARCHIVE_FILE"
  echo "Archived metrics to $ARCHIVE_FILE.gz"

  # Keep only last 30 days
  find "$ARCHIVE_DIR" -name "metrics_*.csv.gz" -mtime +30 -delete
else
  rm "$ARCHIVE_FILE"
  echo "No metrics to archive"
fi
ARCHIVESCRIPT

  chmod 755 /usr/local/bin/wise2-metrics-archive
  log_success "Metrics archival script created at /usr/local/bin/wise2-metrics-archive"
}

##############################################################################
# 11. Setup Cron Jobs
##############################################################################

setup_cron_jobs() {
  log_info "Setting up cron jobs..."

  CRON_JOB="0 2 * * * /usr/local/bin/wise2-metrics-archive"

  # Check if cron job already exists
  if crontab -l 2>/dev/null | grep -q "wise2-metrics-archive"; then
    log_warn "Cron job already exists"
  else
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log_success "Cron job added (runs daily at 2 AM)"
  fi
}

##############################################################################
# 12. Create Alert Configuration
##############################################################################

create_alert_config() {
  log_info "Creating alert configuration..."

  cat > "$ALERT_CONFIG" << EOF
{
  "slack_webhook": "$SLACK_WEBHOOK",
  "alert_email": "$ALERT_EMAIL",
  "alert_destinations": {
    "slack": $([ -n "$SLACK_WEBHOOK" ] && echo "true" || echo "false"),
    "email": $([ -n "$ALERT_EMAIL" ] && echo "true" || echo "false")
  }
}
EOF

  chmod 600 "$ALERT_CONFIG"
  log_success "Alert configuration created at $ALERT_CONFIG"
}

##############################################################################
# 13. Start Services
##############################################################################

start_services() {
  log_info "Starting services..."

  systemctl enable prometheus
  systemctl start prometheus
  log_success "Prometheus started and enabled"

  systemctl enable node-exporter
  systemctl start node-exporter
  log_success "Node Exporter started and enabled"

  if command -v docker >/dev/null 2>&1; then
    systemctl enable cadvisor
    systemctl start cadvisor
    log_success "cAdvisor started and enabled"
  fi

  if [ "$WITH_GRAFANA" == "true" ] && systemctl list-unit-files | grep -q grafana-server; then
    systemctl enable grafana-server
    systemctl start grafana-server
    log_success "Grafana started and enabled"
  fi
}

##############################################################################
# 14. Verify Installation
##############################################################################

verify_installation() {
  log_info "Verifying installation..."

  sleep 2

  # Check Prometheus
  if curl -s http://localhost:9090/-/healthy >/dev/null 2>&1; then
    log_success "Prometheus is running"
  else
    log_error "Prometheus failed to start"
  fi

  # Check Node Exporter
  if curl -s http://localhost:9100/metrics >/dev/null 2>&1; then
    log_success "Node Exporter is running"
  else
    log_error "Node Exporter failed to start"
  fi

  # Check cAdvisor
  if curl -s http://localhost:8080/metrics >/dev/null 2>&1; then
    log_success "cAdvisor is running"
  else
    log_warn "cAdvisor is not running (Docker may not be available)"
  fi
}

##############################################################################
# 15. Print Summary
##############################################################################

print_summary() {
  echo ""
  echo "=========================================="
  echo -e "${GREEN}WISE² Raspberry Pi Monitoring Setup Complete${NC}"
  echo "=========================================="
  echo ""
  echo -e "${BLUE}Access Points:${NC}"
  echo "  Prometheus UI:  http://$(hostname -I | awk '{print $1}'):9090"
  echo "  Node Exporter:  http://$(hostname -I | awk '{print $1}'):9100/metrics"
  if command -v docker >/dev/null 2>&1; then
    echo "  cAdvisor:       http://$(hostname -I | awk '{print $1}'):8080"
  fi
  if [ "$WITH_GRAFANA" == "true" ]; then
    echo "  Grafana:        http://$(hostname -I | awk '{print $1}'):3000"
  fi
  echo ""
  echo -e "${BLUE}Configuration Files:${NC}"
  echo "  Prometheus config:  $PROMETHEUS_CONFIG"
  echo "  Alert rules:        $PROMETHEUS_RULES"
  echo "  Alert config:       $ALERT_CONFIG"
  echo ""
  echo -e "${BLUE}Service Management:${NC}"
  echo "  Start:    systemctl start prometheus node-exporter"
  echo "  Stop:     systemctl stop prometheus node-exporter"
  echo "  Status:   systemctl status prometheus"
  echo "  Logs:     journalctl -u prometheus -f"
  echo ""
  echo -e "${BLUE}Metrics Being Collected:${NC}"
  echo "  • CPU usage and load average"
  echo "  • Memory (total, available, used, cached)"
  echo "  • Disk I/O and space usage"
  echo "  • Network I/O (bytes sent/received)"
  echo "  • File descriptors"
  echo "  • Process metrics"
  echo "  • System temperature (if available)"
  echo "  • Container resource usage (via cAdvisor)"
  echo ""
  echo -e "${BLUE}Alert Rules Active:${NC}"
  echo "  • CPU > 80% for 5 minutes"
  echo "  • Memory > 85%"
  echo "  • Disk > 90%"
  echo "  • System temperature > 80°C"
  echo "  • Filesystem read-only condition"
  echo "  • Container restarting detection"
  echo ""
  if [ -n "$SLACK_WEBHOOK" ]; then
    echo -e "${BLUE}Alert Destinations:${NC}"
    echo "  ✓ Slack webhook configured"
  fi
  if [ -n "$ALERT_EMAIL" ]; then
    echo "  ✓ Email alerts to: $ALERT_EMAIL"
  fi
  echo ""
  echo -e "${BLUE}Data Retention:${NC}"
  echo "  • Time series: 15 days"
  echo "  • CSV archive: 30 days"
  echo "  • Archive location: $METRICS_ARCHIVE"
  echo "  • Archival job: Daily at 2 AM"
  echo ""
  echo -e "${BLUE}Next Steps:${NC}"
  echo "  1. View Prometheus UI: http://$(hostname -I | awk '{print $1}'):9090"
  echo "  2. Check 'Targets' page to verify all exporters are scraping"
  echo "  3. Add datasource to Grafana if using it"
  echo "  4. Create dashboards for custom metrics"
  echo "  5. Adjust alert thresholds as needed in $PROMETHEUS_RULES"
  echo ""
  echo "=========================================="
  echo ""
}

##############################################################################
# Main Execution
##############################################################################

main() {
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║   WISE² Raspberry Pi Monitoring Setup v1.0          ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
  echo ""

  check_root
  detect_arch

  log_info "Starting monitoring stack installation..."
  echo ""

  install_dependencies
  setup_prometheus_user
  install_prometheus
  install_node_exporter
  configure_prometheus
  configure_alert_rules
  create_alert_handler
  create_prometheus_service
  create_node_exporter_service
  create_cadvisor_service
  install_grafana
  create_archival_script
  create_alert_config
  setup_cron_jobs
  start_services
  sleep 2
  verify_installation
  print_summary
}

main "$@"
