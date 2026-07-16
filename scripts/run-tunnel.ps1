# Starts a public HTTPS tunnel to the local API (port 4000) for Paystack callbacks.
# Prefer a FREE static ngrok domain so the Paystack URL never changes:
#   1) https://dashboard.ngrok.com/get-started/your-authtoken  → NGROK_AUTHTOKEN
#   2) https://dashboard.ngrok.com/domains  → claim free domain → NGROK_DOMAIN
#   3) Put both in root .env
#
# Usage:  npm run tunnel
#         npm run server:tunnel   (API + tunnel)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Read-DotEnv([string]$key) {
  $path = Join-Path $root ".env"
  if (-not (Test-Path $path)) { return "" }
  foreach ($line in Get-Content $path) {
    if ($line -match "^\s*#" -or $line -match "^\s*$") { continue }
    if ($line -match ("^" + [regex]::Escape($key) + "=(.*)$")) {
      return $Matches[1].Trim().Trim("'").Trim('"')
    }
  }
  return ""
}

function Upsert-DotEnv([string]$key, [string]$value) {
  $path = Join-Path $root ".env"
  $lines = @()
  if (Test-Path $path) { $lines = Get-Content $path }
  $found = $false
  $out = foreach ($line in $lines) {
    if ($line -match ("^" + [regex]::Escape($key) + "=")) {
      $found = $true
      "$key=$value"
    } else { $line }
  }
  if (-not $found) { $out = @($out) + "$key=$value" }
  Set-Content -Path $path -Value $out -Encoding UTF8
}

$port = 4000
if (Read-DotEnv "PORT") {
  try { $port = [int](Read-DotEnv "PORT") } catch { $port = 4000 }
}

$authtoken = $env:NGROK_AUTHTOKEN
if (-not $authtoken) { $authtoken = Read-DotEnv "NGROK_AUTHTOKEN" }
$domain = $env:NGROK_DOMAIN
if (-not $domain) { $domain = Read-DotEnv "NGROK_DOMAIN" }

$ngrok = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrok) {
  $candidates = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_*\ngrok.exe",
    "$env:ProgramFiles\ngrok\ngrok.exe",
    "$env:LOCALAPPDATA\ngrok\ngrok.exe"
  )
  foreach ($c in $candidates) {
    $hit = Get-Item $c -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hit) { $ngrokPath = $hit.FullName; break }
  }
  if (-not $ngrokPath) {
    # WinGet installs under versioned folders — search
    $hit = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "ngrok.exe" -Recurse -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if ($hit) { $ngrokPath = $hit.FullName }
  }
} else {
  $ngrokPath = $ngrok.Source
}

if (-not $ngrokPath -or -not (Test-Path $ngrokPath)) {
  Write-Host "ngrok not found. Install with: winget install Ngrok.Ngrok"
  Write-Host "Then create a free account and set NGROK_AUTHTOKEN + NGROK_DOMAIN in .env"
  exit 1
}

if ($authtoken) {
  & $ngrokPath config add-authtoken $authtoken 2>$null | Out-Null
  Write-Host "ngrok authtoken configured."
} else {
  Write-Host "WARNING: NGROK_AUTHTOKEN missing — random URLs each run (Paystack will break)."
  Write-Host "Get token: https://dashboard.ngrok.com/get-started/your-authtoken"
}

# Kill existing ngrok so we don't stack tunnels
Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# ngrok v3 free static domain uses --domain= (older docs said --url=)
$ngrokArgs = @("http", "$port", "--log=stdout", "--log-format=logfmt")
if ($domain) {
  $ngrokArgs = @("http", "--domain=$domain", "$port", "--log=stdout", "--log-format=logfmt")
  Write-Host "Using FIXED domain: https://$domain"
} else {
  Write-Host "No NGROK_DOMAIN — URL will be random each time."
  Write-Host "Claim a free static domain: https://dashboard.ngrok.com/domains"
  Write-Host "Then set NGROK_DOMAIN=your-name.ngrok-free.app in .env"
}

Write-Host "Starting ngrok → local port $port ..."
$proc = Start-Process -FilePath $ngrokPath -ArgumentList $ngrokArgs -PassThru -WindowStyle Hidden

# Wait for local API on 4040
$publicUrl = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $api = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2
    $https = $api.tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1
    if ($https) { $publicUrl = $https.public_url; break }
  } catch { }
}

if (-not $publicUrl) {
  Write-Host "ERROR: ngrok did not publish a tunnel."
  Write-Host "Most common cause: missing authtoken (ERR_NGROK_4018)."
  Write-Host "1) Sign up: https://dashboard.ngrok.com/signup"
  Write-Host "2) Copy token: https://dashboard.ngrok.com/get-started/your-authtoken"
  Write-Host "3) Add to .env:  NGROK_AUTHTOKEN=your_token_here"
  Write-Host "4) (Recommended) Free static domain: https://dashboard.ngrok.com/domains"
  Write-Host "   Add to .env:  NGROK_DOMAIN=your-name.ngrok-free.app"
  Write-Host "5) Run again:  npm run tunnel"
  if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
  exit 1
}

$callback = "$publicUrl/billing/callback"
$webhook = "$publicUrl/billing/webhook"

# Persist for the app + next server boot
Upsert-DotEnv "PAYSTACK_CALLBACK_URL" $callback
$publicUrl | Set-Content (Join-Path $root ".tunnel-url") -Encoding UTF8

Write-Host ""
Write-Host "=============================================="
Write-Host "  TUNNEL IS LIVE (leave this process running)"
Write-Host "=============================================="
Write-Host "Public API:        $publicUrl"
Write-Host "Test Callback URL: $callback"
Write-Host "Webhook URL:       $webhook"
Write-Host ""
Write-Host "Paste into Paystack dashboard (Test Callback URL):"
Write-Host "  $callback"
Write-Host ""
Write-Host "Also written to .env as PAYSTACK_CALLBACK_URL"
Write-Host "Restart API once so Spring reloads .env: npm run server"
Write-Host "=============================================="
Write-Host ""

# Keep tunnel alive in foreground
try {
  Wait-Process -Id $proc.Id
} finally {
  if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
}
