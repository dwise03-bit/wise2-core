#Requires -Version 5.1
<#
.SYNOPSIS
  WISE2 access setup: Tailscale-only, public-key-only SSH access for Daniel Wise
  onto this Windows workstation (Darrin Wise Jr.).

.NOTES
  - Review this whole script before running it.
  - Run in an ELEVATED PowerShell window ("Run as Administrator"), or just
    run it normally and it will relaunch itself elevated with a UAC prompt.
  - Only touches: OpenSSH (service, authorized_keys files, sshd_config),
    Tailscale (read-only status calls + optional `tailscale set --ssh`),
    Windows Firewall (one scoped inbound rule + tightening existing port-22
    rules), and the handoff file on the Desktop. Nothing else.
  - Does not read, copy, print, or transmit any private key.
  - Does not create, request, or print any password.
  - Does not open SSH to the public internet or enable/open RDP.
  - Does not install any public key other than the two hardcoded below.
  - Does not reboot.
#>

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Fixed inputs (per authorized handoff spec — do not add/remove keys here)
# ---------------------------------------------------------------------------
$ExpectedTailscaleIP = '100.100.26.47'
$ExpectedHostname    = 'darrinwisejr.tail1dc3bd.ts.net'
$AuthorizedKeys      = @(
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAK3ZwFf5ANmVtNRalBr0F5FO/YPoamKb0RkIZtVSeGV danielwise@Mac.ts.net lan'
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJay3ltT1KgX0kB8Pc/to4WHsgrZ2ioLlDw7OqJggi3l tailscale'
)
$AuthDirectiveNames = @(
    'PubkeyAuthentication'
    'PasswordAuthentication'
    'KbdInteractiveAuthentication'
    'ChallengeResponseAuthentication'
)
$Blockers = New-Object System.Collections.Generic.List[string]

function Add-Blocker {
    param([string]$Reason)
    if (-not [string]::IsNullOrWhiteSpace($Reason)) {
        $script:Blockers.Add($Reason)
    }
}

