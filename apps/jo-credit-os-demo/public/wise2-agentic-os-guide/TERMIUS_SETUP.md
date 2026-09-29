# WISE² Agentic OS Guide - Termius Mobile Access

Access your Agentic OS guide from iPhone/Mac via Termius SSH client.

---

## Quick Setup (5 minutes)

### 1. On Your Mac (Terminal or Termius)
```bash
# Start a simple HTTP server to view the guide from phone
cd ~/Desktop/wise2-agentic-os-guide
python3 -m http.server 8080
```

### 2. Find Your Mac's IP Address
```bash
# In Terminal, run:
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for 192.168.x.x or 10.x.x.x
```

### 3. On Your iPhone (Termius)
- SSH into your Mac
- Command: `ssh dwise@[YOUR_MAC_IP]`
- Or use saved SSH connection to your Mac
- View files: `ls ~/Desktop/wise2-agentic-os-guide/`

### 4. View Guide on iPhone Browser
- Open Safari on iPhone
- Go to: `http://[YOUR_MAC_IP]:8080`
- Click: `index.html`
- See interactive diagrams!

---

## Option A: Termius SSH + HTTP Server (Easiest)

### Step 1: Start Server on Mac
```bash
cd ~/Desktop/wise2-agentic-os-guide
python3 -m http.server 8080

# Output: Serving HTTP on 0.0.0.0 port 8080
```

**Keep this terminal open while accessing from iPhone.**

### Step 2: Add SSH Connection in Termius
1. Open Termius app (iPhone or Mac)
2. + New Host
3. Host: Your Mac's IP (find with `ifconfig`)
4. Port: 22
5. Username: `dwise`
6. Password: Your Mac password
7. Save

### Step 3: View Guide on iPhone
1. Open Safari on iPhone
2. Type: `http://YOUR_MAC_IP:8080`
3. Click `index.html`
4. Scroll through interactive diagrams!

### Step 4: Manage Files via Termius
```bash
# SSH into Mac via Termius
cd ~/Desktop/wise2-agentic-os-guide

# View files
ls -la

# Read setup guide
cat GOOGLE_DRIVE_SETUP.md

# Check file sizes
du -sh *
```

---

## Option B: SSH + Termius Port Forwarding (No Server)

If you don't want to run a server:

### Step 1: Create SFTP Connection in Termius
1. In Termius app
2. + New Host (SFTP mode)
3. Host: Your Mac's IP
4. Port: 22
5. Username: `dwise`
6. Browse: `/Users/dwise/Desktop/wise2-agentic-os-guide/`
7. Download files to iPhone

### Step 2: View Files
- Open Files app on iPhone
- Navigate to Termius folder
- Tap `index.html` to view in Safari

---

## Option C: SSH + Vi/Nano Editor (Power User)

Edit files directly via Termius terminal:

```bash
# SSH into Mac
ssh dwise@YOUR_MAC_IP

# View file
cat GOOGLE_DRIVE_SETUP.md

# Edit file
nano GOOGLE_DRIVE_SETUP.md

# Or use vi
vi README.txt

# Copy to iPhone via Termius
# Use Termius SFTP to download files
```

---

## Option D: Sync to iPhone via Google Drive (Cloud Backup)

Even easier - sync the folder to Google Drive, then access from phone:

### On Mac Terminal:
```bash
# Install Google Drive for Desktop
# https://www.google.com/drive/download/

# Create sync folder
mkdir -p ~/Google\ Drive/WISE2-Agentic-OS-Guide

# Copy files
cp -r ~/Desktop/wise2-agentic-os-guide/* ~/Google\ Drive/WISE2-Agentic-OS-Guide/
```

### On iPhone:
1. Install Google Drive app (free)
2. Sign in: wisedefensellc@gmail.com
3. Go to: WISE2-Agentic-OS-Guide folder
4. Download files to iPhone
5. Open `index.html` in Safari
6. Full interactive guide on your phone!

---

## Recommended: Option A (HTTP Server)

