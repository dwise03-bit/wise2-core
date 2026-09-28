#!/bin/bash

# W² IMP Watch — Quick Setup for Xcode
# This creates the project structure ready to open in Xcode

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$PROJECT_DIR/../W2IMPWatch-Native"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "W² IMP Watch Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Create project structure
echo "📁 Setting up project directories..."
mkdir -p "$PROJECT_DIR/W2IMPWatch"
mkdir -p "$PROJECT_DIR/W2IMPWatch/Assets.xcassets"
echo "✓ Directories created"
echo ""

# Step 2: Copy Swift files
echo "📝 Copying source files..."
cp "$SOURCE_DIR/W2IMPWatchApp.swift" "$PROJECT_DIR/W2IMPWatch/"
cp "$SOURCE_DIR/ContentView.swift" "$PROJECT_DIR/W2IMPWatch/"
cp "$SOURCE_DIR/WatchState.swift" "$PROJECT_DIR/W2IMPWatch/"
cp "$SOURCE_DIR/Info.plist" "$PROJECT_DIR/W2IMPWatch/"
echo "✓ W2IMPWatchApp.swift"
echo "✓ ContentView.swift"
echo "✓ WatchState.swift"
echo "✓ Info.plist"
echo ""

# Step 3: Create Assets.xcassets structure
echo "🎨 Setting up image assets..."
ASSETS_DIR="$PROJECT_DIR/W2IMPWatch/Assets.xcassets"

cat > "$ASSETS_DIR/Contents.json" << 'EOF'
{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

# Copy images
for img in 02_idle_state 03_wake_state 04_charging_state 05_notification_state 06_night_mode 07_always_on_mode; do
    IMAGESET="$ASSETS_DIR/${img}.imageset"
    mkdir -p "$IMAGESET"

    cat > "$IMAGESET/Contents.json" << 'IMAGEJSON'
{
  "images" : [
    {
      "filename" : "IMAGE.png",
      "idiom" : "universal",
      "scale" : "1x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
IMAGEJSON

    sed -i '' "s/IMAGE.png/${img}.png/g" "$IMAGESET/Contents.json"

    if [ -f "$SOURCE_DIR/source-assets/assets/${img}.png" ]; then
        cp "$SOURCE_DIR/source-assets/assets/${img}.png" "$IMAGESET/"
        echo "✓ $img"
    fi
done
echo ""

# Step 4: Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ready! Now complete in Xcode:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Xcode"
echo "2. File → New → Project"
echo "3. Select: watchOS → App"
echo "4. Configure:"
echo "   • Product Name: W2IMPWatch"
echo "   • Interface: SwiftUI"
echo "   • Language: Swift"
echo "5. Save to: $(dirname $PROJECT_DIR)/W2IMPWatch/"
echo "   → Choose 'Create Folder'"
echo ""
echo "Files to add to Xcode project:"
echo "  ✓ Source files already in place"
echo "  ✓ Assets.xcassets already in place"
echo ""
echo "Then:"
echo "6. In Xcode, select target: W2IMPWatch"
echo "7. Build Settings:"
echo "   • Minimum Deployment: watchOS 9.0"
echo "   • Bundle Identifier: com.wise2.W2IMPWatch"
echo "8. Product → Run (⌘R)"
echo ""
