# Requires: Docker Desktop running
# Inputs via env vars (set in the terminal before running):
#   $env:GITHUB_USERNAME  (your GitHub username)
#   $env:GITHUB_PAT       (GitHub PAT with read:packages)
#   $env:SUPABASE_ACCESS_TOKEN (Supabase PAT)
#   $env:VERCEL_TOKEN     (Vercel token)

$ErrorActionPreference = 'Stop'

function Write-Log([string]$msg) {
  if (!(Test-Path artifacts)) { New-Item -ItemType Directory -Path artifacts | Out-Null }
  $line = (Get-Date).ToString('s') + ' ' + $msg
  Add-Content -Path artifacts\token_checks.txt -Value $line
  Write-Host $msg
}

Write-Log "=== CLI setup start ==="

# Optional GHCR login (needed for ghcr.io/* images)
if ($env:GITHUB_USERNAME -and $env:GITHUB_PAT) {
  Write-Log "Logging in to ghcr.io as $($env:GITHUB_USERNAME)"
  $env:GITHUB_PAT | docker login ghcr.io -u $env:GITHUB_USERNAME --password-stdin | Out-Null
  Write-Log "GHCR login OK"
} else {
  Write-Log "GHCR creds not provided; will try pulls unauthenticated"
}

Write-Log "Pulling utility images"
docker pull curlimages/curl:8.8.0 | Out-Null
try { docker pull ghcr.io/supabase/cli:latest | Out-Null; Write-Log "Pulled ghcr.io/supabase/cli:latest" } catch { Write-Log "WARN: could not pull supabase/cli: $_" }
try { docker pull ghcr.io/vercel/cli:latest   | Out-Null; Write-Log "Pulled ghcr.io/vercel/cli:latest" } catch { Write-Log "WARN: could not pull vercel/cli: $_" }

Write-Log "Network sanity via curl container"
docker run --rm curlimages/curl:8.8.0 -sSI https://react.dev/errors/418 | Out-String | Add-Content artifacts\token_checks.txt

if ($env:SUPABASE_ACCESS_TOKEN) {
  Write-Log "Checking Supabase PAT via REST"
  $code = docker run --rm curlimages/curl:8.8.0 -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $($env:SUPABASE_ACCESS_TOKEN)" https://api.supabase.com/v1/projects
  Write-Log ("Supabase REST status: {0}" -f $code)
  try {
    docker run --rm ghcr.io/supabase/cli:latest --version | Out-String | Add-Content artifacts\token_checks.txt
    docker run --rm -e SUPABASE_ACCESS_TOKEN=$env:SUPABASE_ACCESS_TOKEN ghcr.io/supabase/cli:latest projects list | Out-String | Set-Content artifacts\supabase_projects.json
    Write-Log "Supabase CLI projects list saved to artifacts/supabase_projects.json"
  } catch {
    Write-Log "WARN: Supabase CLI not available; REST check completed"
  }
} else {
  Write-Log "No SUPABASE_ACCESS_TOKEN provided; skipping Supabase checks"
}

if ($env:VERCEL_TOKEN) {
  Write-Log "Checking Vercel token via REST"
  $vcode = docker run --rm curlimages/curl:8.8.0 -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $($env:VERCEL_TOKEN)" https://api.vercel.com/v2/user
  Write-Log ("Vercel REST status: {0}" -f $vcode)
  try {
    $pwd = (Get-Location).Path
    docker run --rm -e VERCEL_TOKEN=$env:VERCEL_TOKEN -v "$pwd:/w" -w /w ghcr.io/vercel/cli:latest vercel whoami | Out-String | Add-Content artifacts\token_checks.txt
    Write-Log "Vercel CLI whoami appended to artifacts/token_checks.txt"
  } catch {
    Write-Log "WARN: Vercel CLI not available; REST check completed"
  }
} else {
  Write-Log "No VERCEL_TOKEN provided; skipping Vercel checks"
}

Write-Log "=== CLI setup done ==="


