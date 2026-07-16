# Starts the Spring API and a stable ngrok tunnel (for Paystack).
# Requires NGROK_AUTHTOKEN (+ recommended NGROK_DOMAIN) in root .env

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting API + ngrok tunnel..."
Write-Host "Tip: set NGROK_DOMAIN in .env for a permanent Paystack callback URL."
Write-Host ""

# Start API in a new window so this window can own the tunnel
$serverCmd = "Set-Location -LiteralPath '$root'; npm run server"
Start-Process powershell -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $serverCmd)

# Give Spring a moment to bind :4000
Start-Sleep -Seconds 8

& (Join-Path $PSScriptRoot "run-tunnel.ps1")
