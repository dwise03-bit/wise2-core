# WISE² Surface SSH Setup for Windows
# Run this script in PowerShell as the current user (NOT admin)
# This generates Ed25519 SSH keys for Surface → VPS access

param(
    [string]$KeyName = "id_surface_ed25519",
    [string]$SshDir = "$env:USERPROFILE\.ssh"
)

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   WISE² Surface SSH Key Setup                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# 1. Create .ssh directory if it doesn't exist
if (-not (Test-Path $SshDir)) {
    Write-Host "✓ Creating .ssh directory at $SshDir" -ForegroundColor Green
    New-Item -ItemType Directory -Path $SshDir -Force | Out-Null
    icacls $SshDir /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null
}

# 2. Check if key already exists
$PrivateKeyPath = Join-Path $SshDir $KeyName
$PublicKeyPath = "$PrivateKeyPath.pub"

if (Test-Path $PrivateKeyPath) {
    Write-Host "⚠ Key already exists: $PrivateKeyPath" -ForegroundColor Yellow
    $continue = Read-Host "Overwrite? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "✗ Setup cancelled." -ForegroundColor Red
        exit 1
    }
}

# 3. Generate Ed25519 key (requires OpenSSH)
Write-Host "✓ Generating Ed25519 SSH key (no passphrase for automation)..." -ForegroundColor Green
ssh-keygen -t ed25519 -f $PrivateKeyPath -N "" -C "surface-dev@wise2" 2>$null

if (-not (Test-Path $PublicKeyPath)) {
    Write-Host "✗ SSH key generation failed. Ensure OpenSSH is installed." -ForegroundColor Red
    Write-Host "  Install via: winget install Microsoft.OpenSSH.Beta" -ForegroundColor Yellow
    exit 1
}

# 4. Secure permissions
icacls $PrivateKeyPath /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null
icacls $PublicKeyPath /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null

# 5. Display public key for adding to VPS
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SSH Key Generated Successfully                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Private key: $PrivateKeyPath" -ForegroundColor Magenta
Write-Host "Public key:  $PublicKeyPath" -ForegroundColor Magenta
Write-Host ""

Write-Host "Your PUBLIC key (add to VPS ~/.ssh/authorized_keys):" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Cyan
Get-Content $PublicKeyPath
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""

# 6. Setup SSH config
$SshConfigPath = Join-Path $SshDir "config"
Write-Host "Checking SSH config at $SshConfigPath..." -ForegroundColor Green

if (-not (Test-Path $SshConfigPath)) {
    Write-Host "✓ Creating SSH config..." -ForegroundColor Green

    # Use the template from this directory
    $TemplateDir = Split-Path $MyInvocation.MyCommand.Path
    $TemplatePath = Join-Path $TemplateDir "ssh-config.template"

    if (Test-Path $TemplatePath) {
        Copy-Item $TemplatePath $SshConfigPath
        Write-Host "✓ SSH config created from template." -ForegroundColor Green
    } else {
        Write-Host "⚠ Template not found at $TemplatePath" -ForegroundColor Yellow
        Write-Host "  Please manually copy ssh-config.template to $SshConfigPath" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ SSH config already exists." -ForegroundColor Green
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Next Steps                                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copy your PUBLIC key (shown above) to VPS:" -ForegroundColor Yellow
Write-Host "   ssh gpu-nmls 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'" -ForegroundColor Gray
Write-Host "   (paste the key, then press Ctrl+D on Mac/Linux or Ctrl+Z+Enter on Windows)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test connection:" -ForegroundColor Yellow
Write-Host "   ssh wise2-vps 'echo Connected to WISE2 VPS'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify Surface is registered:" -ForegroundColor Yellow
Write-Host "   Check config/devices.json in wise2-core" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Surface SSH setup complete!" -ForegroundColor Green
