# BLAKKHAIL iOS - Team Deployment Guide

## 🎯 Quick Start (< 5 minutes)

### Option 1: TestFlight (Recommended)
```
1. Receive email invite from blakkhail@gmail.com
2. Open TestFlight app on iPhone
3. Tap "BLAKKHAIL"
4. Tap "Install"
5. Tap home screen → "Blakk Hail"
```

### Option 2: Web App (No Download)
```
1. Visit: https://blakkhail.com/app
2. Tap "Open Web App"
3. Tap Share → Add to Home Screen
4. Tap home screen → "Blakkhail"
```

---

## 👥 Team Member Instructions

### For Testers
1. **Get Invite Email**
   - Sender: blakkhail@gmail.com
   - Subject: "TestFlight invitation to BLAKKHAIL"

2. **Install via TestFlight**
   - Tap link in email
   - Open TestFlight (or search App Store)
   - Tap "Accept" → "Install"
   - Watch progress bar complete

3. **Launch App**
   - Find "Blakk Hail" icon on home screen
   - Tap to open

4. **Report Feedback**
   - Test all 5 sections (Home, Shop, Story, Cart, Account)
   - Report issues in #blakkhail-testing Slack channel

### Auto-Updates
- TestFlight auto-updates in background
- New versions appear within 24 hours
- No manual reinstall needed

---

## 🔧 For Developers

### Update Code
```bash
# Make changes
vi BlakkhailApp.swift

# Deploy to all devices
git push origin main

# GitHub Actions auto-builds + distributes to TestFlight
# Team members see update within 1-2 hours
```

### Check Update Status
```bash
# View latest build
open https://testflight.apple.com/

# See team members
open https://appstoreconnect.apple.com/
```

### Push Emergency Update
```bash
git push origin main
# Triggers CI/CD → TestFlight → Team devices (automatic)
```

---

## 📊 Current Status

| Feature | Status |
|---------|--------|
| Native iOS App | ✅ Ready |
| TestFlight Distribution | ✅ Ready |
| Web PWA | ✅ Live |
| Auto-Updates | ✅ Enabled |
| Team Access | ✅ Ready |

---

## 🚀 Next Steps

1. **Manager**: Send TestFlight invites to team
2. **Team**: Install via TestFlight
3. **Test**: All 5 sections
4. **Feedback**: Report in Slack
5. **Deploy**: Push fixes to main
6. **Auto-Update**: Everyone gets latest

---

## 📞 Support

- **Questions**: #blakkhail-testing on Slack
- **Bugs**: Open issue with screenshot
- **Feature Requests**: React with 👍 emoji

**Questions?** Ping @danielwise in Slack.

