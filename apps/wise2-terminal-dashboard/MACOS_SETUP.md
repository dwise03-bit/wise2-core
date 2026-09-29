# 🍎 WISE² Terminal Dashboard - macOS Setup Complete

## ✅ Installation Status: READY

Your WISE² Terminal Dashboard is fully installed and configured on your Mac.

---

## 🎯 Quick Start

### Fastest Way to Launch
**Double-click on Desktop:**
```
~/Desktop/WISE2-Dashboard.command
```

### From Terminal
```bash
wise2-terminal
```

### From Any Directory
```bash
wise2-app
```

---

## 📋 What's Installed

### 🔧 Commands (Global)
Available from any terminal:

| Command | Purpose | Usage |
|---------|---------|-------|
| `wise2-terminal` | Start dashboard | `wise2-terminal` |
| `wise2-app` | Launch in Safari | `wise2-app` |
| `wise2-status` | Check status | `wise2-status` |
| `wise2-stop` | Stop dashboard | `wise2-stop` |
| `wise2-restart` | Restart dashboard | `wise2-restart` |

### 🚀 Auto-Start
- **Status**: ✅ ENABLED
- **Service**: `com.wise2.terminal-dashboard`
- **Starts on**: macOS login
- **Manage**: `launchctl list | grep wise2`

### 📱 Desktop Integration
- **Location**: `~/Desktop/WISE2-Dashboard.command`
- **Double-click to launch** (auto-starts dashboard + opens Safari)

### 📁 System Locations
```
Command Scripts:    ~/.local/bin/wise2-*
LaunchAgent:        ~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist
Dashboard App:      /Users/danielwise/Projects/wise2-core/apps/wise2-terminal-dashboard
Dashboard Logs:     /tmp/wise2-dashboard.log
```

---

## 🌐 Access Dashboard

**URL**: http://localhost:3030
**Port**: 3030
**Protocol**: HTTP + WebSocket
**Status**: ✅ RUNNING

---

## 📊 Current Status

```
✅ Dashboard:    RUNNING
✅ WebSocket:    CONNECTED
✅ System Mon:   ACTIVE
✅ Services:     Tracked
✅ Terminal:     Ready
✅ Auto-start:   ENABLED
```

---

## 🎮 Usage Examples

### Start Dashboard
```bash
wise2-terminal
```
_Runs server on http://localhost:3030_

### Check if Running
```bash
wise2-status
```
Output:
```
📊 WISE² Dashboard Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Dashboard: RUNNING
🌐 URL: http://localhost:3030
```

### Stop Dashboard
```bash
wise2-stop
```

### Restart Dashboard
```bash
wise2-restart
```

### View Logs
```bash
tail -f /tmp/wise2-dashboard.log
```

---

## 🔄 Auto-Start Management

### Check if Auto-Start is Enabled
```bash
launchctl list | grep wise2.terminal-dashboard
```

### Enable Auto-Start
```bash
launchctl load ~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist
```

### Disable Auto-Start
```bash
launchctl unload ~/Library/LaunchAgents/com.wise2.terminal-dashboard.plist
```

### View Auto-Start Logs
```bash
cat /tmp/wise2-dashboard.log
```

---

## 🐛 Troubleshooting

### Dashboard Won't Start
```bash
# Check if port is in use
lsof -i :3030

# Kill conflicting process
kill -9 <PID>

# Restart
wise2-restart
```

### Command Not Found
```bash
# Reload shell
source ~/.zshrc

# Verify installation
ls ~/.local/bin/wise2-*
```

### WebSocket Connection Issues
```bash
# Check server logs
tail -20 /tmp/wise2-dashboard.log

# Restart with debug
cd /Users/danielwise/Projects/wise2-core/apps/wise2-terminal-dashboard
DEBUG=* npm start
```

### Port 3030 Already in Use
```bash
# Find process using port
lsof -i :3030

# Kill it
kill -9 <PID>

# Try different port (edit .env if needed)
PORT=3031 wise2-terminal
```

---

## 📈 Features Available

✅ **Real-time Monitoring**
- CPU usage with live graph
- Memory consumption
- Disk space tracking

✅ **Service Health**
- Ollama status
- Command Center status
- AI Router status

✅ **Terminal Integration**
- Xterm.js emulator
- PTY shell access
- Command history

✅ **Quick Actions**
- STATUS button - View system status
- DOCTOR button - Run diagnostics

✅ **Live Updates**
- WebSocket streaming
- Real-time metrics
- Service notifications

---

## 🔐 System Requirements

- ✅ Node.js 16+ (installed)
- ✅ npm 7+ (installed)
- ✅ macOS 10.15+ (running)
- ✅ 2GB+ RAM (available)
- ✅ Port 3030 (available)

---

## 📞 Support

### View Dashboard Logs
```bash
tail -f /tmp/wise2-dashboard.log
```

### View System Info
```bash
wise2-status
```

### Check Service Status
```bash
launchctl list | grep wise2
```

### Manual Start
```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise2-terminal-dashboard
npm start
```

---

## 🎉 Ready to Use!

Your WISE² Terminal Dashboard is fully set up and ready:

1. **Start anytime**: `wise2-terminal`
2. **Auto-starts on login** (enabled)
3. **Desktop shortcut ready**: Click `WISE2-Dashboard.command`
4. **Logs saved to**: `/tmp/wise2-dashboard.log`
5. **Access at**: http://localhost:3030

---

**Installation Date**: 2026-09-16
**Version**: 1.0.0
**Status**: ✅ Production Ready
