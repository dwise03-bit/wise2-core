#!/bin/bash
# WISE² Sound Labs MIDI Bridge - Installation Script
# Validates environment and sets up Python dependencies

set -e

BRIDGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_VERSION="3.12"
VENV_DIR="$BRIDGE_DIR/venv"

echo "🎵 WISE² Sound Labs MIDI Bridge Installation"
echo "============================================="
echo ""

# Check Python version
echo "Checking Python $PYTHON_VERSION..."
if ! command -v python$PYTHON_VERSION &> /dev/null; then
    echo "❌ Python $PYTHON_VERSION not found"
    echo "Install via: brew install python@$PYTHON_VERSION"
    exit 1
fi

PYTHON_PATH=$(which python$PYTHON_VERSION)
echo "✅ Found Python: $PYTHON_PATH"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment already exists. Skipping..."
else
    $PYTHON_PATH -m venv "$VENV_DIR"
    echo "✅ Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"
echo "✅ Virtual environment active"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
echo "✅ Pip upgraded"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip install -r "$BRIDGE_DIR/requirements.txt" > /dev/null 2>&1
echo "✅ Dependencies installed"
echo ""

# Check REAPER bridge
echo "Checking REAPER bridge..."
if curl -s http://127.0.0.1:8787/health > /dev/null 2>&1; then
    echo "✅ REAPER bridge is running (port 8787)"
else
    echo "⚠️  REAPER bridge not responding"
    echo "Start with: reaper-bridge"
fi
echo ""

# Check Ollama
echo "Checking Ollama..."
if curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running (port 11434)"
    MODELS=$(curl -s http://127.0.0.1:11434/api/tags | grep -o '"name":"[^"]*"' | head -3)
    echo "   Models: $MODELS"
else
    echo "⚠️  Ollama not responding"
    echo "Start with: open /Applications/Ollama.app"
fi
echo ""

# Check MIDI devices
echo "Checking MIDI devices..."
if python3 -c "import mido; ports = mido.get_input_names(); print('Available ports:', ports)" 2>/dev/null; then
    echo "✅ MIDI system operational"
else
    echo "⚠️  Error checking MIDI"
fi
echo ""

# Configuration
echo "Configuring environment..."
if [ ! -f "$BRIDGE_DIR/.env" ]; then
    echo "Creating .env file..."
    cat > "$BRIDGE_DIR/.env" << 'EOF'
# WISE² Sound Labs MIDI Bridge Configuration
BRIDGE_HOST=127.0.0.1
BRIDGE_PORT=8788
BRIDGE_TOKEN=wise2-sound-labs-test-token

# REAPER Bridge
REAPER_BRIDGE_URL=http://127.0.0.1:8787
REAPER_BRIDGE_TOKEN=your-reaper-token

# Ollama
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5-coder:7b

# Logging
LOG_LEVEL=INFO
DEBUG=false
EOF
    echo "✅ .env created (edit as needed)"
else
    echo "✅ .env already exists"
fi
echo ""

# Summary
echo "Installation Complete! ✅"
echo ""
echo "Next steps:"
echo "  1. Edit .env if needed"
echo "  2. Run: source $VENV_DIR/bin/activate && python main.py"
echo "  3. Test: curl http://127.0.0.1:8788/health"
echo "  4. WebSocket: wscat -c ws://127.0.0.1:8788/ws/state"
echo ""
echo "To install as launchd service:"
echo "  cp com.wise2.sound-labs-bridge.plist ~/Library/LaunchAgents/"
echo "  launchctl load ~/Library/LaunchAgents/com.wise2.sound-labs-bridge.plist"
echo ""
