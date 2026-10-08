# WISE² Hive Windows onboarding for Darrin
# Run in PowerShell on Darrin's own Windows machine, after reviewing this script.
# No private keys are transmitted. Existing files are preserved.
$ErrorActionPreference = 'Stop'
$Repo = Join-Path $HOME 'wise2-core'
$KeyDir = Join-Path $HOME '.ssh'
$Key = Join-Path $KeyDir 'wise2_darrin_ed25519'
$Vps = '173.208.147.165'
$User = 'darrin'
New-Item -ItemType Directory -Force -Path $KeyDir | Out-Null
if (-not (Test-Path $Key)) {
  if (Test-Path "$Key.pub") { throw "Orphan public key at $Key.pub; resolve before continuing." }
  Write-Host "Generating dedicated ED25519 key. Choose a passphrase when prompted."
  & ssh-keygen -t ed25519 -a 64 -f $Key -C 'darrin-wise2-windows'
  if ($LASTEXITCODE -ne 0) { throw 'ssh-keygen failed' }
}
Write-Host "=== WISE2 PUBLIC KEY FINGERPRINT ==="
& ssh-keygen -lf "$Key.pub"
Write-Host "=== TEST SSH ==="
& ssh -o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i $Key "${User}@${Vps}" 'whoami'
$connected = ($LASTEXITCODE -eq 0)
if (-not $connected) {
  Write-Warning 'VPS has not authenticated this key. Administrator must append the PUBLIC key to /home/darrin/.ssh/authorized_keys.'
  Write-Host 'COPY THIS PUBLIC KEY TO YOUR VPS ADMIN (NOT THE PRIVATE KEY):'
  Get-Content "$Key.pub"
  Write-Host 'After the VPS administrator installs it, rerun this installer.'
} else {
  Write-Host 'SSH VERIFIED as darrin.'
}
if (Test-Path (Join-Path $Repo '.git')) {
  Write-Host 'Existing checkout: fetching only; not overwriting local work.'
  & git -C $Repo fetch origin
  if ($LASTEXITCODE -ne 0) { throw 'Git fetch failed' }
  & git -C $Repo status --short
  & git -C $Repo branch -vv
} elseif (Test-Path $Repo) {
  throw "Existing non-Git path $Repo. Refusing to overwrite."
} else {
  & git clone 'https://github.com/dwise03-bit/wise2-core.git' $Repo
  if ($LASTEXITCODE -ne 0) { throw 'Git clone failed' }
}
Write-Host '=== WISE2 HIVE STATUS ==='
Write-Host "Repo: $Repo"
Write-Host "VPS SSH: $(if ($connected) { 'VERIFIED' } else { 'PENDING PUBLIC KEY AUTHORIZATION' })"
Write-Host 'Onboarding guide: docs/hive/DARRIN_MASTER_ONBOARDING.md'
if (-not $connected) { exit 2 }
