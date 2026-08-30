$ErrorActionPreference = "Stop"
Write-Host "WISE Imp setup" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is not installed." }
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { throw "Rust/Cargo is not installed." }
npm install
Write-Host "Starting WISE Imp Alpha..." -ForegroundColor Green
npm run desktop:dev
