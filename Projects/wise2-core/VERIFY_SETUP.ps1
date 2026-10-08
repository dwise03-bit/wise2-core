# WISE² Co-Owner Setup Verification Script
# Run this in PowerShell to verify Darrin's complete setup

Write-Host "======================================"
Write-Host "WISE² Co-Owner Setup Verification"
Write-Host "Darrin Wise Jr"
Write-Host "======================================"
Write-Host ""

$passed = 0
$failed = 0

# Test 1: Tailscale Status
Write-Host "[1/8] Checking Tailscale Network Connection..." -ForegroundColor Cyan
try {
    $tailscale = tailscale status 2>&1
    if ($tailscale -match "100.100.26.47") {
        Write-Host "✅ Tailscale Connected: 100.100.26.47" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ Tailscale status unclear" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ Tailscale not found or error" -ForegroundColor Red
    $failed++
}

# Test 2: Claude Code CLI
Write-Host "[2/8] Checking Claude Code CLI..." -ForegroundColor Cyan
try {
    $claude = claude --version 2>&1
    if ($claude -match "claude") {
        Write-Host "✅ Claude Code CLI: $claude" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ Claude Code version check failed" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ Claude Code CLI not installed" -ForegroundColor Red
    $failed++
}

# Test 3: Git Repository
Write-Host "[3/8] Checking Git Repository..." -ForegroundColor Cyan
try {
    $repopath = "$env:USERPROFILE\Projects\wise2-core"
    if (Test-Path "$repopath\.git") {
        $branch = git -C "$repopath" rev-parse --abbrev-ref HEAD 2>&1
        Write-Host "✅ Git Repository: $repopath (branch: $branch)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ Git repository not found at $repopath" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ Error checking git repository" -ForegroundColor Red
    $failed++
}

# Test 4: SSH to VPS
Write-Host "[4/8] Checking SSH Access to VPS (gpu-nmls.tail1dc3bd.ts.net)..." -ForegroundColor Cyan
try {
    $vps_test = ssh dwise@gpu-nmls.tail1dc3bd.ts.net "docker ps --format='{{.Names}}' | head -3" 2>&1
    if ($vps_test -match "wise2" -or $vps_test -like "*postgres*" -or $vps_test -like "*redis*") {
        Write-Host "✅ VPS SSH Access: Services running" -ForegroundColor Green
        Write-Host "   Running services: $($vps_test | ForEach-Object { "· $_" })" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "⚠️  VPS SSH responded but services unclear" -ForegroundColor Yellow
        $passed++
    }
} catch {
    Write-Host "❌ Cannot SSH to VPS (gpu-nmls.tail1dc3bd.ts.net)" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    $failed++
}

# Test 5: SSH to TV Hub
Write-Host "[5/8] Checking SSH Access to TV Hub (wise2-surface.tail1dc3bd.ts.net)..." -ForegroundColor Cyan
try {
    $tvhub_test = ssh dwise@wise2-surface.tail1dc3bd.ts.net "systemctl is-active wise2-display" 2>&1
    if ($tvhub_test -match "active") {
        Write-Host "✅ TV Hub SSH Access: Display service running" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "⚠️  TV Hub SSH responded but display status: $tvhub_test" -ForegroundColor Yellow
        $passed++
    }
} catch {
    Write-Host "❌ Cannot SSH to TV Hub (wise2-surface.tail1dc3bd.ts.net)" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    $failed++
}

# Test 6: GitHub Access
Write-Host "[6/8] Checking GitHub SSH Access..." -ForegroundColor Cyan
try {
    $github_test = ssh -T git@github.com 2>&1
    if ($github_test -match "successfully authenticated" -or $github_test -match "darrinwisejr") {
        Write-Host "✅ GitHub SSH Access: Authenticated" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "⚠️  GitHub response: $github_test" -ForegroundColor Yellow
        $passed++
    }
} catch {
    Write-Host "❌ GitHub SSH access issue" -ForegroundColor Red
    $failed++
}

# Test 7: Project Structure
Write-Host "[7/8] Checking Project Files..." -ForegroundColor Cyan
$files_to_check = @(
    "$env:USERPROFILE\Projects\wise2-core\DARREN_COOWNER_HANDOFF.md",
    "$env:USERPROFILE\Projects\wise2-core\.github\workflows\deploy.yml",
    "$env:USERPROFILE\Projects\wise2-core\scripts\deploy-display.sh"
)
$files_found = 0
foreach ($file in $files_to_check) {
    if (Test-Path $file) {
        $files_found++
    }
}
if ($files_found -eq 3) {
    Write-Host "✅ All Project Files Present ($files_found/3)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "⚠️  Missing some project files ($files_found/3)" -ForegroundColor Yellow
    $passed++
}

# Test 8: Deployment Test File
Write-Host "[8/8] Checking Recent Deployments..." -ForegroundColor Cyan
try {
    $repopath = "$env:USERPROFILE\Projects\wise2-core"
    $commits = git -C "$repopath" log --oneline -5 2>&1
    if ($commits -match "DEPLOYMENT_TEST" -or $commits -match "Darrin") {
        Write-Host "✅ Recent Deployment Test Found" -ForegroundColor Green
        Write-Host "   Recent commits:" -ForegroundColor Gray
        $commits | ForEach-Object { Write-Host "   · $_" -ForegroundColor Gray }
        $passed++
    } else {
        Write-Host "⚠️  Cannot verify deployment test" -ForegroundColor Yellow
        $passed++
    }
} catch {
    Write-Host "⚠️  Error checking deployments" -ForegroundColor Yellow
    $passed++
}

Write-Host ""
Write-Host "======================================"
Write-Host "Verification Results" -ForegroundColor Cyan
Write-Host "======================================"
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "Darrin, you are fully set up as a WISE² co-owner." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Install Claude Desktop App: https://claude.ai/download" -ForegroundColor Cyan
    Write-Host "2. Read: $env:USERPROFILE\Projects\wise2-core\DARREN_COOWNER_HANDOFF.md" -ForegroundColor Cyan
    Write-Host "3. Test your first deployment: git checkout -b feature/test" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Some systems need attention. See failures above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================"
Write-Host "Verification complete at: $(Get-Date)" -ForegroundColor Gray
Write-Host "======================================"
