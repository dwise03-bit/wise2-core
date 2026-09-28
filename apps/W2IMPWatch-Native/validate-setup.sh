#!/bin/bash
# W² IMP Watch — Setup Validation Script
# Checks that all source files and assets are in place

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="W2IMPWatch-Native"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "W² IMP Watch — Setup Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Track status
ERRORS=0
WARNINGS=0

# Helper functions
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo "✓ $description"
    else
        echo "✗ MISSING: $description"
        echo "  Expected: $file"
        ERRORS=$((ERRORS + 1))
    fi
}

check_dir() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        echo "✓ $description"
    else
        echo "✗ MISSING: $description"
        echo "  Expected: $dir"
        ERRORS=$((ERRORS + 1))
    fi
}

check_image() {
    local image=$1
    local name=$2

    if [ -f "$SCRIPT_DIR/source-assets/assets/$image" ]; then
        local size=$(stat -f%z "$SCRIPT_DIR/source-assets/assets/$image" 2>/dev/null || echo "0")
        local size_mb=$(echo "scale=2; $size / 1048576" | bc)
        echo "✓ Asset: $name ($size_mb MB)"
    else
        echo "✗ MISSING: $name"
        echo "  Expected: source-assets/assets/$image"
        ERRORS=$((ERRORS + 1))
    fi
}

# Check Swift source files
echo "📂 Source Files"
echo "─────────────────────────────────────────"
check_file "$SCRIPT_DIR/W2IMPWatchApp.swift" "Main app entry point"
check_file "$SCRIPT_DIR/ContentView.swift" "Content view (UI + interaction)"
check_file "$SCRIPT_DIR/WatchState.swift" "State management"
echo ""

# Check configuration files
echo "⚙️  Configuration Files"
echo "─────────────────────────────────────────"
check_file "$SCRIPT_DIR/Info.plist" "App configuration (Info.plist)"
check_file "$SCRIPT_DIR/README.md" "README documentation"
check_file "$SCRIPT_DIR/BUILD_INSTRUCTIONS.md" "Build instructions"
echo ""

# Check image assets
echo "🎨 Image Assets"
echo "─────────────────────────────────────────"
check_image "02_idle_state.png" "Idle state"
check_image "03_wake_state.png" "Wake state"
check_image "04_charging_state.png" "Charging state"
check_image "05_notification_state.png" "Notification state"
check_image "06_night_mode.png" "Night mode"
check_image "07_always_on_mode.png" "Always-On mode"
echo ""

# Check reference materials
echo "📚 Reference Materials"
echo "─────────────────────────────────────────"
check_dir "$SCRIPT_DIR/source-assets" "Source assets directory"
check_file "$SCRIPT_DIR/source-assets/boards/08_wake_loop_storyboard.png" "Wake loop storyboard"
check_file "$SCRIPT_DIR/source-assets/boards/09_asset_system_concept_board.png" "Asset system board"
echo ""

# Check Xcode project (if already created)
echo "🔨 Xcode Project Status"
echo "─────────────────────────────────────────"
if [ -d "$SCRIPT_DIR/../W2IMPWatch" ]; then
    echo "✓ Xcode project exists: apps/W2IMPWatch/"

    if [ -f "$SCRIPT_DIR/../W2IMPWatch/W2IMPWatch.xcodeproj/project.pbxproj" ]; then
        echo "✓ Project file found"
    else
        echo "⚠ Project file not found (may need to regenerate)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "ℹ Xcode project not yet created"
    echo "  → Follow BUILD_INSTRUCTIONS.md to create it"
fi
echo ""

# Check Xcode installation
echo "🍎 System Requirements"
echo "─────────────────────────────────────────"
if command -v xcode-select &> /dev/null; then
    XCODE_PATH=$(xcode-select -p)
    if [ -d "$XCODE_PATH" ]; then
        echo "✓ Xcode is installed: $XCODE_PATH"
    else
        echo "✗ Xcode installation appears broken"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "✗ Xcode command-line tools not found"
    echo "  → Run: xcode-select --install"
    ERRORS=$((ERRORS + 1))
fi

if command -v swift &> /dev/null; then
    SWIFT_VERSION=$(swift --version)
    echo "✓ Swift available: $SWIFT_VERSION"
else
    echo "✗ Swift compiler not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo "✅ Setup validation PASSED"
    if [ $WARNINGS -gt 0 ]; then
        echo "   ($WARNINGS warnings — see above)"
    fi
    echo ""
    echo "Next steps:"
    echo "1. Follow BUILD_INSTRUCTIONS.md to create Xcode project"
    echo "2. Copy Swift files to Xcode project"
    echo "3. Import image assets to Assets.xcassets"
    echo "4. Build and run on simulator or physical watch"
    exit 0
else
    echo "❌ Setup validation FAILED"
    echo "   $ERRORS error(s) found — see above"
    echo ""
    echo "Fix these issues before continuing:"
    echo "• Re-extract zip files if any assets are missing"
    echo "• Ensure all source files are present"
    echo "• Check file permissions (chmod +x if needed)"
    exit 1
fi
