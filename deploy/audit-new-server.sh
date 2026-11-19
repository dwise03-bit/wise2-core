#!/bin/bash

#
# WISE² Server Audit Script
#
# Run this on the new server to audit its current state
# Usage: bash audit-new-server.sh > /tmp/audit-report.txt
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Server Audit                                        ║"
echo "║                                                              ║"
echo "║  Inventorying server resources and services                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Generated at: $(date)"
echo ""

# System Information
echo "════════════════════════════════════════════════════════════════"
echo "SYSTEM INFORMATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Hostname: $(hostname)"
echo "OS: $(uname -s)"
echo "Release: $(lsb_release -d 2>/dev/null | cut -f2 || uname -r)"
echo "Kernel: $(uname -r)"
echo ""

# CPU
echo "CPU Information:"
nproc && echo "Cores: $(nproc)"
grep -E '^model name' /proc/cpuinfo | head -1
echo ""

# Memory
echo "Memory:"
free -h | grep Mem
echo ""

# Disk
echo "Disk Space:"
df -h / | tail -1
echo ""

# Network
echo "════════════════════════════════════════════════════════════════"
echo "NETWORK CONFIGURATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "IP Addresses:"
ip -4 addr show 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -10
echo ""

echo "Tailscale Status:"
if command -v tailscale &> /dev/null; then
  tailscale status 2>/dev/null || echo "Tailscale not running"
else
  echo "⚠️  Tailscale not installed"
fi
echo ""

echo "Active Network Interfaces:"
ip link show 2>/dev/null | grep -E '^[0-9]+:' | head -10
echo ""

# Installed Services
echo "════════════════════════════════════════════════════════════════"
echo "INSTALLED SERVICES & TOOLS"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Docker:"
if command -v docker &> /dev/null; then
  docker --version
  echo "Docker service: $(systemctl is-active docker 2>/dev/null || echo 'unknown')"
else
  echo "⚠️  Docker not installed"
fi
echo ""

echo "Docker Compose:"
if command -v docker-compose &> /dev/null; then
  docker-compose --version
else
  echo "⚠️  Docker Compose not installed"
fi
echo ""

echo "Node.js:"
if command -v node &> /dev/null; then
  node --version
  npm --version
else
  echo "⚠️  Node.js not installed"
fi
echo ""

echo "Hermes:"
if command -v hermes &> /dev/null; then
  hermes --version
else
  echo "⚠️  Hermes not installed"
fi
echo ""

echo "Git:"
if command -v git &> /dev/null; then
  git --version
else
  echo "⚠️  Git not installed"
fi
echo ""

echo "PostgreSQL:"
if command -v psql &> /dev/null; then
  psql --version
else
  echo "⚠️  PostgreSQL not installed"
fi
echo ""

echo "Redis:"
if command -v redis-cli &> /dev/null; then
  redis-cli --version
else
  echo "⚠️  Redis not installed"
fi
echo ""

# Running Services
echo "════════════════════════════════════════════════════════════════"
echo "RUNNING SERVICES"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Docker Containers:"
if command -v docker &> /dev/null; then
  docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "Docker not accessible"
else
  echo "No docker containers"
fi
echo ""

echo "Systemd Services (active):"
systemctl list-units --type=service --state=running --all --no-pager 2>/dev/null | grep -E '^[a-z]' | head -20 || echo "Could not query systemd"
echo ""

# Ports
echo "════════════════════════════════════════════════════════════════"
echo "OPEN PORTS"
echo "════════════════════════════════════════════════════════════════"
echo ""

if command -v ss &> /dev/null; then
  echo "Listening ports:"
  ss -tuln 2>/dev/null | grep LISTEN || echo "No ports listening"
else
  echo "netstat -tuln:"
  netstat -tuln 2>/dev/null | grep LISTEN || echo "netstat not available"
fi
echo ""

# Directories
echo "════════════════════════════════════════════════════════════════"
echo "IMPORTANT DIRECTORIES"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Home directory:"
ls -la ~ 2>/dev/null | grep -E '^d|^-' | head -20
echo ""

echo "wise2-core repository:"
if [ -d ~/wise2-core ]; then
  echo "✅ Found at ~/wise2-core"
  cd ~/wise2-core
  git branch -a 2>/dev/null | head -10
  echo ""
else
  echo "⚠️  ~/wise2-core not found"
fi
echo ""

# Firewall
echo "════════════════════════════════════════════════════════════════"
echo "FIREWALL STATUS"
echo "════════════════════════════════════════════════════════════════"
echo ""

if command -v ufw &> /dev/null; then
  ufw status 2>/dev/null || echo "UFW not running"
else
  echo "UFW not installed"
fi
echo ""

# Environment Variables
echo "════════════════════════════════════════════════════════════════"
echo "ENVIRONMENT VARIABLES (KEY WISE² VARS)"
echo "════════════════════════════════════════════════════════════════"
echo ""

env | grep -iE 'WISE|HERMES|NODE_ENV|API|DATABASE|REDIS' | sort
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "READINESS CHECKLIST"
echo "════════════════════════════════════════════════════════════════"
echo ""

READY=0
TOTAL=0

# Check items
check_item() {
  TOTAL=$((TOTAL + 1))
  if eval "$1" &>/dev/null; then
    echo "✅ $2"
    READY=$((READY + 1))
  else
    echo "⚠️  $2"
  fi
}

check_item "command -v docker" "Docker installed"
check_item "command -v node" "Node.js installed"
check_item "command -v git" "Git installed"
check_item "command -v tailscale" "Tailscale installed"
check_item "[ -d ~/wise2-core ]" "wise2-core repository cloned"
check_item "command -v hermes" "Hermes installed"

echo ""
echo "Readiness: $READY/$TOTAL"
echo ""

if [ $READY -eq $TOTAL ]; then
  echo "✅ Server is READY for Hermes integration"
else
  echo "⚠️  Server needs setup. Run: bash deploy/02-vps-setup.sh"
fi
echo ""
