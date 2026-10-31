$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
Write-Host ('Windows: ' + [Environment]::OSVersion.Version + '; CPU: ' + $env:PROCESSOR_ARCHITECTURE)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Please ask Codex to install Node.js 24 LTS x64: https://nodejs.org/en/download/'
    exit 1
}
& node scripts/setup.cjs
exit $LASTEXITCODE
