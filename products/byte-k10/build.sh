#!/usr/bin/env bash
#
# WISE² BYTE MINI 4.0 — UNIHIKER K10 build / flash / monitor
#
#   ./build.sh            compile only
#   ./build.sh flash      compile + upload
#   ./build.sh monitor    compile + upload + serial monitor
#   ./build.sh ota        compile + upload OVER WIFI (no cable)
#
# OTA requires the dual-slot partitions.csv beside this script; the stock
# DFRobot table has a single `factory` app and cannot OTA at all.
#
# WHY THE TFT FLAGS EXIST
# -----------------------
# TFT_eSPI is configured here entirely through -D flags, with
# USER_SETUP_LOADED=1 telling the library to ignore every User_Setup.h on the
# machine. This is deliberate and load-bearing:
#
#   1. A stock, mis-configured TFT_eSPI in ~/Documents/Arduino/libraries was
#      silently overriding DFRobot's correct copy (Arduino gives user libraries
#      priority). It pointed SPI at ESP8266 NodeMCU pins, so nothing ever
#      reached the panel while every call reported success. Pinning the config
#      here makes that class of bug impossible.
#   2. It lets us raise SPI_FREQUENCY above the vendor's 40 MHz. A 240x320
#      16-bit frame is 1,228,800 bits; at 40 MHz that is ~31 ms/frame, a hard
#      ceiling of ~32 FPS. At 80 MHz the ceiling is ~65 FPS.
#
# Pin values are from docs/HARDWARE_PINMAP.md (sourced from DFRobot's core).
set -euo pipefail

SKETCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FQBN="UNIHIKER:esp32:k10:CDCOnBoot=cdc"     # CDCOnBoot required: no HW UART on K10
PORT="${K10_PORT:-/dev/cu.usbmodem101}"
CORE_TFT="$HOME/Library/Arduino15/packages/UNIHIKER/hardware/esp32/0.0.5/libraries/TFT_eSPI"

TFT_FLAGS="\
-DUSER_SETUP_LOADED=1 \
-DILI9341_DRIVER=1 \
-DTFT_WIDTH=240 \
-DTFT_HEIGHT=320 \
-DTFT_MOSI=21 \
-DTFT_SCLK=12 \
-DTFT_CS=14 \
-DTFT_DC=13 \
-DTFT_RST=-1 \
-DTFT_MISO=-1 \
-DLOAD_GLCD=1 \
-DLOAD_FONT2=1 \
-DLOAD_FONT4=1 \
-DLOAD_GFXFF=1 \
-DSMOOTH_FONT=1 \
-DSPI_FREQUENCY=80000000 \
-DSPI_READ_FREQUENCY=20000000"

echo "==> Compiling BYTE for UNIHIKER K10"
arduino-cli compile \
    --fqbn "$FQBN" \
    --library "$CORE_TFT" \
    --build-property "compiler.cpp.extra_flags=$TFT_FLAGS" \
    --build-property "compiler.c.extra_flags=$TFT_FLAGS" \
    "$SKETCH_DIR"

if [[ "${1:-}" == "flash" || "${1:-}" == "monitor" ]]; then
    echo "==> Uploading to $PORT"
    arduino-cli upload --fqbn "$FQBN" -p "$PORT" "$SKETCH_DIR"
fi

if [[ "${1:-}" == "ota" ]]; then
    # espota.py ships with the core. The device advertises as byte-k10 while
    # the OTA app is open; pass K10_OTA_HOST=<ip> if mDNS does not resolve.
    ESPOTA=$(find "$HOME/Library/Arduino15/packages" -name espota.py 2>/dev/null | head -1)
    HOST="${K10_OTA_HOST:-byte-k10.local}"
    BIN="$SKETCH_DIR/build/UNIHIKER.esp32.k10/$(basename "$SKETCH_DIR").ino.bin"
    [[ -f "$BIN" ]] || BIN=$(find "$SKETCH_DIR/build" -name "*.ino.bin" | head -1)
    echo "==> OTA to $HOST"
    echo "    binary: $BIN"
    python3 "$ESPOTA" -i "$HOST" -f "$BIN" -p 3232 --progress -d
    exit $?
fi

if [[ "${1:-}" == "monitor" ]]; then
    echo "==> Serial monitor (ctrl-c to exit)"
    sleep 2
    arduino-cli monitor -p "$PORT" -c baudrate=115200
fi
