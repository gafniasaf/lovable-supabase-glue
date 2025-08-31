Param()

$ErrorActionPreference = 'Stop'

$repoPath = Join-Path (Split-Path -Parent $PSScriptRoot) '..\..\education-system-5-legacy'
if (-not (Test-Path $repoPath)) {
  throw "Legacy repo not found at: $repoPath"
}

Set-Location $repoPath

$vercelPath = Join-Path $repoPath 'vercel.json'
if (-not (Test-Path $vercelPath)) {
  throw "vercel.json not found at: $vercelPath"
}

Write-Host "Backing up vercel.json"
Copy-Item $vercelPath ($vercelPath + '.bak') -Force

Write-Host "Updating vercel.json to remove workspace buildCommand"
$json = Get-Content $vercelPath -Raw | ConvertFrom-Json
$null = $json.PSObject.Properties.Remove('buildCommand')
$json.version = 2
$json.framework = 'nextjs'
$json.installCommand = 'npm ci --ignore-scripts'
$json.outputDirectory = 'apps/web/.next'
$json | ConvertTo-Json -Depth 4 | Set-Content -Path $vercelPath -Encoding UTF8

Write-Host "Creating fix branch and committing"
git checkout -B fix/vercel-next-defaults | Out-Null
git add vercel.json
git commit -m 'fix(vercel): remove workspace buildCommand; use Next.js defaults' | Out-Null

Write-Host "Pushing branch"
git push -u origin HEAD

Write-Host "Done. Open a Deploy in Vercel from this branch or merge into main."


