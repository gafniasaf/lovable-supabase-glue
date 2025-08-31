Param(
  [Parameter(Mandatory=$true)] [string]$Snippet,
  [string]$Label = 'snippet'
)

$ErrorActionPreference = 'Stop'

# Prepare artifacts folder
$outDir = Join-Path (Resolve-Path '.').Path 'artifacts/ops'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$safe = ($Label -replace "[^a-zA-Z0-9_-]", "_")

# Write the snippet to a temp script under artifacts for traceability
$tmpPs1 = Join-Path $outDir "$ts-$safe.ps1"
Set-Content -Encoding UTF8 -Path $tmpPs1 -Value $Snippet

# Output log file path
$log = Join-Path $outDir "$ts-$safe.out.txt"

Write-Host "RUN_SNIPPET $Label => $tmpPs1"

# Execute the script and capture both stdout and stderr
powershell -NoProfile -ExecutionPolicy Bypass -File $tmpPs1 *>&1 | Out-File -Encoding utf8 $log

Write-Host "WROTE $log"
Get-Content $log


