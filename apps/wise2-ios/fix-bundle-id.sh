#!/bin/bash

# Fix iOS Bundle ID to avoid conflicts
OLD_ID="com.dwise954.wise2.app"
NEW_ID="com.wise2.commandcenter.ios"

echo "Updating bundle ID from $OLD_ID to $NEW_ID..."

# Update Info.plist
sed -i '' "s/$OLD_ID/$NEW_ID/g" WISE2/Info.plist

# Update Xcode project
sed -i '' "s/$OLD_ID/$NEW_ID/g" WISE2.xcodeproj/project.pbxproj

# Verify changes
echo ""
echo "✓ Bundle ID updated"
grep -r "$NEW_ID" WISE2/Info.plist | head -1

