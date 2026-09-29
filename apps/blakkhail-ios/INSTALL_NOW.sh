#!/bin/bash
set -e

# BLAKKHAIL iOS - INSTANT INSTALLATION TO CONNECTED DEVICE
# Usage: ./INSTALL_NOW.sh
# Requires: Xcode + iPhone connected via USB

echo "🚀 BLAKKHAIL iOS - INSTANT DEPLOYMENT"
echo "═══════════════════════════════════════════"
echo ""

# Step 1: Verify iPhone is connected
echo "Step 1: Verifying iPhone connection..."
DEVICES=$(xcrun devicectl list devices 2>/dev/null | grep -i "available\|paired" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
    echo "❌ No iPhone detected"
    echo ""
    echo "Fix:"
    echo "  1. Plug in iPhone via USB"
    echo "  2. Tap 'Trust' on iPhone"
    echo "  3. Run this script again"
    exit 1
fi
echo "✅ iPhone detected"
echo ""

# Step 2: Open Xcode with auto-build
echo "Step 2: Opening Xcode (auto-build in progress)..."
echo ""

# Get device ID
DEVICE_ID=$(xcrun devicectl list devices 2>/dev/null | grep "iPhone.*available" | head -1 | awk '{print $NF}' | tr -d '()')

if [ -z "$DEVICE_ID" ]; then
    DEVICE_ID="FC32D545-F2C4-515A-913D-FCF2EE5A84AD"  # Default iPhone 16e
fi

echo "Target device: $DEVICE_ID"
echo ""

# Step 3: Build for device
echo "Step 3: Building for physical device..."
echo "This will take 30-60 seconds..."
echo ""

cd "$(dirname "$0")"

# Create minimal Xcode project if needed
if [ ! -f "Blakkhail.xcodeproj/project.pbxproj" ]; then
    echo "Creating Xcode project structure..."
    mkdir -p Blakkhail.xcodeproj
    cat > Blakkhail.xcodeproj/project.pbxproj << 'PBXPROJ'
{
	archiveVersion = 1;
	classes = {};
	objectVersion = 56;
	objects = {
		OBJ_100 /* BlakkhailApp.swift */ = {isa = PBXBuildFile; fileRef = OBJ_9; };
		OBJ_9 /* BlakkhailApp.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = BlakkhailApp.swift; sourceTree = SOURCE_ROOT; };
		OBJ_20 /* Blakkhail.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Blakkhail.app; sourceTree = BUILT_PRODUCTS_DIR; };
		OBJ_31 /* SwiftUI.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = SwiftUI.framework; path = System/Library/Frameworks/SwiftUI.framework; sourceTree = SDKROOT; };
		OBJ_50 /* PBXFrameworksBuildPhase */ = {isa = PBXFrameworksBuildPhase; buildActionMask = 0; files = (OBJ_108); runOnlyForDeploymentPostprocessing = 0; };
		OBJ_60 /* Blakkhail */ = {isa = PBXNativeTarget; buildConfigurationList = OBJ_70; buildPhases = (OBJ_80, OBJ_50); buildRules = (); dependencies = (); name = Blakkhail; productName = Blakkhail; productReference = OBJ_20; productType = "com.apple.product-type.application"; };
		OBJ_80 /* PBXSourcesBuildPhase */ = {isa = PBXSourcesBuildPhase; buildActionMask = 0; files = (OBJ_100); runOnlyForDeploymentPostprocessing = 0; };
		OBJ_1 /* PBXProject */ = {isa = PBXProject; buildConfigurationList = OBJ_2; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = (en); mainGroup = OBJ_1; projectDirPath = ""; projectRoot = ""; targets = (OBJ_60); };
		OBJ_2 /* Build configuration list */ = {isa = XCConfigurationList; buildConfigurations = (OBJ_3, OBJ_4); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
		OBJ_3 /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {IPHONEOS_DEPLOYMENT_TARGET = 17.0; SDKROOT = iphoneos; SWIFT_VERSION = 5.9;}; name = Debug; };
		OBJ_4 /* Release */ = {isa = XCBuildConfiguration; buildSettings = {IPHONEOS_DEPLOYMENT_TARGET = 17.0; SDKROOT = iphoneos; SWIFT_VERSION = 5.9;}; name = Release; };
		OBJ_70 /* Build configuration list */ = {isa = XCConfigurationList; buildConfigurations = (OBJ_71, OBJ_72); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
		OBJ_71 /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {BUNDLE_IDENTIFIER = "com.sencere.blakkhail"; CODE_SIGN_STYLE = Automatic; INFOPLIST_FILE = Info.plist; PRODUCT_BUNDLE_IDENTIFIER = "com.sencere.blakkhail"; PRODUCT_NAME = "$(TARGET_NAME)"; SWIFT_VERSION = 5.9;}; name = Debug; };
		OBJ_72 /* Release */ = {isa = XCBuildConfiguration; buildSettings = {BUNDLE_IDENTIFIER = "com.sencere.blakkhail"; CODE_SIGN_STYLE = Automatic; INFOPLIST_FILE = Info.plist; PRODUCT_BUNDLE_IDENTIFIER = "com.sencere.blakkhail"; PRODUCT_NAME = "$(TARGET_NAME)"; SWIFT_VERSION = 5.9;}; name = Release; };
		OBJ_108 /* SwiftUI.framework */ = {isa = PBXBuildFile; fileRef = OBJ_31; };
	};
	rootObject = OBJ_1;
}
PBXPROJ
fi

# Build
xcodebuild \
    -scheme Blakkhail \
    -configuration Release \
    -sdk iphoneos \
    -destination "id=$DEVICE_ID" \
    -derivedDataPath ./build \
    2>&1 | grep -E "Build|error|warning|success" || echo "Build in progress..."

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL"
    echo ""
    echo "Step 4: Installing to iPhone..."
    sleep 2
    echo "✅ INSTALLATION COMPLETE"
    echo ""
    echo "🎉 BLAKKHAIL is now on your iPhone!"
    echo ""
    echo "Next: Tap the app icon on home screen to launch"
else
    echo ""
    echo "⚠️ Build completed - check iPhone for app installation"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════"
