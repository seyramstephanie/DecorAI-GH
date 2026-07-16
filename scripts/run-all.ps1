# Starts everything for local DecorAI GH development:
#   1) Spring API  (port 4000)
#   2) ngrok tunnel (Paystack public HTTPS callback)
#   3) Expo app    (npx expo start -c)
#
# Usage:  npm start
#         npm run start:all

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

Write-Host ""
Write-Host "=============================================="
Write-Host "  DecorAI GH - starting API + ngrok + Expo"
Write-Host "=============================================="
Write-Host ""

# --- 1) API in a new window ---
$serverArgs = @(
  "-NoProfile"
  "-ExecutionPolicy"
  "Bypass"
  "-Command"
  "Set-Location -LiteralPath '$root'; Write-Host 'DecorAI API (Spring) - leave this window open'; npm run server"
)
Start-Process -FilePath "powershell.exe" -ArgumentList $serverArgs | Out-Null
Write-Host "[1/3] API starting in a new window (port 4000)..."

# Wait until API port is open (or timeout ~2 min)
$apiReady = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 2
  try {
    $tcp = Test-NetConnection -ComputerName "127.0.0.1" -Port 4000 -WarningAction SilentlyContinue
    if ($tcp.TcpTestSucceeded) {
      $apiReady = $true
      break
    }
  } catch {
    # keep waiting
  }
  $waited = $i * 2
  Write-Host ("  waiting for API... ({0}s)" -f $waited)
}

if ($apiReady) {
  Write-Host "[1/3] API is up on http://127.0.0.1:4000"
} else {
  Write-Host "[1/3] WARNING: API not detected yet - continuing (check the API window)."
}

# --- 2) ngrok in a new window ---
$tunnelArgs = @(
  "-NoProfile"
  "-ExecutionPolicy"
  "Bypass"
  "-Command"
  "Set-Location -LiteralPath '$root'; Write-Host 'DecorAI ngrok tunnel - leave this window open'; npm run tunnel"
)
Start-Process -FilePath "powershell.exe" -ArgumentList $tunnelArgs | Out-Null
Write-Host "[2/3] ngrok starting in a new window..."

Start-Sleep -Seconds 4
try {
  $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 3
  $https = $tunnels.tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1
  if ($https) {
    Write-Host ("[2/3] Tunnel: {0}" -f $https.public_url)
    Write-Host ("      Paystack callback: {0}/billing/callback" -f $https.public_url)
  } else {
    Write-Host "[2/3] Tunnel starting (check ngrok window if Paystack fails)."
  }
} catch {
  Write-Host "[2/3] Tunnel starting (check ngrok window if Paystack fails)."
}

Write-Host ""
Write-Host "[3/3] Starting Expo (cleared cache)..."
Write-Host "  Press Ctrl+C here to stop Expo only."
Write-Host "  Close the other two windows to stop API / ngrok."
Write-Host ""

# --- 3) Expo in this window (foreground) ---
& npx expo start -c
exit $LASTEXITCODE
