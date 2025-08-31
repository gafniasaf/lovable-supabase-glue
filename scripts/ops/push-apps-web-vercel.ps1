Param(
  [Parameter(Mandatory=$true)] [string]$RepoRoot,
  [string]$Owner = 'gafniasaf',
  [string]$Repo = 'education-system-5'
)

$ErrorActionPreference = 'Stop'

$vercel = @"
{
  "version": 2,
  "framework": "nextjs",
  "installCommand": "npm install --ignore-scripts --legacy-peer-deps",
  "buildCommand": "node -e \"require('fs').rmSync('src/app/labs/expertfolio',{recursive:true,force:true})\" && next build",
  "outputDirectory": ".next"
}
"@

if (-not (Test-Path $RepoRoot)) { throw "RepoRoot not found: $RepoRoot" }

$appsWeb = Join-Path $RepoRoot 'apps/web'
New-Item -ItemType Directory -Force -Path $appsWeb | Out-Null
$target = Join-Path $appsWeb 'vercel.json'
Set-Content -Path $target -Value $vercel -Encoding UTF8
Write-Host "WROTE $target"

Push-Location $RepoRoot
try {
  git checkout -B 'fix/apps-web-vercel-json' | Out-Null
  git add 'apps/web/vercel.json'
  git commit -m 'chore(vercel): add apps/web vercel config' | Out-Null

  $t = $env:GITHUB_TOKEN
  if ([string]::IsNullOrWhiteSpace($t)) { $t = $env:GH_TOKEN }
  if ([string]::IsNullOrWhiteSpace($t)) { throw 'No token in env (GITHUB_TOKEN or GH_TOKEN)' }
  # Use PAT over HTTPS with username to avoid x-access-token semantics
  $url = "https://$Owner:$t@github.com/$Owner/$Repo.git"
  git push $url 'HEAD:refs/heads/fix/apps-web-vercel-json' -u
} finally {
  Pop-Location
}


