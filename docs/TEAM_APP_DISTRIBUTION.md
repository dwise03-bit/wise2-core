# 📱 WISE² Team iOS App Distribution Guide

## Overview

WISE² offers four native iOS apps available to team members. All apps are distributed via **Apple TestFlight** for easy installation and feedback.

---

## 🎯 Available Apps

### 1. 🏪 BLAKKHAIL (Live)
**Status**: Production ready  
**What it is**: Full eCommerce platform for PIFF CITY brand  
**Features**: Product catalog, shopping cart, orders, customer profiles  
**Download**: [TestFlight Link](https://testflight.apple.com)

### 2. ⚙️ WISE² Command Center (Beta)
**Status**: In testing  
**What it is**: Business operations dashboard  
**Features**: Team management, project overview, analytics  
**Download**: [TestFlight Link](https://testflight.apple.com)

### 3. 🎨 SenCere Creative Studio (Beta)
**Status**: In testing  
**What it is**: Creative asset and project management  
**Features**: Brand management, team collaboration, workflow tools  
**Download**: [TestFlight Link](https://testflight.apple.com)

### 4. 📱 WISE² RP (Coming Soon)
**Status**: Development  
**What it is**: Field operations and partner management  
**Release**: Q4 2026

---

## 📥 Installation Steps

### For TestFlight Apps

#### Option 1: TestFlight App (Recommended)

1. **Install TestFlight** (if you don't have it)
   - Search "TestFlight" on App Store
   - Download free app from Apple

2. **Get Invited**
   - Contact: dwise03@gmail.com
   - Subject: "iOS App Access Request"
   - Include which app(s) you want

3. **Accept Invitation**
   - Check your email for TestFlight invite
   - Tap the link or use code in TestFlight app
   - Select apps to install

4. **Download & Install**
   - Open TestFlight app
   - Go to "Apps" tab
   - Tap "Install" on app you want
   - Wait for installation (usually 1-2 minutes)

#### Option 2: Direct Link
- Open invite email on your iOS device
- Tap TestFlight link
- Follow app installation prompts

### For Direct Installation (Developer Only)

```bash
# Clone the project
cd /Users/danielwise/Projects/wise2-core

# Navigate to app
cd apps/blakkhail-ios

# Build and run on device
open Blakkhail.xcodeproj
# In Xcode:
# 1. Connect iPhone
# 2. Select device from top menu
# 3. Press Play (⌘R) or Product > Run
```

---

## 🛠️ System Requirements

- **iOS Version**: 16.0 or later
- **Device**: iPhone 11 or newer (iPad compatible)
- **Storage**: 200-300 MB per app
- **Internet**: Required for initial setup & updates

---

## 📋 Request an Invite

### Email Template

```
To: dwise03@gmail.com
Subject: iOS TestFlight App Access

Hi,

I'd like to get access to the following WISE² iOS apps:
- [ ] BLAKKHAIL
- [ ] WISE² Command Center
- [ ] SenCere Creative Studio

My Apple ID email: [your-apple-id-email@example.com]

Device info (optional):
- Device name: [e.g., iPhone 15 Pro]
- iOS version: [e.g., 18.0]

Thanks!
```

---

## 🐛 Report Bugs & Feedback

### In-App Feedback (Easiest)
1. Shake your iPhone while using the app
2. Feedback form appears automatically
3. Fill out and submit (includes screenshots)

### Email
- Send to: dwise03@gmail.com
- Subject: `[BUG] App Name - Issue Description`
- Include:
  - What you were doing
  - What went wrong
  - Device model & iOS version
  - Screenshots if possible

### GitHub (Technical Issues)
- Go to: https://github.com/wise2-org/wise2-core/issues
- Create issue with `ios-` prefix
- Tag: `bug`, `feedback`, or `feature`

---

## 🔄 Staying Updated

### Automatic Updates
- TestFlight apps auto-update when new versions are available
- You'll get a notification in the TestFlight app

### Manual Update Check
1. Open TestFlight app
2. Go to "Apps" tab
3. If update available, tap "Update"

### What's New
- Check release notes in TestFlight before updating
- Notes include new features and bug fixes

---

## ❓ Troubleshooting

### "Invitation Not Received"
1. Check spam/promotions folders
2. Check Apple ID email is correct
3. Ask for re-invitation: dwise03@gmail.com

### "App Installation Failed"
- Ensure iOS 16.0+
- Restart device
- Delete TestFlight app & reinstall
- Ensure 200MB free storage

### "Can't Log In"
- Check internet connection
- Try switching WiFi/cellular
- Log out and log back in
- Contact support: dwise03@gmail.com

### "App Keeps Crashing"
1. Force quit (swipe up from bottom, hold app, swipe up)
2. Clear app cache:
   - Settings > Apps > [App Name] > Clear Cache
3. Reinstall via TestFlight
4. Report via in-app feedback form

---

## 🔐 Privacy & Security

- **Data**: All apps use encrypted connections
- **Permissions**: Apps request only necessary permissions
- **Location**: Only when needed (disabled by default)
- **Analytics**: Anonymous crash reports only

### Revoke Access
To stop using an app:
1. Open TestFlight
2. Swipe left on app
3. Tap "Delete"

---

## 💬 Quick Links

- **App Registry**: [iOS_APP_REGISTRY.md](iOS_APP_REGISTRY.md)
- **Issues**: [GitHub Issues](https://github.com/wise2-org/wise2-core/issues)
- **Contact**: dwise03@gmail.com
- **Discord**: #ios-deployment channel

---

## 📞 Support Channels

| Issue Type | Channel | Response Time |
|-----------|---------|---------------|
| Feature request | Email | 24-48 hours |
| Bug report | GitHub Issues | 2-4 hours |
| Crash/blocker | Email (Urgent) | 1-2 hours |
| General question | Discord | 30 min - 1 hour |

---

**Last Updated**: 2026-09-15  
**Version**: 1.0
