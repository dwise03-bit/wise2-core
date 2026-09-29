# 🚀 WISE² Darrin Setup Handoff

**Date:** 2026-09-29  
**Primary Host:** Dave Station (WISE² Command Center)  
**Collaborative View:** 55" TV Display + Your Workstation

---

## Quick Start (5 Minutes)

### 1️⃣ Network Connection

**Tailscale Mesh Network Setup:**

```powershell
# Download Tailscale
Invoke-WebRequest -Uri "https://tailscale.com/download/windows" -OutFile "$env:TEMP\tailscale-setup.msi"

# Install
msiexec /i "$env:TEMP\tailscale-setup.msi"

# Authenticate (opens browser)
tailscale up

# Copy your IP
tailscale ip -4
# → Your WISE² Network IP (e.g., 100.x.x.x)
```

**Share with Dave:**
```
Your Tailscale IP: [YOUR_IP_HERE]
Hostname: [YOUR_COMPUTER_NAME]
```

---

### 2️⃣ SSH Access Setup

**Generate ED25519 Key (if not done):**

```powershell
# Create .ssh directory
if (-not (Test-Path "$env:USERPROFILE\.ssh")) {
    New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" -Force
}

# Generate key (replace 'darrin@wise2' with your identifier)
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519" -C "darrin@wise2" -N ""

# Display public key (send to Dave)
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

**Save Output:**
- Copy the entire public key output
- Send to Dave via email/message
- ✅ Dave will add it to the WISE² server

---

### 3️⃣ Connect to WISE² Dashboard

**Option A: TV Display (Shared Viewing)**
```
1. Dave displays: http://[DAVE_IP]:8080
2. Your view: Same URL on your network
   → http://100.x.x.x:8080 (via Tailscale)
```

**Option B: Direct Remote Access**
```powershell
# SSH into Dave's machine
ssh dave@100.x.x.x

# Or via hostname (if configured)
ssh dave@wise2-command-center

# Navigate to dashboard folder
cd C:\WISE2\CommandCenter\Dashboard

# View live updates
Get-ChildItem *.html | Select-Object Name, LastWriteTime
```

---

## 📋 Complete Setup Checklist

- [ ] **Tailscale Installed & Connected**
  - Running: `tailscale status`
  - Your IP: `_____________`

- [ ] **SSH Keys Generated**
  - Private key location: `$env:USERPROFILE\.ssh\id_ed25519`
  - Public key sent to Dave: `_____________`

- [ ] **Network Connectivity Verified**
  - Ping Dave: `ping 100.x.x.x` (should respond)
  - SSH access: `ssh dave@100.x.x.x` (should connect)

- [ ] **Dashboard Access Confirmed**
  - TV view: `http://[DAVE_IP]:8080` ✓
  - Your machine: `http://100.x.x.x:8080` ✓

- [ ] **Collaborative Session Started**
  - Dave confirms "Darrin" status online
  - Both viewing same dashboard
  - Ready for real-time collaboration

---

## 🎛️ Dashboard Features (Ultimate AI Edition)

### What You'll See
- **AI Metrics:** Real-time neural performance (94.7%)
- **Predictive Analytics:** System efficiency trending
- **Network Topology:** Live connection visualization
- **Real-Time Charts:** Dual animated analytics
- **System Log:** Live event streaming
- **User Status:** Shows "You (Dave)" + "Darrin" online

### Interactive Features
- Hover panels for depth effects
- Real-time metric updates
- Color-coded event logging
- Network node visualization
- Performance scoring dashboard

---

## 🔧 Troubleshooting

### Can't Connect to Tailscale

```powershell
# Check Tailscale status
tailscale status

# If stuck, restart Tailscale service
Restart-Service Tailscale

# Verify connectivity
ipconfig /all | findstr /i "tailscale"
```

### SSH Key Issues

```powershell
# Verify key exists
Test-Path "$env:USERPROFILE\.ssh\id_ed25519"

# Check permissions (must be restricted)
icacls "$env:USERPROFILE\.ssh" /grant:r "$env:USERNAME`:(F)"

# Test SSH connection
ssh -v dave@100.x.x.x
# Look for: "Trying [IP]..." → "Permission granted"
```

### Dashboard Won't Load

```powershell
# Test connectivity to Dave's machine
Test-NetConnection -ComputerName 100.x.x.x -Port 8080

# If port blocked, check firewall on Dave's machine
# Dave should run: netstat -ano | findstr :8080
```

### Real-Time Updates Not Showing

- Refresh browser: `Ctrl+Shift+R` (hard refresh)
- Check console for errors: `F12` → Console tab
- Dave's WebServer.ps1 should be running
- Verify: `Get-Process | findstr pwsh`

---

## 📞 Support Contacts

**Dave's System:**
- Tailscale IP: `100.x.x.x` (ask Dave)
- Dashboard URL: `http://100.x.x.x:8080`
- Command Center: `C:\WISE2\CommandCenter\Dashboard\`

**Key Locations:**
- WISE² Repository: `C:\WISE2\Core\wise2`
- Dashboard Files: `C:\WISE2\CommandCenter\Dashboard\`
- Design Skills: `C:\WISE2\DesignSkills\`

---

## 🎯 Collaborative Workflow

### During Shared Session

1. **Both viewing TV display** (55" connected to Dave's machine)
2. **Dashboard shows:** "YOU (Dave)" + "Darrin" online
3. **Real-time sync:** Both see live metrics updates
4. **Chat capability:** (Future enhancement with WebSocket)
5. **Control access:** Dave is primary, Darrin is collaborator

### Your Role
- Monitor system status with Dave
- Review AI-driven insights together
- Discuss network topology and performance
- Track build pipeline and deployments
- Comment on predictive analytics

---

## 🚀 Getting Started Right Now

**Step 1 - Install Tailscale** (3 min)
```powershell
# Download and install
Invoke-WebRequest "https://tailscale.com/download/windows" -OutFile "$env:TEMP\ts.msi"
msiexec /i "$env:TEMP\ts.msi"
tailscale up
```

**Step 2 - Generate SSH Key** (2 min)
```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519" -C "darrin@wise2" -N ""
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

**Step 3 - Share Info with Dave**
```
Message Dave:
"Ready to connect! 
Tailscale IP: [YOUR_IP]
SSH Key: [PASTE_PUBLIC_KEY]"
```

**Step 4 - Wait for Confirmation**
- Dave adds your SSH key
- Dave confirms you're online in Tailscale

**Step 5 - Connect to Dashboard**
```
http://[DAVE_IP]:8080
```

---

## ✅ Status Checklist

When you see this on the dashboard:

```
🟢 ACTIVE USERS
  ├─ YOU (Dave) - Primary - Online ✓
  └─ Darrin - Collaborator - Online ✓

✅ ALL SYSTEMS NOMINAL
```

**You're ready! 🎉**

---

**Questions?** Reach out to Dave or check the system log for error messages.

**Dashboard Updated:** Ultimate AI Edition  
**Network:** Tailscale Mesh (Private & Secure)  
**Display:** 55" TV + Your Workstation  
**Status:** READY FOR COLLABORATION

---

*Generated: 2026-09-29*  
*WISE² Command Center Collaborative Setup*
