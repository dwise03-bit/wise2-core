#!/usr/bin/env bash

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

check_service() {
    if systemctl is-active --quiet "$1"; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

echo
echo "=================================="
echo "      WISE OS SYSTEM DOCTOR"
echo "=================================="
echo

echo "Operating System"
hostnamectl | grep "Operating System"

echo
echo "Kernel"
uname -r

echo
echo "Disk Usage"
df -h /

echo
echo "Memory"
free -h

echo
echo "Temperature"
vcgencmd measure_temp 2>/dev/null || echo "Unavailable"

echo
echo "Services"

check_service bluetooth
check_service docker
check_service mosquitto

echo
echo "PipeWire"

if command -v wpctl >/dev/null; then
    wpctl status >/dev/null && \
    echo -e "${GREEN}✓ PipeWire${NC}" || \
    echo -e "${RED}✗ PipeWire${NC}"
else
    echo -e "${YELLOW}! PipeWire not installed${NC}"
fi

echo
echo "Git"

git --version

echo
echo "Docker"

docker --version 2>/dev/null || echo "Docker not installed"

echo
echo "Bluetooth"

bluetoothctl show | grep Powered

echo
echo "Doctor Complete"
