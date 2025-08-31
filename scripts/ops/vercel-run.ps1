Param(
  [Parameter(ValueFromRemainingArguments=$true)] [string[]]$Args
)

$ErrorActionPreference = 'Stop'

# Prefer process env, fallback to User-level env
$token = $env:VERCEL_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
  $token = [Environment]::GetEnvironmentVariable('VERCEL_TOKEN', 'User')
}

if ([string]::IsNullOrWhiteSpace($token)) {
  throw 'VERCEL_TOKEN not set. Run scripts/ops/set-vercel-token.ps1 first.'
}

# Sanitize common paste artifacts (quotes, whitespace/control chars)
$token = $token.Trim()
$token = $token -replace '^["\'']|["\'']$', ''
$token = ($token.ToCharArray() | Where-Object { [int]$_ -ge 32 -and [int]$_ -ne 127 } | ForEach-Object { [string]$_ }) -join ''

if ([string]::IsNullOrWhiteSpace($token)) {
  throw 'VERCEL_TOKEN resolved to empty after sanitization.'
}

$joined = ($Args -join ' ')
if (-not [string]::IsNullOrWhiteSpace($joined)) {
  $cmd = "npx --yes vercel $joined --token $token"
} else {
  $cmd = "npx --yes vercel --token $token"
}

Write-Host ("VERCEL_CMD => npx --yes vercel {0} --token <redacted:{1}>" -f $joined, $token.Length)

& cmd /c "$cmd 2>&1"


