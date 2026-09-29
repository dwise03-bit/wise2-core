# 🚀 WISE² Terminal Dashboard - macOS Installation Guide

## Quick Start

### Option 1: Manual Launch (Recommended for Development)
```bash
wise2-terminal
```

The command will start the dashboard on `http://localhost:3030`

### Option 2: Direct npm start
```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise2-terminal-dashboard
npm start
```

---

## 🔧 Setup (Already Completed)

### ✅ What's Installed

1. **Global Command**
   - Location: `~/.local/bin/wise2-terminal`
   - Usage: `wise2-terminal` (from any directory)

2. **LaunchAgent**
   - Location: `~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist`
   - Auto-starts dashboard on macOS login (disabled by default)

3. **PATH Configuration**
   - Added to `~/.zshrc`
   - Reload with: `source ~/.zshrc`

---

## 🎯 Usage

### Start Dashboard
```bash
wise2-terminal
```

### View Logs
```bash
tail -f /tmp/wise2-dashboard.log
```

### Stop Dashboard
```bash
pkill -f "node server/index.js"
```

---

## 🔄 Auto-Start on Login (Optional)

### Enable Auto-Start
```bash
launchctl load ~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist
```

### Disable Auto-Start
```bash
launchctl unload ~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist
```

### Check Status
```bash
launchctl list | grep wise2
```

---

## 🌐 Access Dashboard

- **Local Access**: http://localhost:3030
- **Server**: Express.js on port 3030
- **Real-time**: WebSocket streaming enabled

---

## 📊 System Requirements

- Node.js 16+
- npm 7+
- macOS 10.15+
- 2GB RAM minimum
- Port 3030 available

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill existing process
lsof -ti :3030 | xargs kill -9

# Then restart
wise2-terminal
```

### Command Not Found
```bash
# Reload shell configuration
source ~/.zshrc

# Or verify installation
ls -la ~/.local/bin/wise2-terminal
```

### LaunchAgent Issues
```bash
# Check logs
cat /tmp/wise2-dashboard.log
cat /tmp/wise2-dashboard.err

# Verify plist
launchctl load -Fv ~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist
```

---

## 📝 Files

- **Script**: `~/.local/bin/wise2-terminal`
- **LaunchAgent**: `~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist`
- **Dashboard**: `/Users/danielwise/Projects/wise2-core/apps/wise2-terminal-dashboard`
- **Logs**: `/tmp/wise2-dashboard.log`

---

## ✨ Features

✅ Real-time system monitoring
✅ Terminal emulator (Xterm.js)
✅ Service health tracking
✅ Live WebSocket streaming
✅ WISE² dark theme
✅ Quick action buttons
✅ Professional UI

---

**Status**: 🚀 Production Ready
**Version**: 1.0.0
**Updated**: 2026-09-16