function Test-IsProcessElevated {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Restart-Elevated {
    if (Test-IsProcessElevated) { return }
    Write-Host 'Elevation required. Approve the Windows UAC prompt if it appears.'
    $args = @(
        '-NoProfile'
        '-ExecutionPolicy', 'Bypass'
        '-File', $PSCommandPath
    )
    $proc = Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $args -Wait -PassThru
    if ($null -eq $proc) {
        throw 'UAC elevation was declined or failed. Re-run from an elevated PowerShell.'
    }
    exit $proc.ExitCode
}

function Find-TailscaleExe {
    $candidates = @(
        (Get-Command tailscale -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
        "$env:ProgramFiles\Tailscale\tailscale.exe"
        "${env:ProgramFiles(x86)}\Tailscale\tailscale.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }
    if ($candidates.Count -eq 0) { return $null }
    return $candidates[0]
}

function Find-SshdExe {
    $candidates = @(
        (Get-Command sshd -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
        "$env:WINDIR\System32\OpenSSH\sshd.exe"
        "$env:ProgramFiles\OpenSSH\sshd.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }
    if ($candidates.Count -eq 0) { return $null }
    return $candidates[0]
}

function Write-Utf8NoBomLf {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string[]]$Lines
    )
    $directory = Split-Path -Parent $Path
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    $payload = ($Lines -join "`n") + "`n"
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $payload, $encoding)
}

function Set-UserAuthorizedKeyAcl {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Account
    )
    & icacls.exe $Path /inheritance:r | Out-Null
    & icacls.exe $Path /grant:r "${Account}:(R)" | Out-Null
    & icacls.exe $Path /grant:r 'SYSTEM:(F)' | Out-Null
    & icacls.exe $Path /grant:r 'Administrators:(F)' | Out-Null
}

function Set-AdminAuthorizedKeyAcl {
    param([Parameter(Mandatory = $true)][string]$Path)
    & icacls.exe $Path /setowner 'Administrators' | Out-Null
    & icacls.exe $Path /inheritance:r | Out-Null
    & icacls.exe $Path /grant:r 'SYSTEM:(F)' | Out-Null
    & icacls.exe $Path /grant:r 'Administrators:(F)' | Out-Null
}

function Test-AccountInAdministrators {
    param([Parameter(Mandatory = $true)][string]$UserName)
    try {
        $members = Get-LocalGroupMember -Group 'Administrators'
        foreach ($member in $members) {
            if ($member.Name -eq $UserName) { return $true }
            if ($member.Name -like "*\$UserName") { return $true }
        }
    } catch {
        return (Test-IsProcessElevated)
    }
    return $false
}

function Get-TailscaleIdentity {
    param([Parameter(Mandatory = $true)][string]$TailscaleExe)

    $ip = $null
    try {
        $ip = (& $TailscaleExe ip -4 2>$null | Select-Object -First 1).Trim()
    } catch {
        $ip = $null
    }

    $hostname = $ExpectedHostname
    try {
        $jsonText = & $TailscaleExe status --json
        if ($jsonText) {
            $status = $jsonText | ConvertFrom-Json
            if ($status.Self.DNSName) {
                $hostname = ($status.Self.DNSName).TrimEnd('.')
            }
            if (-not $ip -and $status.Self.TailscaleIPs) {
                $ip = @($status.Self.TailscaleIPs | Where-Object { $_ -like '100.*' } | Select-Object -First 1)
            }
        }
    } catch {
        # Keep IP from `tailscale ip -4` if JSON parsing fails.
    }

    return [pscustomobject]@{
        IP       = $ip
        Hostname = $hostname
    }
}

function Test-IsTailscaleIPv4 {
    param([string]$IP)
    if ([string]::IsNullOrWhiteSpace($IP)) { return $false }
    $parsed = $null
    if (-not [System.Net.IPAddress]::TryParse($IP, [ref]$parsed)) { return $false }
    $bytes = $parsed.GetAddressBytes()
    if ($bytes.Length -ne 4) { return $false }
    # 100.64.0.0/10
    return ($bytes[0] -eq 100 -and $bytes[1] -ge 64 -and $bytes[1] -le 127)
}

function Install-OpenSshServer {
    $capability = Get-WindowsCapability -Online -Name 'OpenSSH.Server*' | Select-Object -First 1
    if (-not $capability -or $capability.State -ne 'Installed') {
        Write-Host 'Installing OpenSSH Server...'
        Add-WindowsCapability -Online -Name 'OpenSSH.Server~~~~0.0.1.0' | Out-Null
    }
    $service = Get-Service -Name sshd -ErrorAction SilentlyContinue
    if (-not $service) {
        throw 'OpenSSH Server capability is present but the sshd service was not found.'
    }
    if ($service.StartType -ne 'Automatic') {
        Set-Service -Name sshd -StartupType Automatic
    }
    if ($service.Status -ne 'Running') {
        Start-Service sshd
    }
}

function Set-SshdHardening {
    param([Parameter(Mandatory = $true)][string]$ConfigPath)

    if (-not (Test-Path $ConfigPath)) {
        throw "sshd_config not found at $ConfigPath"
    }

    $original = [System.IO.File]::ReadAllLines($ConfigPath)
    $pattern = '^\s*(#\s*)?(' + ($AuthDirectiveNames -join '|') + ')\s+\S+'
    $rewritten = foreach ($line in $original) {
        if ($line -match $pattern -and $line -notmatch '^\s*#') {
            "# $line"
        } else {
            $line
        }
    }

    $begin = '# BEGIN WISE2 ACCESS'
    $end = '# END WISE2 ACCESS'
    $block = @(
        $begin
        'PubkeyAuthentication yes'
        'PasswordAuthentication no'
        'KbdInteractiveAuthentication no'
        'ChallengeResponseAuthentication no'
        $end
    )

    $startIndex = [array]::IndexOf($rewritten, $begin)
    $endIndex = [array]::IndexOf($rewritten, $end)
    if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
        $before = @()
        if ($startIndex -gt 0) { $before = $rewritten[0..($startIndex - 1)] }
        $after = @()
        if ($endIndex -lt ($rewritten.Count - 1)) { $after = $rewritten[($endIndex + 1)..($rewritten.Count - 1)] }
        $rewritten = @($before + $block + $after)
    } else {
        $rewritten = @($rewritten + '' + $block)
    }

    $backup = "$ConfigPath.wise2.bak"
    if (-not (Test-Path $backup)) {
        Copy-Item -Path $ConfigPath -Destination $backup
    }
    Write-Utf8NoBomLf -Path $ConfigPath -Lines $rewritten
}

