#!/bin/bash
# BLAKKHAIL PORT MONITORING & DRIFT PREVENTION
# Monitors port usage and alerts on unauthorized changes

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONFIG="/opt/wise2-core/blakkhail-ports.conf"
BASELINE="/tmp/blakkhail-ports-baseline.txt"
CURRENT="/tmp/blakkhail-ports-current.txt"
LOG="/var/log/blakkhail-port-monitor.log"

# Colors
echo_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️ $1" | tee -a "$LOG"
}

echo_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG"
}

# Get current port status
get_port_status() {
    sudo netstat -tlnp 2>/dev/null | grep LISTEN | awk '{print $4, $7}' | sed 's/\/.*\//\//g' | sort > "$CURRENT"
}

# Initialize baseline
init_baseline() {
    echo_status "Initializing port baseline..."
    get_port_status
    cp "$CURRENT" "$BASELINE"
    echo_status "✅ Baseline created with $(wc -l < "$BASELINE") listening ports"
}

# Check for port drift
check_drift() {
    get_port_status
    
    # Ports added
    new_ports=$(comm -23 "$CURRENT" "$BASELINE")
    if [ -n "$new_ports" ]; then
        echo_warning "NEW PORTS DETECTED:"
        echo "$new_ports" | while read port service; do
            echo_warning "  + $port ($service)"
        done
    fi
    
    # Ports removed
    removed_ports=$(comm -13 "$CURRENT" "$BASELINE")
    if [ -n "$removed_ports" ]; then
        echo_warning "PORTS REMOVED:"
        echo "$removed_ports" | while read port service; do
            echo_warning "  - $port ($service)"
        done
    fi
    
    # Check critical ports
    echo_status "Verifying critical ports..."
    critical_ports="22 80 3001 8443"
    for port in $critical_ports; do
        if grep -q "0.0.0.0:$port" "$CURRENT" || grep -q "::.*:$port" "$CURRENT"; then
            echo_status "  ✅ Port $port: ACTIVE"
        else
            echo_error "  ❌ Port $port: MISSING"
        fi
    done
}

# Prevent unauthorized services
prevent_drift() {
    echo_status "Checking for unauthorized services..."
    
    # Services that should NOT be running
    unauthorized="telnet rsync"
    
    for service in $unauthorized; do
        if netstat -tlnp 2>/dev/null | grep -i "$service"; then
            echo_error "UNAUTHORIZED SERVICE DETECTED: $service"
            return 1
        fi
    done
    
    echo_status "✅ No unauthorized services detected"
}

# Generate report
generate_report() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   BLAKKHAIL PORT STATUS REPORT                         ║"
    echo "║   $(date '+%Y-%m-%d %H:%M:%S')                          ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 LISTENING PORTS: $(wc -l < "$CURRENT")"
    echo ""
    echo "🔴 CRITICAL PORTS STATUS:"
    echo "  Port 22 (SSH):    $(grep "0.0.0.0:22" "$CURRENT" > /dev/null && echo '✅' || echo '❌')"
    echo "  Port 80 (HTTP):   $(grep "0.0.0.0:80" "$CURRENT" > /dev/null && echo '✅' || echo '❌')"
    echo "  Port 443 (HTTPS): $(grep "0.0.0.0:443" "$CURRENT" > /dev/null && echo '✅' || echo '❌')"
    echo "  Port 8443 (ALT):  $(grep "0.0.0.0:8443" "$CURRENT" > /dev/null && echo '✅' || echo '❌')"
    echo "  Port 3001 (APP):  $(grep "0.0.0.0:3001" "$CURRENT" > /dev/null && echo '✅' || echo '❌')"
    echo ""
    echo "📝 TOP SERVICES:"
    head -10 "$CURRENT" | awk '{print "  " $1 " - " $2}'
}

# Main
main() {
    case "${1:-status}" in
        init)
            init_baseline
            ;;
        check)
            check_drift
            ;;
        prevent)
            prevent_drift
            ;;
        report)
            generate_report
            ;;
        monitor)
            echo_status "Starting port monitor..."
            while true; do
                clear
                check_drift
                generate_report
                echo ""
                echo "🔄 Next check in 60 seconds... (Press Ctrl+C to stop)"
                sleep 60
            done
            ;;
        *)
            echo "Usage: $0 {init|check|prevent|report|monitor}"
            echo ""
            echo "  init     - Initialize port baseline"
            echo "  check    - Check for port drift"
            echo "  prevent  - Check for unauthorized services"
            echo "  report   - Generate port status report"
            echo "  monitor  - Continuous monitoring mode"
            exit 1
            ;;
    esac
}

main "$@"