Why it's best:
- ✅ Instant access to guide
- ✅ No file downloads
- ✅ Works from iPhone Safari
- ✅ Full interactive diagrams
- ✅ 5-minute setup

### Setup (Copy-Paste):

**On Mac (Terminal):**
```bash
cd ~/Desktop/wise2-agentic-os-guide
python3 -m http.server 8080
```

**Find Mac IP:**
```bash
# Run this in another Terminal tab:
ipconfig getifaddr en0  # WiFi IP (most common)
# Or: ifconfig | grep "inet " | grep -v 127
```

**On iPhone Safari:**
```
http://192.168.1.XX:8080
(replace XX with your Mac's IP)
```

---

## Termius Shortcuts for Quick Access

### Add to Termius "Snippets" (Favorite Commands)

In Termius app:
1. Snippets tab → +
2. Title: "Start WISE2 Guide Server"
3. Command: `cd ~/Desktop/wise2-agentic-os-guide && python3 -m http.server 8080`
4. Tap to run instantly from iPhone!

### Add as Termius Port Forward

1. Your SSH connection in Termius
2. Ports tab → +
3. Local port: 8080
4. Remote host: localhost
5. Remote port: 8080
6. Save

Now when connected via SSH, port 8080 auto-forwards!

---

## Quick Troubleshooting

**"Can't connect"**
- Check Mac IP: `ifconfig | grep inet`
- Make sure server is running: `python3 -m http.server 8080`
- Check firewall: System Settings → Network → Firewall

**"Port 8080 already in use"**
```bash
# Use different port:
python3 -m http.server 8081
# Then access: http://YOUR_IP:8081
```

**"Can't see index.html"**
- Make sure you're in correct folder: `pwd`
- Should show: `/Users/dwise/Desktop/wise2-agentic-os-guide`
- List files: `ls -la`

**"Slow on iPhone"**
- Make sure both devices on same WiFi
- Restart server: Ctrl+C, then run again
- Use Option D (Google Drive) for offline access

---

## Files You'll Access via Termius

From iPhone via Termius SSH:

```bash
~/Desktop/wise2-agentic-os-guide/
├── index.html              # View at: http://YOUR_IP:8080
├── README.txt              # Read with: cat README.txt
├── START_HERE.txt          # Read with: cat START_HERE.txt
└── GOOGLE_DRIVE_SETUP.md   # Read with: cat GOOGLE_DRIVE_SETUP.md
```

---

## One-Liner: Start Everything

Save this as a bash script on Mac:

```bash
#!/bin/bash
# File: ~/start-wise2-guide.sh
cd ~/Desktop/wise2-agentic-os-guide
echo "📍 Server running at: http://$(ipconfig getifaddr en0):8080"
echo "📍 SSH connect: ssh dwise@$(ipconfig getifaddr en0)"
python3 -m http.server 8080
```

Make executable:
```bash
chmod +x ~/start-wise2-guide.sh
```

Run anytime:
```bash
~/start-wise2-guide.sh
```

---

## Access Checklist

- [ ] Mac: `cd ~/Desktop/wise2-agentic-os-guide`
- [ ] Mac: `python3 -m http.server 8080`
- [ ] Mac: `ipconfig getifaddr en0` (copy IP)
- [ ] iPhone: Open Safari
- [ ] iPhone: Go to `http://[MAC_IP]:8080`
- [ ] iPhone: Click `index.html`
- [ ] Done! View guide on phone

---

## For Mac Termius (Same Setup)

Termius on Mac works identically:
1. Add SSH host (localhost, port 22)
2. Start server: `cd ~/Desktop/wise2-agentic-os-guide && python3 -m http.server 8080`
3. Open browser: `http://localhost:8080`
4. View guide!

---

Questions? SSH into your Mac from Termius and run:
```bash
cat ~/Desktop/wise2-agentic-os-guide/GOOGLE_DRIVE_SETUP.md
```

Enjoy your Agentic OS guide from anywhere! 🚀
