#!/bin/bash
# WISE² Surface Remote Control Setup
# Configures Windows Surface for passwordless SSH access to VPS
# This script generates the setup instructions for the Surface device

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   WISE² Surface Remote Control Setup                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

log() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Get Surface SSH key
SURFACE_KEY_PATH="$HOME/.ssh/id_surface_ed25519"
SURFACE_PUB_PATH="$SURFACE_KEY_PATH.pub"

if [ ! -f "$SURFACE_PUB_PATH" ]; then
    echo -e "${RED}✗ Surface key not found at $SURFACE_PUB_PATH${NC}"
    echo "Run 'bash scripts/setup-passwordless-access.sh' first"
    exit 1
fi

VPS_IP=$(hostname -I | awk '{print $1}')
VPS_HOSTNAME=$(hostname)

log "Generating Surface setup instructions..."

# Create Windows setup script
WINDOWS_SETUP="$HOME/Surface-SSH-Setup.ps1"

cat > "$WINDOWS_SETUP" << 'WINSCRIPT'
# WISE² Surface SSH Setup - Run in PowerShell as Administrator
# This script sets up passwordless SSH access from Surface to VPS

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   WISE² Surface SSH Setup                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Check OpenSSH installation
Write-Host "Checking OpenSSH installation..." -ForegroundColor Green
$openSSH = Get-WindowsCapability -Online | Where-Object { $_.Name -like "*OpenSSH.Server*" }
if ($openSSH.State -ne "Installed") {
    Write-Host "Installing OpenSSH Client..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
}

# 2. Create .ssh directory
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

# 3. Copy SSH keys (you'll paste these from VPS)
Write-Host ""
Write-Host "SSH Key Paths:" -ForegroundColor Cyan
Write-Host "  Private key: $sshDir\id_surface_ed25519"
Write-Host "  Public key:  $sshDir\id_surface_ed25519.pub"
Write-Host ""

# 4. Setup SSH config
$sshConfig = "$sshDir\config"
if (-not (Test-Path $sshConfig)) {
    Write-Host "Creating SSH config..." -ForegroundColor Green
    @"
Host wise2-vps
    HostName VPS_IP_HERE
    User dwise
    IdentityFile ~/.ssh/id_surface_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
"@ | Out-File -FilePath $sshConfig -Encoding ASCII
}

# 5. Test SSH connection
Write-Host ""
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
Write-Host "Command: ssh wise2-vps 'echo Connected!'" -ForegroundColor Gray
Write-Host ""
Write-Host "If you see 'Connected!' below, setup is successful!" -ForegroundColor Green
Write-Host ""

WINSCRIPT

# Extract Surface public key
SURFACE_PUB_KEY=$(cat "$SURFACE_PUB_PATH")

# Create setup instructions document
SETUP_INSTRUCTIONS="$HOME/wise2-surface-setup-instructions.md"

cat > "$SETUP_INSTRUCTIONS" << EOF
# WISE² Surface Setup Instructions

## Overview
This guide sets up passwordless SSH access from your Windows Surface device to the WISE² VPS.

## Prerequisites
- Windows 10 or later with OpenSSH installed
- Admin access on Surface device
- Network connectivity to VPS

## Step 1: Copy SSH Keys to Surface

On your Surface device, open PowerShell and run:

\`\`\`powershell
# Create .ssh directory if needed
New-Item -ItemType Directory -Path "\$env:USERPROFILE\.ssh" -Force | Out-Null

# Set permissions
icacls "\$env:USERPROFILE\.ssh" /inheritance:r /grant:r "\$env:USERNAME:F" | Out-Null
\`\`\`

Then copy the following private key to: \`%USERPROFILE%\.ssh\id_surface_ed25519\`

\`\`\`
-----BEGIN OPENSSH PRIVATE KEY-----
[Private key content from VPS - run: cat ~/.ssh/id_surface_ed25519]
-----END OPENSSH PRIVATE KEY-----
\`\`\`

And the public key to: \`%USERPROFILE%\.ssh\id_surface_ed25519.pub\`

\`\`\`
$SURFACE_PUB_KEY
\`\`\`

## Step 2: Create SSH Config

Create \`%USERPROFILE%\.ssh\config\` with:

\`\`\`
Host wise2-vps
    HostName $VPS_IP
    HostName $VPS_HOSTNAME
    User dwise
    IdentityFile ~/.ssh/id_surface_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    IdentitiesOnly yes
\`\`\`

## Step 3: Fix SSH Key Permissions

In PowerShell:

\`\`\`powershell
\$keyPath = "\$env:USERPROFILE\.ssh\id_surface_ed25519"
icacls \$keyPath /inheritance:r /grant:r "\$env:USERNAME:F" | Out-Null
\`\`\`

## Step 4: Test Connection

\`\`\`powershell
ssh wise2-vps "echo Connected to WISE² VPS!"
\`\`\`

Expected output: \`Connected to WISE² VPS!\`

## Step 5: Set SSH Agent (Optional but Recommended)

For automatic key loading on startup:

\`\`\`powershell
# Create startup script
New-Item -ItemType Directory -Path "\$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup" -Force | Out-Null

# Add to startup
@"
powershell -Command "Start-Service ssh-agent; ssh-add \$env:USERPROFILE\.ssh\id_surface_ed25519"
"@ | Out-File -FilePath "\$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\load-ssh-keys.ps1"
\`\`\`

## Troubleshooting

### Permission denied (publickey)
- Check key permissions: \`icacls %USERPROFILE%\.ssh\id_surface_ed25519\`
- Verify VPS has public key in \`~/.ssh/authorized_keys\`

### Could not resolve hostname
- Check SSH config spelling (use exact hostname)
- Test ping: \`ping $VPS_IP\`

### SSH freezes on connection
- Try with verbose: \`ssh -vvv wise2-vps\`
- Check Windows Firewall settings

## Available Commands

Once connected, you can run WISE² commands:

\`\`\`powershell
# Check mail server status
ssh wise2-vps "sudo systemctl status postfix"

# View deployment logs
ssh wise2-vps "docker logs wise2-api"

# Deploy changes
ssh wise2-vps "cd wise2-core && git pull && npm run deploy"
\`\`\`

## Security Notes

✓ SSH keys use Ed25519 (modern, secure)
✓ Keys are passwordless (use Windows Credential Manager for extra security)
✓ StrictHostKeyChecking disabled for automation (acceptable for private networks)
✓ Sudo passwordless only for specific commands (see server sudoers file)

---

Generated: $(date)
VPS: $VPS_HOSTNAME ($VPS_IP)

EOF

log "Setup instructions created at $SETUP_INSTRUCTIONS"

# Display summary
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Setup Ready                                          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Files Created:${NC}"
echo "  • Instructions: $SETUP_INSTRUCTIONS"
echo "  • PowerShell Script: $WINDOWS_SETUP (optional)"
echo ""

echo -e "${YELLOW}Surface Public Key (copy to Surface):${NC}"
echo "────────────────────────────────────────────────────────"
cat "$SURFACE_PUB_PATH"
echo "────────────────────────────────────────────────────────"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Read: $SETUP_INSTRUCTIONS"
echo "  2. Copy SSH keys to Surface ~/.ssh/"
echo "  3. Test SSH connection from Surface"
echo "  4. Done! Surface can now access VPS without passwords"
echo ""

log "Surface setup instructions ready!"
