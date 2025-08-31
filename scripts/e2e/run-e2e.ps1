$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

if (-not (Test-Path artifacts)) { New-Item -ItemType Directory -Path artifacts | Out-Null }
if (-not (Test-Path artifacts/e2e)) { New-Item -ItemType Directory -Path artifacts/e2e | Out-Null }
if (-not (Test-Path reports)) { New-Item -ItemType Directory -Path reports | Out-Null }
if (-not (Test-Path reports/e2e)) { New-Item -ItemType Directory -Path reports/e2e | Out-Null }

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$srvLog = "artifacts/e2e/server-$ts.txt"
$e2eLog = "artifacts/e2e/playwright-$ts.txt"

# Kill any existing listeners on 3077
$lines = netstat -ano | findstr /R /C:":3077" | findstr LISTENING
if ($lines) {
  $pids = @()
  foreach ($line in $lines) {
    $parts = $line -split "\s+" | Where-Object { $_ -ne '' }
    $procId = $parts[-1]
    if ($procId -match '^\d+$') { $pids += [int]$procId }
  }
  $pids = $pids | Sort-Object -Unique
  foreach ($proc in $pids) { try { taskkill /F /PID $proc | Out-Null } catch {}
  }
}

# Start server (build+start on 127.0.0.1:3077)
Start-Process -WindowStyle Hidden powershell -ArgumentList "-NoProfile -Command cd 'apps/web'; npm run start:e2e 2>&1 | Out-File -Encoding utf8 '../../$srvLog'" | Out-Null

# Wait for health
$ok = $false
for ($i=0; $i -lt 180; $i++) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:3077/edu/sandbox -TimeoutSec 2
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { $ok = $true; break }
  } catch {}
  Start-Sleep -Seconds 1
}

if (-not $ok) { Write-Host 'HEALTH:FAIL'; Get-Content $srvLog -Tail 200; exit 1 }
Write-Host 'HEALTH:OK'

# Run Playwright with external server
$env:PW_EXTERNAL_SERVER = '1'
(npx playwright test 2>&1) | Out-File -Encoding utf8 $e2eLog
Get-Content $e2eLog -TotalCount 200