function Test-SshdConfig {
    param([Parameter(Mandatory = $true)][string]$SshdExe)
    & $SshdExe -t
    if ($LASTEXITCODE -ne 0) {
        throw 'sshd -t rejected the configuration.'
    }
}

function Get-InboundTcp22Rules {
    $portFilters = Get-NetFirewallPortFilter -Protocol TCP -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq 22 -or $_.LocalPort -eq '22' }
    foreach ($filter in $portFilters) {
        $rule = Get-NetFirewallRule -AssociatedNetFirewallPortFilter $filter -ErrorAction SilentlyContinue |
            Where-Object { $_.Direction -eq 'Inbound' }
        if ($rule) { $rule }
    }
}

function Test-RemoteAddressIsTailscaleOnly {
    param($AddressFilter)
    $remotes = @($AddressFilter.RemoteAddress)
    if ($remotes.Count -eq 0) { return $false }
    foreach ($remote in $remotes) {
        if ($remote -in @('Any', 'Internet', 'LocalSubnet', '0.0.0.0/0', '*')) { return $false }
        if ($remote -ne '100.64.0.0/10') { return $false }
    }
    return $true
}

function Set-SshFirewallTailscaleOnly {
    $ruleName = 'WISE2-OpenSSH-Tailscale-Only'
    $existing = Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue
    if ($existing) {
        Set-NetFirewallRule -Name $ruleName -Enabled True -Action Allow -Direction Inbound -Profile Any
        Set-NetFirewallPortFilter -AssociatedNetFirewallRule $existing -Protocol TCP -LocalPort 22
        Set-NetFirewallAddressFilter -AssociatedNetFirewallRule $existing -RemoteAddress '100.64.0.0/10'
    } else {
        New-NetFirewallRule `
            -Name $ruleName `
            -DisplayName 'WISE2 OpenSSH (Tailscale only)' `
            -Direction Inbound `
            -Action Allow `
            -Enabled True `
            -Protocol TCP `
            -LocalPort 22 `
            -RemoteAddress '100.64.0.0/10' `
            -Profile Any | Out-Null
    }

    $tooOpen = New-Object System.Collections.Generic.List[string]
    foreach ($rule in (Get-InboundTcp22Rules | Where-Object { $_.Enabled -eq 'True' -or $_.Enabled -eq $true })) {
        if ($rule.Name -eq $ruleName) { continue }
        $addr = Get-NetFirewallAddressFilter -AssociatedNetFirewallRule $rule
        if (-not (Test-RemoteAddressIsTailscaleOnly $addr)) {
            Disable-NetFirewallRule -Name $rule.Name
            $tooOpen.Add($rule.DisplayName)
        }
    }
    return $tooOpen
}

function Test-Port22Local {
    try {
        $listener = Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction SilentlyContinue
        if ($listener) { return $true }
    } catch { }
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $async = $client.BeginConnect('127.0.0.1', 22, $null, $null)
        $ok = $async.AsyncWaitHandle.WaitOne(1500)
        if ($ok -and $client.Connected) {
            $client.Close()
            return $true
        }
        $client.Close()
    } catch { }
    return $false
}

function Get-EffectiveSshdSettings {
    param([Parameter(Mandatory = $true)][string]$ConfigPath)
    $result = @{}
    foreach ($line in [System.IO.File]::ReadAllLines($ConfigPath)) {
        if ($line -match '^\s*#' -or $line -notmatch '^\s*(\S+)\s+(\S+)') { continue }
        $name = $Matches[1]
        $value = $Matches[2]
        if ($AuthDirectiveNames -contains $name -and -not $result.ContainsKey($name)) {
            $result[$name] = $value
        }
    }
    return $result
}

function Read-AuthorizedKeyLines {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path $Path)) { return @() }
    return @(
        [System.IO.File]::ReadAllLines($Path) |
            ForEach-Object { $_.Trim() } |
            Where-Object { $_ }
    )
}

function Write-Handoff {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][hashtable]$Fields
    )
    $lines = @(
        'WISE2 ACCESS HANDOFF'
        "status: $($Fields.status)"
        "windows_user: $($Fields.windows_user)"
        "is_admin: $($Fields.is_admin)"
        "tailscale_ip: $($Fields.tailscale_ip)"
        "tailscale_hostname: $($Fields.tailscale_hostname)"
        "ssh_target: $($Fields.ssh_target)"
        "sshd: $($Fields.sshd)"
        "password_auth: $($Fields.password_auth)"
        "firewall: $($Fields.firewall)"
        "keys_installed: $($Fields.keys_installed)"
        "blocked_reason: $($Fields.blocked_reason)"
        "next_step_for_daniel: $($Fields.next_step_for_daniel)"
    )
    Write-Utf8NoBomLf -Path $Path -Lines $lines
    Write-Host ''
    Write-Host ($lines -join "`r`n")
}

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
Restart-Elevated

$windowsUser = $env:USERNAME
$userProfile = $env:USERPROFILE
$isAdminAccount = Test-AccountInAdministrators -UserName $windowsUser
$userKeysPath = Join-Path $userProfile '.ssh\authorized_keys'
$adminKeysPath = 'C:\ProgramData\ssh\administrators_authorized_keys'
$sshdConfigPath = 'C:\ProgramData\ssh\sshd_config'
$handoffPath = Join-Path $userProfile 'Desktop\WISE2_ACCESS_HANDOFF.txt'
$tailscaleSshNote = 'skipped'

$tailscaleExe = Find-TailscaleExe
if (-not $tailscaleExe) {
    Add-Blocker 'Tailscale is not installed or tailscale.exe was not found.'
    $tailscale = [pscustomobject]@{ IP = $null; Hostname = $ExpectedHostname }
} else {
    try {
        $null = & $tailscaleExe status
    } catch {
        try { Start-Service Tailscale -ErrorAction SilentlyContinue } catch { }
        try { Start-Service TailscaleTunnel -ErrorAction SilentlyContinue } catch { }
    }
    $tailscale = Get-TailscaleIdentity -TailscaleExe $tailscaleExe
    if (-not (Test-IsTailscaleIPv4 $tailscale.IP)) {
        Add-Blocker "Could not verify a Tailscale IPv4 address (got '$($tailscale.IP)')."
    } elseif ($tailscale.IP -ne $ExpectedTailscaleIP) {
        Write-Host "Tailscale IP changed from $ExpectedTailscaleIP to $($tailscale.IP). Continuing with the verified IP."
    }
}

try {
    Install-OpenSshServer
} catch {
    Add-Blocker "OpenSSH Server install/start failed: $($_.Exception.Message)"
}

try {
    Write-Utf8NoBomLf -Path $userKeysPath -Lines $AuthorizedKeys
    Write-Utf8NoBomLf -Path $adminKeysPath -Lines $AuthorizedKeys
    Set-UserAuthorizedKeyAcl -Path $userKeysPath -Account $windowsUser
    Set-AdminAuthorizedKeyAcl -Path $adminKeysPath
} catch {
    Add-Blocker "Failed to write authorized-key files: $($_.Exception.Message)"
}

$sshdExe = Find-SshdExe
try {
    Set-SshdHardening -ConfigPath $sshdConfigPath
    if (-not $sshdExe) { throw 'sshd.exe not found for configuration validation.' }
    Test-SshdConfig -SshdExe $sshdExe
    Restart-Service sshd -Force
} catch {
    Add-Blocker "sshd hardening/validation failed: $($_.Exception.Message)"
}

$firewallState = 'missing'
try {
    $disabled = Set-SshFirewallTailscaleOnly
    if ($disabled.Count -gt 0) {
        Write-Host ("Tightened broader port-22 rules: " + ($disabled -join '; '))
    }
    $enabled22 = @(Get-InboundTcp22Rules | Where-Object { $_.Enabled -eq 'True' -or $_.Enabled -eq $true })
    $nonScoped = @()
    foreach ($rule in $enabled22) {
        $addr = Get-NetFirewallAddressFilter -AssociatedNetFirewallRule $rule
        if (-not (Test-RemoteAddressIsTailscaleOnly $addr)) {
            $nonScoped += $rule.DisplayName
        }
    }
    if ($nonScoped.Count -gt 0) {
        $firewallState = 'too-open'
        Add-Blocker ("Port 22 still allowed more broadly by: " + ($nonScoped -join '; '))
    } elseif ($enabled22.Count -eq 0) {
        $firewallState = 'missing'
        Add-Blocker 'No enabled inbound TCP/22 firewall rule was found after configuration.'
    } else {
        $firewallState = 'tailscale-only'
    }
} catch {
    $firewallState = 'missing'
    Add-Blocker "Firewall configuration failed: $($_.Exception.Message)"
}

if ($tailscaleExe) {
    try {
        & $tailscaleExe set --ssh
        if ($LASTEXITCODE -eq 0) {
            $tailscaleSshNote = 'enabled'
        } else {
            $tailscaleSshNote = 'unsupported-or-skipped'
        }
    } catch {
        $tailscaleSshNote = 'unsupported-or-skipped'
    }
}

$sshdService = Get-Service -Name sshd -ErrorAction SilentlyContinue
$sshdState = if ($sshdService -and $sshdService.Status -eq 'Running') { 'running' } else { 'stopped' }
if ($sshdState -ne 'running') {
    Add-Blocker 'sshd is not running.'
}

$effective = @{}
if (Test-Path $sshdConfigPath) {
    $effective = Get-EffectiveSshdSettings -ConfigPath $sshdConfigPath
}
$passwordAuth = if ($effective['PasswordAuthentication'] -eq 'no') { 'disabled' } else { 'still-enabled' }
if ($effective['PubkeyAuthentication'] -ne 'yes') {
    Add-Blocker 'PubkeyAuthentication is not effectively yes.'
}
if ($passwordAuth -ne 'disabled') {
    Add-Blocker 'PasswordAuthentication is not effectively no.'
}
if ($effective['KbdInteractiveAuthentication'] -ne 'no') {
    Add-Blocker 'KbdInteractiveAuthentication is not effectively no.'
}
if ($effective['ChallengeResponseAuthentication'] -ne 'no') {
    Add-Blocker 'ChallengeResponseAuthentication is not effectively no.'
}

$userKeyLines = Read-AuthorizedKeyLines -Path $userKeysPath
$adminKeyLines = Read-AuthorizedKeyLines -Path $adminKeysPath
$keysMatch = ($userKeyLines.Count -eq 2) -and
    ($adminKeyLines.Count -eq 2) -and
    ($userKeyLines[0] -eq $AuthorizedKeys[0]) -and
    ($userKeyLines[1] -eq $AuthorizedKeys[1]) -and
    ($adminKeyLines[0] -eq $AuthorizedKeys[0]) -and
    ($adminKeyLines[1] -eq $AuthorizedKeys[1])
$keyCount = $userKeyLines.Count
if (-not $keysMatch) {
    Add-Blocker 'Authorized-key files do not contain exactly the two supplied public-key lines.'
}

if (-not (Test-Port22Local)) {
    Add-Blocker 'TCP 22 did not respond on 127.0.0.1.'
}

$verifiedIP = if (Test-IsTailscaleIPv4 $tailscale.IP) { $tailscale.IP } else { $ExpectedTailscaleIP }
$sshTarget = "$windowsUser@$verifiedIP"
$status = if ($Blockers.Count -eq 0) { 'READY' } else { 'BLOCKED' }

Write-Handoff -Path $handoffPath -Fields @{
    status               = $status
    windows_user         = $windowsUser
    is_admin             = $(if ($isAdminAccount) { 'yes' } else { 'no' })
    tailscale_ip         = $(if ($tailscale.IP) { $tailscale.IP } else { '' })
    tailscale_hostname   = $(if ($tailscale.Hostname) { $tailscale.Hostname } else { $ExpectedHostname })
    ssh_target           = $sshTarget
    sshd                 = $sshdState
    password_auth        = $passwordAuth
    firewall             = $firewallState
    keys_installed       = $(if ($keysMatch) { '2' } else { "$keyCount" })
    blocked_reason       = $(if ($Blockers.Count -eq 0) { "none; tailscale_ssh=$tailscaleSshNote" } else { ($Blockers -join '; ') })
    next_step_for_daniel = "ssh $sshTarget"
}

if ($status -eq 'READY') { exit 0 } else { exit 1 }
