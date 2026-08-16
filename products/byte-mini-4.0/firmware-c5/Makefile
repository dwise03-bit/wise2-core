.PHONY: help build clean reconfigure set-target flash monitor docker-build validate

SHELL := /bin/bash

help:
	@echo "╔═══════════════════════════════════════════════════════════╗"
	@echo "║   BYTE MINI 4.0 - ESP32-C6 Firmware Build Targets         ║"
	@echo "╚═══════════════════════════════════════════════════════════╝"
	@echo
	@echo "Quick start:"
	@echo "  make build           # Full native build"
	@echo "  make docker-build    # Build in Docker container"
	@echo "  make flash           # Flash to connected device"
	@echo
	@echo "Configuration:"
	@echo "  make set-target      # Configure for esp32c6"
	@echo "  make reconfigure     # Reconfigure CMake"
	@echo "  make clean           # Clean build artifacts"
	@echo
	@echo "Debugging:"
	@echo "  make validate        # Verify build configuration"
	@echo "  make monitor         # Open serial monitor (requires prior flash)"
	@echo

validate:
	@echo "=== Validating Build Configuration ==="
	@echo
	@echo "Checking CMakeLists.txt order..."
	@grep -q "include(\$$ENV{IDF_PATH}" CMakeLists.txt && echo "  ✓ include() found" || (echo "  ✗ include() missing" && exit 1)
	@echo
	@echo "Checking components..."
	@[ ! -f src/CMakeLists.txt ] && echo "  ✓ src/ component disabled" || (echo "  ✗ src/ still active" && exit 1)
	@grep -q "arduino" main/CMakeLists.txt && echo "  ✓ Arduino component in main" || (echo "  ✗ Arduino missing" && exit 1)
	@echo
	@echo "Checking sdkconfig..."
	@grep -q "CONFIG_IDF_TARGET=\"esp32c6\"" sdkconfig && echo "  ✓ ESP32-C6 configured" || (echo "  ✗ Target not configured" && exit 1)
	@echo
	@echo "✓ Configuration valid - ready to build"

set-target:
	@. /Users/danielwise/esp/esp-idf/export.sh >/dev/null 2>&1 && \
	idf.py set-target esp32c6 && \
	echo "✓ Target set to esp32c6"

reconfigure: set-target
	@. /Users/danielwise/esp/esp-idf/export.sh >/dev/null 2>&1 && \
	idf.py reconfigure && \
	echo "✓ CMake reconfigured"

build: reconfigure
	@echo "Building BYTE MINI 4.0 firmware..."
	@. /Users/danielwise/esp/esp-idf/export.sh >/dev/null 2>&1 && \
	idf.py build -v 2>&1 | tee build.log
	@echo
	@echo "Build outputs:"
	@ls -lh build/byte_mini_4.bin build/byte_mini_4.elf 2>/dev/null || echo "  (not found)"

docker-build: validate
	@echo "Building in Docker container (espressif/idf:v5.3)..."
	@docker build -f Dockerfile.build -t byte-mini-build:v5.3 .
	@echo "✓ Docker build completed"

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf build
	@rm -f sdkconfig
	@echo "✓ Cleaned"

flash: build
	@echo
	@echo "Available serial ports:"
	@ls -1 /dev/cu.* 2>/dev/null || echo "  (none found)"
	@echo
	@echo "To flash, run:"
	@echo "  idf.py -p /dev/cu.<port> flash monitor"
	@echo
	@echo "Or use: make monitor PORT=/dev/cu.<port>"

monitor:
	@if [ -z "$(PORT)" ]; then \
		echo "Usage: make monitor PORT=/dev/cu.<port>"; \
		echo "Available ports:"; \
		ls -1 /dev/cu.*; \
	else \
		. /Users/danielwise/esp/esp-idf/export.sh >/dev/null 2>&1 && \
		idf.py -p $(PORT) monitor; \
	fi
