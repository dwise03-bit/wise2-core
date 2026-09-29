#!/usr/bin/env bash

##############################################################################
# WISE² Raspberry Pi Power Stability Fix
#
# Reduces boot-time power draw and CPU frequency to help stop reboot loops
# caused by undervoltage, weak PSUs, or aggressive default clock settings.
#
# Usage:
#   bash pi/scripts/fix-power-stability.sh
#
##############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

detect_config_file() {
    local candidates=(
        "/boot/firmware/config.txt"
        "/boot/config.txt"
    )

    for candidate in "${candidates[@]}"; do
        if [ -f "$candidate" ]; then
            echo "$candidate"
            return 0
        fi
    done

    return 1
}

ensure_line() {
    local file="$1"
    local line="$2"
    local pattern
    pattern="$(printf '%s' "$line" | sed 's/[.[\*^$(){}+?|\/]/\\&/g')"

    if grep -qE "^[[:space:]]*${pattern}[[:space:]]*$" "$file"; then
        return 0
    fi

    echo "$line" | sudo tee -a "$file" >/dev/null
}

set_key_value() {
    local file="$1"
    local key="$2"
    local value="$3"

    if grep -qE "^[[:space:]]*#?[[:space:]]*${key}=" "$file"; then
        sudo sed -i -E "s|^[[:space:]]*#?[[:space:]]*${key}=.*|${key}=${value}|" "$file"
    else
        echo "${key}=${value}" | sudo tee -a "$file" >/dev/null
    fi
}

main() {
    if ! command -v sudo >/dev/null 2>&1; then
        error "sudo is required"
    fi

    local config_file
    if ! config_file="$(detect_config_file)"; then
        error "Could not find Raspberry Pi config.txt in /boot/firmware or /boot"
    fi

    log "Using boot config: $config_file"

    local backup="${config_file}.bak.$(date +%Y%m%d-%H%M%S)"
    sudo cp "$config_file" "$backup"
    success "Backed up current config to ${backup}"

    log "Applying conservative power settings"
    set_key_value "$config_file" "arm_freq" "800"
    set_key_value "$config_file" "core_freq" "250"
    set_key_value "$config_file" "force_turbo" "0"
    set_key_value "$config_file" "over_voltage" "0"
    set_key_value "$config_file" "gpu_mem" "16"
    set_key_value "$config_file" "temp_soft_limit" "60"
    ensure_line "$config_file" "dtparam=audio=off"
    ensure_line "$config_file" "dtoverlay=disable-wifi"
    ensure_line "$config_file" "dtoverlay=disable-bt"
    ensure_line "$config_file" "arm_boost=0"
    ensure_line "$config_file" "camera_auto_detect=0"
    ensure_line "$config_file" "display_auto_detect=0"

    log "Current hardware throttle status"
    if command -v vcgencmd >/dev/null 2>&1; then
        vcgencmd get_throttled || true
        vcgencmd measure_temp || true
    else
        warning "vcgencmd is not available; reboot and run it again if needed"
    fi

    echo ""
    success "Power stability settings applied"
    echo "Reboot the Pi to load the new settings:"
    echo "  sudo reboot"
    echo ""
    echo "If reboot loops continue after this, the remaining causes are usually:"
    echo "  - weak or failing PSU"
    echo "  - bad USB-C/micro-USB cable"
    echo "  - overheating"
    echo "  - SD card corruption"
}

main "$@"
