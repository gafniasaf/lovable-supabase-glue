Param(
  [Parameter(Mandatory=$true, Position=0)] [string]$Command,
  [Parameter(Mandatory=$false)] [string]$Label = "run",
  [Parameter(Mandatory=$false)] [switch]$Json
)

$ErrorActionPreference = 'Stop'
$null = New-Item -ItemType Directory -Force -Path "artifacts/ops" 2>$null

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$safe = ($Label -replace "[^a-zA-Z0-9_-]", "_")
$ext = if ($Json) { 'json' } else { 'txt' }
$outFile = "artifacts/ops/$ts-$safe.$ext"

Write-Host "EXEC $Label => $Command"

# Run and capture both stdout and stderr
cmd /c "$Command 2>&1" | Out-File -Encoding utf8 $outFile

Write-Host "WROTE $outFile"
Get-Content $outFile


