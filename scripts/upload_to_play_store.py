#!/usr/bin/env python3
"""
Google Play Store Asset Upload Script
Uploads app icon, feature graphic, and screenshots to Google Play Console via API.
"""

import os
import sys
import json
from pathlib import Path
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
PLAY_STORE_ASSETS = PROJECT_ROOT / "play-store"
PACKAGE_NAME = "com.wise2.app"  # Replace with your actual package name

# Asset files
ASSETS = {
    "icon_512x512.png": "application/png",
    "feature_graphic_1024x500.png": "application/png",
    # Add screenshots here when ready
}

def get_credentials():
    """
    Get Google Play API credentials.
    Expects GOOGLE_PLAY_SERVICE_ACCOUNT_JSON environment variable
    pointing to your service account JSON key file.
    """
    service_account_file = os.getenv("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON")

    if not service_account_file:
        print("❌ Error: Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON environment variable")
        print("   Export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/service-account-key.json")
        sys.exit(1)

    if not os.path.exists(service_account_file):
        print(f"❌ Error: Service account file not found: {service_account_file}")
        sys.exit(1)

    credentials = Credentials.from_service_account_file(
        service_account_file,
        scopes=["https://www.googleapis.com/auth/androidpublisher"]
    )
    return credentials

def build_service(credentials):
    """Build Google Play API service."""
    return build("androidpublisher", "v3", credentials=credentials)

def upload_icon(service):
    """Upload app icon (512x512)."""
    icon_path = PLAY_STORE_ASSETS / "icon_512x512.png"

    if not icon_path.exists():
        print(f"⚠️  Icon not found: {icon_path}")
        return False

    print(f"📤 Uploading app icon: {icon_path.name}")

    try:
        media = MediaFileUpload(str(icon_path), mimetype="application/png")
        request = service.edits().upload(
            packageName=PACKAGE_NAME,
            media_body=media,
            language="en-US"
        )
        response = request.execute()
        print(f"✅ Icon uploaded successfully")
        return True
    except Exception as e:
        print(f"❌ Icon upload failed: {e}")
        return False

def upload_feature_graphic(service):
    """Upload feature graphic (1024x500)."""
    feature_path = PLAY_STORE_ASSETS / "feature_graphic_1024x500.png"

    if not feature_path.exists():
        print(f"⚠️  Feature graphic not found: {feature_path}")
        return False

    print(f"📤 Uploading feature graphic: {feature_path.name}")

    try:
        media = MediaFileUpload(str(feature_path), mimetype="application/png")
        request = service.edits().images().upload(
            packageName=PACKAGE_NAME,
            editId="0",  # Use active edit
            imageType="featureGraphic",
            language="en-US",
            media_body=media
        )
        response = request.execute()
        print(f"✅ Feature graphic uploaded successfully")
        return True
    except Exception as e:
        print(f"❌ Feature graphic upload failed: {e}")
        return False

def upload_screenshots(service):
    """Upload screenshots."""
    screenshots_dir = PLAY_STORE_ASSETS / "screenshots"

    if not screenshots_dir.exists():
        print(f"⚠️  Screenshots directory not found: {screenshots_dir}")
        return False

    screenshots = sorted(screenshots_dir.glob("*.png"))

    if not screenshots:
        print("⚠️  No screenshots found")
        return False

    print(f"📤 Uploading {len(screenshots)} screenshot(s)...")

    all_successful = True
    for i, screenshot_path in enumerate(screenshots, 1):
        try:
            media = MediaFileUpload(str(screenshot_path), mimetype="application/png")
            request = service.edits().images().upload(
                packageName=PACKAGE_NAME,
                editId="0",
                imageType="phoneScreenshots",
                language="en-US",
                media_body=media
            )
            response = request.execute()
            print(f"  ✅ Screenshot {i}: {screenshot_path.name}")
        except Exception as e:
            print(f"  ❌ Screenshot {i} failed: {e}")
            all_successful = False

    return all_successful

def main():
    """Main upload workflow."""
    print("\n" + "="*60)
    print("  WISE² App - Google Play Store Asset Upload")
    print("="*60 + "\n")

    # Verify asset directory exists
    if not PLAY_STORE_ASSETS.exists():
        print(f"❌ Error: Play store assets directory not found: {PLAY_STORE_ASSETS}")
        sys.exit(1)

    print(f"📁 Asset directory: {PLAY_STORE_ASSETS}")
    print(f"📦 Package name: {PACKAGE_NAME}\n")

    # Get credentials
    print("🔐 Authenticating with Google Play API...")
    credentials = get_credentials()

    # Build service
    service = build_service(credentials)
    print("✅ Authentication successful\n")

    # Upload assets
    results = {
        "icon": upload_icon(service),
        "feature_graphic": upload_feature_graphic(service),
        "screenshots": upload_screenshots(service),
    }

    # Summary
    print("\n" + "="*60)
    print("  Upload Summary")
    print("="*60)
    for asset_type, success in results.items():
        status = "✅ Success" if success else "❌ Failed"
        print(f"{asset_type.replace('_', ' ').title()}: {status}")

    all_success = all(results.values())
    print("="*60 + "\n")

    return 0 if all_success else 1

if __name__ == "__main__":
    sys.exit(main())
