Param()

$ErrorActionPreference = 'Stop'

$workspaceRoot = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$appsWebPath = Join-Path $workspaceRoot '..\education-system-5-legacy\apps\web'
if (-not (Test-Path $appsWebPath)) {
  throw "Path not found: $appsWebPath"
}

$json = @"
{
  "version": 2,
  "framework": "nextjs",
  "installCommand": "npm install --ignore-scripts --legacy-peer-deps",
  "buildCommand": "node -e \"require('fs').rmSync('src/app/labs/expertfolio',{recursive:true,force:true})\" && next build",
  "outputDirectory": ".next"
}
"@

$targetFile = Join-Path $appsWebPath 'vercel.json'
Set-Content -Path $targetFile -Value $json -Encoding UTF8
Write-Host "WROTE $targetFile"

# Prepare git commit
$repoRoot = (Split-Path -Parent (Split-Path -Parent $targetFile))
Push-Location $repoRoot
try {
  git checkout -B fix/apps-web-vercel-json | Out-Null
  git add apps/web/vercel.json
  $status = git status -sb
  Write-Host "$status"
  git commit -m "chore(vercel): add apps/web/vercel.json to bypass root vercel.json" | Out-Null
  git push -u origin HEAD
} catch {
  Write-Warning $_
} finally {
  Pop-Location
}


